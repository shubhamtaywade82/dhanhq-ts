// src/mcp/Server.ts
import { createInterface } from "readline";

// src/errors/DhanError.ts
var DhanError = class extends Error {
  constructor(message2, options = {}) {
    super(message2);
    this.name = "DhanError";
    this.code = options.code ?? "DHAN_ERROR";
    this.status = options.status;
    this.details = options.details;
    this.cause = options.cause;
  }
};

// src/errors/LiveTradingDisabledError.ts
var LiveTradingDisabledError = class extends DhanError {
  constructor(message2 = "Write tools require DHANHQ_MCP_ENABLE_WRITES=true and LIVE_TRADING=true") {
    super(message2, { code: "LIVE_TRADING_DISABLED" });
    this.name = "LiveTradingDisabledError";
  }
};

// src/errors/RiskViolationError.ts
var RiskViolationError = class extends DhanError {
  constructor(check, message2, details) {
    super(message2, { code: "RISK_VIOLATION", details });
    this.name = "RiskViolationError";
    this.check = check;
  }
};

// src/constants.ts
var ExchangeSegment = {
  IDX_I: "IDX_I",
  NSE_EQ: "NSE_EQ",
  NSE_FNO: "NSE_FNO",
  NSE_CURRENCY: "NSE_CURRENCY",
  NSE_COMM: "NSE_COMM",
  BSE_EQ: "BSE_EQ",
  MCX_COMM: "MCX_COMM",
  BSE_CURRENCY: "BSE_CURRENCY",
  BSE_FNO: "BSE_FNO",
  /**
   * US / international equities, traded through the Global Stocks APIs
   * (`/v2/globalstocks/*`). Deliberately excluded from `ALL` so it can never
   * satisfy a domestic order contract.
   */
  INX_EQ: "INX_EQ"
};
var EXCHANGE_SEGMENTS = [
  ExchangeSegment.IDX_I,
  ExchangeSegment.NSE_EQ,
  ExchangeSegment.NSE_FNO,
  ExchangeSegment.NSE_CURRENCY,
  ExchangeSegment.NSE_COMM,
  ExchangeSegment.BSE_EQ,
  ExchangeSegment.MCX_COMM,
  ExchangeSegment.BSE_CURRENCY,
  ExchangeSegment.BSE_FNO
];
var GLOBAL_EXCHANGE_SEGMENTS = [ExchangeSegment.INX_EQ];
var MARGIN_CALC_SEGMENTS = [
  ExchangeSegment.NSE_EQ,
  ExchangeSegment.NSE_FNO,
  ExchangeSegment.BSE_EQ,
  ExchangeSegment.BSE_FNO,
  ExchangeSegment.MCX_COMM
];
var ALERT_CONDITION_SEGMENTS = [
  ExchangeSegment.NSE_EQ,
  ExchangeSegment.BSE_EQ,
  ExchangeSegment.IDX_I
];
var CHART_SEGMENTS = [
  ExchangeSegment.IDX_I,
  ExchangeSegment.NSE_EQ,
  ExchangeSegment.NSE_FNO,
  ExchangeSegment.NSE_CURRENCY,
  ExchangeSegment.BSE_EQ,
  ExchangeSegment.BSE_FNO,
  ExchangeSegment.BSE_CURRENCY,
  ExchangeSegment.MCX_COMM
];
var ProductType = {
  CNC: "CNC",
  INTRADAY: "INTRADAY",
  MARGIN: "MARGIN",
  MTF: "MTF",
  CO: "CO",
  BO: "BO"
};
var PRODUCT_TYPES = [
  ProductType.CNC,
  ProductType.INTRADAY,
  ProductType.MARGIN,
  ProductType.MTF,
  ProductType.CO,
  ProductType.BO
];
var MARGIN_CALC_PRODUCT_TYPES = [
  ProductType.CNC,
  ProductType.INTRADAY,
  ProductType.MARGIN,
  ProductType.MTF
];
var FOREVER_ORDER_PRODUCT_TYPES = [
  ProductType.CNC,
  ProductType.MTF
];
var TransactionType = {
  BUY: "BUY",
  SELL: "SELL"
};
var TRANSACTION_TYPES = [
  TransactionType.BUY,
  TransactionType.SELL
];
var OrderTypeEnum = {
  LIMIT: "LIMIT",
  MARKET: "MARKET",
  STOP_LOSS: "STOP_LOSS",
  STOP_LOSS_MARKET: "STOP_LOSS_MARKET"
};
var ORDER_TYPES = [
  OrderTypeEnum.LIMIT,
  OrderTypeEnum.MARKET,
  OrderTypeEnum.STOP_LOSS,
  OrderTypeEnum.STOP_LOSS_MARKET
];
var ValidityEnum = {
  DAY: "DAY",
  IOC: "IOC"
};
var VALIDITIES = [ValidityEnum.DAY, ValidityEnum.IOC];
var InstrumentType = {
  INDEX: "INDEX",
  FUTIDX: "FUTIDX",
  OPTIDX: "OPTIDX",
  EQUITY: "EQUITY",
  FUTSTK: "FUTSTK",
  OPTSTK: "OPTSTK",
  FUTCOM: "FUTCOM",
  OPTFUT: "OPTFUT",
  FUTCUR: "FUTCUR",
  OPTCUR: "OPTCUR"
};
var ChartInterval = {
  ONE: "1",
  FIVE: "5",
  FIFTEEN: "15",
  TWENTY_FIVE: "25",
  SIXTY: "60"
};
var CHART_INTERVALS = [
  ChartInterval.ONE,
  ChartInterval.FIVE,
  ChartInterval.FIFTEEN,
  ChartInterval.TWENTY_FIVE,
  ChartInterval.SIXTY
];
var GlobalStocks = {
  EXCHANGE_SEGMENT: ExchangeSegment.INX_EQ,
  EXCHANGE_SEGMENT_CODE: 14,
  MAX_INSTRUMENTS_PER_REQUEST: 100,
  MAX_SUBSCRIPTIONS_PER_CONNECTION: 5e3,
  MAX_CONNECTIONS_PER_CLIENT: 5,
  OrderType: {
    MARKET: "MARKET",
    LIMIT: "LIMIT",
    STOP_LOSS: "STOP_LOSS",
    STOP_LOSS_MARKET: "STOP_LOSS_MARKET",
    /** Notional / dollar-value orders — quantity is replaced by `amount`. */
    AMOUNT: "AMOUNT"
  },
  MarketStatus: {
    OPEN: "open",
    CLOSED: "closed"
  },
  MsgCode: {
    TRADE: 1,
    PREV_CLOSE: 32,
    CIRCUIT_LIMIT: 33,
    FIFTY_TWO_WEEK: 36
  }
};
var GLOBAL_ORDER_TYPES = [
  GlobalStocks.OrderType.MARKET,
  GlobalStocks.OrderType.LIMIT,
  GlobalStocks.OrderType.STOP_LOSS,
  GlobalStocks.OrderType.STOP_LOSS_MARKET,
  GlobalStocks.OrderType.AMOUNT
];
var RATE_LIMITS = {
  order_api: { perSecond: 10, perDay: 1e5 },
  data_api: { perSecond: 5, perDay: 7e3 },
  quote_api: { perSecond: 1, perDay: Infinity },
  option_chain: { perSecond: 1 / 3, perDay: 4800 },
  non_trading_api: { perSecond: 20, perDay: Infinity }
};
var MARKET_HOURS = {
  timezoneOffsetMinutes: 330,
  openHour: 9,
  openMinute: 15,
  closeHour: 15,
  closeMinute: 30,
  /** Minutes in a regular NSE trading session. */
  sessionMinutes: 375
};
var SEGMENT_MAP = {
  "NSE:E": ExchangeSegment.NSE_EQ,
  "BSE:E": ExchangeSegment.BSE_EQ,
  "NSE:D": ExchangeSegment.NSE_FNO,
  "BSE:D": ExchangeSegment.BSE_FNO,
  "NSE:C": ExchangeSegment.NSE_CURRENCY,
  "BSE:C": ExchangeSegment.BSE_CURRENCY,
  "MCX:M": ExchangeSegment.MCX_COMM,
  "NSE:I": ExchangeSegment.IDX_I,
  "BSE:I": ExchangeSegment.IDX_I
};

// src/risk/checks.ts
var tradingPermissionCheck = {
  name: "trading_permission",
  run({ instrument }) {
    if (!instrument) {
      return;
    }
    if (instrument.buySellIndicator !== "A") {
      throw new RiskViolationError(
        "trading_permission",
        `Trading disabled for instrument ${instrument.securityId}`
      );
    }
  }
};
var asmGsmCheck = {
  name: "asm_gsm",
  run({ instrument }) {
    if (instrument?.asmGsmFlag !== "Y") {
      return;
    }
    throw new RiskViolationError(
      "asm_gsm",
      `ASM/GSM restricted instrument (${instrument.asmGsmCategory ?? "unknown category"})`
    );
  }
};
var productSupportCheck = {
  name: "product_support",
  run({ args, instrument }) {
    const productType = args.productType;
    if (!productType || !instrument) {
      return;
    }
    if (productType === ProductType.BO && instrument.bracketFlag !== "Y") {
      throw new RiskViolationError(
        "product_support",
        "Bracket orders not supported for this instrument"
      );
    }
    if (productType === ProductType.CO && instrument.coverFlag !== "Y") {
      throw new RiskViolationError(
        "product_support",
        "Cover orders not supported for this instrument"
      );
    }
  }
};
var orderTypeCheck = {
  name: "order_type",
  run({ args, limits }) {
    const orderType = args.orderType;
    if (!orderType || limits.allowedOrderTypes.includes(orderType)) {
      return;
    }
    throw new RiskViolationError(
      "order_type",
      `Order type ${orderType} not allowed (permitted: ${limits.allowedOrderTypes.join(", ")})`
    );
  }
};
var quantityCheck = {
  name: "quantity",
  run({ args, limits }) {
    const quantity = Number(args.quantity ?? 0);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new RiskViolationError("quantity", "Quantity must be greater than 0");
    }
    if (quantity > limits.maxQuantity) {
      throw new RiskViolationError(
        "quantity",
        `Quantity ${quantity} exceeds limit of ${limits.maxQuantity}`
      );
    }
    if (args.price === void 0) {
      return;
    }
    const notional = quantity * Number(args.price);
    if (notional > limits.maxNotional) {
      throw new RiskViolationError(
        "quantity",
        `Notional ${notional} exceeds limit of ${limits.maxNotional}`
      );
    }
  }
};
var marketHoursCheck = {
  name: "market_hours",
  run({ now = /* @__PURE__ */ new Date() }) {
    const ist = new Date(
      now.getTime() + MARKET_HOURS.timezoneOffsetMinutes * 60 * 1e3
    );
    const minutes = ist.getUTCHours() * 60 + ist.getUTCMinutes();
    const open = MARKET_HOURS.openHour * 60 + MARKET_HOURS.openMinute;
    const close = MARKET_HOURS.closeHour * 60 + MARKET_HOURS.closeMinute;
    const day = ist.getUTCDay();
    if (day === 0 || day === 6 || minutes < open || minutes > close) {
      throw new RiskViolationError("market_hours", "Market is closed");
    }
  }
};
var positionLimitsCheck = {
  name: "position_limits",
  async run({ provider, limits }) {
    if (!provider) {
      return;
    }
    const positions = await provider.positions();
    const openCount = positions.filter(
      (position) => Number(position.netQty ?? 0) !== 0
    ).length;
    if (openCount >= limits.maxOpenPositions) {
      throw new RiskViolationError(
        "position_limits",
        `Maximum ${limits.maxOpenPositions} open positions exceeded (${openCount} open)`
      );
    }
  }
};
var concentrationCheck = {
  name: "concentration",
  async run({ args, provider, limits }) {
    const symbol = args.securityId;
    if (!provider || !symbol) {
      return;
    }
    const available = availableBalance(await provider.funds());
    if (available <= 0) {
      return;
    }
    const positions = await provider.positions();
    const exposure = positions.filter((position) => matchesSymbol(position, String(symbol))).reduce(
      (total, position) => total + Math.abs(Number(position.netQty ?? 0)) * Number(position.costPrice ?? 0),
      0
    );
    const concentration = exposure / available * 100;
    if (concentration > limits.maxConcentrationPct) {
      throw new RiskViolationError(
        "concentration",
        `Concentration ${concentration.toFixed(1)}% exceeds ${limits.maxConcentrationPct}% limit for ${symbol}`
      );
    }
  }
};
var maxLossCheck = {
  name: "max_loss",
  async run({ provider, limits }) {
    if (!provider) {
      return;
    }
    const positions = await provider.positions();
    const unrealized = positions.reduce(
      (total, position) => total + Number(position.unrealizedProfit ?? 0),
      0
    );
    if (unrealized < -limits.dailyMaxLoss) {
      throw new RiskViolationError(
        "max_loss",
        `Daily loss limit of ${limits.dailyMaxLoss} exceeded (current: ${unrealized.toFixed(0)})`
      );
    }
  }
};
var optionsCheck = {
  name: "options",
  run({ args, instrument, limits }) {
    if (limits.optionsIndexOnly && instrument?.instrumentType !== "INDEX") {
      throw new RiskViolationError(
        "options",
        "Options are only allowed on index underlyings"
      );
    }
    if (!limits.requireOptionsStops) {
      return;
    }
    if (args.stopLoss === void 0) {
      throw new RiskViolationError("options", "Stop loss required");
    }
    if (args.target === void 0) {
      throw new RiskViolationError("options", "Target required");
    }
    if (Number(args.target) <= Number(args.stopLoss)) {
      throw new RiskViolationError(
        "options",
        "Invalid risk-reward: target must exceed stop loss"
      );
    }
  }
};
function matchesSymbol(position, symbol) {
  return String(position.tradingSymbol ?? "") === symbol || String(position.securityId ?? "") === symbol;
}
function availableBalance(funds) {
  return Number(funds.availabelBalance ?? funds.availableBalance ?? 0);
}

