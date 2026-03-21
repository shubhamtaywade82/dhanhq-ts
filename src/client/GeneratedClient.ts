import { OpenAPI } from "../generated";
import type { DhanClientConfig } from "../types/common.types";

export class GeneratedClient {
  constructor(config: DhanClientConfig) {
    OpenAPI.BASE = config.baseURL ?? "https://api.dhan.co/v2";
    OpenAPI.TOKEN = undefined;
    OpenAPI.HEADERS = config.token
      ? {
          "access-token": config.token,
        }
      : undefined;
  }
}
