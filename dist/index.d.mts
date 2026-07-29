import { D as DhanClientConfig, G as GetAlertResponse, A as AlertModifyRequest, a as AlertOrderResponse, b as AlertOrderRequest, O as OptionChartRequest, c as OptionChartResponse, I as IntradayChartsRequest, C as ChartsResponse, H as HistoricalChartsRequest, E as EdisFormRequest, d as EdisFormResponse, e as EdisBulkFormRequest, f as EdisQtyStatusResponse, g as GttModifyRequest, h as GttOrderStatusResponse, i as GttOrderResponse, j as GTTOrderModel, K as KnowYourMarginReq, k as KnowYourMarginResponse, M as MultiScripMarginCalcRequest, l as MultiScripMarginCalcResponse, F as FundLimitResponse, U as UserIPRequest, m as UserIPResponse, n as GetIPDetailsResponse, P as PositionConversionRequest, o as PositionResponse, p as HoldingResponse, B as BoLedgerResponse, q as ExitPnlResponse, r as PnlBasedExitRequest, s as PnlExitResponse, t as KillSwitchResponse, u as AlertCondition, v as AlertOrder, w as ChartData, x as OptionChartPayload, S as ScriptItem, y as StoredSubscription, z as MarketFeedEvent, J as DhanClient, L as SkillRegistry, N as Pipeline, T as Tool, Q as Instrument, R as Skill, V as SkillContext, W as NormalizedOptionChain, X as SkillStep, Y as SkillDefinition, Z as nearestStrike, _ as JsonSchema, $ as SkillParam, a0 as Charts, a1 as RiskCheck, a2 as RiskFunds } from './index-BeZmf5oS.mjs';
export { a3 as ALL_SCOPES, a4 as AgentScope, a5 as AgentToolRegistry, a6 as Alerts, a7 as BASE_CHECKS, a8 as BaseWS, a9 as CancelOrderRequest, aa as CancelSuperOrderRequest, ab as Capabilities, ac as CorrelatedRequest, ad as DAILY_CHECKS, ae as DEFAULT_RISK_LIMITS, af as DEFAULT_TOOL_CALL_TIMEOUT_MS, ag as DepthLevel, ah as DhanAuth, ai as DhanAuthDependencies, aj as DhanClientDependencies, ak as DhanWS, al as DhanWSOptions, am as Edis, an as EnableAutoTokenManagementOptions, ao as ErrorCode, ap as ExchangeSegment, aq as ExpiryListRequest, ar as ExpiryListResponse, as as ForeverOrders, at as FullQuote, au as Funds, av as GenerateAccessTokenRequest, aw as GeneratedClient, ax as HttpClient, ay as HttpClientDependencies, az as InstrumentSearchOptions, aA as InstrumentSubscription, aB as Instruments, aC as InstrumentsConfig, aD as InvalidParamsError, aE as IpSetup, aF as LTPStore, aG as LedgerRequest, aH as LtpQuote, aI as MarketDepthLevel, aJ as MarketDisconnectEvent, aK as MarketFeed, aL as MarketFeedInstruments, aM as MarketFeedMode, aN as MarketFeedResponse, aO as MarketFeedWS, aP as MarketFeedWSOptions, aQ as MarketFullEvent, aR as MarketOiEvent, aS as MarketPacketHeader, aT as MarketPrevCloseEvent, aU as MarketQuoteEvent, aV as MarketTickerEvent, aW as McpServer, aX as McpServerOptions, aY as ModifyOrderRequest, aZ as ModifySuperOrderRequest, a_ as OPTION_CHECKS, a$ as OhlcQuote, b0 as OptionChain, b1 as OptionChainRequest, b2 as OptionGreeks, b3 as OptionLeg, b4 as OrderOperationResult, b5 as OrderResponse, b6 as OrderState, b7 as OrderStore, b8 as OrderType, b9 as OrderUpdateEvent, ba as OrderUpdateWS, bb as OrderUpdateWSOptions, bc as Orders, bd as PROMPTS, be as PipelineConfig, bf as PipelineRunOptions, bg as PlaceOrderRequest, bh as PlaceSuperOrderRequest, bi as Policy, bj as PolicyOptions, bk as Positions, bl as ProductType, bm as Profile, bn as ProfileResponse, bo as PromptDefinition, bp as READ_SCOPES, bq as RESOURCES, br as RateLimiter, bs as RateLimiterConfig, bt as RawOptionChainResponse, bu as ReadScope, bv as RenewWebTokenRequest, bw as RequestOptions, bx as ResolvedChain, by as ResourceDefinition, bz as RiskContext, bA as RiskDataProvider, bB as RiskInstrumentKind, bC as RiskLimits, bD as RiskOrderArgs, bE as RiskPosition, bF as RiskReport, bG as SUPPORTED_PROTOCOL_VERSIONS, bH as SkillListing, bI as SkillParamType, bJ as Statements, bK as StrikeEntry, bL as SuperOrderLeg, bM as SuperOrderProductType, bN as SuperOrderResponse, bO as SuperOrderType, bP as SuperOrders, bQ as TickEvent, bR as TokenManager, bS as TokenResponse, bT as ToolDescriptor, bU as ToolExample, bV as ToolRegistryOptions, bW as ToolRisk, bX as TradeHistoryRequest, bY as TradeResponse, bZ as TraderControls, b_ as TransactionType, b$ as UnknownMethodError, c0 as Validity, c1 as WRITE_SCOPES, c2 as WebSocketLike, c3 as WriteScope, c4 as describeTool, c5 as findStrike, c6 as isWriteTool, c7 as legPremium, c8 as legSecurityId, c9 as legSide, ca as normalizeOptionChain, cb as parseCsv, cc as resolveChain, cd as resolveEquityChain, ce as resolveIndexChain, cf as riskProviderFor, cg as riskTypeFor } from './index-BeZmf5oS.mjs';
import { z, ZodError } from 'zod';
import 'axios';
import 'events';

declare class AuthResolver {
    private readonly config;
    constructor(config: DhanClientConfig);
    resolveAccessToken(): Promise<string>;
    handleTokenExpired(error: unknown): Promise<void>;
}

type ApiRequestOptions = {
    readonly method: 'GET' | 'PUT' | 'POST' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'PATCH';
    readonly url: string;
    readonly path?: Record<string, any>;
    readonly cookies?: Record<string, any>;
    readonly headers?: Record<string, any>;
    readonly query?: Record<string, any>;
    readonly formData?: Record<string, any>;
    readonly body?: any;
    readonly mediaType?: string;
    readonly responseHeader?: string;
    readonly errors?: Record<number, string>;
};

type ApiResult = {
    readonly url: string;
    readonly ok: boolean;
    readonly status: number;
    readonly statusText: string;
    readonly body: any;
};

declare class ApiError extends Error {
    readonly url: string;
    readonly status: number;
    readonly statusText: string;
    readonly body: any;
    readonly request: ApiRequestOptions;
    constructor(request: ApiRequestOptions, response: ApiResult, message: string);
}

declare class CancelError extends Error {
    constructor(message: string);
    get isCancelled(): boolean;
}
interface OnCancel {
    readonly isResolved: boolean;
    readonly isRejected: boolean;
    readonly isCancelled: boolean;
    (cancelHandler: () => void): void;
}
declare class CancelablePromise<T> implements Promise<T> {
    #private;
    constructor(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void, onCancel: OnCancel) => void);
    get [Symbol.toStringTag](): string;
    then<TResult1 = T, TResult2 = never>(onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null, onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1 | TResult2>;
    catch<TResult = never>(onRejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null): Promise<T | TResult>;
    finally(onFinally?: (() => void) | null): Promise<T>;
    cancel(): void;
    get isCancelled(): boolean;
}

type Resolver<T> = (options: ApiRequestOptions) => Promise<T>;
type Headers = Record<string, string>;
type OpenAPIConfig = {
    BASE: string;
    VERSION: string;
    WITH_CREDENTIALS: boolean;
    CREDENTIALS: 'include' | 'omit' | 'same-origin';
    TOKEN?: string | Resolver<string> | undefined;
    USERNAME?: string | Resolver<string> | undefined;
    PASSWORD?: string | Resolver<string> | undefined;
    HEADERS?: Headers | Resolver<Headers> | undefined;
    ENCODE_PATH?: ((path: string) => string) | undefined;
};
declare const OpenAPI: OpenAPIConfig;

type OrderModifyRequest = {
    /**
     * User specific identification generated by Dhan
     */
    dhanClientId?: string;
    /**
     * Order specific identification generated by Dhan
     */
    orderId?: string;
    /**
     * | **Enum Values**  | **Description**             |
     * |------------------|-----------------------------|
     * | LIMIT            | For Limit Order types       |
     * | MARKET           | For market Order types      |
     * | STOP_LOSS        | For Stop Loss Limit orders  |
     * | STOP_LOSS_MARKET | For Stop Loss Market orders |
     */
    orderType?: OrderModifyRequest.orderType;
    /**
     * Order leg where modification is to be done
     */
    legName?: OrderModifyRequest.legName;
    /**
     * Number of shares for the order
     */
    quantity?: number;
    /**
     * Price at which order is placed
     */
    price?: number;
    /**
     * Number of shares visible (Keep more than 30% of quantity)
     */
    disclosedQuantity?: number;
    /**
     * Price at which the order is triggered, in case of SL-M & SL-L
     */
    triggerPrice?: number;
    /**
     * | **Enum Values** | **Description**       |
     * |-----------------|-----------------------|
     * | DAY             | Valid till end of day |
     * | IOC             | Immediate or Cancel   |
     */
    validity?: OrderModifyRequest.validity;
};
declare namespace OrderModifyRequest {
    /**
     * | **Enum Values**  | **Description**             |
     * |------------------|-----------------------------|
     * | LIMIT            | For Limit Order types       |
     * | MARKET           | For market Order types      |
     * | STOP_LOSS        | For Stop Loss Limit orders  |
     * | STOP_LOSS_MARKET | For Stop Loss Market orders |
     */
    enum orderType {
        LIMIT = "LIMIT",
        MARKET = "MARKET",
        STOP_LOSS = "STOP_LOSS",
        STOP_LOSS_MARKET = "STOP_LOSS_MARKET"
    }
    /**
     * Order leg where modification is to be done
     */
    enum legName {
        ENTRY_LEG = "ENTRY_LEG",
        STOP_LOSS_LEG = "STOP_LOSS_LEG",
        TARGET_LEG = "TARGET_LEG",
        NA = "NA"
    }
    /**
     * | **Enum Values** | **Description**       |
     * |-----------------|-----------------------|
     * | DAY             | Valid till end of day |
     * | IOC             | Immediate or Cancel   |
     */
    enum validity {
        DAY = "DAY",
        IOC = "IOC"
    }
}

type OrderRequest = {
    /**
     * User specific identification generated by Dhan
     */
    dhanClientId?: string;
    /**
     * The user/partner generated id for tracking back
     */
    correlationId?: string;
    /**
     * Signifies the type of transaction whether it's BUY or SELL
     */
    transactionType: OrderRequest.transactionType;
    /**
     * | **Enums**    | **Exchange** | **Segment**       |
     * |--------------|--------------|-------------------|
     * | NSE_EQ       | NSE          | Equity Cash       |
     * | NSE_FNO      | NSE          | Futures & Options |
     * | NSE_COMM      | NSE          | Commodity |
     * | BSE_EQ       | BSE          | Equity Cash       |
     * | BSE_FNO      | BSE          | Futures & Options |
     * | MCX_COMM     | MCX          | Commodity         |
     *
     */
    exchangeSegment: OrderRequest.exchangeSegment;
    /**
     * | **Enum Values** | **Description**                                |
     * |-----------------|------------------------------------------------|
     * | CNC             | Cash & Carry for equity deliveries             |
     * | INTRADAY        | Intraday for Equity, Futures & Options         |
     * | MARGIN          | Carry Forward in Futures & Options             |
     * | CO              | Cover Order; entry and stop loss               |
     * | BO              | Bracket Order; entry, stop loss & target price |
     * | MTF             | Margin Traded Fund                             |
     * **CO & BO product types will be valid only for Intraday**
     */
    productType?: OrderRequest.productType;
    /**
     * | **Enum Values**  | **Description**             |
     * |------------------|-----------------------------|
     * | LIMIT            | For Limit Order types       |
     * | MARKET           | For market Order types      |
     * | STOP_LOSS        | For Stop Loss Limit orders  |
     * | STOP_LOSS_MARKET | For Stop Loss Market orders |
     */
    orderType?: OrderRequest.orderType;
    /**
     * | **Enum Values** | **Description**       |
     * |-----------------|-----------------------|
     * | DAY             | Valid till end of day |
     * | IOC             | Immediate or Cancel   |
     */
    validity?: OrderRequest.validity;
    /**
     * Exchange standard identification for each scrip
     */
    securityId?: string;
    /**
     * Number of shares for the order
     */
    quantity?: number;
    /**
     * Number shares visible in the market depth
     */
    disclosedQuantity?: number;
    /**
     * Price at which the order is requested to execute
     */
    price?: number;
    /**
     * Price at which the order is triggered
     */
    triggerPrice?: number;
    /**
     * Flag to inform that the order placed is After Market Order
     */
    afterMarketOrder?: boolean;
    /**
     * Flag to inform after what time AMO is pumped
     */
    amoTime?: OrderRequest.amoTime;
    /**
     * Bracket order Target price
     */
    boProfitValue?: number;
    /**
     * Bracket Order/Cover Order Stop Loss Price
     */
    boStopLossValue?: number;
};
declare namespace OrderRequest {
    /**
     * Signifies the type of transaction whether it's BUY or SELL
     */
    enum transactionType {
        BUY = "BUY",
        SELL = "SELL"
    }
    /**
     * | **Enums**    | **Exchange** | **Segment**       |
     * |--------------|--------------|-------------------|
     * | NSE_EQ       | NSE          | Equity Cash       |
     * | NSE_FNO      | NSE          | Futures & Options |
     * | NSE_COMM      | NSE          | Commodity |
     * | BSE_EQ       | BSE          | Equity Cash       |
     * | BSE_FNO      | BSE          | Futures & Options |
     * | MCX_COMM     | MCX          | Commodity         |
     *
     */
    enum exchangeSegment {
        NSE_EQ = "NSE_EQ",
        NSE_FNO = "NSE_FNO",
        NSE_COMM = "NSE_COMM",
        BSE_EQ = "BSE_EQ",
        BSE_FNO = "BSE_FNO",
        MCX_COMM = "MCX_COMM"
    }
    /**
     * | **Enum Values** | **Description**                                |
     * |-----------------|------------------------------------------------|
     * | CNC             | Cash & Carry for equity deliveries             |
     * | INTRADAY        | Intraday for Equity, Futures & Options         |
     * | MARGIN          | Carry Forward in Futures & Options             |
     * | CO              | Cover Order; entry and stop loss               |
     * | BO              | Bracket Order; entry, stop loss & target price |
     * | MTF             | Margin Traded Fund                             |
     * **CO & BO product types will be valid only for Intraday**
     */
    enum productType {
        CNC = "CNC",
        INTRADAY = "INTRADAY",
        MARGIN = "MARGIN",
        MTF = "MTF",
        CO = "CO",
        BO = "BO"
    }
    /**
     * | **Enum Values**  | **Description**             |
     * |------------------|-----------------------------|
     * | LIMIT            | For Limit Order types       |
     * | MARKET           | For market Order types      |
     * | STOP_LOSS        | For Stop Loss Limit orders  |
     * | STOP_LOSS_MARKET | For Stop Loss Market orders |
     */
    enum orderType {
        LIMIT = "LIMIT",
        MARKET = "MARKET",
        STOP_LOSS = "STOP_LOSS",
        STOP_LOSS_MARKET = "STOP_LOSS_MARKET"
    }
    /**
     * | **Enum Values** | **Description**       |
     * |-----------------|-----------------------|
     * | DAY             | Valid till end of day |
     * | IOC             | Immediate or Cancel   |
     */
    enum validity {
        DAY = "DAY",
        IOC = "IOC"
    }
    /**
     * Flag to inform after what time AMO is pumped
     */
    enum amoTime {
        OPEN = "OPEN",
        OPEN_30 = "OPEN_30",
        OPEN_60 = "OPEN_60",
        PRE_OPEN = "PRE_OPEN"
    }
}