// src/risk/types.ts
var DEFAULT_RISK_LIMITS = {
  maxQuantity: 10,
  maxNotional: 1e5,
  dailyMaxLoss: 5e4,
  maxOpenPositions: 20,
  maxConcentrationPct: 25,
  allowedOrderTypes: ["MARKET", "LIMIT"],
  optionsIndexOnly: true,
  requireOptionsStops: true
};

// src/risk/Pipeline.ts
var BASE_CHECKS = [
  tradingPermissionCheck,
  asmGsmCheck,
  productSupportCheck,
  orderTypeCheck,
  quantityCheck,
  marketHoursCheck,
  positionLimitsCheck,
  concentrationCheck
];
var OPTION_CHECKS = [optionsCheck];
var DAILY_CHECKS = [maxLossCheck];
var Pipeline = class {
  constructor(config = {}) {
    this.limits = { ...DEFAULT_RISK_LIMITS, ...config.limits };
    this.provider = config.provider;
    this.checks = config.checks ?? BASE_CHECKS;
  }
  /** Runs every applicable check. Throws on the first violation. */
  async run(options) {
    const context = {
      args: options.args,
      instrument: options.instrument,
      now: options.now ?? /* @__PURE__ */ new Date(),
      limits: this.limits,
      provider: this.provider
    };
    const applicable = [
      ...this.checks,
      ...options.type === "options" ? OPTION_CHECKS : [],
      ...DAILY_CHECKS
    ];
    for (const check of applicable) {
      await check.run(context);
    }
    return true;
  }
  /**
   * Runs every check and collects the failures instead of throwing — for
   * previews and dry runs, where the caller wants the full picture rather
   * than the first problem.
   */
  async report(options) {
    const context = {
      args: options.args,
      instrument: options.instrument,
      now: options.now ?? /* @__PURE__ */ new Date(),
      limits: this.limits,
      provider: this.provider
    };
    const applicable = [
      ...this.checks,
      ...options.type === "options" ? OPTION_CHECKS : [],
      ...DAILY_CHECKS
    ];
    const violations = [];
    for (const check of applicable) {
      try {
        await check.run(context);
      } catch (error) {
        violations.push({
          check: check.name,
          message: error instanceof Error ? error.message : String(error)
        });
      }
    }
    return { passed: violations.length === 0, violations };
  }
  getLimits() {
    return this.limits;
  }
};
function riskTypeFor(instrument) {
  return instrument?.instrumentType?.startsWith("OPT") ? "options" : "equity";
}

// src/skills/Registry.ts
var SkillRegistry = class {
  constructor() {
    this.skills = /* @__PURE__ */ new Map();
  }
  register(skill) {
    this.skills.set(skill.definition.name, skill);
    return this;
  }
  registerAll(skills) {
    for (const skill of skills) {
      this.register(skill);
    }
    return this;
  }
  has(name) {
    return this.skills.has(name);
  }
  find(name) {
    const skill = this.skills.get(name);
    if (!skill) {
      throw new DhanError(`Unknown skill: ${name}`, {
        code: "SKILL_NOT_FOUND",
        details: { name, available: this.names() }
      });
    }
    return skill;
  }
  names() {
    return [...this.skills.keys()].sort();
  }
  /** Every skill with its parameters and steps, for tool listings. */
  list() {
    return [...this.skills.values()].map((skill) => ({
      ...skill.definition,
      steps: skill.stepNames()
    }));
  }
  async call(name, args, client) {
    const result = await this.find(name).call(args, client);
    const { client: _client, ...rest } = result;
    return rest;
  }
  clear() {
    this.skills.clear();
  }
};

// src/resources/OptionChain.ts
function nearestStrike(chain, target) {
  if (chain.strikes.length === 0) {
    return void 0;
  }
  return chain.strikes.reduce(
    (best, entry) => Math.abs(entry.strike - target) < Math.abs(best.strike - target) ? entry : best
  );
}
function findStrike(chain, target, tolerance = 1e-3) {
  return chain.strikes.find(
    (entry) => Math.abs(entry.strike - target) < tolerance
  );
}

// src/skills/Skill.ts
var Skill = class {
  /** Runs every step in order and returns the final context. */
  async call(args, client) {
    let context = this.buildContext(args, client);
    this.validate(context);
    for (const step of this.steps()) {
      context = await step.run(context);
    }
    return context;
  }
  /** Step names in execution order, for tool listings and docs. */
  stepNames() {
    return this.steps().map((step) => step.name);
  }
  buildContext(args, client) {
    const context = { client };
    for (const [name, config] of Object.entries(this.definition.params)) {
      const value = args[name];
      context[name] = value === void 0 ? config.default : value;
    }
    return context;
  }
  validate(context) {
    for (const [name, config] of Object.entries(this.definition.params)) {
      if (config.required && context[name] === void 0) {
        throw new DhanError(`Missing required parameter: ${name}`, {
          code: "SKILL_PARAM_MISSING",
          details: { skill: this.definition.name, param: name }
        });
      }
    }
  }
};
function legSide(entry, optionType) {
  return optionType === "CE" ? entry.call : entry.put;
}
function legSecurityId(entry, optionType) {
  return legSide(entry, optionType)?.security_id;
}
function legPremium(entry, optionType) {
  return legSide(entry, optionType)?.last_price;
}
async function resolveChain(client, symbol, expiry, segment) {
  const instrument = await client.instruments.find(segment, symbol, {
    exactMatch: true
  });
  if (!instrument) {
    throw new DhanError(`Could not resolve symbol ${symbol} in ${segment}`, {
      code: "INSTRUMENT_NOT_FOUND",
      details: { symbol, segment }
    });
  }
  const chain = await client.optionChain.fetchNormalized({
    underlyingScrip: Number(instrument.securityId),
    underlyingSeg: segment,
    expiry
  });
  const spotPrice = chain.lastPrice ?? await client.marketFeed.ltpFor(segment, instrument.securityId);
  if (spotPrice === void 0) {
    throw new DhanError(`Could not resolve spot price for ${symbol}`, {
      code: "SPOT_PRICE_UNAVAILABLE",
      details: { symbol, segment }
    });
  }
  return { securityId: instrument.securityId, spotPrice, chain };
}
function resolveIndexChain(client, symbol, expiry) {
  return resolveChain(client, symbol, expiry, "IDX_I");
}
function resolveEquityChain(client, symbol, expiry) {
  return resolveChain(client, symbol, expiry, "NSE_EQ");
}

// src/skills/builtin/equityOverlays.ts
var equityParams = {
  symbol: {
    type: "string",
    required: true,
    description: "NSE equity symbol, e.g. RELIANCE"
  },
  expiry: {
    type: "string",
    required: true,
    description: "Option expiry date as YYYY-MM-DD"
  },
  quantity: { type: "integer", default: 100 },
  strikeOffset: {
    type: "number",
    default: 2,
    description: "Distance of the option strike from spot, in percent"
  }
};
var EquityOverlaySkill = class extends Skill {
  steps() {
    return [
      {
        name: "resolve_chain",
        run: async (context) => {
          const { securityId, spotPrice, chain } = await resolveEquityChain(
            context.client,
            context.symbol,
            context.expiry
          );
          return { ...context, equitySecurityId: securityId, spotPrice, chain };
        }
      },
      { name: "build_intent", run: (context) => this.buildIntent(context) }
    ];
  }
  requireChain(context) {
    if (!context.chain || context.spotPrice === void 0) {
      throw new DhanError("Option chain was not resolved", {
        code: "CHAIN_UNAVAILABLE"
      });
    }
    return { chain: context.chain, spot: context.spotPrice };
  }
};
var CoveredCallSkill = class extends EquityOverlaySkill {
  constructor() {
    super(...arguments);
    this.definition = {
      name: "covered_call",
      description: "Build a covered call: buy the underlying equity, sell an OTM call against it.",
      risk: "trade_adjacent_read",
      scope: "orders:read",
      params: equityParams
    };
  }
  buildIntent(context) {
    const { chain, spot } = this.requireChain(context);
    const offset = Number(context.strikeOffset ?? 2) / 100;
    const targetStrike = spot * (1 + offset);
    const call = nearestStrike(chain, targetStrike);
    if (!call) {
      throw new DhanError(
        `Could not find an OTM call strike near ${targetStrike.toFixed(2)}`,
        { code: "STRIKE_NOT_FOUND" }
      );
    }
    const premium = legPremium(call, "CE");
    return {
      ...context,
      callStrike: call.strike,
      callPremium: premium,
      intent: {
        tradeType: "COVERED_CALL",
        symbol: context.symbol,
        expiry: context.expiry,
        quantity: context.quantity,
        spotPrice: spot,
        legs: [
          {
            action: TransactionType.BUY,
            instrumentType: InstrumentType.EQUITY,
            securityId: context.equitySecurityId,
            quantity: context.quantity
          },
          {
            action: TransactionType.SELL,
            optionType: "CE",
            strike: call.strike,
            securityId: legSecurityId(call, "CE"),
            quantity: context.quantity,
            premium
          }
        ],
        note: `Covered call prepared: buy ${context.quantity} ${context.symbol}, sell ${context.quantity} ${call.strike} CE. Await human confirmation.`
      }
    };
  }
};
var ProtectivePutSkill = class extends EquityOverlaySkill {
  constructor() {
    super(...arguments);
    this.definition = {
      name: "protective_put",
      description: "Build a protective put: buy the underlying equity, buy an OTM put as downside insurance.",
      risk: "trade_adjacent_read",
      scope: "orders:read",
      params: {
        ...equityParams,
        maxPremiumPct: {
          type: "number",
          default: 3,
          description: "Reject the structure if the put costs more than this share of spot"
        }
      }
    };
  }
  buildIntent(context) {
    const { chain, spot } = this.requireChain(context);
    const offset = Number(context.strikeOffset ?? 2) / 100;
    const maxPremiumPct = Number(context.maxPremiumPct ?? 3);
    const targetStrike = spot * (1 - offset);
    const put = nearestStrike(chain, targetStrike);
    if (!put) {
      throw new DhanError(
        `Could not find an OTM put strike near ${targetStrike.toFixed(2)}`,
        { code: "STRIKE_NOT_FOUND" }
      );
    }
    const premium = legPremium(put, "PE") ?? 0;
    const premiumPct = premium / spot * 100;
    if (premiumPct > maxPremiumPct) {
      throw new DhanError(
        `Put premium ${premiumPct.toFixed(2)}% exceeds max ${maxPremiumPct}%`,
        { code: "PREMIUM_TOO_HIGH", details: { premium, spot } }
      );
    }
    return {
      ...context,
      putStrike: put.strike,
      putPremium: premium,
      intent: {
        tradeType: "PROTECTIVE_PUT",
        symbol: context.symbol,
        expiry: context.expiry,
        quantity: context.quantity,
        spotPrice: spot,
        premiumPct: Number(premiumPct.toFixed(2)),
        legs: [
          {
            action: TransactionType.BUY,
            instrumentType: InstrumentType.EQUITY,
            securityId: context.equitySecurityId,
            quantity: context.quantity
          },
          {
            action: TransactionType.BUY,
            optionType: "PE",
            strike: put.strike,
            securityId: legSecurityId(put, "PE"),
            quantity: context.quantity,
            premium
          }
        ],
        note: `Protective put prepared: buy ${context.quantity} ${context.symbol}, buy ${context.quantity} ${put.strike} PE. Await human confirmation.`
      }
    };
  }
};

// src/analytics/maxPain.ts
function maxPain(data) {
  return detailedMaxPain(data)?.maxPainStrike;
}
function detailedMaxPain(data) {
  if (data.length === 0) {
    return void 0;
  }
  const painDistribution = data.map((entry) => ({
    strike: entry.strike,
    pain: data.reduce(
      (total, row) => total + painAtStrike(row, entry.strike),
      0
    )
  }));
  const minimum = painDistribution.reduce(
    (best, entry) => entry.pain < best.pain ? entry : best
  );
  return {
    maxPainStrike: minimum.strike,
    totalPain: minimum.pain,
    painDistribution
  };
}
function painAtStrike(row, expiryStrike) {
  const callPain = expiryStrike > row.strike ? (expiryStrike - row.strike) * row.callOi : 0;
  const putPain = expiryStrike < row.strike ? (row.strike - expiryStrike) * row.putOi : 0;
  return callPain + putPain;
}
function putCallRatio(data) {
  const totalCallOi = data.reduce((total, entry) => total + entry.callOi, 0);
  const totalPutOi = data.reduce((total, entry) => total + entry.putOi, 0);
  return totalCallOi === 0 ? 0 : totalPutOi / totalCallOi;
}
function openInterestFromChain(chain) {
  return chain.strikes.map((entry) => ({
    strike: entry.strike,
    callOi: entry.call?.oi ?? 0,
    putOi: entry.put?.oi ?? 0
  }));
}
function highestCallOi(chain, count = 3) {
  return chain.strikes.map((entry) => ({ strike: entry.strike, oi: entry.call?.oi ?? 0 })).sort((a, b) => b.oi - a.oi).slice(0, count);
}
function highestPutOi(chain, count = 3) {
  return chain.strikes.map((entry) => ({ strike: entry.strike, oi: entry.put?.oi ?? 0 })).sort((a, b) => b.oi - a.oi).slice(0, count);
}

