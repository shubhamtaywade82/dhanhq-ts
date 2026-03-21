export class DhanWS {
  constructor(
    private readonly token: string,
    private readonly clientId: string,
  ) {}

  public connect(): { token: string; clientId: string } {
    return {
      token: this.token,
      clientId: this.clientId,
    };
  }
}
