import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";

import { ApiResponseError, NetworkError, RateLimitError } from "../errors";
import type { DhanClientConfig } from "../types/common.types";
import { RateLimiter } from "./RateLimiter";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface RequestOptions<TBody = unknown> {
  method: HttpMethod;
  url: string;
  data?: TBody;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  safeToRetry?: boolean;
}

export interface HttpClientDependencies {
  axiosInstance?: AxiosInstance;
  rateLimiter?: RateLimiter;
}

export class HttpClient {
  private readonly axiosInstance: AxiosInstance;
  private readonly rateLimiter: RateLimiter;
  private readonly accessToken: string;
  private readonly clientId: string;

  constructor(
    config: DhanClientConfig,
    dependencies: HttpClientDependencies = {},
  ) {
    this.accessToken = config.token;
    this.clientId = config.clientId;
    this.rateLimiter =
      dependencies.rateLimiter ??
      new RateLimiter({ minTime: config.rateLimitMinTimeMs });
    this.axiosInstance =
      dependencies.axiosInstance ??
      axios.create({
        baseURL: config.baseURL ?? "https://api.dhan.co/v2",
        timeout: config.timeoutMs ?? 5000,
        headers: {
          "access-token": config.token,
          Accept: "application/json",
        },
      });
  }

  public async request<TResponse, TBody = unknown>(
    options: RequestOptions<TBody>,
  ): Promise<TResponse> {
    const execute = () => this.execute<TResponse, TBody>(options);

    try {
      if (options.method === "GET") {
        return await this.rateLimiter.scheduleRead(execute);
      }

      return await this.rateLimiter.scheduleWrite(execute);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  public getClientId(): string {
    return this.clientId;
  }

  public getAccessToken(): string {
    return this.accessToken;
  }

  private async execute<TResponse, TBody>(
    options: RequestOptions<TBody>,
  ): Promise<TResponse> {
    try {
      const response = await this.axiosInstance.request<TResponse>(
        this.toAxiosConfig(options),
      );
      return response.data;
    } catch (error) {
      const normalized = this.normalizeError(error);

      if (
        options.safeToRetry &&
        this.shouldRetry(normalized) &&
        options.method === "GET"
      ) {
        const response = await this.axiosInstance.request<TResponse>(
          this.toAxiosConfig(options),
        );
        return response.data;
      }

      throw normalized;
    }
  }

  private toAxiosConfig<TBody>(
    options: RequestOptions<TBody>,
  ): AxiosRequestConfig<TBody> {
    return {
      method: options.method,
      url: options.url,
      data: options.data,
      params: options.params,
      headers: options.headers,
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

    if (error instanceof BottleneckError) {
      return new RateLimitError(error.message, error);
    }

    return new NetworkError("Unexpected request failure", error);
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

class BottleneckError extends Error {}

function isAxiosLikeError(error: unknown): error is AxiosError {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error
  );
}