// src/ta/candles.ts
function parseTimestamp(value) {
  if (typeof value === "number") {
    return value;
  }
  if (/^\d+$/.test(value)) {
    const numeric = Number(value);
    return value.length >= 13 ? Math.floor(numeric / 1e3) : numeric;
  }
  return Math.floor(new Date(value).getTime() / 1e3);
}
function candlesFromSeries(series) {
  if (!series) {
    return [];
  }
  const { timestamp, open, high, low, close, volume, open_interest: oi } = series;
  if (!timestamp || !open || !high || !low || !close) {
    return [];
  }
  const candles = [];
  for (let index = 0; index < close.length; index += 1) {
    const candle = {
      timestamp: parseTimestamp(timestamp[index]),
      open: Number(open[index]),
      high: Number(high[index]),
      low: Number(low[index]),
      close: Number(close[index]),
      volume: Number(volume?.[index] ?? 0),
      openInterest: oi?.[index] === void 0 ? void 0 : Number(oi[index])
    };
    if (Number.isFinite(candle.open) && Number.isFinite(candle.high) && Number.isFinite(candle.low) && Number.isFinite(candle.close)) {
      candles.push(candle);
    }
  }
  return candles;
}
function resample(candles, minutes) {
  if (minutes <= 1) {
    return candles;
  }
  const bucketSeconds = minutes * 60;
  const buckets = /* @__PURE__ */ new Map();
  for (const candle of candles) {
    const key = Math.floor(candle.timestamp / bucketSeconds) * bucketSeconds;
    const bucket = buckets.get(key);
    if (!bucket) {
      buckets.set(key, { ...candle, timestamp: key });
      continue;
    }
    bucket.high = Math.max(bucket.high, candle.high);
    bucket.low = Math.min(bucket.low, candle.low);
    bucket.close = candle.close;
    bucket.volume += candle.volume;
    bucket.openInterest = candle.openInterest ?? bucket.openInterest;
  }
  return [...buckets.values()].sort((a, b) => a.timestamp - b.timestamp);
}
function closes(candles) {
  return candles.map((candle) => candle.close);
}

// src/ta/indicators.ts
function sma(data, period = 20) {
  if (data.length === 0 || period < 1) {
    return [];
  }
  return data.map((_, index) => {
    if (index < period - 1) {
      return null;
    }
    const window = data.slice(index - period + 1, index + 1);
    return window.reduce((total, value) => total + value, 0) / period;
  });
}
function ema(data, period = 20) {
  if (data.length === 0 || period < 1) {
    return [];
  }
  const multiplier = 2 / (period + 1);
  const values = [];
  data.forEach((price, index) => {
    if (index < period - 1) {
      values.push(null);
      return;
    }
    if (index === period - 1) {
      const window = data.slice(0, index + 1);
      values.push(window.reduce((total, value) => total + value, 0) / period);
      return;
    }
    const previous = values[index - 1];
    values.push((price - previous) * multiplier + previous);
  });
  return values;
}
function rsi(data, period = 14) {
  if (data.length < period + 1 || period < 1) {
    return [];
  }
  const changes = data.slice(1).map((value, index) => value - data[index]);
  const opening = changes.slice(0, period);
  let averageGain = opening.filter((change) => change > 0).reduce((a, b) => a + b, 0) / period;
  let averageLoss = opening.filter((change) => change < 0).reduce((a, b) => a + Math.abs(b), 0) / period;
  const values = new Array(period).fill(null);
  values.push(rsiFromAverages(averageGain, averageLoss));
  for (const change of changes.slice(period)) {
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    averageGain = (averageGain * (period - 1) + gain) / period;
    averageLoss = (averageLoss * (period - 1) + loss) / period;
    values.push(rsiFromAverages(averageGain, averageLoss));
  }
  return values;
}
function rsiFromAverages(averageGain, averageLoss) {
  if (averageLoss === 0) {
    return 100;
  }
  if (averageGain === 0) {
    return 0;
  }
  return 100 - 100 / (1 + averageGain / averageLoss);
}
function macd(data, { fastPeriod = 12, slowPeriod = 26, signalPeriod = 9 } = {}) {
  if (data.length === 0) {
    return { macdLine: [], signalLine: [], histogram: [] };
  }
  const fast = ema(data, fastPeriod);
  const slow = ema(data, slowPeriod);
  const macdLine = data.map((_, index) => {
    const fastValue = fast[index];
    const slowValue = slow[index];
    return fastValue === null || slowValue === null ? null : fastValue - slowValue;
  });
  const defined = macdLine.filter((value) => value !== null);
  const signalRaw = defined.length === 0 ? [] : ema(defined, signalPeriod);
  const signalLine = [
    ...new Array(macdLine.length - signalRaw.length).fill(null),
    ...signalRaw
  ];
  const histogram = macdLine.map((value, index) => {
    const signal = signalLine[index];
    return value === null || signal === null || signal === void 0 ? null : value - signal;
  });
  return { macdLine, signalLine, histogram };
}
function bollingerBands(data, { period = 20, standardDeviations = 2 } = {}) {
  if (data.length === 0) {
    return { upper: [], middle: [], lower: [] };
  }
  const middle = sma(data, period);
  const upper = [];
  const lower = [];
  data.forEach((_, index) => {
    const mean = middle[index];
    if (mean === null || mean === void 0) {
      upper.push(null);
      lower.push(null);
      return;
    }
    const window = data.slice(index - period + 1, index + 1);
    const variance = window.reduce((total, value) => total + (value - mean) ** 2, 0) / period;
    const deviation = Math.sqrt(variance);
    upper.push(mean + standardDeviations * deviation);
    lower.push(mean - standardDeviations * deviation);
  });
  return { upper, middle, lower };
}
function trueRanges(bars) {
  return bars.map((bar, index) => {
    if (index === 0) {
      return Math.abs(bar.high - bar.low);
    }
    const previousClose = bars[index - 1].close;
    return Math.max(
      bar.high - bar.low,
      Math.abs(bar.high - previousClose),
      Math.abs(bar.low - previousClose)
    );
  });
}
function atr(bars, period = 14) {
  if (bars.length < 2 || period < 1) {
    return [];
  }
  const ranges = trueRanges(bars);
  const values = new Array(bars.length).fill(null);
  if (ranges.length <= period) {
    return values;
  }
  let current = ranges.slice(1, period + 1).reduce((total, value) => total + value, 0) / period;
  values[period] = current;
  for (let index = period + 1; index < ranges.length; index += 1) {
    current = (current * (period - 1) + ranges[index]) / period;
    values[index] = current;
  }
  return values;
}
function adx(bars, period = 14) {
  const empty = { adx: [], plusDi: [], minusDi: [] };
  if (bars.length < period * 2) {
    return empty;
  }
  const plusDm = [0];
  const minusDm = [0];
  for (let index = 1; index < bars.length; index += 1) {
    const upMove = bars[index].high - bars[index - 1].high;
    const downMove = bars[index - 1].low - bars[index].low;
    plusDm.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDm.push(downMove > upMove && downMove > 0 ? downMove : 0);
  }
  const ranges = trueRanges(bars);
  let smoothTr = ranges.slice(0, period).reduce((a, b) => a + b, 0);
  let smoothPlusDm = plusDm.slice(0, period).reduce((a, b) => a + b, 0);
  let smoothMinusDm = minusDm.slice(0, period).reduce((a, b) => a + b, 0);
  const adxValues = new Array(bars.length).fill(null);
  const plusDiValues = new Array(bars.length).fill(null);
  const minusDiValues = new Array(bars.length).fill(null);
  const dxValues = [];
  for (let index = period; index < bars.length; index += 1) {
    smoothTr = smoothTr - smoothTr / period + ranges[index];
    smoothPlusDm = smoothPlusDm - smoothPlusDm / period + plusDm[index];
    smoothMinusDm = smoothMinusDm - smoothMinusDm / period + minusDm[index];
    if (smoothTr === 0) {
      continue;
    }
    const plusDi = 100 * (smoothPlusDm / smoothTr);
    const minusDi = 100 * (smoothMinusDm / smoothTr);
    plusDiValues[index] = plusDi;
    minusDiValues[index] = minusDi;
    const diSum = plusDi + minusDi;
    dxValues.push(diSum === 0 ? 0 : 100 * (Math.abs(plusDi - minusDi) / diSum));
    if (dxValues.length >= period) {
      adxValues[index] = dxValues.slice(-period).reduce((a, b) => a + b, 0) / period;
    }
  }
  return { adx: adxValues, plusDi: plusDiValues, minusDi: minusDiValues };
}
function stochastic(bars, { period = 14, signalPeriod = 3 } = {}) {
  if (bars.length === 0) {
    return { k: [], d: [] };
  }
  const k = bars.map((bar, index) => {
    if (index < period - 1) {
      return null;
    }
    const window = bars.slice(index - period + 1, index + 1);
    const highest = Math.max(...window.map((entry) => entry.high));
    const lowest = Math.min(...window.map((entry) => entry.low));
    const range = highest - lowest;
    return range === 0 ? 100 : (bar.close - lowest) / range * 100;
  });
  const defined = k.filter((value) => value !== null);
  const dRaw = defined.length === 0 ? [] : sma(defined, signalPeriod);
  const d = [
    ...new Array(k.length - dRaw.length).fill(null),
    ...dRaw
  ];
  return { k, d };
}
function supertrend(bars, { period = 10, multiplier = 3 } = {}) {
  const atrValues = atr(bars, period);
  const trend = new Array(bars.length).fill(null);
  const direction = new Array(bars.length).fill(null);
  let upperBand = 0;
  let lowerBand = 0;
  let currentDirection = 1;
  bars.forEach((bar, index) => {
    const atrValue = atrValues[index];
    if (atrValue === null || atrValue === void 0) {
      return;
    }
    const mid = (bar.high + bar.low) / 2;
    const rawUpper = mid + multiplier * atrValue;
    const rawLower = mid - multiplier * atrValue;
    const previousClose = bars[index - 1]?.close ?? bar.close;
    upperBand = rawUpper < upperBand || previousClose > upperBand ? rawUpper : upperBand;
    lowerBand = rawLower > lowerBand || previousClose < lowerBand ? rawLower : lowerBand;
    if (bar.close > upperBand) {
      currentDirection = 1;
    } else if (bar.close < lowerBand) {
      currentDirection = -1;
    }
    direction[index] = currentDirection;
    trend[index] = currentDirection === 1 ? lowerBand : upperBand;
  });
  return { trend, direction };
}
function vwap(bars) {
  let cumulativeVolume = 0;
  let cumulativeNotional = 0;
  return bars.map((bar) => {
    const volume = bar.volume ?? 0;
    const typical = (bar.high + bar.low + bar.close) / 3;
    cumulativeVolume += volume;
    cumulativeNotional += typical * volume;
    return cumulativeVolume === 0 ? null : cumulativeNotional / cumulativeVolume;
  });
}
function latest(series) {
  for (let index = series.length - 1; index >= 0; index -= 1) {
    const value = series[index];
    if (value !== null && value !== void 0) {
      return value;
    }
  }
  return null;
}

// src/ta/marketCalendar.ts
var IST_OFFSET_MINUTES = 330;
var MS_PER_DAY = 24 * 60 * 60 * 1e3;
var MARKET_HOLIDAYS = /* @__PURE__ */ new Set([
  // 2025
  "2025-02-26",
  "2025-03-14",
  "2025-03-31",
  "2025-04-10",
  "2025-04-14",
  "2025-04-18",
  "2025-05-01",
  "2025-08-15",
  "2025-08-27",
  "2025-10-02",
  "2025-10-21",
  "2025-10-22",
  "2025-11-05",
  "2025-12-25",
  // 2026
  "2026-01-26",
  "2026-03-04",
  "2026-04-01",
  "2026-04-03",
  "2026-04-14",
  "2026-05-01",
  "2026-08-15",
  "2026-10-02",
  "2026-12-25"
]);
function toIstDateString(date = /* @__PURE__ */ new Date()) {
  const shifted = new Date(date.getTime() + IST_OFFSET_MINUTES * 60 * 1e3);
  return shifted.toISOString().slice(0, 10);
}
function fromDateString(value) {
  return /* @__PURE__ */ new Date(`${value}T00:00:00.000Z`);
}
function addDays(value, days) {
  return new Date(fromDateString(value).getTime() + days * MS_PER_DAY).toISOString().slice(0, 10);
}
function isWeekday(value) {
  const day = fromDateString(value).getUTCDay();
  return day >= 1 && day <= 5;
}
function isTradingDay(value) {
  return isWeekday(value) && !MARKET_HOLIDAYS.has(value);
}
function lastTradingDay(from = toIstDateString()) {
  let cursor = from;
  while (!isTradingDay(cursor)) {
    cursor = addDays(cursor, -1);
  }
  return cursor;
}
function previousTradingDay(from = toIstDateString()) {
  return lastTradingDay(addDays(from, -1));
}
function todayOrLastTradingDay() {
  return lastTradingDay(toIstDateString());
}
function tradingDaysAgo(date, days) {
  if (days < 0) {
    throw new RangeError("days must be >= 0");
  }
  let cursor = isTradingDay(date) ? date : todayOrLastTradingDay();
  for (let count = 0; count < days; count += 1) {
    cursor = previousTradingDay(cursor);
  }
  return cursor;
}