type OrderResponse = {
    /**
     * User specific identification generated by Dhan
     */
    dhanClientId?: string;
    /**
     * Order specific identification generated by Dhan
     */
    orderId?: string;
    /**
     * Order specific identification generated by Exchange
     */
    exchangeOrderId?: string;
    /**
     * The user/partner generated id for tracking back
     */
    correlationId?: string;
    /**
     * | **Enum Values** | **Description**                             |
     * |-----------------|---------------------------------------------|
     * | TRANSIT         | Did not reach the exchange server           |
     * | PENDING         | Reached at exchange end, awaiting execution |
     * | REJECTED        | Rejected at exchange/broker’s end           |
     * | CANCELLED       | Cancelled by user                           |
     * | PART_TRADED     | Partially Executed                          |
     * | TRADED          | Executed                                    |
     * | EXPIRED         | Validity of order is expired                |
     */
    orderStatus?: OrderResponse.orderStatus;
    /**
     * Signifies the type of transaction whether it's BUY or SELL
     */
    transactionType?: OrderResponse.transactionType;
    /**
     * | **Enums**    | **Exchange** | **Segment**       |
     * |--------------|--------------|-------------------|
     * | NSE_EQ       | NSE          | Equity Cash       |
     * | NSE_FNO      | NSE          | Futures & Options |
     * | BSE_EQ       | BSE          | Equity Cash       |
     * | BSE_FNO      | BSE          | Futures & Options |
     * | MCX_COMM     | MCX          | Commodity         |
     *
     */
    exchangeSegment?: OrderResponse.exchangeSegment;
    /**
     * | **Enum Values** | **Description**                                |
     * |-----------------|------------------------------------------------|
     * | CNC             | Cash & Carry for equity deliveries             |
     * | INTRADAY        | Intraday for Equity, Futures & Options         |
     * | MARGIN          | Carry Forward in Futures & Options             |
     * | CO              | Cover Order; entry and stop loss               |
     * | BO              | Bracket Order; entry, stop loss & target price |
     * | MTF             | Margin Traded Fund                             |
     * **CO & BO product types will be valid only for Intraday**
     */
    productType?: OrderResponse.productType;
    /**
     * | **Enum Values**  | **Description**             |
     * |------------------|-----------------------------|
     * | LIMIT            | For Limit Order types       |
     * | MARKET           | For market Order types      |
     * | STOP_LOSS        | For Stop Loss Limit orders  |
     * | STOP_LOSS_MARKET | For Stop Loss Market orders |
     */
    orderType?: OrderResponse.orderType;
    /**
     * | **Enum Values** | **Description**       |
     * |-----------------|-----------------------|
     * | DAY             | Valid till end of day |
     * | IOC             | Immediate or Cancel   |
     */
    validity?: OrderResponse.validity;
    /**
     * Exchange standard  trading symbol
     */
    tradingSymbol?: string;
    /**
     * Exchange standard identification for each scrip
     */
    securityId?: string;
    /**
     * Number of shares for the order
     */
    quantity?: number;
    /**
     * Number shares visible in the market depth
     */
    disclosedQuantity?: number;
    /**
     * Price at which the order is requested to execute
     */
    price?: number;
    /**
     * Price at which the order is triggered
     */
    triggerPrice?: number;
    /**
     * Flag to inform that the order placed is After Market Order
     */
    afterMarketOrder?: boolean;
    /**
     * Bracket order Target price
     */
    boProfitValue?: number;
    /**
     * Bracket Order/Cover Order Stop Loss Price
     */
    boStopLossValue?: number;
    /**
     * Order leg where modification is to be done
     */
    legName?: OrderResponse.legName;
    /**
     * Time at which the record is created
     */
    createTime?: string;
    /**
     * Time at which the record is updated
     */
    updateTime?: string;
    /**
     * Time at which order reached at exchange end
     */
    exchangeTime?: string;
    /**
     * For F&O, expiry date of contract
     */
    drvExpiryDate?: string;
    /**
     * For Options, type CALL or PUT
     */
    drvOptionType?: OrderResponse.drvOptionType;
    /**
     * For Options, Strike Price
     */
    drvStrikePrice?: number;
    /**
     * When order is rejected or failed, omsErrorCode would be populated
     */
    omsErrorCode?: string;
    /**
     * When order is rejected or failed, omsErrorDescription would be populated
     */
    omsErrorDescription?: string;
    /**
     * Algo_ID
     */
    algoId?: string;
    /**
     * Number of shares yet to be traded for the order
     */
    remainingQuantity?: number;
    /**
     * Average price at which order is traded
     */
    averageTradedPrice?: number;
    /**
     * Filled Quantity
     */
    filledQty?: number;
};
declare namespace OrderResponse {
    /**
     * | **Enum Values** | **Description**                             |
     * |-----------------|---------------------------------------------|
     * | TRANSIT         | Did not reach the exchange server           |
     * | PENDING         | Reached at exchange end, awaiting execution |
     * | REJECTED        | Rejected at exchange/broker’s end           |
     * | CANCELLED       | Cancelled by user                           |
     * | PART_TRADED     | Partially Executed                          |
     * | TRADED          | Executed                                    |
     * | EXPIRED         | Validity of order is expired                |
     */
    enum orderStatus {
        TRANSIT = "TRANSIT",
        PENDING = "PENDING",
        REJECTED = "REJECTED",
        CANCELLED = "CANCELLED",
        PART_TRADED = "PART_TRADED",
        TRADED = "TRADED",
        EXPIRED = "EXPIRED"
    }
    /**
     * Signifies the type of transaction whether it's BUY or SELL
     */
    enum transactionType {
        BUY = "BUY",
        SELL = "SELL"
    }
    /**
     * | **Enums**    | **Exchange** | **Segment**       |
     * |--------------|--------------|-------------------|
     * | NSE_EQ       | NSE          | Equity Cash       |
     * | NSE_FNO      | NSE          | Futures & Options |
     * | BSE_EQ       | BSE          | Equity Cash       |
     * | BSE_FNO      | BSE          | Futures & Options |
     * | MCX_COMM     | MCX          | Commodity         |
     *
     */
    enum exchangeSegment {
        NSE_EQ = "NSE_EQ",
        NSE_FNO = "NSE_FNO",
        BSE_EQ = "BSE_EQ",
        BSE_FNO = "BSE_FNO",
        MCX_COMM = "MCX_COMM"
    }
    /**
     * | **Enum Values** | **Description**                                |
     * |-----------------|------------------------------------------------|
     * | CNC             | Cash & Carry for equity deliveries             |
     * | INTRADAY        | Intraday for Equity, Futures & Options         |
     * | MARGIN          | Carry Forward in Futures & Options             |
     * | CO              | Cover Order; entry and stop loss               |
     * | BO              | Bracket Order; entry, stop loss & target price |
     * | MTF             | Margin Traded Fund                             |
     * **CO & BO product types will be valid only for Intraday**
     */
    enum productType {
        CNC = "CNC",
        INTRADAY = "INTRADAY",
        MARGIN = "MARGIN",
        MTF = "MTF",
        CO = "CO",
        BO = "BO"
    }
    /**
     * | **Enum Values**  | **Description**             |
     * |------------------|-----------------------------|
     * | LIMIT            | For Limit Order types       |
     * | MARKET           | For market Order types      |
     * | STOP_LOSS        | For Stop Loss Limit orders  |
     * | STOP_LOSS_MARKET | For Stop Loss Market orders |
     */
    enum orderType {
        LIMIT = "LIMIT",
        MARKET = "MARKET",
        STOP_LOSS = "STOP_LOSS",
        STOP_LOSS_MARKET = "STOP_LOSS_MARKET"
    }
    /**
     * | **Enum Values** | **Description**       |
     * |-----------------|-----------------------|
     * | DAY             | Valid till end of day |
     * | IOC             | Immediate or Cancel   |
     */
    enum validity {
        DAY = "DAY",
        IOC = "IOC"
    }
    /**
     * Order leg where modification is to be done
     */
    enum legName {
        ENTRY_LEG = "ENTRY_LEG",
        STOP_LOSS_LEG = "STOP_LOSS_LEG",
        TARGET_LEG = "TARGET_LEG",
        NA = "NA"
    }
    /**
     * For Options, type CALL or PUT
     */
    enum drvOptionType {
        CALL = "CALL",
        PUT = "PUT",
        NA = "NA"
    }
}

type OrderStatusResponse = {
    /**
     * Order specific identification generated by Dhan
     */
    orderId?: string;
    /**
     * | **Enum Values** | **Description**                             |
     * |-----------------|---------------------------------------------|
     * | TRANSIT         | Did not reach the exchange server           |
     * | PENDING         | Reached at exchange end, awaiting execution |
     * | REJECTED        | Rejected at exchange/broker’s end           |
     * | CANCELLED       | Cancelled by user                           |
     * | PART_TRADED     | Partially Executed                          |
     * | TRADED          | Executed                                    |
     * | EXPIRED         | Validity of order is expired                |
     */
    orderStatus?: OrderStatusResponse.orderStatus;
};
declare namespace OrderStatusResponse {
    /**
     * | **Enum Values** | **Description**                             |
     * |-----------------|---------------------------------------------|
     * | TRANSIT         | Did not reach the exchange server           |
     * | PENDING         | Reached at exchange end, awaiting execution |
     * | REJECTED        | Rejected at exchange/broker’s end           |
     * | CANCELLED       | Cancelled by user                           |
     * | PART_TRADED     | Partially Executed                          |
     * | TRADED          | Executed                                    |
     * | EXPIRED         | Validity of order is expired                |
     */
    enum orderStatus {
        TRANSIT = "TRANSIT",
        PENDING = "PENDING",
        REJECTED = "REJECTED",
        CANCELLED = "CANCELLED",
        PART_TRADED = "PART_TRADED",
        TRADED = "TRADED",
        EXPIRED = "EXPIRED",
        MODIFIED = "MODIFIED",
        TRIGGERED = "TRIGGERED",
        INACTIVE = "INACTIVE"
    }
}

type SuperModifyRequest = {
    /**
     * User specific identification generated by Dhan
     */
    dhanClientId?: string;
    /**
     * Order specific identification generated by Dhan
     */
    orderId?: string;
    /**
     * | **Enum Values**  | **Description**             |
     * |------------------|-----------------------------|
     * | LIMIT            | For Limit Order types       |
     * | MARKET           | For market Order types      |
     */
    orderType?: SuperModifyRequest.orderType;
    /**
     * ENTRY_LEG - Entire Super Order can be modified, only when main order status is `PENDING`, TARGET_LEG STOP_LOSS_LEG
     */
    legName?: SuperModifyRequest.legName;
    /**
     * Quantity to be modified - only for ENTRY_LEG
     */
    quantity?: number;
    /**
     * Price to be modified - only for ENTRY_LEG
     */
    price?: number;
    /**
     * Target Price to be modified - ENTRY_LEG or TARGET_LEG
     */
    targetPrice?: number;
    /**
     * Stop Loss Price to be modified - ENTRY_LEG or STOP_LOSS_LEG
     */
    stopLossPrice?: number;
    /**
     * Stop Loss Price jump to be modified - ENTRY_LEG or STOP_LOSS_LEG
     */
    trailingJump?: number;
};
declare namespace SuperModifyRequest {
    /**
     * | **Enum Values**  | **Description**             |
     * |------------------|-----------------------------|
     * | LIMIT            | For Limit Order types       |
     * | MARKET           | For market Order types      |
     */
    enum orderType {
        LIMIT = "LIMIT",
        MARKET = "MARKET"
    }
    /**
     * ENTRY_LEG - Entire Super Order can be modified, only when main order status is `PENDING`, TARGET_LEG STOP_LOSS_LEG
     */
    enum legName {
        ENTRY_LEG = "ENTRY_LEG",
        STOP_LOSS_LEG = "STOP_LOSS_LEG",
        TARGET_LEG = "TARGET_LEG"
    }
}

/**
 * Array of Leg Details
 */
type SuperOrderLeg = {
    /**
     * Order specific identification generated by Dhan
     */
    orderId?: string;
    /**
     * Order leg where modification is to be done
     */
    legName?: SuperOrderLeg.legName;
    /**
     * Signifies the type of transaction whether it's BUY or SELL
     */
    transactionType?: SuperOrderLeg.transactionType;
    /**
     * Number of shares yet to be traded for the order
     */
    remainingQuantity?: number;
    /**
     * Price at which the order is requested to execute for the leg
     */
    price?: number;
    /**
     * | **Enum Values** | **Description**                             |
     * |-----------------|---------------------------------------------|
     * | PENDING         | Reached at exchange end, awaiting execution |
     * | PART_TRADED     | Partially Executed                          |
     * | TRIGGERED       | Executed                                    |
     * | CANCELLED       | Legs manually Cancelled by User             |
     * | EXPIRED         | Validity of order is expired                |
     */
    orderStatus?: SuperOrderLeg.orderStatus;
    /**
     * Price Jump by which Stop Loss should be trailed
     */
    trailingJump?: number;
};
declare namespace SuperOrderLeg {
    /**
     * Order leg where modification is to be done
     */
    enum legName {
        STOP_LOSS_LEG = "STOP_LOSS_LEG",
        TARGET_LEG = "TARGET_LEG"
    }
    /**
     * Signifies the type of transaction whether it's BUY or SELL
     */
    enum transactionType {
        BUY = "BUY",
        SELL = "SELL"
    }
    /**
     * | **Enum Values** | **Description**                             |
     * |-----------------|---------------------------------------------|
     * | PENDING         | Reached at exchange end, awaiting execution |
     * | PART_TRADED     | Partially Executed                          |
     * | TRIGGERED       | Executed                                    |
     * | CANCELLED       | Legs manually Cancelled by User             |
     * | EXPIRED         | Validity of order is expired                |
     */
    enum orderStatus {
        PENDING = "PENDING",
        PART_TRADED = "PART_TRADED",
        TRIGGERED = "TRIGGERED",
        CANCELLED = "CANCELLED",
        EXPIRED = "EXPIRED"
    }
}

type SuperOrderRequest = {
    /**
     * User specific identification generated by Dhan
     */
    dhanClientId?: string;
    /**
     * The user/partner generated id for tracking back
     */
    correlationId?: string;
    /**
     * The trading side of transaction
     */
    transactionType: SuperOrderRequest.transactionType;
    /**
     * | **Enums**    | **Exchange** | **Segment**       |
     * |--------------|--------------|-------------------|
     * | NSE_EQ       | NSE          | Equity Cash       |
     * | NSE_FNO      | NSE          | Futures & Options |
     * | NSE_COMM     | NSE          | Commodity |
     * | BSE_EQ       | BSE          | Equity Cash       |
     * | BSE_FNO      | BSE          | Futures & Options |
     * | MCX_COMM     | MCX          | Commodity         |
     *
     */
    exchangeSegment: SuperOrderRequest.exchangeSegment;
    /**
     * | **Enum Values** | **Description**                                |
     * |-----------------|------------------------------------------------|
     * | CNC             | Cash & Carry for equity deliveries             |
     * | INTRADAY        | Intraday for Equity, Futures & Options         |
     * | MARGIN          | Carry Forward in Futures & Options             |
     * | MTF             | Margin Traded Fund                             |
     *
     */
    productType?: SuperOrderRequest.productType;
    /**
     * | **Enum Values**  | **Description**             |
     * |------------------|-----------------------------|
     * | LIMIT            | For Limit Order types       |
     * | MARKET           | For market Order types      |
     */
    orderType?: SuperOrderRequest.orderType;
    /**
     * Exchange standard identification for each scrip
     */
    securityId?: string;
    /**
     * Number of shares for the order
     */
    quantity?: number;
    /**
     * Price at which order is placed
     */
    price?: number;
    /**
     * Target price for the Super Order
     */
    targetPrice?: number;
    /**
     * Stop Loss Price for the Super Order
     */
    stopLossPrice?: number;
    /**
     * Price Jump by which Stop Loss should be trailed
     */
    trailingJump?: number;
};
declare namespace SuperOrderRequest {
    /**
     * The trading side of transaction
     */
    enum transactionType {
        BUY = "BUY",
        SELL = "SELL"
    }
    /**
     * | **Enums**    | **Exchange** | **Segment**       |
     * |--------------|--------------|-------------------|
     * | NSE_EQ       | NSE          | Equity Cash       |
     * | NSE_FNO      | NSE          | Futures & Options |
     * | NSE_COMM     | NSE          | Commodity |
     * | BSE_EQ       | BSE          | Equity Cash       |
     * | BSE_FNO      | BSE          | Futures & Options |
     * | MCX_COMM     | MCX          | Commodity         |
     *
     */
    enum exchangeSegment {
        NSE_EQ = "NSE_EQ",
        NSE_FNO = "NSE_FNO",
        NSE_COMM = "NSE_COMM",
        BSE_EQ = "BSE_EQ",
        BSE_FNO = "BSE_FNO",
        MCX_COMM = "MCX_COMM"
    }
    /**
     * | **Enum Values** | **Description**                                |
     * |-----------------|------------------------------------------------|
     * | CNC             | Cash & Carry for equity deliveries             |
     * | INTRADAY        | Intraday for Equity, Futures & Options         |
     * | MARGIN          | Carry Forward in Futures & Options             |
     * | MTF             | Margin Traded Fund                             |
     *
     */
    enum productType {
        CNC = "CNC",
        INTRADAY = "INTRADAY",
        MARGIN = "MARGIN",
        MTF = "MTF"
    }
    /**
     * | **Enum Values**  | **Description**             |
     * |------------------|-----------------------------|
     * | LIMIT            | For Limit Order types       |
     * | MARKET           | For market Order types      |
     */
    enum orderType {
        LIMIT = "LIMIT",
        MARKET = "MARKET"
    }
}

