import type {
  ExitPnlResponse,
  KillSwitchResponse,
  PnlBasedExitRequest,
  PnlExitResponse,
  UserIPResponse,
} from "../generated";

import { HttpClient } from "../client/HttpClient";

export class TraderControls {
  constructor(private readonly httpClient: HttpClient) {}

  public async getPnlExit(): Promise<ExitPnlResponse> {
    return this.httpClient.request<ExitPnlResponse>({
      method: "GET",
      url: "/pnlExit",
      safeToRetry: true,
    });
  }

  public async setPnlExit(
    request: PnlBasedExitRequest,
  ): Promise<PnlExitResponse> {
    return this.httpClient.request<PnlExitResponse, PnlBasedExitRequest>({
      method: "POST",
      url: "/pnlExit",
      data: request,
      safeToRetry: false,
    });
  }

  public async stopPnlExit(): Promise<UserIPResponse> {
    return this.httpClient.request<UserIPResponse>({
      method: "DELETE",
      url: "/pnlExit",
      safeToRetry: false,
    });
  }

  public async getKillSwitchStatus(): Promise<KillSwitchResponse> {
    return this.httpClient.request<KillSwitchResponse>({
      method: "GET",
      url: "/killswitch",
      safeToRetry: true,
    });
  }

  public async setKillSwitch(
    killSwitchStatus: string,
  ): Promise<KillSwitchResponse> {
    return this.httpClient.request<KillSwitchResponse>({
      method: "POST",
      url: "/killswitch",
      params: {
        killSwitchStatus,
      },
      safeToRetry: false,
    });
  }
}