// src/skills/builtin/marketDataSummarizer.ts
var MarketDataSummarizerSkill = class extends Skill {
  constructor() {
    super(...arguments);
    this.definition = {
      name: "market_data_summarizer",
      description: "Summarize technicals and/or option chain (PCR, OI walls, max pain, ATM strikes) for a symbol.",
      risk: "read_only",
      scope: "market:read",
      params: {
        underlyingSymbol: {
          type: "string",
          required: true,
          description: "Underlying ticker symbol, e.g. NIFTY or RELIANCE"
        },
        mode: {
          type: "string",
          default: "both",
          description: "One of: both, technicals, option_chain"
        },
        rangeDays: {
          type: "integer",
          default: 60,
          description: "Trading days of daily candles to analyze"
        },
        expiry: {
          type: "string",
          default: "nearest",
          description: "Expiry date as YYYY-MM-DD, or 'nearest'"
        },
        strikeRange: {
          type: "integer",
          default: 5,
          description: "Strikes to include either side of ATM"
        }
      }
    };
  }
  steps() {
    return [
      { name: "resolve_instrument", run: (context) => this.resolve(context) },
      { name: "fetch_technicals", run: (context) => this.technicals(context) },
      { name: "fetch_option_chain", run: (context) => this.optionChain(context) },
      {
        name: "prepare_summary",
        run: (context) => ({
          ...context,
          summary: {
            symbol: context.underlyingSymbol,
            securityId: context.instrument?.securityId,
            exchangeSegment: context.instrument?.exchangeSegment,
            technicals: context.technicalSummary,
            optionChain: context.optionChainSummary
          }
        })
      }
    ];
  }
  /** Indices first, then cash equity, then a broad search. */
  async resolve(context) {
    const symbol = String(context.underlyingSymbol).trim().toUpperCase();
    const instrument = await context.client.instruments.find("IDX_I", symbol, {
      exactMatch: true
    }) ?? await context.client.instruments.find("NSE_EQ", symbol, {
      exactMatch: true
    }) ?? await context.client.instruments.findAnywhere(symbol);
    if (!instrument) {
      throw new DhanError(`Underlying symbol not found: ${symbol}`, {
        code: "INSTRUMENT_NOT_FOUND",
        details: { symbol }
      });
    }
    return { ...context, instrument };
  }
  async technicals(context) {
    if (context.mode !== "both" && context.mode !== "technicals") {
      return context;
    }
    const instrument = context.instrument;
    if (!instrument) {
      return context;
    }
    const toDate = todayOrLastTradingDay();
    const rangeDays = Number(context.rangeDays ?? 60);
    const fromDate = tradingDaysAgo(toDate, Math.max(rangeDays, 60));
    const response = await context.client.charts.historical({
      securityId: instrument.securityId,
      exchangeSegment: instrument.exchangeSegment,
      instrument: instrument.instrument,
      fromDate,
      toDate
    });
    const candles = candlesFromSeries(response);
    if (candles.length === 0) {
      const ltp = await context.client.marketFeed.ltpFor(
        instrument.exchangeSegment ?? "NSE_EQ",
        instrument.securityId
      );
      return {
        ...context,
        technicalSummary: {
          ltp: ltp ?? null,
          note: "No historical candles available; using a quote snapshot instead."
        }
      };
    }
    const closeSeries = closes(candles);
    const previous = closeSeries[closeSeries.length - 6];
    const last = closeSeries[closeSeries.length - 1];
    return {
      ...context,
      technicalSummary: {
        ltp: last,
        sma20: round(latest(sma(closeSeries, 20))),
        sma50: round(latest(sma(closeSeries, 50))),
        rsi14: round(latest(rsi(closeSeries, 14))),
        return5dPct: previous ? round((last / previous - 1) * 100) : null,
        dataPointsAnalyzed: closeSeries.length,
        from: fromDate,
        to: toDate
      }
    };
  }
  async optionChain(context) {
    if (context.mode !== "both" && context.mode !== "option_chain") {
      return context;
    }
    const instrument = context.instrument;
    if (!instrument) {
      return context;
    }
    const underlyingSeg = instrument.exchangeSegment === "IDX_I" ? "IDX_I" : "NSE_EQ";
    const underlyingScrip = Number(instrument.securityId);
    let expiry = String(context.expiry ?? "nearest");
    if (expiry === "" || expiry === "nearest") {
      const expiries = await context.client.optionChain.expiryList({
        underlyingScrip,
        underlyingSeg
      });
      const nearest = expiries.data?.[0];
      if (!nearest) {
        return context;
      }
      expiry = nearest;
    }
    const chain = await context.client.optionChain.fetchNormalized({
      underlyingScrip,
      underlyingSeg,
      expiry
    });
    return {
      ...context,
      optionChainSummary: summarizeChain(
        chain,
        expiry,
        Number(context.strikeRange ?? 5)
      )
    };
  }
};
function summarizeChain(chain, expiry, strikeRange) {
  const spot = chain.lastPrice ?? 0;
  const atm = nearestStrike(chain, spot);
  const atmIndex = atm ? chain.strikes.findIndex((entry) => entry.strike === atm.strike) : 0;
  const start = Math.max(0, atmIndex - strikeRange);
  const end = Math.min(chain.strikes.length, atmIndex + strikeRange + 1);
  const openInterest = openInterestFromChain(chain);
  return {
    expiry,
    spot,
    atmStrike: atm?.strike ?? null,
    pcr: round(putCallRatio(openInterest), 3),
    maxPain: maxPain(openInterest) ?? null,
    resistanceWalls: highestCallOi(chain, 3),
    supportWalls: highestPutOi(chain, 3),
    strikes: chain.strikes.slice(start, end).map((entry) => ({
      strike: entry.strike,
      ce: entry.call ? {
        securityId: entry.call.security_id,
        ltp: entry.call.last_price,
        oi: entry.call.oi,
        iv: entry.call.implied_volatility
      } : null,
      pe: entry.put ? {
        securityId: entry.put.security_id,
        ltp: entry.put.last_price,
        oi: entry.put.oi,
        iv: entry.put.implied_volatility
      } : null
    }))
  };
}
function round(value, digits = 2) {
  return value === null ? null : Number(value.toFixed(digits));
}

// src/skills/builtin/optionStructures.ts
var OptionStructureSkill = class extends Skill {
  steps() {
    return [
      {
        name: "resolve_chain",
        run: async (context) => {
          const { spotPrice, chain } = await resolveIndexChain(
            context.client,
            context.symbol,
            context.expiry
          );
          return { ...context, spotPrice, chain };
        }
      },
      { name: "select_legs", run: (context) => this.selectLegs(context) },
      { name: "build_intent", run: (context) => this.buildIntent(context) }
    ];
  }
  requireChain(context) {
    if (!context.chain || context.spotPrice === void 0) {
      throw new DhanError("Option chain was not resolved", {
        code: "CHAIN_UNAVAILABLE"
      });
    }
    return { chain: context.chain, spot: context.spotPrice };
  }
  leg(entry, optionType, action) {
    if (!entry) {
      throw new DhanError("Strike not present in option chain", {
        code: "STRIKE_NOT_FOUND"
      });
    }
    return {
      action,
      optionType,
      strike: entry.strike,
      securityId: legSecurityId(entry, optionType),
      premium: legPremium(entry, optionType)
    };
  }
};
var indexParams = {
  symbol: {
    type: "string",
    required: true,
    description: "Index symbol, e.g. NIFTY or BANKNIFTY"
  },
  expiry: {
    type: "string",
    required: true,
    description: "Option expiry date as YYYY-MM-DD"
  }
};
var BuyAtmCallSkill = class extends OptionStructureSkill {
  constructor() {
    super(...arguments);
    this.definition = {
      name: "buy_atm_call",
      description: "Buy an at-the-money call option on an index (e.g. NIFTY).",
      risk: "trade_adjacent_read",
      scope: "orders:read",
      params: {
        ...indexParams,
        quantity: { type: "integer", default: 50 },
        stopLoss: { type: "number", default: 100 },
        target: { type: "number", default: 200 }
      }
    };
  }
  selectLegs(context) {
    const { chain, spot } = this.requireChain(context);
    const atm = nearestStrike(chain, spot);
    return {
      ...context,
      legs: [this.leg(atm, "CE", TransactionType.BUY)]
    };
  }
  buildIntent(context) {
    const leg = context.legs?.[0];
    return {
      ...context,
      intent: {
        tradeType: "OPTIONS_BUY",
        symbol: context.symbol,
        expiry: context.expiry,
        instrument: `${context.symbol} ${leg?.strike} CE`,
        securityId: leg?.securityId,
        strike: leg?.strike,
        optionType: "CE",
        quantity: context.quantity,
        premium: leg?.premium,
        stopLoss: context.stopLoss,
        target: context.target,
        note: "Prepared ATM call buy. Await human confirmation."
      }
    };
  }
};
var StraddleSkill = class extends OptionStructureSkill {
  constructor() {
    super(...arguments);
    this.definition = {
      name: "straddle",
      description: "Build a long straddle: buy ATM call + buy ATM put at the same strike.",
      risk: "trade_adjacent_read",
      scope: "orders:read",
      params: {
        ...indexParams,
        quantity: { type: "integer", default: 25 },
        stopLoss: { type: "number", default: 300 },
        target: { type: "number", default: 600 }
      }
    };
  }
  selectLegs(context) {
    const { chain, spot } = this.requireChain(context);
    const atm = nearestStrike(chain, spot);
    return {
      ...context,
      atmStrike: atm?.strike,
      legs: [
        this.leg(atm, "CE", TransactionType.BUY),
        this.leg(atm, "PE", TransactionType.BUY)
      ]
    };
  }
  buildIntent(context) {
    const legs = context.legs ?? [];
    const totalPremium = legs.reduce((total, leg) => total + (leg.premium ?? 0), 0);
    const strike = Number(context.atmStrike ?? 0);
    return {
      ...context,
      totalPremium,
      intent: {
        tradeType: "STRADDLE",
        symbol: context.symbol,
        expiry: context.expiry,
        quantity: context.quantity,
        legs,
        totalPremium,
        // Both breakevens sit one combined premium away from the strike.
        breakEvenUpside: strike + totalPremium,
        breakEvenDownside: strike - totalPremium,
        stopLoss: context.stopLoss,
        target: context.target,
        note: "Long straddle prepared. Await human confirmation."
      }
    };
  }
};
var StrangleSkill = class extends OptionStructureSkill {
  constructor() {
    super(...arguments);
    this.definition = {
      name: "strangle",
      description: "Build a long strangle: buy OTM call + buy OTM put around the current spot price.",
      risk: "trade_adjacent_read",
      scope: "orders:read",
      params: {
        ...indexParams,
        quantity: { type: "integer", default: 50 },
        offsetPct: {
          type: "number",
          default: 1,
          description: "Distance of each strike from spot, in percent"
        },
        stopLoss: { type: "number", default: 200 },
        target: { type: "number", default: 400 }
      }
    };
  }
  selectLegs(context) {
    const { chain, spot } = this.requireChain(context);
    const offset = Number(context.offsetPct ?? 1) / 100;
    return {
      ...context,
      legs: [
        this.leg(
          nearestStrike(chain, spot * (1 + offset)),
          "CE",
          TransactionType.BUY
        ),
        this.leg(
          nearestStrike(chain, spot * (1 - offset)),
          "PE",
          TransactionType.BUY
        )
      ]
    };
  }
  buildIntent(context) {
    return {
      ...context,
      intent: {
        tradeType: "STRANGLE",
        symbol: context.symbol,
        expiry: context.expiry,
        quantity: context.quantity,
        legs: context.legs,
        stopLoss: context.stopLoss,
        target: context.target,
        note: "Long strangle prepared. Await human confirmation."
      }
    };
  }
};
var IronCondorSkill = class extends OptionStructureSkill {
  constructor() {
    super(...arguments);
    this.definition = {
      name: "iron_condor",
      description: "Build an iron condor: sell OTM call + sell OTM put, buy further OTM call + put for protection.",
      risk: "trade_adjacent_read",
      scope: "orders:read",
      params: {
        ...indexParams,
        quantity: { type: "integer", default: 50 },
        wingWidth: {
          type: "number",
          default: 200,
          description: "Points between the short and long strike on each side"
        },
        maxLoss: { type: "number", default: 5e3 }
      }
    };
  }
  selectLegs(context) {
    const { chain, spot } = this.requireChain(context);
    const wing = Number(context.wingWidth ?? 200);
    const atm = nearestStrike(chain, spot);
    if (!atm) {
      throw new DhanError("Option chain is empty", { code: "CHAIN_EMPTY" });
    }
    const shortCall = findStrike(chain, atm.strike + wing);
    const longCall = findStrike(chain, atm.strike + wing * 2);
    const shortPut = findStrike(chain, atm.strike - wing);
    const longPut = findStrike(chain, atm.strike - wing * 2);
    if (!shortCall || !longCall || !shortPut || !longPut) {
      throw new DhanError(
        "Could not build iron condor \u2014 insufficient strikes in chain",
        { code: "STRIKE_NOT_FOUND", details: { atmStrike: atm.strike, wing } }
      );
    }
    return {
      ...context,
      atmStrike: atm.strike,
      legs: [
        this.leg(shortCall, "CE", TransactionType.SELL),
        this.leg(longCall, "CE", TransactionType.BUY),
        this.leg(shortPut, "PE", TransactionType.SELL),
        this.leg(longPut, "PE", TransactionType.BUY)
      ]
    };
  }
  buildIntent(context) {
    return {
      ...context,
      intent: {
        tradeType: "IRON_CONDOR",
        symbol: context.symbol,
        expiry: context.expiry,
        quantity: context.quantity,
        wingWidth: context.wingWidth,
        maxLoss: context.maxLoss,
        legs: context.legs,
        note: "Iron condor prepared. Await human confirmation before execution."
      }
    };
  }
};
var BullPutSpreadSkill = class extends OptionStructureSkill {
  constructor() {
    super(...arguments);
    this.definition = {
      name: "bull_put_spread",
      description: "Build a bull put spread: sell an OTM put, buy a further OTM put for defined risk.",
      risk: "trade_adjacent_read",
      scope: "orders:read",
      params: {
        ...indexParams,
        quantity: { type: "integer", default: 50 },
        spreadWidth: { type: "number", default: 200 },
        maxLoss: { type: "number", default: 5e3 }
      }
    };
  }
  selectLegs(context) {
    const { chain, spot } = this.requireChain(context);
    const spread = Number(context.spreadWidth ?? 200);
    const atm = nearestStrike(chain, spot);
    if (!atm) {
      throw new DhanError("Option chain is empty", { code: "CHAIN_EMPTY" });
    }
    const shortPut = findStrike(chain, atm.strike - spread);
    const longPut = findStrike(chain, atm.strike - spread * 2);
    if (!shortPut || !longPut) {
      throw new DhanError(
        "Could not build bull put spread \u2014 insufficient strikes in chain",
        { code: "STRIKE_NOT_FOUND" }
      );
    }
    return {
      ...context,
      legs: [
        this.leg(shortPut, "PE", TransactionType.SELL),
        this.leg(longPut, "PE", TransactionType.BUY)
      ]
    };
  }
  buildIntent(context) {
    return {
      ...context,
      intent: {
        tradeType: "BULL_PUT_SPREAD",
        symbol: context.symbol,
        expiry: context.expiry,
        quantity: context.quantity,
        spreadWidth: context.spreadWidth,
        maxLoss: context.maxLoss,
        legs: context.legs,
        note: "Bull put spread prepared. Await human confirmation before execution."
      }
    };
  }
};
var BearCallSpreadSkill = class extends OptionStructureSkill {
  constructor() {
    super(...arguments);
    this.definition = {
      name: "bear_call_spread",
      description: "Build a bear call spread: sell an OTM call, buy a further OTM call for defined risk.",
      risk: "trade_adjacent_read",
      scope: "orders:read",
      params: {
        ...indexParams,
        quantity: { type: "integer", default: 50 },
        spreadWidth: { type: "number", default: 200 },
        maxLoss: { type: "number", default: 5e3 }
      }
    };
  }
  selectLegs(context) {
    const { chain, spot } = this.requireChain(context);
    const spread = Number(context.spreadWidth ?? 200);
    const atm = nearestStrike(chain, spot);
    if (!atm) {
      throw new DhanError("Option chain is empty", { code: "CHAIN_EMPTY" });
    }
    const shortCall = findStrike(chain, atm.strike + spread);
    const longCall = findStrike(chain, atm.strike + spread * 2);
    if (!shortCall || !longCall) {
      throw new DhanError(
        "Could not build bear call spread \u2014 insufficient strikes in chain",
        { code: "STRIKE_NOT_FOUND" }
      );
    }
    return {
      ...context,
      legs: [
        this.leg(shortCall, "CE", TransactionType.SELL),
        this.leg(longCall, "CE", TransactionType.BUY)
      ]
    };
  }
  buildIntent(context) {
    return {
      ...context,
      intent: {
        tradeType: "BEAR_CALL_SPREAD",
        symbol: context.symbol,
        expiry: context.expiry,
        quantity: context.quantity,
        spreadWidth: context.spreadWidth,
        maxLoss: context.maxLoss,
        legs: context.legs,
        note: "Bear call spread prepared. Await human confirmation before execution."
      }
    };
  }
};