type SuperOrderResponse = {
    /**
     * User specific identification generated by Dhan
     */
    dhanClientId?: string;
    /**
     * Order specific identification generated by Dhan
     */
    orderId?: string;
    /**
     * Order specific identification generated by Exchange
     */
    exchangeOrderId?: string;
    /**
     * The user/partner generated id for tracking back
     */
    correlationId?: string;
    /**
     * | **Enum Values** | **Description**                                                |
     * |-----------------|-------------------------------------------------------------------         |
     * | TRANSIT         | Did not reach the exchange server                                          |
     * | PENDING         | Reached at exchange end, awaiting execution                                |
     * | REJECTED        | Rejected at exchange/broker’s end                                          |
     * | CANCELLED       | Cancelled by user                                                          |
     * | PART_TRADED     | Partially Executed                                                         |
     * | TRADED          | Executed                                                                   |
     * | CLOSED          | ENTRY_LEG along with its respective child legs are/is successfully traded  |
     * | EXPIRED         | Validity of order is expired                |
     */
    orderStatus?: SuperOrderResponse.orderStatus;
    /**
     * The trading side of transaction
     */
    transactionType?: SuperOrderResponse.transactionType;
    /**
     * | **Enums**    | **Exchange** | **Segment**       |
     * |--------------|--------------|-------------------|
     * | NSE_EQ       | NSE          | Equity Cash       |
     * | NSE_FNO      | NSE          | Futures & Options |
     * | BSE_EQ       | BSE          | Equity Cash       |
     * | BSE_FNO      | BSE          | Futures & Options |
     * | MCX_COMM     | MCX          | Commodity         |
     *
     */
    exchangeSegment?: SuperOrderResponse.exchangeSegment;
    /**
     * | **Enum Values** | **Description**                                |
     * |-----------------|------------------------------------------------|
     * | CNC             | Cash & Carry for equity deliveries             |
     * | INTRADAY        | Intraday for Equity, Futures & Options         |
     * | MARGIN          | Carry Forward in Futures & Options             |
     * | MTF             | Margin Traded Fund                             |
     *
     */
    productType?: SuperOrderResponse.productType;
    /**
     * | **Enum Values**  | **Description**             |
     * |------------------|-----------------------------|
     * | LIMIT            | For Limit Order types       |
     * | MARKET           | For market Order types      |
     */
    orderType?: SuperOrderResponse.orderType;
    /**
     * | **Enum Values** | **Description**       |
     * |-----------------|-----------------------|
     * | DAY             | Valid till end of day |
     * | IOC             | Immediate or Cancel   |
     */
    validity?: SuperOrderResponse.validity;
    /**
     * Refer Trading Symbol in Tables
     */
    tradingSymbol?: string;
    /**
     * Exchange standard identification for each scrip
     */
    securityId?: string;
    /**
     * Number of shares for the order
     */
    quantity?: number;
    /**
     * Quantity pending execution
     */
    remainingQuantity?: number;
    /**
     * Price at which the stock is currently trading
     */
    ltp?: number;
    /**
     * Price at which the order is requested to execute
     */
    price?: number;
    /**
     * If the order is placed after market
     */
    afterMarketOrder?: boolean;
    /**
     * Leg identification
     */
    legName?: SuperOrderResponse.legName;
    /**
     * Time at which the record is created
     */
    createTime?: string;
    /**
     * Time at which the record is updated
     */
    updateTime?: string;
    /**
     * Time at which order reached at exchange end
     */
    exchangeTime?: string;
    /**
     * Description of error in case the order is rejected or failed
     */
    omsErrorDescription?: string;
    /**
     * Algo id
     */
    algoId?: string;
    /**
     * Array of Leg Details
     */
    legDetails?: Array<SuperOrderLeg>;
    /**
     * Average price at which order is traded
     */
    averageTradedPrice?: number;
    /**
     * Quantity of order traded on Exchange
     */
    filledQty?: number;
};
declare namespace SuperOrderResponse {
    /**
     * | **Enum Values** | **Description**                                                |
     * |-----------------|-------------------------------------------------------------------         |
     * | TRANSIT         | Did not reach the exchange server                                          |
     * | PENDING         | Reached at exchange end, awaiting execution                                |
     * | REJECTED        | Rejected at exchange/broker’s end                                          |
     * | CANCELLED       | Cancelled by user                                                          |
     * | PART_TRADED     | Partially Executed                                                         |
     * | TRADED          | Executed                                                                   |
     * | CLOSED          | ENTRY_LEG along with its respective child legs are/is successfully traded  |
     * | EXPIRED         | Validity of order is expired                |
     */
    enum orderStatus {
        TRANSIT = "TRANSIT",
        PENDING = "PENDING",
        REJECTED = "REJECTED",
        CANCELLED = "CANCELLED",
        PART_TRADED = "PART_TRADED",
        TRADED = "TRADED",
        CLOSED = "CLOSED",
        EXPIRED = "EXPIRED"
    }
    /**
     * The trading side of transaction
     */
    enum transactionType {
        BUY = "BUY",
        SELL = "SELL"
    }
    /**
     * | **Enums**    | **Exchange** | **Segment**       |
     * |--------------|--------------|-------------------|
     * | NSE_EQ       | NSE          | Equity Cash       |
     * | NSE_FNO      | NSE          | Futures & Options |
     * | BSE_EQ       | BSE          | Equity Cash       |
     * | BSE_FNO      | BSE          | Futures & Options |
     * | MCX_COMM     | MCX          | Commodity         |
     *
     */
    enum exchangeSegment {
        NSE_EQ = "NSE_EQ",
        NSE_FNO = "NSE_FNO",
        NSE_COMM = "NSE_COMM",
        BSE_EQ = "BSE_EQ",
        BSE_FNO = "BSE_FNO",
        MCX_COMM = "MCX_COMM"
    }
    /**
     * | **Enum Values** | **Description**                                |
     * |-----------------|------------------------------------------------|
     * | CNC             | Cash & Carry for equity deliveries             |
     * | INTRADAY        | Intraday for Equity, Futures & Options         |
     * | MARGIN          | Carry Forward in Futures & Options             |
     * | MTF             | Margin Traded Fund                             |
     *
     */
    enum productType {
        CNC = "CNC",
        INTRADAY = "INTRADAY",
        MARGIN = "MARGIN",
        MTF = "MTF"
    }
    /**
     * | **Enum Values**  | **Description**             |
     * |------------------|-----------------------------|
     * | LIMIT            | For Limit Order types       |
     * | MARKET           | For market Order types      |
     */
    enum orderType {
        LIMIT = "LIMIT",
        MARKET = "MARKET"
    }
    /**
     * | **Enum Values** | **Description**       |
     * |-----------------|-----------------------|
     * | DAY             | Valid till end of day |
     * | IOC             | Immediate or Cancel   |
     */
    enum validity {
        DAY = "DAY",
        IOC = "IOC"
    }
    /**
     * Leg identification
     */
    enum legName {
        ENTRY_LEG = "ENTRY_LEG"
    }
}

type TradeHistoryResponseModel = {
    /**
     * User specific identification generated by Dhan
     */
    dhanClientId?: string;
    /**
     * Order specific identification generated by Dhan
     */
    orderId?: string;
    /**
     * Order specific identification generated by Exchange
     */
    exchangeOrderId?: string;
    /**
     * Trade specific identification, generated by exchange once order is executed
     */
    exchangeTradeId?: string;
    /**
     * Signifies the type of transaction whether it's BUY or SELL
     */
    transactionType?: TradeHistoryResponseModel.transactionType;
    /**
     * | **Enums**    | **Exchange** | **Segment**       |
     * |--------------|--------------|-------------------|
     * | NSE_EQ       | NSE          | Equity Cash       |
     * | NSE_FNO      | NSE          | Futures & Options |
     * | BSE_EQ       | BSE          | Equity Cash       |
     * | BSE_FNO      | BSE          | Futures & Options |
     * | MCX_COMM     | MCX          | Commodity         |
     *
     */
    exchangeSegment?: TradeHistoryResponseModel.exchangeSegment;
    /**
     * | **Enum Values** | **Description**                                |
     * |-----------------|------------------------------------------------|
     * | CNC             | Cash & Carry for equity deliveries             |
     * | INTRADAY        | Intraday for Equity, Futures & Options         |
     * | MARGIN          | Carry Forward in Futures & Options             |
     * | CO              | Cover Order; entry and stop loss               |
     * | BO              | Bracket Order; entry, stop loss & target price |
     * | MTF             | Margin Traded Fund                             |
     * **CO & BO product types will be valid only for Intraday**
     */
    productType?: TradeHistoryResponseModel.productType;
    /**
     * | **Enum Values**  | **Description**             |
     * |------------------|-----------------------------|
     * | LIMIT            | For Limit Order types       |
     * | MARKET           | For market Order types      |
     * | STOP_LOSS        | For Stop Loss Limit orders  |
     * | STOP_LOSS_MARKET | For Stop Loss Market orders |
     */
    orderType?: TradeHistoryResponseModel.orderType;
    /**
     * Custom trading symbol
     */
    customSymbol?: string;
    /**
     * Exchange standard identification for each scrip
     */
    securityId?: string;
    /**
     * Number of shares traded
     */
    tradedQuantity?: number;
    /**
     * Price at which trade executed
     */
    tradedPrice?: number;
    /**
     * Isin Number of that scrip
     */
    isin?: string;
    /**
     * Instrument of that scrip
     */
    instrument?: string;
    /**
     * SEBI tax
     */
    sebiTax?: number;
    /**
     * stt
     */
    stt?: number;
    /**
     * Brokerage Charges
     */
    brokerageCharges?: number;
    /**
     * Service tax
     */
    serviceTax?: number;
    /**
     * Exchange Transaction Charges
     */
    exchangeTransactionCharges?: number;
    /**
     * Stamp duty paid on transfer of shares
     */
    stampDuty?: number;
    /**
     * Record create date time
     */
    createTime?: string;
    /**
     * Record update date time
     */
    updateTime?: string;
    /**
     * Time at which order reached at exchange end
     */
    exchangeTime?: string;
    /**
     * For F&O, expiry date of contract
     */
    drvExpiryDate?: string;
    /**
     * For Options, type CALL or PUT
     */
    drvOptionType?: TradeHistoryResponseModel.drvOptionType;
    /**
     * For Options, Strike Price
     */
    drvStrikePrice?: number;
};
declare namespace TradeHistoryResponseModel {
    /**
     * Signifies the type of transaction whether it's BUY or SELL
     */
    enum transactionType {
        BUY = "BUY",
        SELL = "SELL"
    }
    /**
     * | **Enums**    | **Exchange** | **Segment**       |
     * |--------------|--------------|-------------------|
     * | NSE_EQ       | NSE          | Equity Cash       |
     * | NSE_FNO      | NSE          | Futures & Options |
     * | BSE_EQ       | BSE          | Equity Cash       |
     * | BSE_FNO      | BSE          | Futures & Options |
     * | MCX_COMM     | MCX          | Commodity         |
     *
     */
    enum exchangeSegment {
        NSE_EQ = "NSE_EQ",
        NSE_FNO = "NSE_FNO",
        BSE_EQ = "BSE_EQ",
        BSE_FNO = "BSE_FNO",
        MCX_COMM = "MCX_COMM"
    }
    /**
     * | **Enum Values** | **Description**                                |
     * |-----------------|------------------------------------------------|
     * | CNC             | Cash & Carry for equity deliveries             |
     * | INTRADAY        | Intraday for Equity, Futures & Options         |
     * | MARGIN          | Carry Forward in Futures & Options             |
     * | CO              | Cover Order; entry and stop loss               |
     * | BO              | Bracket Order; entry, stop loss & target price |
     * | MTF             | Margin Traded Fund                             |
     * **CO & BO product types will be valid only for Intraday**
     */
    enum productType {
        CNC = "CNC",
        INTRADAY = "INTRADAY",
        MARGIN = "MARGIN",
        MTF = "MTF",
        CO = "CO",
        BO = "BO"
    }
    /**
     * | **Enum Values**  | **Description**             |
     * |------------------|-----------------------------|
     * | LIMIT            | For Limit Order types       |
     * | MARKET           | For market Order types      |
     * | STOP_LOSS        | For Stop Loss Limit orders  |
     * | STOP_LOSS_MARKET | For Stop Loss Market orders |
     */
    enum orderType {
        LIMIT = "LIMIT",
        MARKET = "MARKET",
        STOP_LOSS = "STOP_LOSS",
        STOP_LOSS_MARKET = "STOP_LOSS_MARKET"
    }
    /**
     * For Options, type CALL or PUT
     */
    enum drvOptionType {
        CALL = "CALL",
        PUT = "PUT",
        NA = "NA"
    }
}

type TradeResponse = {
    /**
     * User specific identification generated by Dhan
     */
    dhanClientId?: string;
    /**
     * Order specific identification generated by Dhan
     */
    orderId?: string;
    /**
     * Order specific identification generated by Exchange
     */
    exchangeOrderId?: string;
    /**
     * Trade specific identification, generated by exchange once order is executed
     */
    exchangeTradeId?: string;
    /**
     * Signifies the type of transaction whether it's BUY or SELL
     */
    transactionType?: TradeResponse.transactionType;
    /**
     * | **Enums**    | **Exchange** | **Segment**       |
     * |--------------|--------------|-------------------|
     * | NSE_EQ       | NSE          | Equity Cash       |
     * | NSE_FNO      | NSE          | Futures & Options |
     * | BSE_EQ       | BSE          | Equity Cash       |
     * | BSE_FNO      | BSE          | Futures & Options |
     * | MCX_COMM     | MCX          | Commodity         |
     *
     */
    exchangeSegment?: TradeResponse.exchangeSegment;
    /**
     * | **Enum Values** | **Description**                                |
     * |-----------------|------------------------------------------------|
     * | CNC             | Cash & Carry for equity deliveries             |
     * | INTRADAY        | Intraday for Equity, Futures & Options         |
     * | MARGIN          | Carry Forward in Futures & Options             |
     * | CO              | Cover Order; entry and stop loss               |
     * | BO              | Bracket Order; entry, stop loss & target price |
     * | MTF             | Margin Traded Fund                             |
     * **CO & BO product types will be valid only for Intraday**
     */
    productType?: TradeResponse.productType;
    /**
     * | **Enum Values**  | **Description**             |
     * |------------------|-----------------------------|
     * | LIMIT            | For Limit Order types       |
     * | MARKET           | For market Order types      |
     * | STOP_LOSS        | For Stop Loss Limit orders  |
     * | STOP_LOSS_MARKET | For Stop Loss Market orders |
     */
    orderType?: TradeResponse.orderType;
    /**
     * Exchange standard  trading symbol
     */
    tradingSymbol?: string;
    /**
     * Custom trading symbol
     */
    customSymbol?: string;
    /**
     * Exchange standard identification for each scrip
     */
    securityId?: string;
    /**
     * Number of shares traded
     */
    tradedQuantity?: number;
    /**
     * Price at which trade executed
     */
    tradedPrice?: number;
    /**
     * Record create date time
     */
    createTime?: string;
    /**
     * Record update date time
     */
    updateTime?: string;
    /**
     * Time at which order reached at exchange end
     */
    exchangeTime?: string;
    /**
     * For F&O, expiry date of contract
     */
    drvExpiryDate?: string;
    /**
     * For Options, type CALL or PUT
     */
    drvOptionType?: TradeResponse.drvOptionType;
    /**
     * For Options, Strike Price
     */
    drvStrikePrice?: number;
};
declare namespace TradeResponse {
    /**
     * Signifies the type of transaction whether it's BUY or SELL
     */
    enum transactionType {
        BUY = "BUY",
        SELL = "SELL"
    }
    /**
     * | **Enums**    | **Exchange** | **Segment**       |
     * |--------------|--------------|-------------------|
     * | NSE_EQ       | NSE          | Equity Cash       |
     * | NSE_FNO      | NSE          | Futures & Options |
     * | BSE_EQ       | BSE          | Equity Cash       |
     * | BSE_FNO      | BSE          | Futures & Options |
     * | MCX_COMM     | MCX          | Commodity         |
     *
     */
    enum exchangeSegment {
        NSE_EQ = "NSE_EQ",
        NSE_FNO = "NSE_FNO",
        BSE_EQ = "BSE_EQ",
        BSE_FNO = "BSE_FNO",
        MCX_COMM = "MCX_COMM"
    }
    /**
     * | **Enum Values** | **Description**                                |
     * |-----------------|------------------------------------------------|
     * | CNC             | Cash & Carry for equity deliveries             |
     * | INTRADAY        | Intraday for Equity, Futures & Options         |
     * | MARGIN          | Carry Forward in Futures & Options             |
     * | CO              | Cover Order; entry and stop loss               |
     * | BO              | Bracket Order; entry, stop loss & target price |
     * | MTF             | Margin Traded Fund                             |
     * **CO & BO product types will be valid only for Intraday**
     */
    enum productType {
        CNC = "CNC",
        INTRADAY = "INTRADAY",
        MARGIN = "MARGIN",
        MTF = "MTF",
        CO = "CO",
        BO = "BO"
    }
    /**
     * | **Enum Values**  | **Description**             |
     * |------------------|-----------------------------|
     * | LIMIT            | For Limit Order types       |
     * | MARKET           | For market Order types      |
     * | STOP_LOSS        | For Stop Loss Limit orders  |
     * | STOP_LOSS_MARKET | For Stop Loss Market orders |
     */
    enum orderType {
        LIMIT = "LIMIT",
        MARKET = "MARKET",
        STOP_LOSS = "STOP_LOSS",
        STOP_LOSS_MARKET = "STOP_LOSS_MARKET"
    }
    /**
     * For Options, type CALL or PUT
     */
    enum drvOptionType {
        CALL = "CALL",
        PUT = "PUT",
        NA = "NA"
    }
}

