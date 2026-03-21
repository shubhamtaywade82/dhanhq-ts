declare class OrdersResource {
    private readonly config;
    constructor(config: DhanClientConfig);
    getConfig(): DhanClientConfig;
}

declare class DhanWS {
    private readonly token;
    private readonly clientId;
    constructor(token: string, clientId: string);
    connect(): {
        token: string;
        clientId: string;
    };
}

interface DhanClientConfig {
    token: string;
    clientId: string;
}
declare class DhanClient {
    orders: OrdersResource;
    ws: DhanWS;
    constructor(config: DhanClientConfig);
}

export { DhanClient, type DhanClientConfig, DhanWS };