// src/skills/builtin/positionManagement.ts
var SquareOffAllSkill = class extends Skill {
  constructor() {
    super(...arguments);
    this.definition = {
      name: "square_off_all",
      description: "Exit all open positions at market price.",
      risk: "destructive_write",
      scope: "orders:write",
      params: {}
    };
  }
  steps() {
    return [
      {
        name: "fetch_positions",
        run: async (context) => {
          const positions = await context.client.positions.list();
          const open = positions.filter(
            (position) => Number(position.netQty ?? 0) !== 0
          );
          return { ...context, positions: open };
        }
      },
      {
        name: "exit_positions",
        run: async (context) => {
          const open = context.positions ?? [];
          if (open.length === 0) {
            return { ...context, exited: false, openCount: 0 };
          }
          const result = await context.client.positions.exitAll();
          return {
            ...context,
            exited: true,
            openCount: open.length,
            exitResult: result
          };
        }
      }
    ];
  }
};
var SquareOffPositionSkill = class extends Skill {
  constructor() {
    super(...arguments);
    this.definition = {
      name: "square_off_position",
      description: "Exit a specific open position by symbol and exchange segment.",
      risk: "destructive_write",
      scope: "orders:write",
      params: {
        symbol: { type: "string", required: true },
        exchangeSegment: { type: "string", required: true }
      }
    };
  }
  steps() {
    return [
      {
        name: "find_position",
        run: async (context) => {
          const symbol = String(context.symbol).toUpperCase();
          const segment = String(context.exchangeSegment);
          const positions = await context.client.positions.list();
          const target = positions.find(
            (position) => String(position.exchangeSegment ?? "") === segment && String(position.tradingSymbol ?? "").toUpperCase() === symbol && Number(position.netQty ?? 0) !== 0
          );
          if (!target) {
            throw new DhanError(
              `No open position found for ${symbol} on ${segment}`,
              { code: "POSITION_NOT_FOUND", details: { symbol, segment } }
            );
          }
          return {
            ...context,
            position: target,
            securityId: target.securityId,
            netQuantity: Number(target.netQty ?? 0)
          };
        }
      },
      {
        name: "exit_position",
        run: async (context) => {
          const position = context.position;
          const netQuantity = Number(context.netQuantity ?? 0);
          const result = await context.client.orders.place({
            transactionType: netQuantity > 0 ? "SELL" : "BUY",
            exchangeSegment: String(
              position.exchangeSegment
            ),
            productType: String(position.productType),
            orderType: "MARKET",
            validity: "DAY",
            quantity: Math.abs(netQuantity),
            securityId: String(position.securityId)
          });
          return { ...context, exited: true, exitResult: result };
        }
      }
    ];
  }
};

// src/skills/builtin/index.ts
function builtinSkills() {
  return [
    new BuyAtmCallSkill(),
    new StraddleSkill(),
    new StrangleSkill(),
    new IronCondorSkill(),
    new BullPutSpreadSkill(),
    new BearCallSpreadSkill(),
    new CoveredCallSkill(),
    new ProtectivePutSkill(),
    new SquareOffAllSkill(),
    new SquareOffPositionSkill(),
    new MarketDataSummarizerSkill()
  ];
}
function createSkillRegistry() {
  return new SkillRegistry().registerAll(builtinSkills());
}

// src/ta/TechnicalAnalysis.ts
var TIMEFRAMES = {
  1: "m1",
  5: "m5",
  15: "m15",
  25: "m25",
  60: "m60"
};
var DEFAULTS = {
  rsiPeriod: 14,
  atrPeriod: 14,
  adxPeriod: 14,
  macdFast: 12,
  macdSlow: 26,
  macdSignal: 9,
  smaPeriod: 20,
  emaPeriod: 20,
  bollingerPeriod: 20,
  throttleMs: 1e3
};
var TechnicalAnalysis = class {
  constructor(charts, options = {}) {
    this.charts = charts;
    this.options = { ...DEFAULTS, ...options };
  }
  /** Fetches candles per interval and computes indicators for each. */
  async compute(request) {
    const intervals = request.intervals ?? [1, 5, 15, 25, 60];
    const toDate = this.normalizeToDate(request.toDate);
    const daysBack = request.daysBack && request.daysBack > 0 ? request.daysBack : this.autoDaysNeeded(intervals);
    const fromDate = this.normalizeFromDate(request.fromDate, toDate, daysBack);
    const indicators = {};
    for (const [index, interval] of intervals.entries()) {
      const key = TIMEFRAMES[interval];
      if (!key) {
        continue;
      }
      const response = await this.charts.intraday({
        securityId: request.securityId,
        exchangeSegment: request.exchangeSegment,
        instrument: request.instrument,
        interval: String(interval),
        oi: request.oi,
        fromDate,
        toDate
      });
      indicators[key] = this.computeFor(candlesFromSeries(response));
      if (index < intervals.length - 1) {
        await sleep(this.options.throttleMs);
      }
    }
    return {
      meta: {
        securityId: request.securityId,
        exchangeSegment: request.exchangeSegment,
        instrument: request.instrument,
        fromDate,
        toDate
      },
      indicators
    };
  }
  /**
   * Computes the same multi-timeframe result from a single base series by
   * resampling, so one API call can cover every interval.
   */
  computeFromCandles(baseCandles, intervals = [1, 5, 15, 25, 60]) {
    const indicators = {};
    for (const interval of intervals) {
      const key = TIMEFRAMES[interval];
      if (!key) {
        continue;
      }
      indicators[key] = this.computeFor(resample(baseCandles, interval));
    }
    return indicators;
  }
  /** Every indicator for one timeframe, reduced to its latest value. */
  computeFor(candles) {
    if (candles.length === 0) {
      return emptyIndicators();
    }
    const closeSeries = closes(candles);
    const macdResult = macd(closeSeries, {
      fastPeriod: this.options.macdFast,
      slowPeriod: this.options.macdSlow,
      signalPeriod: this.options.macdSignal
    });
    const bands = bollingerBands(closeSeries, {
      period: this.options.bollingerPeriod
    });
    const stoch = stochastic(candles);
    const trend = supertrend(candles);
    return {
      rsi: latest(rsi(closeSeries, this.options.rsiPeriod)),
      adx: latest(adx(candles, this.options.adxPeriod).adx),
      atr: latest(atr(candles, this.options.atrPeriod)),
      sma: latest(sma(closeSeries, this.options.smaPeriod)),
      ema: latest(ema(closeSeries, this.options.emaPeriod)),
      vwap: latest(vwap(candles)),
      macd: {
        macd: latest(macdResult.macdLine),
        signal: latest(macdResult.signalLine),
        hist: latest(macdResult.histogram)
      },
      bollinger: {
        upper: latest(bands.upper),
        middle: latest(bands.middle),
        lower: latest(bands.lower)
      },
      stochastic: { k: latest(stoch.k), d: latest(stoch.d) },
      supertrend: {
        value: latest(trend.trend),
        direction: lastDirection(trend.direction)
      },
      lastClose: closeSeries[closeSeries.length - 1] ?? null,
      candleCount: candles.length
    };
  }
  /** Bars needed before the slowest configured indicator produces a value. */
  requiredBars() {
    return Math.max(
      this.options.rsiPeriod + 1,
      this.options.atrPeriod + 1,
      this.options.adxPeriod * 2,
      this.options.macdSlow,
      this.options.bollingerPeriod
    );
  }
  autoDaysNeeded(intervals) {
    const needed = this.requiredBars();
    return Math.max(
      ...intervals.map((interval) => {
        const barsPerDay = Math.max(
          Math.floor(MARKET_HOURS.sessionMinutes / Math.max(interval, 1)),
          1
        );
        return Math.ceil(needed / barsPerDay);
      }),
      1
    );
  }
  normalizeToDate(toDate) {
    if (!toDate) {
      return todayOrLastTradingDay();
    }
    return isTradingDay(toDate) ? toDate : lastTradingDay(toDate);
  }
  normalizeFromDate(fromDate, toDate, daysBack) {
    if (fromDate) {
      return isTradingDay(fromDate) ? fromDate : lastTradingDay(fromDate);
    }
    return tradingDaysAgo(toDate, daysBack);
  }
};
function lastDirection(directions) {
  for (let index = directions.length - 1; index >= 0; index -= 1) {
    const value = directions[index];
    if (value !== null) {
      return value;
    }
  }
  return null;
}
function emptyIndicators() {
  const empty = [];
  void empty;
  return {
    rsi: null,
    adx: null,
    atr: null,
    sma: null,
    ema: null,
    vwap: null,
    macd: { macd: null, signal: null, hist: null },
    bollinger: { upper: null, middle: null, lower: null },
    stochastic: { k: null, d: null },
    supertrend: { value: null, direction: null },
    lastClose: null,
    candleCount: 0
  };
}
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// src/ta/multiTimeframe.ts
var TIMEFRAME_WEIGHTS = {
  m1: 1,
  m5: 2,
  m15: 3,
  m25: 3,
  m60: 4
};
var BIAS_SCORES = {
  bullish: 1,
  neutral: 0.5,
  bearish: 0
};
var TIMEFRAME_ORDER = ["m1", "m5", "m15", "m25", "m60"];
function analyzeMultiTimeframe(data) {
  const perTimeframe = {};
  for (const key of TIMEFRAME_ORDER) {
    const indicators = data.indicators[key];
    if (indicators) {
      perTimeframe[key] = classify(indicators);
    }
  }
  const entries = Object.entries(perTimeframe);
  let totalWeight = 0;
  let accumulated = 0;
  for (const [key, classification] of entries) {
    const weight = TIMEFRAME_WEIGHTS[key] ?? 1;
    totalWeight += weight;
    accumulated += BIAS_SCORES[classification.bias] * weight;
  }
  const confidence = totalWeight === 0 ? 0.5 : accumulated / totalWeight;
  const bias = confidence >= 0.66 ? "bullish" : confidence <= 0.33 ? "bearish" : "neutral";
  const setup = bias === "bullish" ? "buy_on_dip" : bias === "bearish" ? "sell_on_rise" : "range_trade";
  const classifications = entries.map(([, value]) => value);
  return {
    meta: data.meta ?? {},
    perTimeframe,
    summary: {
      bias,
      setup,
      confidence: Number(confidence.toFixed(2)),
      rationale: {
        rsi: rsiRationale(classifications),
        macd: macdRationale(classifications),
        adx: adxRationale(classifications),
        atr: atrRationale(classifications)
      },
      trendStrength: aggregateTrendStrength(classifications)
    }
  };
}
function classify(indicators) {
  const momentum = classifyRsi(indicators.rsi);
  const macdSignal = classifyMacd(
    indicators.macd.macd,
    indicators.macd.signal,
    indicators.macd.hist
  );
  return {
    momentum,
    trend: classifyAdx(indicators.adx),
    macdSignal,
    volatility: classifyAtr(indicators.atr),
    bias: deriveBias(momentum, macdSignal)
  };
}
function classifyRsi(value) {
  if (value === null) return "unknown";
  if (value >= 70) return "overbought";
  if (value <= 30) return "oversold";
  if (value >= 55) return "bullish";
  if (value <= 45) return "bearish";
  return "neutral";
}
function classifyAdx(value) {
  if (value === null) return "unknown";
  if (value >= 25) return "strong";
  if (value <= 15) return "weak";
  return "moderate";
}
function classifyMacd(macdValue, signal, histogram) {
  if (macdValue === null || signal === null) return "unknown";
  if (macdValue > signal && (histogram === null || histogram >= 0)) {
    return "bullish";
  }
  if (macdValue < signal && (histogram === null || histogram <= 0)) {
    return "bearish";
  }
  return "neutral";
}
function classifyAtr(value) {
  if (value === null) return "unknown";
  return value > 0 ? "expanding" : "flat";
}
function deriveBias(momentum, macdSignal) {
  if (momentum === "bullish" && macdSignal === "bullish") return "bullish";
  if (momentum === "bearish" && macdSignal === "bearish") return "bearish";
  return "neutral";
}
function rsiRationale(entries) {
  const ups = entries.filter(
    (entry) => ["bullish", "overbought"].includes(entry.momentum)
  ).length;
  const downs = entries.filter(
    (entry) => ["bearish", "oversold"].includes(entry.momentum)
  ).length;
  if (ups > downs) return `Upward momentum across ${ups} timeframes`;
  if (downs > ups) return `Downward momentum across ${downs} timeframes`;
  return "Mixed RSI momentum";
}
function macdRationale(entries) {
  const ups = entries.filter((entry) => entry.macdSignal === "bullish").length;
  const downs = entries.filter((entry) => entry.macdSignal === "bearish").length;
  if (ups > downs) return "MACD bullish signals dominant";
  if (downs > ups) return "MACD bearish signals dominant";
  return "MACD mixed/neutral";
}
function adxRationale(entries) {
  const strong = entries.filter((entry) => entry.trend === "strong").length;
  if (strong >= 2) return "Strong higher timeframe trend";
  const moderate = entries.filter((entry) => entry.trend === "moderate").length;
  if (moderate >= 2) return "Moderate trend strength";
  return "Weak or undefined trend";
}
function atrRationale(entries) {
  const expanding = entries.filter(
    (entry) => entry.volatility === "expanding"
  ).length;
  return expanding >= entries.length / 2 ? "Volatility expanding" : "Volatility subdued";
}
function aggregateTrendStrength(entries) {
  if (entries.length === 0) return "unknown";
  const strong = entries.filter((entry) => entry.trend === "strong").length;
  const weak = entries.filter((entry) => entry.trend === "weak").length;
  if (strong >= entries.length / 2) return "strong";
  if (weak >= entries.length / 2) return "weak";
  return "moderate";
}