declare class ConditionalTriggersService {
    /**
     * get conditional trigger by ID
     * Retrieve the status and detailed conditional triggers for a specific alert order by its unique identification
     * @param accessToken
     * @param alertId
     * @returns GetAlertResponse Successful operation
     * @throws ApiError
     */
    static getAlertOrder(accessToken: string, alertId: string): CancelablePromise<GetAlertResponse>;
    /**
     * modify conditional trigger
     * Modify an existing alert order by updating its conditional trigger logic and/or the associated order execution parameters.
     * @param accessToken
     * @param alertId
     * @param requestBody
     * @returns AlertOrderResponse Successful operation
     * @throws ApiError
     */
    static modifyAlertOrder(accessToken: string, alertId: string, requestBody: AlertModifyRequest): CancelablePromise<AlertOrderResponse>;
    /**
     * delete conditional trigger
     * Delete an existing conditional trigger using its unique identifier.
     * @param accessToken
     * @param alertId
     * @returns AlertOrderResponse Successful operation
     * @throws ApiError
     */
    static delAlertOrder(accessToken: string, alertId: string): CancelablePromise<AlertOrderResponse>;
    /**
     * get all conditional triggers
     * Retrieve a list of all conditional triggers for the authenticated account, along with their current status and configuration details.
     * @param accessToken
     * @returns GetAlertResponse Successful operation
     * @throws ApiError
     */
    static getAllAlertOrders(accessToken: string): CancelablePromise<Array<GetAlertResponse>>;
    /**
     * place conditional trigger
     * The Conditional Trigger (Alerts) API lets you define conditions (price or technical indicators) that, when met, place one or multiple orders automatically on the user’s Dhan account. It supports multiple combinations of indicators and operators along with optional webhook callbacks.
     * **Notes** :
     * * Conditions are currently supported only for Equities and Indices.
     * * You can receive a postback update by providing a Webhook URL while generating the Access Token.
     * @param accessToken
     * @param requestBody
     * @returns AlertOrderResponse Successful operation
     * @throws ApiError
     */
    static alertOrder(accessToken: string, requestBody: AlertOrderRequest): CancelablePromise<AlertOrderResponse>;
}

declare class DataApiSService {
    /**
     * fetch expired option data
     * Fetch minute-wise rolling option chart data of expired contracts - including OHLC, volume, IV based on strike.
     * @param accessToken
     * @param requestBody
     * @returns OptionChartResponse Successful operation
     * @throws ApiError
     */
    static optionchart(accessToken: string, requestBody: OptionChartRequest): CancelablePromise<OptionChartResponse>;
    /**
     * fetch OHLC for minute timeframe
     * Retrieve OHLC & Volume of minute candle for desired instrument for current day. This data available for all segments including futures & options.
     * @param accessToken
     * @param requestBody
     * @returns ChartsResponse Successful operation
     * @throws ApiError
     */
    static intradaycharts(accessToken: string, requestBody: IntradayChartsRequest): CancelablePromise<ChartsResponse>;
    /**
     * fetch OHLC for daily candle
     * Retrieve OHLC & Volume of daily candle for desired instrument. The data for any scrip is available back upto the date of its inception.
     * @param accessToken
     * @param requestBody
     * @returns ChartsResponse Successful operation
     * @throws ApiError
     */
    static historicalcharts(accessToken: string, requestBody: HistoricalChartsRequest): CancelablePromise<ChartsResponse>;
}

declare class EdisService {
    /**
     * generate edis form
     * Retrieve escaped html form of CDSL and enter T-PIN to mark the stock for EDIS approval. Partner has to render this form at their end to unescape.
     * @param accessToken
     * @param requestBody
     * @returns EdisFormResponse Successful operation
     * @throws ApiError
     */
    static edisform(accessToken: string, requestBody: EdisFormRequest): CancelablePromise<EdisFormResponse>;
    /**
     * generate bulk edis form
     * Retrieve escaped html form of CDSL and enter T-PIN to mark the stock for EDIS approval. Partner has to render this form at their end to unescape.
     * @param accessToken
     * @param requestBody
     * @returns EdisFormResponse Successful operation
     * @throws ApiError
     */
    static bulkedisform(accessToken: string, requestBody: EdisBulkFormRequest): CancelablePromise<EdisFormResponse>;
    /**
     * generate edis T-pin
     * Get T-pin on registered mobile number using this API.
     * @param accessToken
     * @returns any Successful operation
     * @throws ApiError
     */
    static edistpin(accessToken: string): CancelablePromise<any>;
    /**
     * get edis authorized quantity
     * The api allows user to check the edis status of the securities. User have to enter isin of the stock. An international securities identification number (ISIN) is a 12-digit alphanumeric code that uniquely identifies a specific security. You can get ISIN of portfolio stocks, in response of holdings api.Or use ALL as a special case to query all holdings' edis auth status
     * @param accessToken
     * @param isin
     * @returns EdisQtyStatusResponse Successful operation
     * @throws ApiError
     */
    static edisqtystatus(accessToken: string, isin: string): CancelablePromise<EdisQtyStatusResponse>;
}

declare class ForeverOrderService {
    /**
     * modify pending forever order
     * The api allows you to modify pending forever order in orderbook. The fields that can be modified are price, quantity and order type.
     * @param accessToken
     * @param orderId
     * @param requestBody
     * @returns GttOrderStatusResponse Successful operation
     * @throws ApiError
     */
    static modifyforeverorder(accessToken: string, orderId: string, requestBody: GttModifyRequest): CancelablePromise<GttOrderStatusResponse>;
    /**
     * cancel given forever order
     * The api allows you to cancel existing forever order.
     * @param accessToken
     * @param orderId
     * @returns GttOrderStatusResponse Successful operation
     * @throws ApiError
     */
    static cancelforeverorder(accessToken: string, orderId: string): CancelablePromise<GttOrderStatusResponse>;
    /**
     * get forever orders list
     * The api allows you to retrieve an array of all forever orders placed with their last updated status.
     * @param accessToken
     * @returns GttOrderResponse Successful operation
     * @throws ApiError
     */
    static getforeverorders(accessToken: string): CancelablePromise<Array<GttOrderResponse>>;
    /**
     * place forever order
     * The order request api allows you place a new forever order.
     * @param accessToken
     * @param requestBody
     * @returns GttOrderStatusResponse Successful operation
     * @throws ApiError
     */
    static placeforeverorder(accessToken: string, requestBody: GTTOrderModel): CancelablePromise<GttOrderStatusResponse>;
}

declare class FundsMarginService {
    /**
     * margin calculator
     * Margin Calculation API lets you calculate span, exposure, var, brokerage, leverage, available  margin values for any type of order and instrument.
     * @param accessToken
     * @param requestBody
     * @returns KnowYourMarginResponse Successful operation
     * @throws ApiError
     */
    static margincalculator(accessToken: string, requestBody: KnowYourMarginReq): CancelablePromise<KnowYourMarginResponse>;
    /**
     * multi order margin calculator
     * The Multi Order Margin Calculator API allows users to calculate margin requirements for multiple scripts in a single request, including span, exposure, equity, FO, and commodity margins.
     * **Notes** :
     * Margin values returned are indicative and valid only for the current trading session.
     *
     * @param accessToken
     * @param requestBody
     * @returns MultiScripMarginCalcResponse Successful operation
     * @throws ApiError
     */
    static margincalculatormulti(accessToken: string, requestBody: MultiScripMarginCalcRequest): CancelablePromise<MultiScripMarginCalcResponse>;
    /**
     * get fund limit details
     * Get all information of your trading account like balance, margin utilised, collateral, etc.
     * @param accessToken
     * @returns FundLimitResponse Successful operation
     * @throws ApiError
     */
    static fundlimit(accessToken: string): CancelablePromise<FundLimitResponse>;
}

declare class IpSetupService {
    /**
     * modify the static IP
     * You can use this API to modify the Primary & Secondary IP for your account. You can modify the set IP only once in a specified period
     * @param accessToken
     * @param requestBody
     * @returns UserIPResponse Successful operation
     * @throws ApiError
     */
    static modifyIp(accessToken: string, requestBody: UserIPRequest): CancelablePromise<UserIPResponse>;
    /**
     * static IP Setup
     * You can use this API to set the Primary & Secondary IP to be mapped to your account in order to enable Order Placement.
     * @param accessToken
     * @param requestBody
     * @returns UserIPResponse Successful operation
     * @throws ApiError
     */
    static setIp(accessToken: string, requestBody: UserIPRequest): CancelablePromise<UserIPResponse>;
    /**
     * get the static IP
     * Fetch the current Primary & Secondary IP for your account.
     * @param accessToken
     * @returns GetIPDetailsResponse Successful operation
     * @throws ApiError
     */
    static getIp(accessToken: string): CancelablePromise<GetIPDetailsResponse>;
}

declare class OrdersService {
    /**
     * get order by id
     * The api allows you to retrieve the details of an order placed during the day with their last updated status, with their order id.
     * @param accessToken
     * @param orderId
     * @returns OrderResponse Successful operation
     * @throws ApiError
     */
    static getorderbyorderid(accessToken: string, orderId: string): CancelablePromise<OrderResponse>;
    /**
     * modify pending order
     * The api allows you modify pending order in orderbook. The fields that can be modified are price, quantity, order type & validity.
     * @param accessToken
     * @param orderId
     * @param requestBody
     * @returns OrderStatusResponse Successful operation
     * @throws ApiError
     */
    static modifyorder(accessToken: string, orderId: string, requestBody: OrderModifyRequest): CancelablePromise<OrderStatusResponse>;
    /**
     * cancel given order
     * The api allows you to cancel a pending order using the order id
     * @param accessToken
     * @param orderId
     * @returns OrderStatusResponse Successful operation
     * @throws ApiError
     */
    static cancelorder(accessToken: string, orderId: string): CancelablePromise<OrderStatusResponse>;
    /**
     * get current orders list
     * The API lets you retrieve an array of all orders requested in a day with their last updated status.
     * @param accessToken
     * @returns OrderResponse Successful operation
     * @throws ApiError
     */
    static getorders(accessToken: string): CancelablePromise<Array<OrderResponse>>;
    /**
     * place an order
     * The order request API allows you to place new order.
     * @param accessToken
     * @param requestBody
     * @returns OrderStatusResponse Successful operation
     * @throws ApiError
     */
    static placeorder(accessToken: string, requestBody: OrderRequest): CancelablePromise<OrderStatusResponse>;
    /**
     * place slice order
     * The order request API allows you to place a new slice order.
     * @param accessToken
     * @param requestBody
     * @returns OrderStatusResponse Successful operation
     * @throws ApiError
     */
    static placesliceorder(accessToken: string, requestBody: OrderRequest): CancelablePromise<Array<OrderStatusResponse>>;
    /**
     * get all trades
     * The api allows you retrieve an array of all trades executed in a day.
     * @param accessToken
     * @returns TradeResponse Successful operation
     * @throws ApiError
     */
    static getalltrades(accessToken: string): CancelablePromise<Array<TradeResponse>>;
    /**
     * get trade by order id
     * The api allows user to retrieve trade details using an order id. Often during partial trades or Bracket/ Cover Orders, traders get confused in reading trade from tradebook. The response of this API will include all the trades generated for a particular order id.
     * @param accessToken
     * @param orderId
     * @returns TradeResponse Successful operation
     * @throws ApiError
     */
    static gettradebyorderid(accessToken: string, orderId: string): CancelablePromise<Array<TradeResponse>>;
    /**
     * get trade history
     * The api allows user to retrieve the trade history Often during partial trades or Bracket/ Cover Orders, traders get confused in reading trade from tradebook. The response of the api will include all the trades generated for a particular order id.
     * @param accessToken
     * @param fromDate date format : yyyy-MM-dd
     * @param toDate date format : yyyy-MM-dd
     * @param pageNumber default value : 0
     * @returns TradeHistoryResponseModel Successful operation
     * @throws ApiError
     */
    static gettradehistory(accessToken: string, fromDate: string, toDate: string, pageNumber: string): CancelablePromise<Array<TradeHistoryResponseModel>>;
    /**
     * get order by correlation id
     * The api allows you to retrieve the details of an order placed during the day, with its most recent status, using a correlation id provided by the API consumer at the time of order placement. This feature is available in case the user has missed the order id for any reason.
     * @param accessToken
     * @param correlationId
     * @returns OrderResponse Successful operation
     * @throws ApiError
     */
    static getorderbycorrelationid(accessToken: string, correlationId: string): CancelablePromise<OrderResponse>;
}

declare class PositionsPortfolioService {
    /**
     * convert position
     * Users can convert their open position from intraday to delivery or delivery to intraday.
     * @param accessToken
     * @param requestBody
     * @returns any Successful operation
     * @throws ApiError
     */
    static convertposition(accessToken: string, requestBody: PositionConversionRequest): CancelablePromise<any>;
    /**
     * get current positions
     * Users can retrieve a list of all open positions for the day. This includes all F&O carryforward positions as well.
     * @param accessToken
     * @returns PositionResponse Successful operation
     * @throws ApiError
     */
    static getpositions(accessToken: string): CancelablePromise<Array<PositionResponse>>;
    /**
     * exit all position
     * The Exit All Position API allows users to exit all active positions and cancel all open orders for the authenticated account.
     * Note: All open orders and positions are exited for the current trading day only.
     *
     * @param accessToken
     * @returns UserIPResponse Successful operation
     * @throws ApiError
     */
    static orderExitAll(accessToken: string): CancelablePromise<UserIPResponse>;
    /**
     * get current holdings
     * Users can retrieve all holdings bought/sold in previous trading sessions. All T1 and delivered quantities can be fetched.
     * @param accessToken
     * @returns HoldingResponse Successful operation
     * @throws ApiError
     */
    static getholdings(accessToken: string): CancelablePromise<Array<HoldingResponse>>;
}

declare class StatementsService {
    /**
     * get ledger report
     * The api allows user to fetch trading account ledger with all credit and debit transaction details
     * @param accessToken
     * @param fromDate date format : yyyy-MM-dd
     * @param toDate date format : yyyy-MM-dd
     * @returns BoLedgerResponse Successful operation
     * @throws ApiError
     */
    static ledger(accessToken: string, fromDate?: string, toDate?: string): CancelablePromise<BoLedgerResponse>;
}

declare class SuperOrderService {
    /**
     * modify pending super order
     * This API can be used to modify any leg of a Super Order till it is in PENDING or PART_TRADED state.
     * @param accessToken
     * @param orderId
     * @param requestBody
     * @returns OrderStatusResponse Successful Operation
     * @throws ApiError
     */
    static modifysuperorder(accessToken: string, orderId: string, requestBody: SuperModifyRequest): CancelablePromise<OrderStatusResponse>;
    /**
     * get current super orders list
     * The API lets you retrieve an array of all orders with their last updated status along with legdetails.
     * @param accessToken
     * @returns SuperOrderResponse Successful operation
     * @throws ApiError
     */
    static getsuperorders(accessToken: string): CancelablePromise<Array<SuperOrderResponse>>;
    /**
     * place super order
     * The order API allows you to place a new order.
     * @param accessToken
     * @param requestBody
     * @returns OrderStatusResponse Successful Operation
     * @throws ApiError
     */
    static placesuperorder(accessToken: string, requestBody: SuperOrderRequest): CancelablePromise<OrderStatusResponse>;
    /**
     * cancel super order
     * User can cancel any leg of a super order which is PENDING using this API.
     * @param accessToken
     * @param orderId Order ID of the Order being cancelled
     * @param orderLeg Order Leg to be cancelled
     * @returns OrderStatusResponse Successful operation
     * @throws ApiError
     */
    static cancelsuperorder(accessToken: string, orderId: string, orderLeg: 'ENTRY_LEG' | 'STOP_LOSS_LEG' | 'TARGET_LEG'): CancelablePromise<OrderStatusResponse>;
}

