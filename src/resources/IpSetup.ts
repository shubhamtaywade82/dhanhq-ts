import type {
  GetIPDetailsResponse,
  UserIPRequest,
  UserIPResponse,
} from "../generated";

import { HttpClient } from "../client/HttpClient";

export class IpSetup {
  constructor(private readonly httpClient: HttpClient) {}

  public async get(): Promise<GetIPDetailsResponse> {
    return this.httpClient.request<GetIPDetailsResponse>({
      method: "GET",
      url: "/ip/getIP",
      safeToRetry: true,
    });
  }

  public async set(request: UserIPRequest): Promise<UserIPResponse> {
    return this.httpClient.request<UserIPResponse, UserIPRequest>({
      method: "POST",
      url: "/ip/setIP",
      data: request,
      safeToRetry: false,
    });
  }

  public async modify(request: UserIPRequest): Promise<UserIPResponse> {
    return this.httpClient.request<UserIPResponse, UserIPRequest>({
      method: "PUT",
      url: "/ip/modifyIP",
      data: request,
      safeToRetry: false,
    });
  }
}