// src/agent/OrderPreview.ts
import { ZodError } from "zod";

// src/contracts/order.schema.ts
import { z } from "zod";
var orderSchema = z.object({
  dhanClientId: z.string().min(1).optional(),
  correlationId: z.string().min(1).max(128).optional(),
  transactionType: z.enum(["BUY", "SELL"]),
  exchangeSegment: z.enum([
    "NSE_EQ",
    "NSE_FNO",
    "NSE_COMM",
    "BSE_EQ",
    "BSE_FNO",
    "MCX_COMM"
  ]),
  productType: z.enum(["CNC", "INTRADAY", "MARGIN", "MTF", "BO", "CO"]),
  orderType: z.enum([
    "MARKET",
    "LIMIT",
    "STOP_LOSS",
    "STOP_LOSS_MARKET"
  ]),
  validity: z.enum(["DAY", "IOC"]).optional(),
  quantity: z.number().int().positive(),
  disclosedQuantity: z.number().int().nonnegative().optional(),
  price: z.number().nonnegative().optional(),
  triggerPrice: z.number().nonnegative().optional(),
  afterMarketOrder: z.boolean().optional(),
  amoTime: z.string().min(1).optional(),
  securityId: z.string().min(1),
  boProfitValue: z.number().nonnegative().optional(),
  boStopLossValue: z.number().nonnegative().optional()
}).superRefine((value, ctx) => {
  if ((value.orderType === "LIMIT" || value.orderType === "STOP_LOSS") && value.price === void 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "price is required for LIMIT and STOP_LOSS orders",
      path: ["price"]
    });
  }
  if ((value.orderType === "STOP_LOSS" || value.orderType === "STOP_LOSS_MARKET") && value.triggerPrice === void 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "triggerPrice is required for STOP_LOSS and STOP_LOSS_MARKET orders",
      path: ["triggerPrice"]
    });
  }
});

// src/agent/OrderPreview.ts
async function previewOrder(params, options = {}) {
  const errors = [];
  const warnings = [];
  try {
    orderSchema.parse(params);
  } catch (error) {
    if (error instanceof ZodError) {
      errors.push(
        ...error.issues.map(
          (issue) => `${issue.path.join(".") || "order"}: ${issue.message}`
        )
      );
    } else {
      throw error;
    }
  }
  if (!params.correlationId) {
    warnings.push("correlationId is recommended for agent-originated orders");
  }
  let riskChecks;
  if (options.pipeline) {
    const report = await options.pipeline.report({
      args: params,
      instrument: options.instrument,
      type: riskTypeFor(options.instrument)
    });
    riskChecks = report.violations;
    errors.push(...report.violations.map((v) => `${v.check}: ${v.message}`));
  }
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    action: "place_order",
    risk: "live_order_requires_confirmation",
    requires: ["orders:write", "DHANHQ_MCP_ENABLE_WRITES", "LIVE_TRADING"],
    summary: summarize(params),
    riskChecks,
    order: params
  };
}
function summarize(params) {
  const price = params.price === void 0 ? "" : ` @ ${params.price}`;
  return `${params.transactionType} ${params.quantity} of ${params.exchangeSegment}:${params.securityId} as ${params.orderType}${price}`;
}

// src/agent/schemas.ts
var emptySchema = {
  type: "object",
  properties: {},
  additionalProperties: false
};
function enumOf(values) {
  return { type: "string", enum: [...values] };
}
var searchSchema = {
  type: "object",
  required: ["query"],
  properties: {
    query: { type: "string", description: "Symbol or partial symbol to resolve" },
    segments: {
      type: "array",
      items: enumOf(EXCHANGE_SEGMENTS),
      description: "Segments to search, in order"
    },
    limit: { type: "integer", minimum: 1, maximum: 100 },
    exactMatch: { type: "boolean" }
  },
  additionalProperties: false
};
var feedSchema = {
  type: "object",
  required: ["instruments"],
  properties: {
    instruments: {
      type: "object",
      description: 'Security ids keyed by exchange segment, e.g. { "NSE_EQ": [11536] }',
      additionalProperties: {
        type: "array",
        items: { type: ["integer", "string"] }
      }
    }
  },
  additionalProperties: false
};
var orderSchema2 = {
  type: "object",
  required: [
    "transactionType",
    "exchangeSegment",
    "productType",
    "orderType",
    "securityId",
    "quantity"
  ],
  properties: {
    transactionType: enumOf(TRANSACTION_TYPES),
    exchangeSegment: enumOf(EXCHANGE_SEGMENTS),
    productType: enumOf(PRODUCT_TYPES),
    orderType: enumOf(ORDER_TYPES),
    validity: enumOf(VALIDITIES),
    securityId: { type: "string" },
    quantity: { type: "integer", minimum: 1 },
    disclosedQuantity: { type: "integer", minimum: 0 },
    price: { type: "number", minimum: 0 },
    triggerPrice: { type: "number", minimum: 0 },
    correlationId: { type: "string" }
  },
  additionalProperties: true
};
var modifyOrderSchema = {
  type: "object",
  required: ["orderId"],
  properties: {
    orderId: { type: "string" },
    orderType: enumOf(ORDER_TYPES),
    validity: enumOf(VALIDITIES),
    quantity: { type: "integer", minimum: 1 },
    disclosedQuantity: { type: "integer", minimum: 0 },
    price: { type: "number", minimum: 0 },
    triggerPrice: { type: "number", minimum: 0 }
  },
  additionalProperties: false
};
var cancelSchema = {
  type: "object",
  required: ["orderId"],
  properties: { orderId: { type: "string" } },
  additionalProperties: false
};
var optionChainSchema = {
  type: "object",
  required: ["underlyingScrip", "underlyingSeg", "expiry"],
  properties: {
    underlyingScrip: { type: "integer" },
    underlyingSeg: enumOf(["IDX_I", "NSE_EQ", "NSE_FNO", "BSE_EQ"]),
    expiry: { type: "string", description: "Expiry date as YYYY-MM-DD" }
  },
  additionalProperties: false
};
var expiryListSchema = {
  type: "object",
  required: ["underlyingScrip", "underlyingSeg"],
  properties: {
    underlyingScrip: { type: "integer" },
    underlyingSeg: enumOf(["IDX_I", "NSE_EQ", "NSE_FNO", "BSE_EQ"])
  },
  additionalProperties: false
};
var historicalSchema = {
  type: "object",
  required: ["securityId", "exchangeSegment", "instrument"],
  properties: {
    securityId: { type: "string" },
    exchangeSegment: enumOf(EXCHANGE_SEGMENTS),
    instrument: { type: "string" },
    fromDate: { type: "string" },
    toDate: { type: "string" },
    oi: { type: "boolean" }
  },
  additionalProperties: false
};
var intradaySchema = {
  type: "object",
  required: ["securityId", "exchangeSegment", "instrument"],
  properties: {
    securityId: { type: "string" },
    exchangeSegment: enumOf(EXCHANGE_SEGMENTS),
    instrument: { type: "string" },
    interval: enumOf(CHART_INTERVALS),
    fromDate: { type: "string" },
    toDate: { type: "string" },
    oi: { type: "boolean" }
  },
  additionalProperties: false
};
var technicalsSchema = {
  type: "object",
  required: ["securityId", "exchangeSegment", "instrument"],
  properties: {
    securityId: { type: "string" },
    exchangeSegment: enumOf(EXCHANGE_SEGMENTS),
    instrument: { type: "string" },
    intervals: {
      type: "array",
      items: { type: "integer", enum: [1, 5, 15, 25, 60] }
    },
    daysBack: { type: "integer", minimum: 1 }
  },
  additionalProperties: false
};
var marginSchema = {
  type: "object",
  required: [
    "transactionType",
    "exchangeSegment",
    "productType",
    "securityId",
    "quantity"
  ],
  properties: {
    transactionType: enumOf(TRANSACTION_TYPES),
    exchangeSegment: enumOf(EXCHANGE_SEGMENTS),
    productType: enumOf(PRODUCT_TYPES),
    securityId: { type: "string" },
    quantity: { type: "integer", minimum: 1 },
    price: { type: "number", minimum: 0 },
    triggerPrice: { type: "number", minimum: 0 }
  },
  additionalProperties: true
};
var SKILL_PARAM_TYPES = {
  string: "string",
  integer: "integer",
  number: "number",
  boolean: "boolean"
};
function skillInputSchema(params) {
  const properties = {};
  const required = [];
  for (const [name, config] of Object.entries(params)) {
    properties[name] = { type: SKILL_PARAM_TYPES[config.type] ?? "string" };
    if (config.description) {
      properties[name].description = config.description;
    }
    if (config.default !== void 0) {
      properties[name].default = config.default;
    }
    if (config.required) {
      required.push(name);
    }
  }
  return { type: "object", properties, required, additionalProperties: false };
}