declare class TraderSControlService {
    /**
     * get P&L based exit
     * The Get P&L Based Exit API allows users to fetch the currently active P&L based exit configuration, including profit/loss thresholds and exit behavior.
     * **Notes** :
     * Returns the active P&L based exit configuration for the current trading day, if any
     * @param accessToken
     * @returns ExitPnlResponse Successful operation
     * @throws ApiError
     */
    static getPnlExit(accessToken: string): CancelablePromise<ExitPnlResponse>;
    /**
     * P&L based exit
     * The P&L Based Exit API allows users to configure automatic exit rules based on cumulative profit or loss thresholds. When the defined limits are breached, all applicable positions are exited.
     * **Notes** :
     * The configured P&L based exit remains active for the current trading day and is reset at the end of the session
     *
     * @param accessToken
     * @param requestBody
     * @returns PnlExitResponse Successful operation
     * @throws ApiError
     */
    static pnlExit(accessToken: string, requestBody: PnlBasedExitRequest): CancelablePromise<PnlExitResponse>;
    /**
     * stop P&L based exit
     * The Stop P&L Based Exit API allows users to disable an active P&L based exit configuration. Once stopped, no automatic exits will be triggered based on profit or loss thresholds.
     * **Notes** :
     * Disabling the P&L based exit applies only to the current trading day.
     *
     * @param accessToken
     * @returns UserIPResponse Successful operation
     * @throws ApiError
     */
    static stopPnlExit(accessToken: string): CancelablePromise<UserIPResponse>;
    /**
     * kill switch status
     * The api allows you to check  killSwitch status for your account, which will disable trading for current trading day
     * @param accessToken
     * @returns KillSwitchResponse Successful operation
     * @throws ApiError
     */
    static killSwitchStatus(accessToken: string): CancelablePromise<KillSwitchResponse>;
    /**
     * manage kill switch
     * The api allows you to control killSwitch for your account, which will disable trading for current trading day
     * @param accessToken
     * @param killSwitchStatus
     * @returns KillSwitchResponse Successful operation
     * @throws ApiError
     */
    static killswitch(accessToken: string, killSwitchStatus: string): CancelablePromise<KillSwitchResponse>;
}

declare const index_AlertCondition: typeof AlertCondition;
declare const index_AlertModifyRequest: typeof AlertModifyRequest;
declare const index_AlertOrder: typeof AlertOrder;
declare const index_AlertOrderRequest: typeof AlertOrderRequest;
declare const index_AlertOrderResponse: typeof AlertOrderResponse;
type index_ApiError = ApiError;
declare const index_ApiError: typeof ApiError;
declare const index_BoLedgerResponse: typeof BoLedgerResponse;
type index_CancelError = CancelError;
declare const index_CancelError: typeof CancelError;
type index_CancelablePromise<T> = CancelablePromise<T>;
declare const index_CancelablePromise: typeof CancelablePromise;
declare const index_ChartData: typeof ChartData;
declare const index_ChartsResponse: typeof ChartsResponse;
type index_ConditionalTriggersService = ConditionalTriggersService;
declare const index_ConditionalTriggersService: typeof ConditionalTriggersService;
type index_DataApiSService = DataApiSService;
declare const index_DataApiSService: typeof DataApiSService;
declare const index_EdisBulkFormRequest: typeof EdisBulkFormRequest;
declare const index_EdisFormRequest: typeof EdisFormRequest;
declare const index_EdisFormResponse: typeof EdisFormResponse;
declare const index_EdisQtyStatusResponse: typeof EdisQtyStatusResponse;
type index_EdisService = EdisService;
declare const index_EdisService: typeof EdisService;
declare const index_ExitPnlResponse: typeof ExitPnlResponse;
type index_ForeverOrderService = ForeverOrderService;
declare const index_ForeverOrderService: typeof ForeverOrderService;
declare const index_FundLimitResponse: typeof FundLimitResponse;
type index_FundsMarginService = FundsMarginService;
declare const index_FundsMarginService: typeof FundsMarginService;
declare const index_GTTOrderModel: typeof GTTOrderModel;
declare const index_GetAlertResponse: typeof GetAlertResponse;
declare const index_GetIPDetailsResponse: typeof GetIPDetailsResponse;
declare const index_GttModifyRequest: typeof GttModifyRequest;
declare const index_GttOrderResponse: typeof GttOrderResponse;
declare const index_GttOrderStatusResponse: typeof GttOrderStatusResponse;
declare const index_HistoricalChartsRequest: typeof HistoricalChartsRequest;
declare const index_HoldingResponse: typeof HoldingResponse;
declare const index_IntradayChartsRequest: typeof IntradayChartsRequest;
type index_IpSetupService = IpSetupService;
declare const index_IpSetupService: typeof IpSetupService;
declare const index_KillSwitchResponse: typeof KillSwitchResponse;
declare const index_KnowYourMarginReq: typeof KnowYourMarginReq;
declare const index_KnowYourMarginResponse: typeof KnowYourMarginResponse;
declare const index_MultiScripMarginCalcRequest: typeof MultiScripMarginCalcRequest;
declare const index_MultiScripMarginCalcResponse: typeof MultiScripMarginCalcResponse;
declare const index_OpenAPI: typeof OpenAPI;
type index_OpenAPIConfig = OpenAPIConfig;
declare const index_OptionChartPayload: typeof OptionChartPayload;
declare const index_OptionChartRequest: typeof OptionChartRequest;
declare const index_OptionChartResponse: typeof OptionChartResponse;
declare const index_OrderModifyRequest: typeof OrderModifyRequest;
declare const index_OrderRequest: typeof OrderRequest;
declare const index_OrderResponse: typeof OrderResponse;
declare const index_OrderStatusResponse: typeof OrderStatusResponse;
type index_OrdersService = OrdersService;
declare const index_OrdersService: typeof OrdersService;
declare const index_PnlBasedExitRequest: typeof PnlBasedExitRequest;
declare const index_PnlExitResponse: typeof PnlExitResponse;
declare const index_PositionConversionRequest: typeof PositionConversionRequest;
declare const index_PositionResponse: typeof PositionResponse;
type index_PositionsPortfolioService = PositionsPortfolioService;
declare const index_PositionsPortfolioService: typeof PositionsPortfolioService;
declare const index_ScriptItem: typeof ScriptItem;
type index_StatementsService = StatementsService;
declare const index_StatementsService: typeof StatementsService;
declare const index_SuperModifyRequest: typeof SuperModifyRequest;
declare const index_SuperOrderLeg: typeof SuperOrderLeg;
declare const index_SuperOrderRequest: typeof SuperOrderRequest;
declare const index_SuperOrderResponse: typeof SuperOrderResponse;
type index_SuperOrderService = SuperOrderService;
declare const index_SuperOrderService: typeof SuperOrderService;
declare const index_TradeHistoryResponseModel: typeof TradeHistoryResponseModel;
declare const index_TradeResponse: typeof TradeResponse;
type index_TraderSControlService = TraderSControlService;
declare const index_TraderSControlService: typeof TraderSControlService;
declare const index_UserIPRequest: typeof UserIPRequest;
declare const index_UserIPResponse: typeof UserIPResponse;
declare namespace index {
  export { index_AlertCondition as AlertCondition, index_AlertModifyRequest as AlertModifyRequest, index_AlertOrder as AlertOrder, index_AlertOrderRequest as AlertOrderRequest, index_AlertOrderResponse as AlertOrderResponse, index_ApiError as ApiError, index_BoLedgerResponse as BoLedgerResponse, index_CancelError as CancelError, index_CancelablePromise as CancelablePromise, index_ChartData as ChartData, index_ChartsResponse as ChartsResponse, index_ConditionalTriggersService as ConditionalTriggersService, index_DataApiSService as DataApiSService, index_EdisBulkFormRequest as EdisBulkFormRequest, index_EdisFormRequest as EdisFormRequest, index_EdisFormResponse as EdisFormResponse, index_EdisQtyStatusResponse as EdisQtyStatusResponse, index_EdisService as EdisService, index_ExitPnlResponse as ExitPnlResponse, index_ForeverOrderService as ForeverOrderService, index_FundLimitResponse as FundLimitResponse, index_FundsMarginService as FundsMarginService, index_GTTOrderModel as GTTOrderModel, index_GetAlertResponse as GetAlertResponse, index_GetIPDetailsResponse as GetIPDetailsResponse, index_GttModifyRequest as GttModifyRequest, index_GttOrderResponse as GttOrderResponse, index_GttOrderStatusResponse as GttOrderStatusResponse, index_HistoricalChartsRequest as HistoricalChartsRequest, index_HoldingResponse as HoldingResponse, index_IntradayChartsRequest as IntradayChartsRequest, index_IpSetupService as IpSetupService, index_KillSwitchResponse as KillSwitchResponse, index_KnowYourMarginReq as KnowYourMarginReq, index_KnowYourMarginResponse as KnowYourMarginResponse, index_MultiScripMarginCalcRequest as MultiScripMarginCalcRequest, index_MultiScripMarginCalcResponse as MultiScripMarginCalcResponse, index_OpenAPI as OpenAPI, type index_OpenAPIConfig as OpenAPIConfig, index_OptionChartPayload as OptionChartPayload, index_OptionChartRequest as OptionChartRequest, index_OptionChartResponse as OptionChartResponse, index_OrderModifyRequest as OrderModifyRequest, index_OrderRequest as OrderRequest, index_OrderResponse as OrderResponse, index_OrderStatusResponse as OrderStatusResponse, index_OrdersService as OrdersService, index_PnlBasedExitRequest as PnlBasedExitRequest, index_PnlExitResponse as PnlExitResponse, index_PositionConversionRequest as PositionConversionRequest, index_PositionResponse as PositionResponse, index_PositionsPortfolioService as PositionsPortfolioService, index_ScriptItem as ScriptItem, index_StatementsService as StatementsService, index_SuperModifyRequest as SuperModifyRequest, index_SuperOrderLeg as SuperOrderLeg, index_SuperOrderRequest as SuperOrderRequest, index_SuperOrderResponse as SuperOrderResponse, index_SuperOrderService as SuperOrderService, index_TradeHistoryResponseModel as TradeHistoryResponseModel, index_TradeResponse as TradeResponse, index_TraderSControlService as TraderSControlService, index_UserIPRequest as UserIPRequest, index_UserIPResponse as UserIPResponse };
}

declare function parseMarketFeedPacket(packet: Buffer, subscriptions: StoredSubscription[]): MarketFeedEvent | null;

declare function splitPackets(buffer: Buffer): Buffer[];

/** Version stamped on a tool definition that does not declare its own. */
declare const DEFAULT_TOOL_VERSION = "1.0.0";
interface CatalogueDependencies {
    client: DhanClient;
    skills: SkillRegistry;
    pipeline: Pipeline;
}
/**
 * The catalogue of tools exposed to MCP clients and agent runtimes: what
 * exists, at what scope, at what risk, and which handler carries it out.
 *
 * Declarative on purpose — adding an endpoint means adding an entry here and
 * a schema in `schemas.ts`. Policy enforcement lives in
 * {@link AgentToolRegistry}, so handlers here carry no scope checks of their
 * own.
 */
declare function buildCatalogue(deps: CatalogueDependencies): Tool[];

interface OrderPreviewResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    action: "place_order";
    risk: "live_order_requires_confirmation";
    requires: string[];
    summary: string;
    riskChecks?: Array<{
        check: string;
        message: string;
    }>;
    order: Record<string, unknown>;
}
interface OrderPreviewOptions {
    pipeline?: Pipeline;
    instrument?: Instrument;
}
/**
 * Validates and summarizes an order without placing it.
 *
 * Runs the same contract the live order path uses, then — when a risk pipeline
 * is supplied — collects *every* risk violation rather than stopping at the
 * first, so an agent sees the full picture before asking for confirmation.
 */
declare function previewOrder(params: Record<string, unknown>, options?: OrderPreviewOptions): Promise<OrderPreviewResult>;

interface EquityOverlayContext extends SkillContext {
    symbol: string;
    expiry: string;
    quantity: number;
    equitySecurityId?: string;
    spotPrice?: number;
    chain?: NormalizedOptionChain;
    intent?: Record<string, unknown>;
}
/**
 * Shared scaffolding for structures that pair an equity position with an
 * option leg. Like the index structures, these stop at an intent.
 */
declare abstract class EquityOverlaySkill extends Skill<EquityOverlayContext> {
    protected abstract buildIntent(context: EquityOverlayContext): EquityOverlayContext;
    protected steps(): Array<SkillStep<EquityOverlayContext>>;
    protected requireChain(context: EquityOverlayContext): {
        chain: NormalizedOptionChain;
        spot: number;
    };
}
/** Hold the stock, sell an OTM call against it for premium income. */
declare class CoveredCallSkill extends EquityOverlaySkill {
    readonly definition: SkillDefinition;
    protected buildIntent(context: EquityOverlayContext): EquityOverlayContext;
}
/** Hold the stock, buy an OTM put as downside insurance. */
declare class ProtectivePutSkill extends EquityOverlaySkill {
    readonly definition: SkillDefinition;
    protected buildIntent(context: EquityOverlayContext): EquityOverlayContext;
}

interface SummarizerContext extends SkillContext {
    underlyingSymbol: string;
    mode: "both" | "technicals" | "option_chain";
    instrument?: Instrument;
    technicalSummary?: Record<string, unknown>;
    optionChainSummary?: Record<string, unknown>;
    summary?: Record<string, unknown>;
}
/**
 * Read-only market context for a symbol: trend and momentum from daily
 * candles, plus positioning from the option chain.
 *
 * The one builtin that touches no order path at all, hence `read_only`.
 */
declare class MarketDataSummarizerSkill extends Skill<SummarizerContext> {
    readonly definition: SkillDefinition;
    protected steps(): Array<SkillStep<SummarizerContext>>;
    /** Indices first, then cash equity, then a broad search. */
    private resolve;
    private technicals;
    private optionChain;
}

/** One leg of a prepared option structure. */
interface IntentLeg {
    action: string;
    optionType: "CE" | "PE";
    strike: number;
    securityId?: string;
    premium?: number;
}
interface OptionSkillContext extends SkillContext {
    symbol: string;
    expiry: string;
    quantity: number;
    spotPrice?: number;
    chain?: NormalizedOptionChain;
    legs?: IntentLeg[];
    intent?: Record<string, unknown>;
}
/**
 * Shared scaffolding for index option structures.
 *
 * Every one of them resolves the index, pulls the chain, picks strikes and
 * stops at an intent — no orders are placed, which is why they sit at
 * `trade_adjacent_read` rather than a write risk level.
 */
declare abstract class OptionStructureSkill<TContext extends OptionSkillContext = OptionSkillContext> extends Skill<TContext> {
    protected abstract selectLegs(context: TContext): TContext;
    protected abstract buildIntent(context: TContext): TContext;
    protected steps(): Array<SkillStep<TContext>>;
    protected requireChain(context: TContext): {
        chain: NormalizedOptionChain;
        spot: number;
    };
    protected leg(entry: ReturnType<typeof nearestStrike>, optionType: "CE" | "PE", action: string): IntentLeg;
}
/** Buy the at-the-money call on an index. */
declare class BuyAtmCallSkill extends OptionStructureSkill {
    readonly definition: SkillDefinition;
    protected selectLegs(context: OptionSkillContext): OptionSkillContext;
    protected buildIntent(context: OptionSkillContext): OptionSkillContext;
}
/** Buy the ATM call and put together — a long volatility position. */
declare class StraddleSkill extends OptionStructureSkill {
    readonly definition: SkillDefinition;
    protected selectLegs(context: OptionSkillContext): OptionSkillContext;
    protected buildIntent(context: OptionSkillContext): OptionSkillContext;
}
/** Buy an OTM call and an OTM put a set percentage either side of spot. */
declare class StrangleSkill extends OptionStructureSkill {
    readonly definition: SkillDefinition;
    protected selectLegs(context: OptionSkillContext): OptionSkillContext;
    protected buildIntent(context: OptionSkillContext): OptionSkillContext;
}
/** Sell an OTM call and put, buying wings further out to cap the loss. */
declare class IronCondorSkill extends OptionStructureSkill {
    readonly definition: SkillDefinition;
    protected selectLegs(context: OptionSkillContext): OptionSkillContext;
    protected buildIntent(context: OptionSkillContext): OptionSkillContext;
}
/** Sell an OTM put, buy a further OTM put — bullish, defined risk. */
declare class BullPutSpreadSkill extends OptionStructureSkill {
    readonly definition: SkillDefinition;
    protected selectLegs(context: OptionSkillContext): OptionSkillContext;
    protected buildIntent(context: OptionSkillContext): OptionSkillContext;
}
/** Sell an OTM call, buy a further OTM call — bearish, defined risk. */
declare class BearCallSpreadSkill extends OptionStructureSkill {
    readonly definition: SkillDefinition;
    protected selectLegs(context: OptionSkillContext): OptionSkillContext;
    protected buildIntent(context: OptionSkillContext): OptionSkillContext;
}

