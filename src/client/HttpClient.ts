import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import Bottleneck from "bottleneck";

import { AuthResolver } from "../auth";
import type { ApiTier } from "../constants";
import { ApiResponseError, NetworkError, RateLimitError } from "../errors";
import type { DhanClientConfig } from "../types/common.types";
import type { Logger } from "../types/logger.types";
import {
  CircuitBreaker,
  type CircuitBreakerOptions,
  type CircuitState,
} from "./CircuitBreaker";
import { RateLimiter } from "./RateLimiter";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface RequestOptions<TBody = unknown> {
  method: HttpMethod;
  url: string;
  data?: TBody;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  safeToRetry?: boolean;
  /**
   * Enforces the documented Dhan rate limit for this endpoint (`RATE_LIMITS`)
   * in addition to the generic read/write queue. Omit for endpoints without a
   * documented tier-specific limit narrower than the generic default.
   */
  tier?: ApiTier;
}

export interface HttpClientDependencies {
  axiosInstance?: AxiosInstance;
  rateLimiter?: RateLimiter;
  logger?: Logger;
  /** Pass `false` to disable the circuit breaker outright. */
  circuitBreaker?: CircuitBreaker | false;
}

export class HttpClient {
  private readonly axiosInstance: AxiosInstance;
  private readonly rateLimiter: RateLimiter;
  private readonly authResolver: AuthResolver;
  private readonly clientId: string;
  private readonly logger?: Logger;
  private readonly circuitBreaker?: CircuitBreaker;

  constructor(
    config: DhanClientConfig,
    dependencies: HttpClientDependencies = {},
  ) {
    this.authResolver = new AuthResolver(config);
    this.clientId = config.clientId;
    this.logger = dependencies.logger;
    this.rateLimiter =
      dependencies.rateLimiter ??
      new RateLimiter({ minTime: config.rateLimitMinTimeMs });
    this.axiosInstance =
      dependencies.axiosInstance ??
      axios.create({
        baseURL: config.baseURL ?? "https://api.dhan.co/v2",
        timeout: config.timeoutMs ?? 5000,
        headers: {
          Accept: "application/json",
        },
      });
    this.circuitBreaker = this.resolveCircuitBreaker(config, dependencies);
  }

  public async request<TResponse, TBody = unknown>(
    options: RequestOptions<TBody>,
  ): Promise<TResponse> {
    const run = async (): Promise<TResponse> => {
      const execute = () => this.execute<TResponse, TBody>(options);
      const isWrite = options.method !== "GET";

      try {
        if (options.tier) {
          return await this.rateLimiter.scheduleTier(options.tier, isWrite, execute);
        }

        if (isWrite) {
          return await this.rateLimiter.scheduleWrite(execute);
        }

        return await this.rateLimiter.scheduleRead(execute);
      } catch (error) {
        throw this.normalizeError(error);
      }
    };

    return this.circuitBreaker ? this.circuitBreaker.execute(run) : run();
  }

  /** Current circuit-breaker state, mainly useful for health checks/observability. */
  public getCircuitState(): CircuitState | undefined {
    return this.circuitBreaker?.getState();
  }

  private resolveCircuitBreaker(
    config: DhanClientConfig,
    dependencies: HttpClientDependencies,
  ): CircuitBreaker | undefined {
    if (dependencies.circuitBreaker !== undefined) {
      return dependencies.circuitBreaker === false ? undefined : dependencies.circuitBreaker;
    }

    if (config.circuitBreaker === false) {
      return undefined;
    }

    const options: CircuitBreakerOptions = config.circuitBreaker ?? {};
    return new CircuitBreaker({
      ...options,
      logger: options.logger ?? this.logger,
      isFailure:
        options.isFailure ??
        ((error) =>
          error instanceof NetworkError ||
          (error instanceof ApiResponseError && (error.status ?? 0) >= 500)),
    });
  }

  public getClientId(): string {
    return this.clientId;
  }

  public async getAccessToken(): Promise<string> {
    return this.authResolver.resolveAccessToken();
  }

  private async execute<TResponse, TBody>(
    options: RequestOptions<TBody>,
  ): Promise<TResponse> {
    try {
      const response = await this.axiosInstance.request<TResponse>(
        await this.toAxiosConfig(options),
      );
      return response.data;
    } catch (error) {
      const normalized = this.normalizeError(error);

      if (this.isAuthenticationFailure(normalized)) {
        await this.authResolver.handleTokenExpired(normalized);
        const response = await this.axiosInstance.request<TResponse>(
          await this.toAxiosConfig(options),
        );
        return response.data;
      }

      if (
        options.safeToRetry &&
        this.shouldRetry(normalized) &&
        options.method === "GET"
      ) {
        const response = await this.axiosInstance.request<TResponse>(
          await this.toAxiosConfig(options),
        );
        return response.data;
      }

      throw normalized;
    }
  }

  private async toAxiosConfig<TBody>(
    options: RequestOptions<TBody>,
  ): Promise<AxiosRequestConfig<TBody>> {
    const token = await this.authResolver.resolveAccessToken();

    return {
      method: options.method,
      url: options.url,
      data: options.data,
      params: options.params,
      headers: {
        "access-token": token,
        "client-id": this.clientId,
        ...options.headers,
      },
    };
  }

  private shouldRetry(error: unknown): boolean {
    return (
      error instanceof NetworkError ||
      (error instanceof ApiResponseError &&
        error.status !== undefined &&
        error.status >= 500)
    );
  }

  private isAuthenticationFailure(error: unknown): boolean {
    return (
      error instanceof ApiResponseError &&
      error.status !== undefined &&
      error.status === 401
    );
  }

  private normalizeError(error: unknown): Error {
    if (error instanceof Error && !(error instanceof AxiosError)) {
      return error;
    }

    if (error instanceof AxiosError || isAxiosLikeError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        return new ApiResponseError(
          `Dhan API request failed with status ${axiosError.response.status}`,
          axiosError.response.status,
          this.extractErrorPayload(axiosError.response),
          error,
        );
      }

      if (axiosError.request) {
        return new NetworkError(
          `Network request failed: ${axiosError.message}`,
          error,
        );
      }
    }

    if (error instanceof Bottleneck.BottleneckError) {
      this.logger?.warn('Rate limit exceeded', {
        message: error.message,
        retryAfterMs: this.extractRetryAfter(error)
      });
      return new RateLimitError(
        `Rate limit exceeded: ${error.message}`,
        { cause: error, retryAfterMs: this.extractRetryAfter(error) }
      );
    }

    return new NetworkError("Unexpected request failure", error);
  }

  private extractRetryAfter(error: Bottleneck.BottleneckError): number | undefined {
    // Extract retry-after information from bottleneck error if available
    const anyError = error as any;
    if (anyError.retryAfterMs !== undefined) {
      return anyError.retryAfterMs;
    }
    // Default to 1 second if not specified
    return 1000;
  }

  private extractErrorPayload(response: AxiosResponse<unknown>): unknown {
    if (response.data === undefined) {
      return {
        status: response.status,
        statusText: response.statusText,
      };
    }

    return response.data;
  }
}

function isAxiosLikeError(error: unknown): error is AxiosError {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error
  );
}