// src/agent/catalogue.ts
var DEFAULT_TOOL_VERSION = "1.0.0";
function tool(definition) {
  return { version: DEFAULT_TOOL_VERSION, ...definition };
}
function buildCatalogue(deps) {
  return [
    ...portfolioTools(deps),
    ...marketTools(deps),
    ...analysisTools(deps),
    ...orderTools(deps),
    ...skillTools(deps)
  ];
}
function portfolioTools({ client }) {
  return [
    tool({
      name: "dhan_profile",
      description: "Fetch the Dhan account profile",
      scope: "portfolio:read",
      risk: "read_only",
      inputSchema: emptySchema,
      outputSchema: {
        type: "object",
        properties: { dhanClientId: { type: "string" } }
      },
      handler: () => client.profile.get()
    }),
    tool({
      name: "dhan_funds",
      description: "Fetch fund limits and available balance",
      scope: "portfolio:read",
      risk: "read_only",
      inputSchema: emptySchema,
      outputSchema: {
        type: "object",
        properties: { availabelBalance: { type: "number" } }
      },
      handler: () => client.funds.getLimit()
    }),
    tool({
      name: "dhan_holdings",
      description: "List equity holdings",
      scope: "portfolio:read",
      risk: "read_only",
      inputSchema: emptySchema,
      outputSchema: { type: "array", items: { type: "object" } },
      handler: () => client.positions.listHoldings()
    }),
    tool({
      name: "dhan_positions",
      description: "List open positions",
      scope: "portfolio:read",
      risk: "read_only",
      inputSchema: emptySchema,
      outputSchema: { type: "array", items: { type: "object" } },
      handler: () => client.positions.list()
    }),
    tool({
      name: "dhan_orders",
      description: "List today's orders",
      scope: "orders:read",
      risk: "read_only",
      inputSchema: emptySchema,
      outputSchema: { type: "array", items: { type: "object" } },
      handler: () => client.orders.list()
    }),
    tool({
      name: "dhan_trades",
      description: "List today's trades",
      scope: "orders:read",
      risk: "read_only",
      inputSchema: emptySchema,
      outputSchema: { type: "array", items: { type: "object" } },
      handler: () => client.orders.listTrades()
    })
  ];
}
function marketTools({ client }) {
  return [
    tool({
      name: "dhan_search_instruments",
      description: "Resolve symbols to Dhan security ids",
      scope: "market:read",
      risk: "read_only",
      inputSchema: searchSchema,
      outputSchema: { type: "array", items: { type: "object" } },
      examples: [
        {
          input: { query: "RELIANCE" },
          output: '[{ "securityId": "2885", "symbolName": "RELIANCE" }]'
        }
      ],
      handler: (args) => client.instruments.search(String(args.query), {
        segments: args.segments,
        limit: args.limit,
        exactMatch: args.exactMatch
      })
    }),
    tool({
      name: "dhan_ltp",
      description: "Fetch last traded prices for up to 1000 instruments",
      scope: "market:read",
      risk: "read_only",
      inputSchema: feedSchema,
      outputSchema: { type: "object" },
      handler: (args) => client.marketFeed.ltp(args.instruments)
    }),
    tool({
      name: "dhan_ohlc",
      description: "Fetch open/high/low/close for up to 1000 instruments",
      scope: "market:read",
      risk: "read_only",
      inputSchema: feedSchema,
      outputSchema: { type: "object" },
      handler: (args) => client.marketFeed.ohlc(args.instruments)
    }),
    tool({
      name: "dhan_quote",
      description: "Fetch full quotes with market depth and open interest",
      scope: "market:read",
      risk: "read_only",
      inputSchema: feedSchema,
      outputSchema: { type: "object" },
      handler: (args) => client.marketFeed.quote(args.instruments)
    }),
    tool({
      name: "dhan_option_chain",
      description: "Fetch the option chain for an underlying and expiry",
      scope: "market:read",
      risk: "read_only",
      inputSchema: optionChainSchema,
      outputSchema: { type: "object" },
      handler: (args) => client.optionChain.fetchNormalized(args)
    }),
    tool({
      name: "dhan_option_expiries",
      description: "List available option expiry dates for an underlying",
      scope: "market:read",
      risk: "read_only",
      inputSchema: expiryListSchema,
      outputSchema: { type: "object" },
      handler: (args) => client.optionChain.expiryList(args)
    }),
    tool({
      name: "dhan_historical_data",
      description: "Fetch daily historical candles",
      scope: "market:read",
      risk: "read_only",
      inputSchema: historicalSchema,
      outputSchema: { type: "object" },
      handler: (args) => client.charts.historical(args)
    }),
    tool({
      name: "dhan_intraday_data",
      description: "Fetch intraday candles at a minute interval",
      scope: "market:read",
      risk: "read_only",
      inputSchema: intradaySchema,
      outputSchema: { type: "object" },
      handler: (args) => client.charts.intraday(args)
    })
  ];
}
function analysisTools({ client }) {
  return [
    tool({
      name: "dhan_technical_analysis",
      description: "Compute multi-timeframe indicators (RSI, MACD, ADX, ATR, Bollinger, Supertrend) for an instrument",
      scope: "market:read",
      risk: "read_only",
      inputSchema: technicalsSchema,
      outputSchema: { type: "object" },
      handler: async (args) => {
        const analysis = new TechnicalAnalysis(client.charts);
        return analysis.compute({
          securityId: String(args.securityId),
          exchangeSegment: String(args.exchangeSegment),
          instrument: String(args.instrument),
          intervals: args.intervals,
          daysBack: args.daysBack
        });
      }
    }),
    tool({
      name: "dhan_market_bias",
      description: "Blend multi-timeframe indicators into a single directional bias with rationale",
      scope: "market:read",
      risk: "read_only",
      inputSchema: technicalsSchema,
      outputSchema: {
        type: "object",
        properties: {
          summary: {
            type: "object",
            properties: {
              bias: { type: "string" },
              confidence: { type: "number" }
            }
          }
        }
      },
      handler: async (args) => {
        const analysis = new TechnicalAnalysis(client.charts);
        const result = await analysis.compute({
          securityId: String(args.securityId),
          exchangeSegment: String(args.exchangeSegment),
          instrument: String(args.instrument),
          intervals: args.intervals,
          daysBack: args.daysBack
        });
        return analyzeMultiTimeframe(result);
      }
    }),
    tool({
      name: "dhan_margin_requirement",
      description: "Calculate the margin required for a prospective order",
      scope: "orders:read",
      risk: "trade_adjacent_read",
      inputSchema: marginSchema,
      outputSchema: { type: "object" },
      handler: (args) => client.funds.calculateMargin(args)
    })
  ];
}
function orderTools({ client, pipeline }) {
  return [
    tool({
      name: "dhan_order_preview",
      description: "Validate and summarize an order, including risk checks, without placing it",
      scope: "orders:read",
      risk: "trade_adjacent_read",
      inputSchema: orderSchema2,
      outputSchema: {
        type: "object",
        properties: {
          valid: { type: "boolean" },
          errors: { type: "array", items: { type: "string" } },
          summary: { type: "string" }
        }
      },
      handler: async (args) => {
        const instrument = await resolveInstrument(client, args);
        return previewOrder(args, { pipeline, instrument });
      }
    }),
    tool({
      name: "dhan_place_order",
      description: "Place an order after external confirmation",
      scope: "orders:write",
      risk: "live_write",
      inputSchema: orderSchema2,
      outputSchema: {
        type: "object",
        properties: { orderId: { type: "string" } }
      },
      handler: async (args) => {
        const instrument = await resolveInstrument(client, args);
        if (!instrument) {
          throw new RiskViolationError(
            "instrument_resolution",
            `Cannot verify risk for unknown instrument: ${args.exchangeSegment}:${args.securityId}`
          );
        }
        await pipeline.run({
          args,
          instrument,
          type: riskTypeFor(instrument)
        });
        return client.orders.place(args);
      }
    }),
    tool({
      name: "dhan_modify_order",
      description: "Modify a pending order",
      scope: "orders:write",
      risk: "live_write",
      inputSchema: modifyOrderSchema,
      outputSchema: {
        type: "object",
        properties: { orderId: { type: "string" } }
      },
      handler: (args) => client.orders.modify(args)
    }),
    tool({
      name: "dhan_cancel_order",
      description: "Cancel a pending order",
      scope: "orders:cancel",
      risk: "destructive_write",
      inputSchema: cancelSchema,
      outputSchema: {
        type: "object",
        properties: {
          orderId: { type: "string" },
          orderStatus: { type: "string" }
        }
      },
      handler: (args) => client.orders.cancel(String(args.orderId))
    })
  ];
}
function skillTools({ client, skills }) {
  return skills.list().map(
    (skill) => tool({
      name: `dhan_skill_${skill.name}`,
      description: skill.description,
      scope: skill.scope,
      risk: skill.risk,
      inputSchema: skillInputSchema(skill.params),
      handler: (args) => skills.call(skill.name, args, client)
    })
  );
}
async function resolveInstrument(client, args) {
  if (!args.exchangeSegment || !args.securityId) {
    return void 0;
  }
  return client.instruments.findBySecurityId(
    String(args.exchangeSegment),
    String(args.securityId)
  );
}

// src/agent/Policy.ts
var READ_SCOPES = [
  "portfolio:read",
  "market:read",
  "orders:read"
];
var WRITE_SCOPES = [
  "orders:write",
  "orders:cancel",
  "alerts:write",
  "risk:write"
];
var ALL_SCOPES = [...READ_SCOPES, ...WRITE_SCOPES];
var Policy = class _Policy {
  constructor(options = {}) {
    const scopes = options.scopes ?? [];
    const unknown = scopes.filter((scope) => !ALL_SCOPES.includes(scope));
    if (unknown.length > 0) {
      throw new DhanError(`Unknown agent scopes: ${unknown.join(", ")}`, {
        code: "INVALID_SCOPE"
      });
    }
    this.scopes = Object.freeze([...new Set(scopes)]);
    this.writesEnabledOverride = options.writesEnabled;
  }
  /** Read scopes only — the safe default for an unattended agent. */
  static readOnly() {
    return new _Policy({ scopes: [...READ_SCOPES] });
  }
  /** Every scope. Writes still require the live-trading gate. */
  static full() {
    return new _Policy({ scopes: ALL_SCOPES });
  }
  /**
   * Reads `DHANHQ_AGENT_SCOPES` (comma or space separated), defaulting to
   * read-only when unset.
   */
  static fromEnv(env = process.env) {
    const raw = env.DHANHQ_AGENT_SCOPES ?? READ_SCOPES.join(",");
    const scopes = raw.split(/[\s,]+/).filter((scope) => scope.length > 0);
    return new _Policy({ scopes });
  }
  allows(scope) {
    return this.scopes.includes(scope);
  }
  /** Throws unless the policy holds `scope`. */
  require(scope) {
    if (this.allows(scope)) {
      return true;
    }
    throw new DhanError(`Agent scope required: ${scope}`, {
      code: "SCOPE_REQUIRED",
      details: { required: scope, held: this.scopes }
    });
  }
  /** True only when both env flags are set, unless explicitly overridden. */
  writesEnabled(env = process.env) {
    if (this.writesEnabledOverride !== void 0) {
      return this.writesEnabledOverride;
    }
    return env.DHANHQ_MCP_ENABLE_WRITES === "true" && env.LIVE_TRADING === "true";
  }
  /** Throws unless the policy holds `scope` *and* writes are enabled. */
  requireWrite(scope, env = process.env) {
    this.require(scope);
    if (this.writesEnabled(env)) {
      return true;
    }
    throw new LiveTradingDisabledError();
  }
};

// src/agent/Tool.ts
function describeTool(tool2) {
  const { handler: _handler, ...descriptor } = tool2;
  return descriptor;
}
function isWriteTool(tool2) {
  return tool2.risk.endsWith("write");
}

// src/agent/ToolRegistry.ts
var AgentToolRegistry = class {
  constructor(options) {
    this.policy = options.policy ?? Policy.fromEnv();
    this.skills = options.skills ?? createSkillRegistry();
    const pipeline = options.pipeline ?? new Pipeline({
      limits: options.riskLimits,
      provider: riskProviderFor(options.client)
    });
    const catalogue = buildCatalogue({
      client: options.client,
      skills: this.skills,
      pipeline
    });
    this.tools = new Map(catalogue.map((entry) => [entry.name, entry]));
  }
  list() {
    return [...this.tools.values()].map(describeTool);
  }
  names() {
    return [...this.tools.keys()];
  }
  find(name) {
    const found = this.tools.get(name);
    if (!found) {
      throw new DhanError(`Unknown DhanHQ agent tool: ${name}`, {
        code: "TOOL_NOT_FOUND",
        details: { name }
      });
    }
    return found;
  }
  /** Checks policy, then dispatches to the tool's handler. */
  async execute(name, args = {}) {
    const found = this.find(name);
    if (isWriteTool(found)) {
      this.policy.requireWrite(found.scope);
    } else {
      this.policy.require(found.scope);
    }
    return found.handler(args);
  }
  /** Tools this policy may call right now, write gate included. */
  availableTools() {
    const writesEnabled = this.policy.writesEnabled();
    return this.list().filter((entry) => {
      if (!this.policy.allows(entry.scope)) {
        return false;
      }
      return isWriteTool(entry) ? writesEnabled : true;
    });
  }
  /** Capability manifest for an agent runtime. */
  capabilities() {
    const tools = this.list();
    return {
      toolCount: tools.length,
      tools,
      scopes: [...ALL_SCOPES],
      riskLevels: [...new Set(tools.map((entry) => entry.risk))].sort(),
      writeEnabled: this.policy.writesEnabled(),
      skills: this.skills.names()
    };
  }
  getPolicy() {
    return this.policy;
  }
  getSkills() {
    return this.skills;
  }
};
function riskProviderFor(client) {
  return {
    positions: async () => await client.positions.list(),
    funds: async () => await client.funds.getLimit()
  };
}

