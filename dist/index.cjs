"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  DhanClient: () => DhanClient,
  DhanWS: () => DhanWS
});
module.exports = __toCommonJS(index_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DhanClient,
  DhanWS
});
//# sourceMappingURL=index.cjs.map