interface PositionContext extends SkillContext {
    positions?: Array<Record<string, unknown>>;
    exited?: boolean;
}
/**
 * Exit every open position at market.
 *
 * Destructive and irreversible during market hours, hence `destructive_write`
 * — it needs `orders:write` *and* the live-trading gate.
 */
declare class SquareOffAllSkill extends Skill<PositionContext> {
    readonly definition: SkillDefinition;
    protected steps(): Array<SkillStep<PositionContext>>;
}
/** Exit one named position, identified by symbol and segment. */
declare class SquareOffPositionSkill extends Skill<PositionContext> {
    readonly definition: SkillDefinition;
    protected steps(): Array<SkillStep<PositionContext>>;
}

/** Fresh instances of every builtin skill. */
declare function builtinSkills(): Array<Skill<SkillContext>>;
/** A registry preloaded with every builtin skill. */
declare function createSkillRegistry(): SkillRegistry;

/**
 * Ad-hoc multi-step orchestration for callers who want a skill-shaped pipeline
 * without declaring a {@link Skill} subclass.
 *
 * Steps run in priority order (lower first, declaration order breaking ties)
 * and thread one context through, same as a skill.
 */
interface WorkflowStep<TContext> {
    name: string;
    priority: number;
    run(context: TContext): Promise<TContext> | TContext;
}
declare class Workflow<TContext extends Record<string, unknown>> {
    readonly name: string;
    private readonly workflowSteps;
    constructor(name?: string);
    /** Appends a step. Lower `priority` runs earlier; the default is 10. */
    step(name: string, run: (context: TContext) => Promise<TContext> | TContext, priority?: number): this;
    get steps(): ReadonlyArray<WorkflowStep<TContext>>;
    /** Runs every step in order and returns the final context. */
    call(context: TContext): Promise<TContext>;
    /**
     * Runs every step, stopping at the first failure and reporting which step
     * failed rather than surfacing a bare error.
     */
    run(context: TContext): Promise<{
        ok: true;
        context: TContext;
        completed: string[];
    } | {
        ok: false;
        context: TContext;
        completed: string[];
        failedStep: string;
        error: unknown;
    }>;
    private ordered;
}

/**
 * JSON Schema fragments describing what each agent tool accepts.
 *
 * Pure data — no API calls, no policy, no state. Kept apart from the catalogue
 * so adding an endpoint means editing a schema here and a handler there,
 * rather than growing one module that registers, describes and dispatches.
 */
declare const emptySchema: JsonSchema;
declare const searchSchema: JsonSchema;
declare const feedSchema: JsonSchema;
declare const orderSchema$1: JsonSchema;
declare const modifyOrderSchema: JsonSchema;
declare const cancelSchema: JsonSchema;
declare const optionChainSchema: JsonSchema;
declare const expiryListSchema: JsonSchema;
declare const historicalSchema: JsonSchema;
declare const intradaySchema: JsonSchema;
declare const technicalsSchema: JsonSchema;
declare const marginSchema: JsonSchema;
/** Turns a skill's parameter declarations into an input schema. */
declare function skillInputSchema(params: Record<string, SkillParam>): JsonSchema;

declare const schemas_cancelSchema: typeof cancelSchema;
declare const schemas_emptySchema: typeof emptySchema;
declare const schemas_expiryListSchema: typeof expiryListSchema;
declare const schemas_feedSchema: typeof feedSchema;
declare const schemas_historicalSchema: typeof historicalSchema;
declare const schemas_intradaySchema: typeof intradaySchema;
declare const schemas_marginSchema: typeof marginSchema;
declare const schemas_modifyOrderSchema: typeof modifyOrderSchema;
declare const schemas_optionChainSchema: typeof optionChainSchema;
declare const schemas_searchSchema: typeof searchSchema;
declare const schemas_skillInputSchema: typeof skillInputSchema;
declare const schemas_technicalsSchema: typeof technicalsSchema;
declare namespace schemas {
  export { schemas_cancelSchema as cancelSchema, schemas_emptySchema as emptySchema, schemas_expiryListSchema as expiryListSchema, schemas_feedSchema as feedSchema, schemas_historicalSchema as historicalSchema, schemas_intradaySchema as intradaySchema, schemas_marginSchema as marginSchema, schemas_modifyOrderSchema as modifyOrderSchema, schemas_optionChainSchema as optionChainSchema, orderSchema$1 as orderSchema, schemas_searchSchema as searchSchema, schemas_skillInputSchema as skillInputSchema, schemas_technicalsSchema as technicalsSchema };
}

/**
 * Technical indicators.
 *
 * Every series function returns an array the same length as its input, with
 * `null` in the leading positions where there is not yet enough data. Callers
 * can therefore index indicator output by bar without re-aligning it.
 */
interface OhlcBar {
    open?: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}
type IndicatorSeries = Array<number | null>;
/** Simple moving average. */
declare function sma(data: number[], period?: number): IndicatorSeries;
/** Weighted moving average — linear weights, heaviest on the newest bar. */
declare function wma(data: number[], period?: number): IndicatorSeries;
/**
 * Exponential moving average. The first value is seeded with the SMA of the
 * opening window, which is the convention the rest of this module assumes.
 */
declare function ema(data: number[], period?: number): IndicatorSeries;
/** Wilder's relative strength index. */
declare function rsi(data: number[], period?: number): IndicatorSeries;
interface MacdResult {
    macdLine: IndicatorSeries;
    signalLine: IndicatorSeries;
    histogram: IndicatorSeries;
}
/** Moving average convergence/divergence. */
declare function macd(data: number[], { fastPeriod, slowPeriod, signalPeriod }?: {
    fastPeriod?: number | undefined;
    slowPeriod?: number | undefined;
    signalPeriod?: number | undefined;
}): MacdResult;
interface BollingerBandsResult {
    upper: IndicatorSeries;
    middle: IndicatorSeries;
    lower: IndicatorSeries;
}
/** Bollinger bands around an SMA. */
declare function bollingerBands(data: number[], { period, standardDeviations }?: {
    period?: number | undefined;
    standardDeviations?: number | undefined;
}): BollingerBandsResult;
/** True range per bar. The first bar falls back to high − low. */
declare function trueRanges(bars: OhlcBar[]): number[];
/** Average true range, smoothed the Wilder way. */
declare function atr(bars: OhlcBar[], period?: number): IndicatorSeries;
interface AdxResult {
    adx: IndicatorSeries;
    plusDi: IndicatorSeries;
    minusDi: IndicatorSeries;
}
/** Average directional index with both directional indicators. */
declare function adx(bars: OhlcBar[], period?: number): AdxResult;
interface StochasticResult {
    k: IndicatorSeries;
    d: IndicatorSeries;
}
/** Stochastic oscillator (%K and its %D moving average). */
declare function stochastic(bars: OhlcBar[], { period, signalPeriod }?: {
    period?: number | undefined;
    signalPeriod?: number | undefined;
}): StochasticResult;
interface SupertrendResult {
    trend: IndicatorSeries;
    /** `1` while price is above the band, `-1` below, `null` before the seed. */
    direction: Array<1 | -1 | null>;
}
/** Supertrend — ATR bands that flip direction when price closes through them. */
declare function supertrend(bars: OhlcBar[], { period, multiplier }?: {
    period?: number | undefined;
    multiplier?: number | undefined;
}): SupertrendResult;
/** Volume-weighted average price, cumulative from the first bar. */
declare function vwap(bars: OhlcBar[]): IndicatorSeries;
/** On-balance volume. */
declare function obv(bars: OhlcBar[]): IndicatorSeries;
/** Last non-null value of an indicator series. */
declare function latest(series: IndicatorSeries): number | null;

/** A single OHLCV bar with its timestamp in epoch seconds. */
interface Candle extends OhlcBar {
    timestamp: number;
    open: number;
    volume: number;
    openInterest?: number;
}
/**
 * The columnar payload the charts endpoints return: parallel arrays rather
 * than a list of candle objects.
 */
interface ChartSeries {
    timestamp?: Array<number | string>;
    open?: Array<number | string>;
    high?: Array<number | string>;
    low?: Array<number | string>;
    close?: Array<number | string>;
    volume?: Array<number | string>;
    open_interest?: Array<number | string>;
    [key: string]: unknown;
}
/** Epoch seconds from an epoch number, epoch string or ISO/date string. */
declare function parseTimestamp(value: number | string): number;
/**
 * Converts a columnar chart response into candles. Rows where any OHLC column
 * is missing are dropped rather than emitted as `NaN`.
 */
declare function candlesFromSeries(series: ChartSeries | undefined): Candle[];
/**
 * Aggregates 1-minute candles up to a coarser interval by flooring each
 * timestamp to its bucket. Returns the input untouched for `minutes <= 1`.
 */
declare function resample(candles: Candle[], minutes: number): Candle[];
declare function closes(candles: Candle[]): number[];
declare function highs(candles: Candle[]): number[];
declare function lows(candles: Candle[]): number[];
declare function volumes(candles: Candle[]): number[];

/** Minute intervals the charts API serves, and the keys they map to. */
declare const TIMEFRAMES: {
    readonly 1: "m1";
    readonly 5: "m5";
    readonly 15: "m15";
    readonly 25: "m25";
    readonly 60: "m60";
};
type TimeframeKey = (typeof TIMEFRAMES)[keyof typeof TIMEFRAMES];
interface TechnicalAnalysisOptions {
    rsiPeriod?: number;
    atrPeriod?: number;
    adxPeriod?: number;
    macdFast?: number;
    macdSlow?: number;
    macdSignal?: number;
    smaPeriod?: number;
    emaPeriod?: number;
    bollingerPeriod?: number;
    /** Pause between per-interval chart requests, in ms. Defaults to 1000. */
    throttleMs?: number;
}
interface ComputeRequest {
    securityId: string;
    exchangeSegment: string;
    instrument: string;
    fromDate?: string;
    toDate?: string;
    /** Trading days of history to pull. Derived from indicator periods if omitted. */
    daysBack?: number;
    intervals?: number[];
    oi?: boolean;
}
interface TimeframeIndicators {
    rsi: number | null;
    adx: number | null;
    atr: number | null;
    sma: number | null;
    ema: number | null;
    vwap: number | null;
    macd: {
        macd: number | null;
        signal: number | null;
        hist: number | null;
    };
    bollinger: {
        upper: number | null;
        middle: number | null;
        lower: number | null;
    };
    stochastic: {
        k: number | null;
        d: number | null;
    };
    supertrend: {
        value: number | null;
        direction: 1 | -1 | null;
    };
    lastClose: number | null;
    candleCount: number;
}
interface TechnicalAnalysisResult {
    meta: {
        securityId: string;
        exchangeSegment: string;
        instrument: string;
        fromDate: string;
        toDate: string;
    };
    indicators: Partial<Record<TimeframeKey, TimeframeIndicators>>;
}
/**
 * Multi-timeframe indicator computation over the charts API.
 *
 * Pulls intraday candles per interval, then reduces each timeframe to the
 * latest value of every indicator — the shape {@link analyzeMultiTimeframe}
 * consumes.
 */
declare class TechnicalAnalysis {
    private readonly charts;
    private readonly options;
    constructor(charts: Charts, options?: TechnicalAnalysisOptions);
    /** Fetches candles per interval and computes indicators for each. */
    compute(request: ComputeRequest): Promise<TechnicalAnalysisResult>;
    /**
     * Computes the same multi-timeframe result from a single base series by
     * resampling, so one API call can cover every interval.
     */
    computeFromCandles(baseCandles: Candle[], intervals?: number[]): Partial<Record<TimeframeKey, TimeframeIndicators>>;
    /** Every indicator for one timeframe, reduced to its latest value. */
    computeFor(candles: Candle[]): TimeframeIndicators;
    /** Bars needed before the slowest configured indicator produces a value. */
    private requiredBars;
    private autoDaysNeeded;
    private normalizeToDate;
    private normalizeFromDate;
}

type Momentum = "overbought" | "oversold" | "bullish" | "bearish" | "neutral" | "unknown";
type TrendStrength = "strong" | "moderate" | "weak" | "unknown";
type Signal = "bullish" | "bearish" | "neutral" | "unknown";
type Bias = "bullish" | "bearish" | "neutral";
type Setup = "buy_on_dip" | "sell_on_rise" | "range_trade";
interface TimeframeClassification {
    momentum: Momentum;
    trend: TrendStrength;
    macdSignal: Signal;
    volatility: "expanding" | "flat" | "unknown";
    bias: Bias;
}
interface MultiTimeframeSummary {
    meta: TechnicalAnalysisResult["meta"] | Record<string, never>;
    perTimeframe: Partial<Record<TimeframeKey, TimeframeClassification>>;
    summary: {
        bias: Bias;
        setup: Setup;
        /** Weighted score in `[0, 1]`; 1 is unanimously bullish. */
        confidence: number;
        rationale: {
            rsi: string;
            macd: string;
            adx: string;
            atr: string;
        };
        trendStrength: TrendStrength;
    };
}
/**
 * Blends per-timeframe indicator readings into a single directional bias.
 *
 * Each timeframe is classified independently, then scored and weighted by
 * horizon — a 60-minute reading counts four times a 1-minute one.
 */
declare function analyzeMultiTimeframe(data: Pick<TechnicalAnalysisResult, "indicators"> & Partial<Pick<TechnicalAnalysisResult, "meta">>): MultiTimeframeSummary;

/**
 * Prompt construction for AI trading assistants.
 *
 * These render account and market state into text an LLM can reason over —
 * they never call the API themselves, so a caller decides what data to fetch
 * and how fresh it needs to be.
 */
interface HoldingLike {
    tradingSymbol?: string;
    securityId?: string;
    totalQty?: number;
    avgCostPrice?: number;
    [key: string]: unknown;
}
interface PositionLike {
    tradingSymbol?: string;
    securityId?: string;
    netQty?: number;
    buyAvg?: number;
    costPrice?: number;
    unrealizedProfit?: number;
    realizedProfit?: number;
    productType?: string;
    [key: string]: unknown;
}
interface FundsLike {
    availabelBalance?: number;
    availableBalance?: number;
    utilizedAmount?: number;
    withdrawableBalance?: number;
    [key: string]: unknown;
}
/** System prompt establishing the assistant's remit and guardrails. */
declare function systemPrompt(capabilities?: string[]): string;
/** Human-readable portfolio state: funds, holdings and open positions. */
declare function portfolioSummary(input: {
    holdings?: HoldingLike[];
    positions?: PositionLike[];
    funds?: FundsLike;
}): string;
/**
 * Risk exposure across positions.
 *
 * P&L is summed over every position, but the count is restricted to open
 * ones — a closed position still contributed realized P&L today.
 */
declare function riskReport(input: {
    positions?: PositionLike[];
    maxDrawdownPct?: number;
    dailyLossLimit?: number;
}): string;
/** Renders a multi-timeframe bias into prose. */
declare function marketAnalysis(summary: MultiTimeframeSummary): string;
/** Confirmation text to show a human before a live order goes out. */
declare function orderConfirmation(order: Record<string, unknown>): string;

type promptHelpers_FundsLike = FundsLike;
type promptHelpers_HoldingLike = HoldingLike;
type promptHelpers_PositionLike = PositionLike;
declare const promptHelpers_marketAnalysis: typeof marketAnalysis;
declare const promptHelpers_orderConfirmation: typeof orderConfirmation;
declare const promptHelpers_portfolioSummary: typeof portfolioSummary;
declare const promptHelpers_riskReport: typeof riskReport;
declare const promptHelpers_systemPrompt: typeof systemPrompt;
declare namespace promptHelpers {
  export { type promptHelpers_FundsLike as FundsLike, type promptHelpers_HoldingLike as HoldingLike, type promptHelpers_PositionLike as PositionLike, promptHelpers_marketAnalysis as marketAnalysis, promptHelpers_orderConfirmation as orderConfirmation, promptHelpers_portfolioSummary as portfolioSummary, promptHelpers_riskReport as riskReport, promptHelpers_systemPrompt as systemPrompt };
}

/**
 * Black-Scholes pricing, Greeks and implied volatility.
 *
 * Time to expiry is in years and rates/volatilities are annualized decimals
 * (`0.065` for 6.5%), matching the convention in the Ruby gem.
 */