// src/ai/promptHelpers.ts
function systemPrompt(capabilities = []) {
  const extra = capabilities.length === 0 ? "" : `
Additional capabilities:
${capabilities.map((entry) => `- ${entry}`).join("\n")}
`;
  return `You are an AI trading assistant for Indian stock markets (NSE, BSE, MCX).

Your capabilities:
- Fetch market data (LTP, OHLC, quotes, option chains)
- Place, modify, and cancel orders
- View portfolio holdings, positions, and orders
- Calculate option Greeks and implied volatility
- Analyze option chains, max pain and put-call ratios
- Compute multi-timeframe technical indicators
- Apply risk management rules
${extra}
Rules:
- Always confirm before placing live orders
- Use correlationId for all agent-originated orders
- Never expose access tokens or secrets
- Prefer read-only operations unless explicitly asked to trade
- Validate instruments with a search before trading them`;
}
function portfolioSummary(input) {
  const holdings = input.holdings ?? [];
  const positions = input.positions ?? [];
  const open = positions.filter((position) => Number(position.netQty ?? 0) !== 0);
  const lines = ["=== Portfolio Summary ==="];
  if (input.funds) {
    lines.push(`Funds: ${describeFunds(input.funds)}`);
  }
  lines.push("", `Holdings (${holdings.length}):`);
  for (const holding of holdings) {
    lines.push(`  ${describeHolding(holding)}`);
  }
  lines.push("", `Open Positions (${open.length}):`);
  for (const position of open) {
    lines.push(`  ${describePosition(position)}`);
  }
  return lines.join("\n");
}
function riskReport(input) {
  const positions = input.positions ?? [];
  const unrealized = positions.reduce(
    (total, position) => total + Number(position.unrealizedProfit ?? 0),
    0
  );
  const realized = positions.reduce(
    (total, position) => total + Number(position.realizedProfit ?? 0),
    0
  );
  const open = positions.filter(
    (position) => Number(position.netQty ?? 0) !== 0
  ).length;
  const lines = [
    "=== Risk Report ===",
    `Total Unrealized P&L: \u20B9${unrealized.toFixed(2)}`,
    `Total Realized P&L: \u20B9${realized.toFixed(2)}`,
    `Open Positions: ${open}`
  ];
  if (input.maxDrawdownPct !== void 0) {
    lines.push(`Max Drawdown: ${input.maxDrawdownPct}%`);
  }
  if (input.dailyLossLimit !== void 0) {
    lines.push(`Daily Loss Limit: \u20B9${input.dailyLossLimit}`);
  }
  return lines.join("\n");
}
function marketAnalysis(summary) {
  const { bias, setup, confidence, rationale, trendStrength } = summary.summary;
  return [
    "=== Market Analysis ===",
    `Bias: ${bias} (confidence ${confidence})`,
    `Suggested setup: ${setup}`,
    `Trend strength: ${trendStrength}`,
    `RSI: ${rationale.rsi}`,
    `MACD: ${rationale.macd}`,
    `ADX: ${rationale.adx}`,
    `ATR: ${rationale.atr}`
  ].join("\n");
}
function describeFunds(funds) {
  const available = funds.availabelBalance ?? funds.availableBalance ?? 0;
  return `available \u20B9${Number(available).toFixed(2)}, utilized \u20B9${Number(funds.utilizedAmount ?? 0).toFixed(2)}, withdrawable \u20B9${Number(funds.withdrawableBalance ?? 0).toFixed(2)}`;
}
function describeHolding(holding) {
  const symbol = holding.tradingSymbol ?? holding.securityId ?? "unknown";
  return `${symbol}: ${holding.totalQty ?? 0} @ \u20B9${Number(holding.avgCostPrice ?? 0).toFixed(2)}`;
}
function describePosition(position) {
  const symbol = position.tradingSymbol ?? position.securityId ?? "unknown";
  const cost = position.buyAvg ?? position.costPrice ?? 0;
  return `${symbol} (${position.productType ?? "\u2014"}): ${position.netQty ?? 0} @ \u20B9${Number(cost).toFixed(2)}, unrealized \u20B9${Number(position.unrealizedProfit ?? 0).toFixed(2)}`;
}

// src/mcp/Server.ts
var SUPPORTED_PROTOCOL_VERSIONS = ["2025-06-18", "2024-11-05"];
var DEFAULT_TOOL_CALL_TIMEOUT_MS = 15e3;
var ErrorCode = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603
};
var InvalidParamsError = class extends Error {
};
var UnknownMethodError = class extends Error {
};
var RESOURCES = [
  {
    uri: "dhanhq://account/profile",
    name: "Dhan Profile",
    description: "Account profile including client id, token validity and active segments",
    mimeType: "application/json"
  },
  {
    uri: "dhanhq://account/funds",
    name: "Fund Limits",
    description: "Available balance, utilized margin and withdrawal capacity",
    mimeType: "application/json"
  },
  {
    uri: "dhanhq://account/holdings",
    name: "Portfolio Holdings",
    description: "Equity holdings with quantity, average price and P&L",
    mimeType: "application/json"
  },
  {
    uri: "dhanhq://account/positions",
    name: "Open Positions",
    description: "F&O and equity positions with net quantity and unrealized P&L",
    mimeType: "application/json"
  },
  {
    uri: "dhanhq://account/orders",
    name: "Recent Orders",
    description: "Order history with status, quantity and fill details",
    mimeType: "application/json"
  },
  {
    uri: "dhanhq://market/capabilities",
    name: "Agent Capabilities",
    description: "Available tools, scopes, risk levels and the write gate state",
    mimeType: "application/json"
  }
];
var PROMPTS = [
  {
    name: "system_prompt",
    description: "Base system prompt for a DhanHQ trading assistant",
    arguments: []
  },
  {
    name: "portfolio_summary",
    description: "Human-readable summary of current holdings, positions and funds",
    arguments: []
  },
  {
    name: "market_analysis",
    description: "Multi-timeframe technical bias for a symbol, with supporting rationale",
    arguments: [
      {
        name: "symbol",
        description: "Ticker symbol, e.g. NIFTY or RELIANCE",
        required: false
      }
    ]
  },
  {
    name: "risk_report",
    description: "Current risk exposure: open positions, P&L and limits",
    arguments: []
  },
  {
    name: "order_preview",
    description: "Preview an order with contract and risk validation",
    arguments: [
      { name: "transactionType", description: "BUY or SELL", required: true },
      { name: "securityId", description: "Dhan security id", required: true },
      { name: "quantity", description: "Number of shares or lots", required: true },
      {
        name: "exchangeSegment",
        description: "NSE_EQ, NSE_FNO, etc.",
        required: true
      },
      {
        name: "productType",
        description: "CNC, INTRADAY, MARGIN, MTF, BO or CO",
        required: true
      },
      { name: "orderType", description: "MARKET or LIMIT", required: true },
      { name: "price", description: "Limit price", required: false }
    ]
  }
];
var McpServer = class {
  constructor(options) {
    this.client = options.client;
    this.registry = options.registry ?? new AgentToolRegistry({ client: options.client });
    this.input = options.input ?? process.stdin;
    this.output = options.output ?? process.stdout;
    this.toolCallTimeoutMs = options.toolCallTimeoutMs ?? DEFAULT_TOOL_CALL_TIMEOUT_MS;
    this.serverName = options.serverName ?? "dhanhq-ts";
    this.serverVersion = options.serverVersion ?? "0.2.0";
  }
  /** Reads newline-delimited JSON-RPC from stdin until the stream closes. */
  async run() {
    this.reader = createInterface({ input: this.input, crlfDelay: Infinity });
    for await (const line of this.reader) {
      if (line.trim().length > 0) {
        await this.handleLine(line);
      }
    }
  }
  close() {
    this.reader?.close();
  }
  /** Handles one JSON-RPC line. Exposed for testing. */
  async handleLine(line) {
    let request;
    try {
      request = JSON.parse(line);
    } catch (error) {
      this.respondError(null, ErrorCode.PARSE_ERROR, `Parse error: ${message(error)}`);
      return;
    }
    if (request.id === void 0) {
      return;
    }
    try {
      this.respondResult(
        request.id,
        await this.dispatch(request.method ?? "", request.params ?? {})
      );
    } catch (error) {
      this.respondError(request.id, errorCodeFor(error), message(error));
    }
  }
  async dispatch(method, params) {
    switch (method) {
      case "initialize":
        return {
          protocolVersion: this.negotiateVersion(params.protocolVersion),
          serverInfo: { name: this.serverName, version: this.serverVersion },
          capabilities: { tools: {}, resources: {}, prompts: {} }
        };
      case "ping":
        return {};
      case "tools/list":
        return {
          tools: this.registry.list().map((entry) => ({
            name: entry.name,
            description: `[${entry.risk}] ${entry.description}`,
            inputSchema: entry.inputSchema
          }))
        };
      case "tools/call":
        return this.callTool(params);
      case "resources/list":
        return { resources: RESOURCES };
      case "resources/read":
        return { contents: [await this.readResource(String(params.uri))] };
      case "prompts/list":
        return { prompts: PROMPTS };
      case "prompts/get":
        return this.getPrompt(
          String(params.name),
          params.arguments ?? {}
        );
      default:
        throw new UnknownMethodError(`Unsupported MCP method: ${method}`);
    }
  }
  async callTool(params) {
    const name = params.name;
    if (typeof name !== "string") {
      throw new InvalidParamsError("tools/call requires a tool name");
    }
    const args = params.arguments ?? {};
    try {
      const result = await withTimeout(
        this.registry.execute(name, args),
        this.toolCallTimeoutMs,
        `Tool call '${name}' timed out after ${this.toolCallTimeoutMs}ms (likely blocked on rate-limit backoff) \u2014 retry shortly`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: message(error) }]
      };
    }
  }
  async readResource(uri) {
    const data = await this.resourceData(uri);
    return {
      uri,
      mimeType: "application/json",
      text: JSON.stringify(data, null, 2)
    };
  }
  async resourceData(uri) {
    switch (uri) {
      case "dhanhq://account/profile":
        return this.client.profile.get();
      case "dhanhq://account/funds":
        return this.client.funds.getLimit();
      case "dhanhq://account/holdings":
        return this.client.positions.listHoldings();
      case "dhanhq://account/positions":
        return this.client.positions.list();
      case "dhanhq://account/orders":
        return this.client.orders.list();
      case "dhanhq://market/capabilities":
        return this.registry.capabilities();
      default:
        throw new InvalidParamsError(`Unknown resource: ${uri}`);
    }
  }
  async getPrompt(name, args) {
    const text = await this.promptText(name, args);
    return {
      messages: [{ role: "user", content: { type: "text", text } }]
    };
  }
  async promptText(name, args) {
    switch (name) {
      case "system_prompt":
        return systemPrompt(this.registry.availableTools().map((t) => t.name));
      case "portfolio_summary": {
        const [holdings, positions, funds] = await Promise.all([
          this.client.positions.listHoldings(),
          this.client.positions.list(),
          this.client.funds.getLimit()
        ]);
        return portfolioSummary({ holdings, positions, funds });
      }
      case "risk_report":
        return riskReport({ positions: await this.client.positions.list() });
      case "market_analysis":
        return this.marketAnalysisPrompt(String(args.symbol ?? "NIFTY"));
      case "order_preview": {
        const preview = await previewOrder(args);
        return preview.valid ? `Order preview: ${preview.summary}` : `Validation errors: ${preview.errors.join(", ")}`;
      }
      default:
        throw new InvalidParamsError(`Unknown prompt: ${name}`);
    }
  }
  async marketAnalysisPrompt(symbol) {
    const instrument = await this.client.instruments.find("IDX_I", symbol, {
      exactMatch: true
    }) ?? await this.client.instruments.find("NSE_EQ", symbol, {
      exactMatch: true
    });
    if (!instrument) {
      return `Could not resolve symbol ${symbol} to a security id for market data.`;
    }
    const analysis = new TechnicalAnalysis(this.client.charts);
    const result = await analysis.compute({
      securityId: instrument.securityId,
      exchangeSegment: instrument.exchangeSegment ?? "NSE_EQ",
      instrument: instrument.instrument ?? "EQUITY",
      intervals: [15, 60]
    });
    return `${symbol}
${marketAnalysis(analyzeMultiTimeframe(result))}`;
  }
  negotiateVersion(requested) {
    return typeof requested === "string" && SUPPORTED_PROTOCOL_VERSIONS.includes(requested) ? requested : SUPPORTED_PROTOCOL_VERSIONS[0];
  }
  respondResult(id, result) {
    this.write({ jsonrpc: "2.0", id, result });
  }
  respondError(id, code, text) {
    this.write({ jsonrpc: "2.0", id, error: { code, message: text } });
  }
  write(payload) {
    this.output.write(`${JSON.stringify(payload)}
`);
  }
};
function errorCodeFor(error) {
  if (error instanceof UnknownMethodError) return ErrorCode.METHOD_NOT_FOUND;
  if (error instanceof InvalidParamsError) return ErrorCode.INVALID_PARAMS;
  return ErrorCode.INTERNAL_ERROR;
}
function message(error) {
  return error instanceof Error ? error.message : String(error);
}
function withTimeout(promise, ms, timeoutMessage) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(timeoutMessage)), ms);
    promise.then((value) => {
      clearTimeout(timer);
      resolve(value);
    }).catch((error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}
export {
  DEFAULT_TOOL_CALL_TIMEOUT_MS,
  ErrorCode,
  InvalidParamsError,
  McpServer,
  PROMPTS,
  RESOURCES,
  SUPPORTED_PROTOCOL_VERSIONS,
  UnknownMethodError
};
//# sourceMappingURL=index.js.map