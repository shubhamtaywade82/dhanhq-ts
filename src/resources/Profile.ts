import { HttpClient } from "../client/HttpClient";

export interface ProfileResponse {
  dhanClientId?: string;
  tokenValidity?: string;
  activeSegment?: string;
  ddpi?: string;
  mtf?: string;
  dataPlan?: string;
  dataValidity?: string;
  [key: string]: unknown;
}

/** Account profile (`GET /v2/profile`). */
export class Profile {
  constructor(private readonly httpClient: HttpClient) {}

  public async get(): Promise<ProfileResponse> {
    return this.httpClient.request<ProfileResponse>({
      method: "GET",
      url: "/profile",
      safeToRetry: true,
    });
  }
}