type OptionKind = "call" | "put";
interface BlackScholesInput {
    spot: number;
    strike: number;
    timeToExpiry: number;
    riskFreeRate: number;
    volatility: number;
    optionType: OptionKind;
}
interface Greeks {
    delta: number;
    gamma: number;
    /** Per-day theta, i.e. the annual figure divided by 365. */
    theta: number;
    /** Per 1% change in volatility. */
    vega: number;
    /** Per 1% change in the risk-free rate. */
    rho: number;
}
/** Theoretical option price. Returns 0 at or past expiry. */
declare function price(input: BlackScholesInput): number;
/** Delta, gamma, theta, vega and rho. All zero at or past expiry. */
declare function greeks(input: BlackScholesInput): Greeks;
interface ImpliedVolatilityInput {
    marketPrice: number;
    spot: number;
    strike: number;
    timeToExpiry: number;
    riskFreeRate: number;
    optionType: OptionKind;
    tolerance?: number;
    maxIterations?: number;
}
/**
 * Implied volatility by Newton-Raphson from a 20% seed.
 *
 * Returns the best estimate reached within `maxIterations`; deep in- or
 * out-of-the-money options where vega collapses may not converge, in which
 * case the last iterate is returned rather than throwing.
 */
declare function impliedVolatility(input: ImpliedVolatilityInput): number;
/** Standard normal CDF. */
declare function normalCdf(x: number): number;
/** Standard normal PDF. */
declare function normalPdf(x: number): number;
/** Abramowitz & Stegun 7.1.26 error function approximation. */
declare function erf(value: number): number;
/** Years between now and an expiry date, floored at zero. */
declare function yearsToExpiry(expiry: Date | string, now?: Date): number;

/** Open interest at one strike, both sides. */
interface StrikeOpenInterest {
    strike: number;
    callOi: number;
    putOi: number;
}
interface MaxPainDetail {
    maxPainStrike: number;
    totalPain: number;
    painDistribution: Array<{
        strike: number;
        pain: number;
    }>;
}
/**
 * Max pain: the expiry price at which option writers lose the least, i.e.
 * the strike where the most contracts expire worthless.
 */
declare function maxPain(data: StrikeOpenInterest[]): number | undefined;
/** Max pain plus the full pain curve, for plotting or inspection. */
declare function detailedMaxPain(data: StrikeOpenInterest[]): MaxPainDetail | undefined;
/** Put-call ratio by open interest. Returns 0 when there is no call OI. */
declare function putCallRatio(data: StrikeOpenInterest[]): number;
/** Put-call ratio by traded volume. */
declare function volumePutCallRatio(chain: NormalizedOptionChain): number;
/** Extracts the open-interest view a max-pain calculation needs from a chain. */
declare function openInterestFromChain(chain: NormalizedOptionChain): StrikeOpenInterest[];
interface OiConcentration {
    strike: number;
    oi: number;
}
/** The `count` strikes carrying the most call open interest — resistance. */
declare function highestCallOi(chain: NormalizedOptionChain, count?: number): OiConcentration[];
/** The `count` strikes carrying the most put open interest — support. */
declare function highestPutOi(chain: NormalizedOptionChain, count?: number): OiConcentration[];

/**
 * Enumerations and helper lookups shared by the REST, WebSocket, risk, skill and
 * agent layers. Mirrors `DhanHQ::Constants` in the Ruby gem.
 */
declare const ExchangeSegment: {
    readonly IDX_I: "IDX_I";
    readonly NSE_EQ: "NSE_EQ";
    readonly NSE_FNO: "NSE_FNO";
    readonly NSE_CURRENCY: "NSE_CURRENCY";
    readonly NSE_COMM: "NSE_COMM";
    readonly BSE_EQ: "BSE_EQ";
    readonly MCX_COMM: "MCX_COMM";
    readonly BSE_CURRENCY: "BSE_CURRENCY";
    readonly BSE_FNO: "BSE_FNO";
    /**
     * US / international equities, traded through the Global Stocks APIs
     * (`/v2/globalstocks/*`). Deliberately excluded from `ALL` so it can never
     * satisfy a domestic order contract.
     */
    readonly INX_EQ: "INX_EQ";
};
declare const EXCHANGE_SEGMENTS: readonly ["IDX_I", "NSE_EQ", "NSE_FNO", "NSE_CURRENCY", "NSE_COMM", "BSE_EQ", "MCX_COMM", "BSE_CURRENCY", "BSE_FNO"];
/** Segments served by the Global Stocks APIs. */
declare const GLOBAL_EXCHANGE_SEGMENTS: readonly ["INX_EQ"];
/** Segments allowed by `POST /v2/margincalculator` (single and multi). */
declare const MARGIN_CALC_SEGMENTS: readonly ["NSE_EQ", "NSE_FNO", "BSE_EQ", "BSE_FNO", "MCX_COMM"];
/** Segments allowed by `POST /v2/forever/orders`. */
declare const FOREVER_ORDER_SEGMENTS: readonly ["NSE_EQ", "NSE_FNO", "BSE_EQ", "BSE_FNO", "MCX_COMM"];
/** Segments for conditional triggers — equities and indices only. */
declare const ALERT_CONDITION_SEGMENTS: readonly ["NSE_EQ", "BSE_EQ", "IDX_I"];
/** Segments allowed by the charts endpoints (excludes `NSE_COMM`). */
declare const CHART_SEGMENTS: readonly ["IDX_I", "NSE_EQ", "NSE_FNO", "NSE_CURRENCY", "BSE_EQ", "BSE_FNO", "BSE_CURRENCY", "MCX_COMM"];
declare const ProductType: {
    readonly CNC: "CNC";
    readonly INTRADAY: "INTRADAY";
    readonly MARGIN: "MARGIN";
    readonly MTF: "MTF";
    readonly CO: "CO";
    readonly BO: "BO";
};
declare const PRODUCT_TYPES: readonly ["CNC", "INTRADAY", "MARGIN", "MTF", "CO", "BO"];
/** Product types allowed by the margin calculator. */
declare const MARGIN_CALC_PRODUCT_TYPES: readonly ["CNC", "INTRADAY", "MARGIN", "MTF"];
/** Product types allowed by `POST /v2/forever/orders`. */
declare const FOREVER_ORDER_PRODUCT_TYPES: readonly ["CNC", "MTF"];
declare const TransactionType: {
    readonly BUY: "BUY";
    readonly SELL: "SELL";
};
declare const TRANSACTION_TYPES: readonly ["BUY", "SELL"];
declare const OrderTypeEnum: {
    readonly LIMIT: "LIMIT";
    readonly MARKET: "MARKET";
    readonly STOP_LOSS: "STOP_LOSS";
    readonly STOP_LOSS_MARKET: "STOP_LOSS_MARKET";
};
declare const ORDER_TYPES: readonly ["LIMIT", "MARKET", "STOP_LOSS", "STOP_LOSS_MARKET"];
declare const ValidityEnum: {
    readonly DAY: "DAY";
    readonly IOC: "IOC";
};
declare const VALIDITIES: readonly ["DAY", "IOC"];
declare const OrderStatus: {
    readonly TRANSIT: "TRANSIT";
    readonly PENDING: "PENDING";
    readonly CLOSED: "CLOSED";
    readonly TRIGGERED: "TRIGGERED";
    readonly REJECTED: "REJECTED";
    readonly CANCELLED: "CANCELLED";
    readonly PART_TRADED: "PART_TRADED";
    readonly TRADED: "TRADED";
    readonly EXPIRED: "EXPIRED";
    readonly MODIFIED: "MODIFIED";
};
declare const AmoTime: {
    readonly PRE_OPEN: "PRE_OPEN";
    readonly OPEN: "OPEN";
    readonly OPEN_30: "OPEN_30";
    readonly OPEN_60: "OPEN_60";
};
declare const ExpiryCode: {
    readonly CURRENT: 0;
    readonly NEXT: 1;
    readonly FAR: 2;
};
declare const InstrumentType: {
    readonly INDEX: "INDEX";
    readonly FUTIDX: "FUTIDX";
    readonly OPTIDX: "OPTIDX";
    readonly EQUITY: "EQUITY";
    readonly FUTSTK: "FUTSTK";
    readonly OPTSTK: "OPTSTK";
    readonly FUTCOM: "FUTCOM";
    readonly OPTFUT: "OPTFUT";
    readonly FUTCUR: "FUTCUR";
    readonly OPTCUR: "OPTCUR";
};
/** Minute intervals accepted by `POST /v2/charts/intraday`. */
declare const ChartInterval: {
    readonly ONE: "1";
    readonly FIVE: "5";
    readonly FIFTEEN: "15";
    readonly TWENTY_FIVE: "25";
    readonly SIXTY: "60";
};
declare const CHART_INTERVALS: readonly ["1", "5", "15", "25", "60"];
declare const OptionType: {
    readonly CALL: "CALL";
    readonly PUT: "PUT";
};
/** Short-form option types used throughout the option chain payloads. */
declare const OptionSide: {
    readonly CE: "CE";
    readonly PE: "PE";
};
declare const LegName: {
    readonly ENTRY_LEG: "ENTRY_LEG";
    readonly TARGET_LEG: "TARGET_LEG";
    readonly STOP_LOSS_LEG: "STOP_LOSS_LEG";
};
declare const OrderFlag: {
    readonly SINGLE: "SINGLE";
    readonly OCO: "OCO";
};
declare const PositionType: {
    readonly LONG: "LONG";
    readonly SHORT: "SHORT";
};
/** Request codes for the Live Market Feed WebSocket. */
declare const FeedRequest: {
    readonly CONNECT: 11;
    readonly DISCONNECT: 12;
    readonly SUBSCRIBE_TICKER: 15;
    readonly UNSUBSCRIBE_TICKER: 16;
    readonly SUBSCRIBE_QUOTE: 17;
    readonly UNSUBSCRIBE_QUOTE: 18;
    readonly SUBSCRIBE_FULL: 21;
    readonly UNSUBSCRIBE_FULL: 22;
    readonly SUBSCRIBE_DEPTH: 23;
    readonly UNSUBSCRIBE_DEPTH: 24;
};
/** Response codes on the Live Market Feed WebSocket. */
declare const FeedResponse: {
    readonly INDEX_PACKET: 1;
    readonly TICKER_PACKET: 2;
    readonly QUOTE_PACKET: 4;
    readonly OI_PACKET: 5;
    readonly PREV_CLOSE_PACKET: 6;
    readonly MARKET_STATUS_PACKET: 7;
    readonly FULL_PACKET: 8;
    readonly FEED_DISCONNECT: 50;
};
/**
 * Global Stocks (US equities) enumerations, served under `/v2/globalstocks/*`.
 * These orders carry no exchange segment, product type or validity, so the
 * domestic {@link ProductType}/{@link ValidityEnum} enums do not apply.
 */
declare const GlobalStocks: {
    readonly EXCHANGE_SEGMENT: "INX_EQ";
    readonly EXCHANGE_SEGMENT_CODE: 14;
    readonly MAX_INSTRUMENTS_PER_REQUEST: 100;
    readonly MAX_SUBSCRIPTIONS_PER_CONNECTION: 5000;
    readonly MAX_CONNECTIONS_PER_CLIENT: 5;
    readonly OrderType: {
        readonly MARKET: "MARKET";
        readonly LIMIT: "LIMIT";
        readonly STOP_LOSS: "STOP_LOSS";
        readonly STOP_LOSS_MARKET: "STOP_LOSS_MARKET";
        /** Notional / dollar-value orders — quantity is replaced by `amount`. */
        readonly AMOUNT: "AMOUNT";
    };
    readonly MarketStatus: {
        readonly OPEN: "open";
        readonly CLOSED: "closed";
    };
    readonly MsgCode: {
        readonly TRADE: 1;
        readonly PREV_CLOSE: 32;
        readonly CIRCUIT_LIMIT: 33;
        readonly FIFTY_TWO_WEEK: 36;
    };
};
declare const GLOBAL_ORDER_TYPES: readonly ["MARKET", "LIMIT", "STOP_LOSS", "STOP_LOSS_MARKET", "AMOUNT"];
declare const ComparisonType: {
    readonly TECHNICAL_WITH_VALUE: "TECHNICAL_WITH_VALUE";
    readonly TECHNICAL_WITH_INDICATOR: "TECHNICAL_WITH_INDICATOR";
    readonly TECHNICAL_WITH_CLOSE: "TECHNICAL_WITH_CLOSE";
    readonly PRICE_WITH_VALUE: "PRICE_WITH_VALUE";
};
declare const Operator: {
    readonly CROSSING_UP: "CROSSING_UP";
    readonly CROSSING_DOWN: "CROSSING_DOWN";
    readonly CROSSING_ANY_SIDE: "CROSSING_ANY_SIDE";
    readonly GREATER_THAN: "GREATER_THAN";
    readonly LESS_THAN: "LESS_THAN";
    readonly GREATER_THAN_EQUAL: "GREATER_THAN_EQUAL";
    readonly LESS_THAN_EQUAL: "LESS_THAN_EQUAL";
    readonly EQUAL: "EQUAL";
    readonly NOT_EQUAL: "NOT_EQUAL";
};
declare const TriggerStatus: {
    readonly ACTIVE: "ACTIVE";
    readonly TRIGGERED: "TRIGGERED";
    readonly EXPIRED: "EXPIRED";
    readonly CANCELLED: "CANCELLED";
};
/** Trading API error codes (DH-900 series). */
declare const TradingErrorCode: {
    readonly INVALID_AUTHENTICATION: "DH-901";
    readonly INVALID_ACCESS: "DH-902";
    readonly USER_ACCOUNT: "DH-903";
    readonly RATE_LIMIT: "DH-904";
    readonly INPUT_EXCEPTION: "DH-905";
    readonly ORDER_ERROR: "DH-906";
    readonly DATA_ERROR: "DH-907";
    readonly INTERNAL_SERVER_ERROR: "DH-908";
    readonly NETWORK_ERROR: "DH-909";
    readonly OTHERS: "DH-910";
    readonly NO_HOLDINGS: "DH-1111";
};
/**
 * Published DhanHQ rate limits per API tier. Order APIs 10/sec, Data APIs
 * 5/sec, Market Quote 1/sec, Option Chain one call every 3 seconds.
 */
declare const RATE_LIMITS: {
    readonly order_api: {
        readonly perSecond: 10;
        readonly perDay: 100000;
    };
    readonly data_api: {
        readonly perSecond: 5;
        readonly perDay: 7000;
    };
    readonly quote_api: {
        readonly perSecond: 1;
        readonly perDay: number;
    };
    readonly option_chain: {
        readonly perSecond: number;
        readonly perDay: 4800;
    };
    readonly non_trading_api: {
        readonly perSecond: 20;
        readonly perDay: number;
    };
};
type ApiTier = keyof typeof RATE_LIMITS;
/** Indian market hours in IST, used by the risk pipeline. */
declare const MARKET_HOURS: {
    readonly timezoneOffsetMinutes: 330;
    readonly openHour: 9;
    readonly openMinute: 15;
    readonly closeHour: 15;
    readonly closeMinute: 30;
    /** Minutes in a regular NSE trading session. */
    readonly sessionMinutes: 375;
};
/**
 * Maps a scrip-master `(EXCH_ID, SEGMENT)` pair to an exchange segment. Keyed
 * as `"EXCH_ID:SEGMENT"` because tuples are not usable as object keys.
 */
declare const SEGMENT_MAP: Record<string, string>;

