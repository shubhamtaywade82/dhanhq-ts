import type { DhanClientConfig } from "../client/DhanClient";

export class OrdersResource {
  constructor(private readonly config: DhanClientConfig) {}

  public getConfig(): DhanClientConfig {
    return this.config;
  }
}
