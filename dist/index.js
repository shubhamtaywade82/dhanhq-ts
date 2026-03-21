// src/resources/OrdersResource.ts
var OrdersResource = class {
  constructor(config) {
    this.config = config;
  }
  getConfig() {
    return this.config;
  }
};

// src/ws/DhanWS.ts
var DhanWS = class {
  constructor(token, clientId) {
    this.token = token;
    this.clientId = clientId;
  }
  connect() {
    return {
      token: this.token,
      clientId: this.clientId
    };
  }
};

// src/client/DhanClient.ts
var DhanClient = class {
  constructor(config) {
    this.orders = new OrdersResource(config);
    this.ws = new DhanWS(config.token, config.clientId);
  }
};
export {
  DhanClient,
  DhanWS
};
//# sourceMappingURL=index.js.map