declare const constants_ALERT_CONDITION_SEGMENTS: typeof ALERT_CONDITION_SEGMENTS;
declare const constants_AmoTime: typeof AmoTime;
type constants_ApiTier = ApiTier;
declare const constants_CHART_INTERVALS: typeof CHART_INTERVALS;
declare const constants_CHART_SEGMENTS: typeof CHART_SEGMENTS;
declare const constants_ChartInterval: typeof ChartInterval;
declare const constants_ComparisonType: typeof ComparisonType;
declare const constants_EXCHANGE_SEGMENTS: typeof EXCHANGE_SEGMENTS;
declare const constants_ExchangeSegment: typeof ExchangeSegment;
declare const constants_ExpiryCode: typeof ExpiryCode;
declare const constants_FOREVER_ORDER_PRODUCT_TYPES: typeof FOREVER_ORDER_PRODUCT_TYPES;
declare const constants_FOREVER_ORDER_SEGMENTS: typeof FOREVER_ORDER_SEGMENTS;
declare const constants_FeedRequest: typeof FeedRequest;
declare const constants_FeedResponse: typeof FeedResponse;
declare const constants_GLOBAL_EXCHANGE_SEGMENTS: typeof GLOBAL_EXCHANGE_SEGMENTS;
declare const constants_GLOBAL_ORDER_TYPES: typeof GLOBAL_ORDER_TYPES;
declare const constants_GlobalStocks: typeof GlobalStocks;
declare const constants_InstrumentType: typeof InstrumentType;
declare const constants_LegName: typeof LegName;
declare const constants_MARGIN_CALC_PRODUCT_TYPES: typeof MARGIN_CALC_PRODUCT_TYPES;
declare const constants_MARGIN_CALC_SEGMENTS: typeof MARGIN_CALC_SEGMENTS;
declare const constants_MARKET_HOURS: typeof MARKET_HOURS;
declare const constants_ORDER_TYPES: typeof ORDER_TYPES;
declare const constants_Operator: typeof Operator;
declare const constants_OptionSide: typeof OptionSide;
declare const constants_OptionType: typeof OptionType;
declare const constants_OrderFlag: typeof OrderFlag;
declare const constants_OrderStatus: typeof OrderStatus;
declare const constants_OrderTypeEnum: typeof OrderTypeEnum;
declare const constants_PRODUCT_TYPES: typeof PRODUCT_TYPES;
declare const constants_PositionType: typeof PositionType;
declare const constants_ProductType: typeof ProductType;
declare const constants_RATE_LIMITS: typeof RATE_LIMITS;
declare const constants_SEGMENT_MAP: typeof SEGMENT_MAP;
declare const constants_TRANSACTION_TYPES: typeof TRANSACTION_TYPES;
declare const constants_TradingErrorCode: typeof TradingErrorCode;
declare const constants_TransactionType: typeof TransactionType;
declare const constants_TriggerStatus: typeof TriggerStatus;
declare const constants_VALIDITIES: typeof VALIDITIES;
declare const constants_ValidityEnum: typeof ValidityEnum;
declare namespace constants {
  export { constants_ALERT_CONDITION_SEGMENTS as ALERT_CONDITION_SEGMENTS, constants_AmoTime as AmoTime, type constants_ApiTier as ApiTier, constants_CHART_INTERVALS as CHART_INTERVALS, constants_CHART_SEGMENTS as CHART_SEGMENTS, constants_ChartInterval as ChartInterval, constants_ComparisonType as ComparisonType, constants_EXCHANGE_SEGMENTS as EXCHANGE_SEGMENTS, constants_ExchangeSegment as ExchangeSegment, constants_ExpiryCode as ExpiryCode, constants_FOREVER_ORDER_PRODUCT_TYPES as FOREVER_ORDER_PRODUCT_TYPES, constants_FOREVER_ORDER_SEGMENTS as FOREVER_ORDER_SEGMENTS, constants_FeedRequest as FeedRequest, constants_FeedResponse as FeedResponse, constants_GLOBAL_EXCHANGE_SEGMENTS as GLOBAL_EXCHANGE_SEGMENTS, constants_GLOBAL_ORDER_TYPES as GLOBAL_ORDER_TYPES, constants_GlobalStocks as GlobalStocks, constants_InstrumentType as InstrumentType, constants_LegName as LegName, constants_MARGIN_CALC_PRODUCT_TYPES as MARGIN_CALC_PRODUCT_TYPES, constants_MARGIN_CALC_SEGMENTS as MARGIN_CALC_SEGMENTS, constants_MARKET_HOURS as MARKET_HOURS, constants_ORDER_TYPES as ORDER_TYPES, constants_Operator as Operator, constants_OptionSide as OptionSide, constants_OptionType as OptionType, constants_OrderFlag as OrderFlag, constants_OrderStatus as OrderStatus, constants_OrderTypeEnum as OrderTypeEnum, constants_PRODUCT_TYPES as PRODUCT_TYPES, constants_PositionType as PositionType, constants_ProductType as ProductType, constants_RATE_LIMITS as RATE_LIMITS, constants_SEGMENT_MAP as SEGMENT_MAP, constants_TRANSACTION_TYPES as TRANSACTION_TYPES, constants_TradingErrorCode as TradingErrorCode, constants_TransactionType as TransactionType, constants_TriggerStatus as TriggerStatus, constants_VALIDITIES as VALIDITIES, constants_ValidityEnum as ValidityEnum };
}

declare const orderSchema: z.ZodObject<{
    dhanClientId: z.ZodOptional<z.ZodString>;
    correlationId: z.ZodOptional<z.ZodString>;
    transactionType: z.ZodEnum<{
        BUY: "BUY";
        SELL: "SELL";
    }>;
    exchangeSegment: z.ZodEnum<{
        NSE_EQ: "NSE_EQ";
        BSE_EQ: "BSE_EQ";
        NSE_FNO: "NSE_FNO";
        NSE_COMM: "NSE_COMM";
        BSE_FNO: "BSE_FNO";
        MCX_COMM: "MCX_COMM";
    }>;
    productType: z.ZodEnum<{
        CNC: "CNC";
        INTRADAY: "INTRADAY";
        MARGIN: "MARGIN";
        MTF: "MTF";
        CO: "CO";
        BO: "BO";
    }>;
    orderType: z.ZodEnum<{
        LIMIT: "LIMIT";
        MARKET: "MARKET";
        STOP_LOSS: "STOP_LOSS";
        STOP_LOSS_MARKET: "STOP_LOSS_MARKET";
    }>;
    validity: z.ZodOptional<z.ZodEnum<{
        DAY: "DAY";
        IOC: "IOC";
    }>>;
    quantity: z.ZodNumber;
    disclosedQuantity: z.ZodOptional<z.ZodNumber>;
    price: z.ZodOptional<z.ZodNumber>;
    triggerPrice: z.ZodOptional<z.ZodNumber>;
    afterMarketOrder: z.ZodOptional<z.ZodBoolean>;
    amoTime: z.ZodOptional<z.ZodString>;
    securityId: z.ZodString;
    boProfitValue: z.ZodOptional<z.ZodNumber>;
    boStopLossValue: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;

declare const superOrderSchema: z.ZodObject<{
    dhanClientId: z.ZodOptional<z.ZodString>;
    correlationId: z.ZodOptional<z.ZodString>;
    transactionType: z.ZodEnum<{
        BUY: "BUY";
        SELL: "SELL";
    }>;
    exchangeSegment: z.ZodEnum<{
        NSE_EQ: "NSE_EQ";
        BSE_EQ: "BSE_EQ";
        NSE_FNO: "NSE_FNO";
        NSE_COMM: "NSE_COMM";
        BSE_FNO: "BSE_FNO";
        MCX_COMM: "MCX_COMM";
    }>;
    productType: z.ZodEnum<{
        CNC: "CNC";
        INTRADAY: "INTRADAY";
        MARGIN: "MARGIN";
        MTF: "MTF";
    }>;
    orderType: z.ZodEnum<{
        LIMIT: "LIMIT";
        MARKET: "MARKET";
    }>;
    quantity: z.ZodNumber;
    price: z.ZodOptional<z.ZodNumber>;
    targetPrice: z.ZodOptional<z.ZodNumber>;
    stopLossPrice: z.ZodOptional<z.ZodNumber>;
    trailingJump: z.ZodOptional<z.ZodNumber>;
    securityId: z.ZodString;
}, z.core.$strip>;

declare class DhanError extends Error {
    readonly code: string;
    readonly status?: number;
    readonly details?: unknown;
    readonly cause?: unknown;
    constructor(message: string, options?: {
        code?: string;
        status?: number;
        details?: unknown;
        cause?: unknown;
    });
}

declare class ApiResponseError extends DhanError {
    constructor(message: string, status: number, details?: unknown, cause?: unknown);
}

/**
 * A write tool was invoked without the live-trading gate open.
 *
 * Agent and MCP write paths require both `DHANHQ_MCP_ENABLE_WRITES=true` and
 * `LIVE_TRADING=true`, so an agent cannot place orders by default.
 */
declare class LiveTradingDisabledError extends DhanError {
    constructor(message?: string);
}

declare class NetworkError extends DhanError {
    constructor(message: string, cause?: unknown);
}

declare class RateLimitError extends DhanError {
    constructor(message?: string, cause?: unknown);
}

/**
 * A pre-trade risk check rejected the order. Raised by the risk pipeline
 * before anything reaches the broker, so no order was placed.
 */
declare class RiskViolationError extends DhanError {
    /** Name of the check that rejected the order, e.g. `"quantity"`. */
    readonly check: string;
    constructor(check: string, message: string, details?: unknown);
}

declare class ValidationError extends DhanError {
    readonly issues: ZodError["issues"];
    constructor(error: ZodError);
}

/** Blocks instruments the exchange has flagged as not tradable. */
declare const tradingPermissionCheck: RiskCheck;
/** Blocks ASM/GSM surveillance-restricted instruments. */
declare const asmGsmCheck: RiskCheck;
/** Rejects BO/CO orders on instruments that do not support them. */
declare const productSupportCheck: RiskCheck;
/** Restricts order types to the configured allowlist. */
declare const orderTypeCheck: RiskCheck;
/** Enforces per-order quantity and notional ceilings. */
declare const quantityCheck: RiskCheck;
/** Blocks orders outside 09:15–15:30 IST. */
declare const marketHoursCheck: RiskCheck;
/** Caps the number of concurrently open positions. */
declare const positionLimitsCheck: RiskCheck;
/** Caps how much of the available balance a single symbol may represent. */
declare const concentrationCheck: RiskCheck;
/** Stops new orders once aggregate unrealized loss crosses the daily limit. */
declare const maxLossCheck: RiskCheck;
/**
 * Options-only rules: index underlyings, a stop loss and target on every
 * order, and a target further from entry than the stop.
 */
declare const optionsCheck: RiskCheck;
/**
 * `GET /v2/fundlimit` returns `availabelBalance` — the misspelling is in the
 * upstream API, so both spellings are accepted.
 */
declare function availableBalance(funds: RiskFunds): number;

/**
 * Position sizing and stop-loss placement.
 *
 * All functions are pure — they take numbers and return numbers, so they can
 * be used for planning without any API access.
 */
interface FixedRiskSizingInput {
    accountBalance: number;
    /** Share of the account to risk on this trade, in percent (`2` for 2%). */
    riskPercent: number;
    entryPrice: number;
    stopLossPrice: number;
    /** Rounds down to a whole multiple of the lot size. Defaults to 1. */
    lotSize?: number;
}
/** Quantity such that a stop-out costs `riskPercent` of the account. */
declare function fixedRiskSize(input: FixedRiskSizingInput): number;
interface KellySizingInput {
    /** Historical win rate as a fraction in `(0, 1)`. */
    winRate: number;
    avgWin: number;
    /** Average loss as a positive number. */
    avgLoss: number;
    accountBalance: number;
    entryPrice: number;
    /** Fraction of full Kelly to deploy. Defaults to 0.5 (half-Kelly). */
    fraction?: number;
}
/**
 * Kelly criterion sizing, scaled by `fraction`.
 *
 * Full Kelly is famously over-aggressive against estimation error in the win
 * rate, which is why the default is half.
 */
declare function kellySize(input: KellySizingInput): number;
interface VolatilitySizingInput {
    accountBalance: number;
    riskPercent: number;
    entryPrice: number;
    atr: number;
    /** ATR multiples between entry and stop. Defaults to 2. */
    atrMultiplier?: number;
    lotSize?: number;
}
/** Fixed-risk sizing where the stop distance comes from ATR. */
declare function volatilitySize(input: VolatilitySizingInput): number;
/** Stop a fixed percentage below entry. */
declare function percentageStop(entryPrice: number, riskPercent: number): number;
/** Stop `multiplier` ATRs below entry. */
declare function atrStop(entryPrice: number, atr: number, multiplier?: number): number;
/**
 * Stop just below the nearest support under entry. Returns 0 when no support
 * level sits below the entry price.
 */
declare function supportStop(entryPrice: number, supportLevels: number[], buffer?: number): number;
/** Target at `riskRewardRatio` times the stop distance above entry. */
declare function takeProfit(entryPrice: number, stopLossPrice: number, riskRewardRatio?: number): number;
interface TrailUpdate {
    stop: number;
    highest: number;
    triggered: boolean;
}
/**
 * ATR trailing stop for a long position.
 *
 * The stop ratchets up with the high-water mark and never moves down, so a
 * pullback cannot loosen protection already earned.
 */
declare class TrailManager {
    readonly entryPrice: number;
    readonly initialStop: number;
    private readonly atr;
    private readonly trailMultiplier;
    private currentStop;
    private highestPrice;
    constructor(entryPrice: number, initialStop: number, atr: number, trailMultiplier?: number);
    /** Feeds a new price in and returns the updated stop state. */
    update(currentPrice: number): TrailUpdate;
    get stop(): number;
    get highest(): number;
    isTriggered(currentPrice: number): boolean;
    profit(currentPrice: number): number;
    profitPercent(currentPrice: number): number;
}

/**
 * Trading-day arithmetic for the Indian equity market.
 *
 * Dates are handled as `YYYY-MM-DD` strings in IST so that a call made from a
 * machine in another timezone still resolves to the right trading session.
 */
/**
 * NSE trading holidays, as `YYYY-MM-DD`. Weekends are handled separately, so
 * only weekday holidays need listing. Extend this when the exchange publishes
 * the next calendar.
 */
declare const MARKET_HOLIDAYS: Set<string>;
/** Formats a date as `YYYY-MM-DD` in IST. */
declare function toIstDateString(date?: Date): string;
/** Parses `YYYY-MM-DD` as UTC midnight, which keeps day arithmetic exact. */
declare function fromDateString(value: string): Date;
declare function addDays(value: string, days: number): string;
declare function isWeekday(value: string): boolean;
declare function isTradingDay(value: string): boolean;
/** `from` itself if it is a trading day, else the most recent one before it. */
declare function lastTradingDay(from?: string): string;
/** The trading day strictly before `from`. */
declare function previousTradingDay(from?: string): string;
/** Today when the market trades today, otherwise the previous session. */
declare function todayOrLastTradingDay(): string;
/** Walks back `days` trading sessions from `date`. */
declare function tradingDaysAgo(date: string, days: number): string;

export { type AdxResult, ApiResponseError, AuthResolver, BearCallSpreadSkill, type Bias, type BlackScholesInput, type BollingerBandsResult, BullPutSpreadSkill, BuyAtmCallSkill, type Candle, type CatalogueDependencies, type ChartSeries, Charts, type ComputeRequest, constants as Constants, CoveredCallSkill, DEFAULT_TOOL_VERSION, DhanClient, DhanClientConfig, DhanError, type FixedRiskSizingInput, type FundsLike, index as Generated, type Greeks, type HoldingLike, type ImpliedVolatilityInput, type IndicatorSeries, Instrument, type IntentLeg, IronCondorSkill, JsonSchema, type KellySizingInput, LiveTradingDisabledError, MARKET_HOLIDAYS, type MacdResult, MarketDataSummarizerSkill, MarketFeedEvent, type MaxPainDetail, type Momentum, type MultiTimeframeSummary, NetworkError, NormalizedOptionChain, type OhlcBar, type OiConcentration, type OptionKind, type OrderPreviewOptions, type OrderPreviewResult, Pipeline, type PositionLike, promptHelpers as PromptHelpers, ProtectivePutSkill, RateLimitError, RiskCheck, RiskFunds, RiskViolationError, type Setup, type Signal, Skill, SkillContext, SkillDefinition, SkillParam, SkillRegistry, SkillStep, SquareOffAllSkill, SquareOffPositionSkill, type StochasticResult, StoredSubscription, StraddleSkill, StrangleSkill, type StrikeOpenInterest, type SupertrendResult, TIMEFRAMES, TechnicalAnalysis, type TechnicalAnalysisOptions, type TechnicalAnalysisResult, type TimeframeClassification, type TimeframeIndicators, type TimeframeKey, Tool, schemas as ToolSchemas, TrailManager, type TrailUpdate, type TrendStrength, ValidationError, type VolatilitySizingInput, Workflow, type WorkflowStep, addDays, adx, analyzeMultiTimeframe, asmGsmCheck, atr, atrStop, availableBalance, bollingerBands, buildCatalogue, builtinSkills, candlesFromSeries, closes, concentrationCheck, createSkillRegistry, detailedMaxPain, ema, erf, fixedRiskSize, fromDateString, greeks, highestCallOi, highestPutOi, highs, impliedVolatility, isTradingDay, isWeekday, kellySize, lastTradingDay, latest, lows, macd, marketAnalysis, marketHoursCheck, maxLossCheck, maxPain, nearestStrike, normalCdf, normalPdf, obv, openInterestFromChain, optionsCheck, orderConfirmation, orderSchema, orderTypeCheck, parseMarketFeedPacket, parseTimestamp, percentageStop, portfolioSummary, positionLimitsCheck, previewOrder, previousTradingDay, price, productSupportCheck, putCallRatio, quantityCheck, resample, riskReport, rsi, sma, splitPackets, stochastic, superOrderSchema, supertrend, supportStop, systemPrompt, takeProfit, toIstDateString, todayOrLastTradingDay, tradingDaysAgo, tradingPermissionCheck, trueRanges, volatilitySize, volumePutCallRatio, volumes, vwap, wma, yearsToExpiry };
