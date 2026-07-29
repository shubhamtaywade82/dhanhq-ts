import { AxiosInstance } from 'axios';
import { EventEmitter } from 'events';

interface DhanClientConfig {
    token?: string;
    clientId: string;
    tokenProvider?: () => Promise<string> | string;
    onTokenExpired?: (error: unknown) => Promise<void> | void;
    baseURL?: string;
    timeoutMs?: number;
    rateLimitMinTimeMs?: number;
    wsUrl?: string;
    marketFeedUrl?: string;
    orderUpdateUrl?: string;
    wsReconnectDelayMs?: number;
    wsOrderUserType?: "SELF" | "PARTNER";
    partnerId?: string;
    partnerSecret?: string;
    /** How long a parsed scrip-master segment stays cached. Defaults to 1 hour. */
    instrumentCacheTtlMs?: number;
}
interface CorrelatedRequest {
    correlationId?: string;
}
interface OrderOperationResult<T> {
    correlationId: string;
    data: T;
}
interface InstrumentSubscription {
    securityId: string;
    exchangeSegment: string;
}
interface TickEvent extends InstrumentSubscription {
    ltp?: number;
    timestamp?: number;
    raw: unknown;
}

interface GenerateAccessTokenRequest {
    clientId: string;
    pin: string;
    totp: string;
}
interface RenewWebTokenRequest {
    token: string;
    clientId: string;
    baseURL?: string;
}
interface TokenResponse {
    accessToken?: string;
    expiryTime?: string;
    dhanClientId?: string;
    access_token?: string;
    expiry_time?: string;
    [key: string]: unknown;
}
interface DhanAuthDependencies {
    axiosInstance?: AxiosInstance;
}
declare class DhanAuth {
    static generateTotp(secret: string, options?: {
        timestamp?: number;
        digits?: number;
        period?: number;
    }): string;
    static generateAccessToken(request: GenerateAccessTokenRequest, dependencies?: DhanAuthDependencies): Promise<TokenResponse>;
    static renewWebToken(request: RenewWebTokenRequest, dependencies?: DhanAuthDependencies): Promise<TokenResponse>;
}

interface EnableAutoTokenManagementOptions {
    clientId: string;
    pin: string;
    totpSecret: string;
    renewBeforeMs?: number;
}
declare class TokenManager {
    private readonly config;
    private readonly options;
    private token?;
    private expiryAt?;
    private readonly renewBeforeMs;
    constructor(config: DhanClientConfig, options: EnableAutoTokenManagementOptions);
    ensureValidToken(): Promise<string>;
    generate(): Promise<string>;
    refresh(): Promise<string>;
    private apply;
    private needsRefresh;
}

declare class GeneratedClient {
    constructor(config: DhanClientConfig);
}

interface RateLimiterConfig {
    minTime?: number;
}
declare class RateLimiter {
    private readonly readLimiter;
    private readonly writeLimiter;
    constructor(config?: RateLimiterConfig);
    scheduleRead<T>(task: () => Promise<T>): Promise<T>;
    scheduleWrite<T>(task: () => Promise<T>): Promise<T>;
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
interface RequestOptions<TBody = unknown> {
    method: HttpMethod;
    url: string;
    data?: TBody;
    params?: Record<string, unknown>;
    headers?: Record<string, string>;
    safeToRetry?: boolean;
}
interface HttpClientDependencies {
    axiosInstance?: AxiosInstance;
    rateLimiter?: RateLimiter;
}
declare class HttpClient {
    private readonly axiosInstance;
    private readonly rateLimiter;
    private readonly authResolver;
    private readonly clientId;
    constructor(config: DhanClientConfig, dependencies?: HttpClientDependencies);
    request<TResponse, TBody = unknown>(options: RequestOptions<TBody>): Promise<TResponse>;
    getClientId(): string;
    getAccessToken(): Promise<string>;
    private execute;
    private toAxiosConfig;
    private shouldRetry;
    private isAuthenticationFailure;
    private normalizeError;
    private extractErrorPayload;
}

/**
 * Alert condition details
 */
type AlertCondition = {
    /**
     * Type of comparison
     */
    comparisonType?: AlertCondition.comparisonType;
    /**
     * The exchange where the condition is checked
     */
    exchangeSegment?: AlertCondition.exchangeSegment;
    /**
     * Condition security
     */
    securityId: string;
    /**
     * Name of the indicator
     */
    indicatorName?: AlertCondition.indicatorName;
    /**
     * Time frame for technical indicators
     */
    timeFrame?: AlertCondition.timeFrame;
    /**
     * Comparison operator
     */
    operator?: AlertCondition.operator;
    /**
     * Target value for comparison
     */
    comparingValue?: number;
    /**
     * The technical indicator to compare against when using TechnicalWithIndicator conditions.
     * This represents the right-hand side (RHS) indicator in a technical comparison
     * For e.g. SMA_20 crossing above SMA_50
     */
    comparingIndicatorName?: AlertCondition.comparingIndicatorName;
    /**
     * Expiry date of alert
     */
    expDate?: string;
    /**
     * Evaluation frequency
     */
    frequency?: AlertCondition.frequency;
    /**
     * User-provided note
     * For eg. Price crossing SMA
     */
    userNote?: string;
};
declare namespace AlertCondition {
    /**
     * Type of comparison
     */
    enum comparisonType {
        TECHNICAL_WITH_VALUE = "TECHNICAL_WITH_VALUE",
        TECHNICAL_WITH_INDICATOR = "TECHNICAL_WITH_INDICATOR",
        TECHNICAL_WITH_CLOSE = "TECHNICAL_WITH_CLOSE",
        PRICE_WITH_VALUE = "PRICE_WITH_VALUE"
    }
    /**
     * The exchange where the condition is checked
     */
    enum exchangeSegment {
        NSE_EQ = "NSE_EQ",
        BSE_EQ = "BSE_EQ",
        IDX_I = "IDX_I"
    }
    /**
     * Name of the indicator
     */
    enum indicatorName {
        SMA_5 = "SMA_5",
        SMA_10 = "SMA_10",
        SMA_20 = "SMA_20",
        SMA_50 = "SMA_50",
        SMA_100 = "SMA_100",
        SMA_200 = "SMA_200",
        EMA_5 = "EMA_5",
        EMA_10 = "EMA_10",
        EMA_20 = "EMA_20",
        EMA_50 = "EMA_50",
        EMA_100 = "EMA_100",
        EMA_200 = "EMA_200",
        BB_UPPER = "BB_UPPER",
        BB_LOWER = "BB_LOWER",
        RSI_14 = "RSI_14",
        ATR_14 = "ATR_14",
        STOCHASTIC = "STOCHASTIC",
        STOCHRSI_14 = "STOCHRSI_14",
        MACD_26 = "MACD_26",
        MACD_12 = "MACD_12",
        MACD_HIST = "MACD_HIST"
    }
    /**
     * Time frame for technical indicators
     */
    enum timeFrame {
        DAY = "DAY",
        ONE_MIN = "ONE_MIN",
        FIVE_MIN = "FIVE_MIN",
        FIFTEEN_MIN = "FIFTEEN_MIN"
    }
    /**
     * Comparison operator
     */
    enum operator {
        CROSSING_UP = "CROSSING_UP",
        CROSSING_DOWN = "CROSSING_DOWN",
        CROSSING_ANY_SIDE = "CROSSING_ANY_SIDE",
        GREATER_THAN = "GREATER_THAN",
        LESS_THAN = "LESS_THAN",
        GREATER_THAN_EQUAL = "GREATER_THAN_EQUAL",
        LESS_THAN_EQUAL = "LESS_THAN_EQUAL",
        EQUAL = "EQUAL",
        NOT_EQUAL = "NOT_EQUAL"
    }
    /**
     * The technical indicator to compare against when using TechnicalWithIndicator conditions.
     * This represents the right-hand side (RHS) indicator in a technical comparison
     * For e.g. SMA_20 crossing above SMA_50
     */
    enum comparingIndicatorName {
        SMA_5 = "SMA_5",
        SMA_10 = "SMA_10",
        SMA_20 = "SMA_20",
        SMA_50 = "SMA_50",
        SMA_100 = "SMA_100",
        SMA_200 = "SMA_200",
        EMA_5 = "EMA_5",
        EMA_10 = "EMA_10",
        EMA_20 = "EMA_20",
        EMA_50 = "EMA_50",
        EMA_100 = "EMA_100",
        EMA_200 = "EMA_200",
        BB_UPPER = "BB_UPPER",
        BB_LOWER = "BB_LOWER",
        RSI_14 = "RSI_14",
        ATR_14 = "ATR_14",
        STOCHASTIC = "STOCHASTIC",
        STOCHRSI_14 = "STOCHRSI_14",
        MACD_26 = "MACD_26",
        MACD_12 = "MACD_12",
        MACD_HIST = "MACD_HIST"
    }
    /**
     * Evaluation frequency
     */
    enum frequency {
        ONCE = "ONCE"
    }
}

/**
 * List of orders to execute when alert is triggered
 */
type AlertOrder = {
    /**
     * Type of transaction
     */
    transactionType: AlertOrder.transactionType;
    /**
     * The exchange where the transaction takes place
     */
    exchangeSegment: AlertOrder.exchangeSegment;
    /**
     * Product type
     */
    productType: AlertOrder.productType;
    /**
     * Type of order
     */
    orderType: AlertOrder.orderType;
    /**
     * Unique identifier for the security
     */
    securityId: string;
    /**
     * Quantity of securities to trade
     */
    quantity: number;
    /**
     * Order validity
     */
    validity: AlertOrder.validity;
    /**
     * Price per unit
     * For eg. "250.5"
     */
    price?: string;
    /**
     * Disclosed quantity
     * For eg. "100"
     */
    discQuantity?: string;
    /**
     * Trigger price for stop-loss or trigger orders
     * For eg. "2500.0"
     */
    triggerPrice?: string;
};
declare namespace AlertOrder {
    /**
     * Type of transaction
     */
    enum transactionType {
        BUY = "BUY",
        SELL = "SELL"
    }
    /**
     * The exchange where the transaction takes place
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
     * Product type
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
     * Type of order
     */
    enum orderType {
        LIMIT = "LIMIT",
        MARKET = "MARKET",
        STOP_LOSS = "STOP_LOSS",
        STOP_LOSS_MARKET = "STOP_LOSS_MARKET"
    }
    /**
     * Order validity
     */
    enum validity {
        DAY = "DAY",
        IOC = "IOC"
    }
}

type AlertModifyRequest = {
    /**
     * User specific identification generated by Dhan
     */
    dhanClientId: string;
    /**
     * Unique ID generated by Dhan
     * For eg. "12345"
     */
    alertId: string;
    condition: AlertCondition;
    /**
     * List of orders to execute when alert is triggered
     */
    orders?: Array<AlertOrder>;
};

type AlertOrderRequest = {
    /**
     * User specific identification generated by Dhan
     */
    dhanClientId: string;
    condition: AlertCondition;
    /**
     * List of orders to execute when alert is triggered
     */
    orders: Array<AlertOrder>;
};

type AlertOrderResponse = {
    /**
     * Alert ID generated by Dhan
     */
    alertId?: string;
    /**
     * | **Status**   | **Description**                   |
     * |--------------|-----------------------------------|
     * | ACTIVE       | Alert is currently active         |
     * | TRIGGERED    | Alert condition has been met      |
     * | EXPIRED      | Alert expired without triggering  |
     * | CANCELLED    | Alert was manually cancelled      |
     */
    alertStatus?: string;
};

type BoLedgerResponse = {
    /**
     * User specific identification generated by Dhan
     */
    dhanClientId?: string;
    /**
     * narration
     */
    narration?: string;
    /**
     * voucher date
     */
    voucherdate?: string;
    /**
     * exchange name
     */
    exchange?: string;
    /**
     * voucher decscription
     */
    voucherdesc?: string;
    /**
     * voucher number
     */
    vouchernumber?: string;
    /**
     * debited amount
     */
    debit?: string;
    /**
     * credited amount
     */
    credit?: string;
    /**
     * runnable balance
     */
    runbal?: string;
};

/**
 * Chart data for Put options, null if option_type is CE
 */
type OptionChartPayload = {
    /**
     * List of implied volatility values (IV)
     */
    iv?: Array<number>;
    /**
     * List of open interest values (OI)
     */
    oi?: Array<number>;
    /**
     * List of strike prices
     */
    strike?: Array<number>;
    /**
     * List of spot prices
     */
    spot?: Array<number>;
    /**
     * List of open prices
     */
    open?: Array<number>;
    /**
     * List of high prices
     */
    high?: Array<number>;
    /**
     * List of low prices
     */
    low?: Array<number>;
    /**
     * List of close prices
     */
    close?: Array<number>;
    /**
     * List of traded volumes
     */
    volume?: Array<number>;
    /**
     * List of timestamps in unix
     */
    timestamp?: Array<number>;
};

/**
 * Chart data for call (ce) and put (pe) options
 */
type ChartData = {
    ce?: OptionChartPayload;
    pe?: OptionChartPayload;
};

type ChartsResponse = {
    /**
     * Array of values representing OHLC open value
     */
    open?: Array<number>;
    /**
     * Array of values representing OHLC high value
     */
    high?: Array<number>;
    /**
     * Array of values representing OHLC low value
     */
    low?: Array<number>;
    /**
     * Array of values representing OHLC close value
     */
    close?: Array<number>;
    /**
     * Array of values representing volume
     */
    volume?: Array<number>;
    /**
     * Array of values representing date times in seconds since January 01, 1980
     */
    timestamp?: Array<number>;
    /**
     * Array of values representing open interest
     */
    open_interest?: Array<number>;
};

type EdisBulkFormRequest = {
    isin: Array<string>;
    exchange: EdisBulkFormRequest.exchange;
    segment: EdisBulkFormRequest.segment;
};
declare namespace EdisBulkFormRequest {
    enum exchange {
        NSE = "NSE",
        BSE = "BSE",
        MCX = "MCX",
        ALL = "ALL"
    }
    enum segment {
        EQ = "EQ",
        COMM = "COMM",
        FNO = "FNO"
    }
}

type EdisFormRequest = {
    isin: string;
    qty: number;
    exchange: EdisFormRequest.exchange;
    segment: EdisFormRequest.segment;
    bulk: boolean;
};
declare namespace EdisFormRequest {
    enum exchange {
        NSE = "NSE",
        BSE = "BSE",
        MCX = "MCX",
        ALL = "ALL"
    }
    enum segment {
        EQ = "EQ",
        COMM = "COMM",
        FNO = "FNO"
    }
}

type EdisFormResponse = {
    dhanClientId?: string;
    edisFormHtml?: string;
};

type EdisQtyStatusResponse = {
    clientId?: string;
    isin?: string;
    totalQty?: string;
    aprvdQty?: string;
    status?: string;
    remarks?: string;
};

type ExitPnlResponse = {
    /**
     * Current status of the PNL exit operation
     */
    pnlExitStatus?: string;
    /**
     * User-defined target profit amount for the PNL exit
     */
    profit?: number;
    /**
     * User-defined target loss amount for the PNL exit
     */
    loss?: number;
    /**
     * Indicates if the kill switch is enabled for this PNL exit
     */
    enableKillSwitch?: boolean;
    /**
     * | **Enum Values** | **Description** |
     * |-----------------|----------------|
     * | INTRADAY         | Intraday for Equity, Futures & Options |
     * | DELIVERY         | Delivery for equity deliveries |
     */
    productType?: Array<string>;
};

type FundLimitResponse = {
    /**
     * User specific identification generated by Dhan
     */
    dhanClientId?: string;
    /**
     * Available balance to trade
     */
    availabelBalance?: number;
    /**
     * Start of the day amount
     */
    sodLimit?: number;
    /**
     * Amount received against collateral
     */
    collateralAmount?: number;
    /**
     * Amount available against selling deliveries
     */
    receiveableAmount?: number;
    /**
     * Amount utilised in the day
     */
    utilizedAmount?: number;
    /**
     * Amount blocked against payout request
     */
    blockedPayoutAmount?: number;
    /**
     * Amount available to withdraw to bank
     */
    withdrawableBalance?: number;
};

type GetAlertResponse = {
    /**
     * Alert ID generated by Dhan
     */
    alertId: string;
    /**
     * | **Status**   | **Description**                   |
     * |--------------|-----------------------------------|
     * | ACTIVE       | Alert is currently active         |
     * | TRIGGERED    | Alert condition has been met      |
     * | EXPIRED      | Alert expired without triggering  |
     * | CANCELLED    | Alert was manually cancelled      |
     */
    alertStatus?: string;
    /**
     * Alert Created Time
     */
    createdTime: string;
    /**
     * Alert Triggered Time
     */
    triggeredTime: string;
    /**
     * Last Time
     */
    lastPrice: number;
    condition: AlertCondition;
    /**
     * List of orders to execute when alert is triggered
     */
    orders: Array<AlertOrder>;
};

type GetIPDetailsResponse = {
    /**
     * Date when secondary IP can be modified again (format: yyyy-MM-dd)
     */
    modifyDatePrimary?: string;
    /**
     * Date when primary IP can be modified again (format: yyyy-MM-dd)
     */
    modifyDateSecondary?: string;
    /**
     * Primary IP address associated with the user
     */
    primaryIP?: string;
    /**
     * Secondary IP address associated with the user
     */
    secondaryIP?: string;
};

type GttModifyRequest = {
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
     * | SINGLE           | For GTT Order types       |
     * | OCO              | For OCO Order types      |
     */
    orderFlag?: GttModifyRequest.orderFlag;
    /**
     * | **Enum Values**  | **Description**             |
     * |------------------|-----------------------------|
     * | LIMIT            | For Limit Order types       |
     * | MARKET           | For market Order types      |
     */
    orderType?: GttModifyRequest.orderType;
    /**
     * | **Enum Values**  | **Description**             |
     * |----------------------|-----------------------------------------------|
     * | TARGET_LEG           | For Target Leg                                |
     * | STOP_LOSS_LEG        | For SL leg, in case of OCO OrderType          |
     */
    legName?: GttModifyRequest.legName;
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
     * Valid for 1Year/Expiry
     */
    validity?: string;
};
declare namespace GttModifyRequest {
    /**
     * | **Enum Values**  | **Description**             |
     * |------------------|-----------------------------|
     * | SINGLE           | For GTT Order types       |
     * | OCO              | For OCO Order types      |
     */
    enum orderFlag {
        SINGLE = "SINGLE",
        OCO = "OCO"
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
     * | **Enum Values**  | **Description**             |
     * |----------------------|-----------------------------------------------|
     * | TARGET_LEG           | For Target Leg                                |
     * | STOP_LOSS_LEG        | For SL leg, in case of OCO OrderType          |
     */
    enum legName {
        TARGET_LEG = "TARGET_LEG",
        STOP_LOSS_LEG = "STOP_LOSS_LEG"
    }
}

type GTTOrderModel = {
    /**
     * User specific identification generated by Dhan
     */
    dhanClientId?: string;
    /**
     * The user/partner generated id for tracking back
     */
    correlationId?: string;
    /**
     * | **Enum Values**  | **Description**             |
     * |------------------|-----------------------------|
     * | SINGLE           | For GTT Order types       |
     * | OCO              | For OCO Order types      |
     */
    orderFlag?: GTTOrderModel.orderFlag;
    /**
     * Signifies the type of transaction whether it's BUY or SELL
     */
    transactionType: GTTOrderModel.transactionType;
    /**
     * | **Enums**    | **Exchange** | **Segment**       |
     * |--------------|--------------|-------------------|
     * | NSE_EQ       | NSE          | Equity Cash       |
     * | NSE_FNO      | NSE          | Futures & Options |
     * | BSE_EQ       | BSE          | Equity Cash       |
     * | BSE_FNO      | BSE          | Futures & Options |
     *
     */
    exchangeSegment?: GTTOrderModel.exchangeSegment;
    /**
     * | **Enum Values** | **Description**                                |
     * |-----------------|------------------------------------------------|
     * | CNC             | Cash & Carry for equity deliveries             |
     * | MTF             | Margin Traded Fund                             |
     * | MARGIN          | Carry Forward in Futures & Options             |
     *
     */
    productType?: GTTOrderModel.productType;
    /**
     * | **Enum Values**  | **Description**             |
     * |------------------|-----------------------------|
     * | LIMIT            | For Limit Order types       |
     * | MARKET           | For market Order types      |
     */
    orderType?: GTTOrderModel.orderType;
    /**
     * Valid for 1Year/Expiry
     */
    validity?: string;
    /**
     * Exchange standard identification for each scrip
     */
    securityId?: string;
    /**
     * Number of shares for the order
     */
    quantity?: number;
    /**
     * Number of shares visible (Keep more than 30% of quantity)
     */
    disclosedQuantity?: number;
    /**
     * Price at which order is placed
     */
    price?: number;
    /**
     * Price at which the order is triggered
     */
    triggerPrice?: number;
    /**
     * Target price for OCO order
     */
    price1?: number;
    /**
     * Target trigger price For OCO order
     */
    triggerPrice1?: number;
    /**
     * Target Quantity for OCO order
     */
    quantity1?: number;
};
declare namespace GTTOrderModel {
    /**
     * | **Enum Values**  | **Description**             |
     * |------------------|-----------------------------|
     * | SINGLE           | For GTT Order types       |
     * | OCO              | For OCO Order types      |
     */
    enum orderFlag {
        SINGLE = "SINGLE",
        OCO = "OCO"
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
     *
     */
    enum exchangeSegment {
        NSE_EQ = "NSE_EQ",
        NSE_FNO = "NSE_FNO",
        BSE_EQ = "BSE_EQ",
        BSE_FNO = "BSE_FNO"
    }
    /**
     * | **Enum Values** | **Description**                                |
     * |-----------------|------------------------------------------------|
     * | CNC             | Cash & Carry for equity deliveries             |
     * | MTF             | Margin Traded Fund                             |
     * | MARGIN          | Carry Forward in Futures & Options             |
     *
     */
    enum productType {
        CNC = "CNC",
        MTF = "MTF",
        MARGIN = "MARGIN"
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

type GttOrderResponse = {
    /**
     * User specific identification generated by Dhan
     */
    dhanClientId?: string;
    /**
     * Order specific identification generated by Dhan
     */
    orderId?: string;
    /**
     * | **Enum Values** | **Description**                             |
     * |-----------------|---------------------------------------------|
     * | PENDING         | Reached at exchange end, awaiting execution |
     * | REJECTED        | Rejected at exchange/broker’s end           |
     * | CANCELLED       | Cancelled by user                           |
     * | EXPIRED         | Validity of order is expired                |
     */
    orderStatus?: GttOrderResponse.orderStatus;
    /**
     * Signifies the type of transaction whether it's BUY or SELL
     */
    transactionType?: GttOrderResponse.transactionType;
    /**
     * | **Enums**    | **Exchange** | **Segment**       |
     * |--------------|--------------|-------------------|
     * | NSE_EQ       | NSE          | Equity Cash       |
     * | NSE_FNO      | NSE          | Futures & Options |
     * | BSE_EQ       | BSE          | Equity Cash       |
     * | MCX_COMM     | MCX          | Commodity         |
     */
    exchangeSegment?: GttOrderResponse.exchangeSegment;
    /**
     * | **Enum Values** | **Description**                                |
     * |-----------------|------------------------------------------------|
     * | CNC             | Cash & Carry for equity deliveries             |
     * | INTRADAY        | Intraday for Equity, Futures & Options         |
     * | MARGIN          | Carry Forward in Futures & Options             |
     *
     */
    productType?: GttOrderResponse.productType;
    /**
     * | **Enum Values**  | **Description**                  |
     * |------------------|----------------------------------|
     * | SINGLE           | For Single Forever Order types   |
     * | OCO              | For OCO Forever Order types      |
     *
     */
    orderType?: GttOrderResponse.orderType;
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
     * Price at which order is placed
     */
    price?: number;
    /**
     * Price at which the order is triggered
     */
    triggerPrice?: number;
    /**
     * Order leg of Forever Order where modification is to be done
     */
    legName?: GttOrderResponse.legName;
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
     * Contract Expiry Date for F&O
     */
    drvExpiryDate?: string;
    /**
     * Type of Option
     */
    drvOptionType?: GttOrderResponse.drvOptionType;
    /**
     * Strike Price for Options
     */
    drvStrikePrice?: number;
};
declare namespace GttOrderResponse {
    /**
     * | **Enum Values** | **Description**                             |
     * |-----------------|---------------------------------------------|
     * | PENDING         | Reached at exchange end, awaiting execution |
     * | REJECTED        | Rejected at exchange/broker’s end           |
     * | CANCELLED       | Cancelled by user                           |
     * | EXPIRED         | Validity of order is expired                |
     */
    enum orderStatus {
        PENDING = "PENDING",
        REJECTED = "REJECTED",
        CANCELLED = "CANCELLED",
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
     * | MCX_COMM     | MCX          | Commodity         |
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
     *
     */
    enum productType {
        CNC = "CNC",
        INTRADAY = "INTRADAY",
        MARGIN = "MARGIN"
    }
    /**
     * | **Enum Values**  | **Description**                  |
     * |------------------|----------------------------------|
     * | SINGLE           | For Single Forever Order types   |
     * | OCO              | For OCO Forever Order types      |
     *
     */
    enum orderType {
        SINGLE = "SINGLE",
        OCO = "OCO"
    }
    /**
     * Order leg of Forever Order where modification is to be done
     */
    enum legName {
        TARGET_LEG = "TARGET_LEG",
        STOP_LOSS_LEG = "STOP_LOSS_LEG"
    }
    /**
     * Type of Option
     */
    enum drvOptionType {
        CALL = "CALL",
        PUT = "PUT",
        NA = "NA"
    }
}

type GttOrderStatusResponse = {
    /**
     * Order specific identification generated by Dhan
     */
    orderId?: string;
    /**
     * | **Enum Values** | **Description**                             |
     * |-----------------|---------------------------------------------|
     * | PENDING         | Reached at exchange end, awaiting execution |
     * | REJECTED        | Rejected at exchange/broker’s end           |
     * | CANCELLED       | Cancelled by user                           |
     * | EXPIRED         | Validity of order is expired                |
     */
    orderStatus?: GttOrderStatusResponse.orderStatus;
};
declare namespace GttOrderStatusResponse {
    /**
     * | **Enum Values** | **Description**                             |
     * |-----------------|---------------------------------------------|
     * | PENDING         | Reached at exchange end, awaiting execution |
     * | REJECTED        | Rejected at exchange/broker’s end           |
     * | CANCELLED       | Cancelled by user                           |
     * | EXPIRED         | Validity of order is expired                |
     */
    enum orderStatus {
        PENDING = "PENDING",
        REJECTED = "REJECTED",
        CANCELLED = "CANCELLED",
        EXPIRED = "EXPIRED"
    }
}

type HistoricalChartsRequest = {
    /**
     * Exchange standard identification for each scrip
     */
    securityId?: string;
    /**
     * | **Enums**    | **Exchange** | **Segment**       |
     * |--------------|--------------|-------------------|
     * | NSE_EQ       | NSE          | Equity Cash       |
     * | NSE_FNO      | NSE          | Futures & Options |
     * | BSE_EQ       | BSE          | Equity Cash       |
     * | BSE_FNO      | BSE          | Futures & Options |
     * | MCX_COMM     | MCX          | Commodity         |
     * | IDX_I        | INDEX        | Indices           |
     */
    exchangeSegment?: HistoricalChartsRequest.exchangeSegment;
    /**
     * Represents the security instrument type, refer charts annexure for possible values.
     */
    instrument?: HistoricalChartsRequest.instrument;
    /**
     * Represents the expiry code value, refer charts annexure for possible values.
     */
    expiryCode?: number;
    /**
     * Open Interest Data
     */
    oi?: boolean;
    /**
     * Chart data request start date in format YYYY-MM-DD
     */
    fromDate?: string;
    /**
     * Chart data request end date in format YYYY-MM-DD
     */
    toDate?: string;
};
declare namespace HistoricalChartsRequest {
    /**
     * | **Enums**    | **Exchange** | **Segment**       |
     * |--------------|--------------|-------------------|
     * | NSE_EQ       | NSE          | Equity Cash       |
     * | NSE_FNO      | NSE          | Futures & Options |
     * | BSE_EQ       | BSE          | Equity Cash       |
     * | BSE_FNO      | BSE          | Futures & Options |
     * | MCX_COMM     | MCX          | Commodity         |
     * | IDX_I        | INDEX        | Indices           |
     */
    enum exchangeSegment {
        NSE_EQ = "NSE_EQ",
        NSE_FNO = "NSE_FNO",
        BSE_EQ = "BSE_EQ",
        BSE_FNO = "BSE_FNO",
        MCX_COMM = "MCX_COMM",
        IDX_I = "IDX_I"
    }
    /**
     * Represents the security instrument type, refer charts annexure for possible values.
     */
    enum instrument {
        INDEX = "INDEX",
        FUTIDX = "FUTIDX",
        OPTIDX = "OPTIDX",
        EQUITY = "EQUITY",
        FUTSTK = "FUTSTK",
        OPTSTK = "OPTSTK",
        FUTCOM = "FUTCOM",
        OPTFUT = "OPTFUT"
    }
}

type HoldingResponse = {
    /**
     * Enum values is either NSE or BSE
     */
    exchange?: HoldingResponse.exchange;
    /**
     * Exchange standard  trading symbol
     */
    tradingSymbol?: string;
    /**
     * Exchange standard identification for each scrip
     */
    securityId?: string;
    /**
     * International Securities Identification Number
     */
    isin?: string;
    /**
     * Total number of shares in holding for given stock
     */
    totalQty?: number;
    /**
     * Quantities present in depository
     */
    dpQty?: number;
    /**
     * Quantities not delivered to depository
     */
    t1Qty?: number;
    /**
     * MTF  Quantities not delivered to depository
     */
    mtf_t1_qty?: number;
    /**
     * MTF Quantities delivered to depository
     */
    mtf_qty?: number;
    /**
     * Quantities available for transactions
     */
    availableQty?: number;
    /**
     * Quantities placed as collateral with broker
     */
    collateralQty?: number;
    /**
     * Average Buy Price of total quantities
     */
    avgCostPrice?: number;
    /**
     * Last Traded Price for the scrip
     */
    lastTradedPrice?: number;
};
declare namespace HoldingResponse {
    /**
     * Enum values is either NSE or BSE
     */
    enum exchange {
        NSE = "NSE",
        BSE = "BSE",
        MCX = "MCX",
        ALL = "ALL"
    }
}

type IntradayChartsRequest = {
    /**
     * Exchange standard identification for each scrip
     */
    securityId?: string;
    /**
     * | **Enums**    | **Exchange** | **Segment**       |
     * |--------------|--------------|-------------------|
     * | NSE_EQ       | NSE          | Equity Cash       |
     * | NSE_FNO      | NSE          | Futures & Options |
     * | BSE_EQ       | BSE          | Equity Cash       |
     * | BSE_FNO      | BSE          | Futures & Options |
     * | MCX_COMM     | MCX          | Commodity         |
     * | IDX_I        | INDEX        | Indices           |
     */
    exchangeSegment?: IntradayChartsRequest.exchangeSegment;
    /**
     * Represents the security instrument type, refer charts annexure for possible values.
     */
    instrument?: IntradayChartsRequest.instrument;
    /**
     * Represents time interval in minute, refer charts annexure for possible values.
     */
    interval?: IntradayChartsRequest.interval;
    /**
     * Open Interest Data
     */
    oi?: boolean;
    /**
     * date format : yyyy-MM-dd
     */
    fromDate?: string;
    /**
     * date format : yyyy-MM-dd
     */
    toDate?: string;
};
declare namespace IntradayChartsRequest {
    /**
     * | **Enums**    | **Exchange** | **Segment**       |
     * |--------------|--------------|-------------------|
     * | NSE_EQ       | NSE          | Equity Cash       |
     * | NSE_FNO      | NSE          | Futures & Options |
     * | BSE_EQ       | BSE          | Equity Cash       |
     * | BSE_FNO      | BSE          | Futures & Options |
     * | MCX_COMM     | MCX          | Commodity         |
     * | IDX_I        | INDEX        | Indices           |
     */
    enum exchangeSegment {
        NSE_EQ = "NSE_EQ",
        NSE_FNO = "NSE_FNO",
        BSE_EQ = "BSE_EQ",
        BSE_FNO = "BSE_FNO",
        MCX_COMM = "MCX_COMM",
        IDX_I = "IDX_I"
    }
    /**
     * Represents the security instrument type, refer charts annexure for possible values.
     */
    enum instrument {
        INDEX = "INDEX",
        FUTIDX = "FUTIDX",
        OPTIDX = "OPTIDX",
        EQUITY = "EQUITY",
        FUTSTK = "FUTSTK",
        OPTSTK = "OPTSTK",
        FUTCOM = "FUTCOM",
        OPTFUT = "OPTFUT"
    }
    /**
     * Represents time interval in minute, refer charts annexure for possible values.
     */
    enum interval {
        _1 = "1",
        _5 = "5",
        _15 = "15",
        _25 = "25",
        _60 = "60"
    }
}

type KillSwitchResponse = {
    /**
     * User specific identification generated by Dhan
     */
    dhanClientId?: string;
    /**
     * | **Enum Values**   | **Description**        |
     * |-------------------|------------------------|
     * | ACTIVATE          | KillSwitch Activated   |
     * | DEACTIVATE        | KillSwitch Deactivated |
     */
    killSwitchStatus?: string;
};

type KnowYourMarginReq = {
    /**
     * User specific identification generated by Dhan
     */
    dhanClientId?: string;
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
    exchangeSegment: KnowYourMarginReq.exchangeSegment;
    /**
     * Signifies the type of transaction whether it's BUY or SELL
     */
    transactionType: KnowYourMarginReq.transactionType;
    /**
     * Number of shares for the order
     */
    quantity?: number;
    /**
     * | **Enum Values** | **Description**                                |
     * |-----------------|------------------------------------------------|
     * | CNC             | Cash & Carry for equity deliveries             |
     * | INTRADAY        | Intraday for Equity, Futures & Options         |
     * | MARGIN          | Carry Forward in Futures & Options             |
     * | CO              | Cover Order; entry and stop loss               |
     * | BO              | Bracket Order; entry, stop loss & target price |
     * **CO & BO product types will be valid only for Intraday**
     */
    productType?: KnowYourMarginReq.productType;
    /**
     * Exchange standard identification for each scrip
     */
    securityId?: string;
    /**
     * Price at which the order is requested to execute
     */
    price?: number;
    /**
     * Price at which the order is requested to trigger
     */
    triggerPrice?: number;
};
declare namespace KnowYourMarginReq {
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
     * Signifies the type of transaction whether it's BUY or SELL
     */
    enum transactionType {
        BUY = "BUY",
        SELL = "SELL"
    }
    /**
     * | **Enum Values** | **Description**                                |
     * |-----------------|------------------------------------------------|
     * | CNC             | Cash & Carry for equity deliveries             |
     * | INTRADAY        | Intraday for Equity, Futures & Options         |
     * | MARGIN          | Carry Forward in Futures & Options             |
     * | CO              | Cover Order; entry and stop loss               |
     * | BO              | Bracket Order; entry, stop loss & target price |
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
}

type KnowYourMarginResponse = {
    /**
     * Total available margin to trade
     */
    totalMargin?: number;
    /**
     * Available span margin
     */
    spanMargin?: number;
    /**
     * Available exposure margin
     */
    exposureMargin?: number;
    /**
     * Available balance to trade
     */
    availableBalance?: number;
    /**
     * Variable margin
     */
    variableMargin?: number;
    /**
     * Insufficient balance
     */
    insufficientBalance?: number;
    /**
     * Applicable brokerage
     */
    brokerage?: number;
    /**
     * Applicable leverage
     */
    leverage?: string;
};

type ScriptItem = {
    exchangeSegment?: ScriptItem.exchangeSegment;
    transactionType?: ScriptItem.transactionType;
    quantity?: number;
    productType?: ScriptItem.productType;
    securityId?: string;
    price?: number;
    triggerPrice?: number;
};
declare namespace ScriptItem {
    enum exchangeSegment {
        NSE_EQ = "NSE_EQ",
        NSE_FNO = "NSE_FNO",
        NSE_COMM = "NSE_COMM",
        BSE_EQ = "BSE_EQ",
        BSE_FNO = "BSE_FNO",
        MCX_COMM = "MCX_COMM"
    }
    enum transactionType {
        BUY = "BUY",
        SELL = "SELL"
    }
    enum productType {
        CNC = "CNC",
        INTRADAY = "INTRADAY",
        MARGIN = "MARGIN",
        MTF = "MTF",
        CO = "CO",
        BO = "BO"
    }
}

type MultiScripMarginCalcRequest = {
    includePosition?: boolean;
    includeOrder?: boolean;
    dhanClientId?: string;
    scripList?: Array<ScriptItem>;
};

type MultiScripMarginCalcResponse = {
    clientId?: string;
    totalMargin?: number;
    spanMargin?: number;
    exposure?: number;
    equityMargin?: number;
    foMargin?: number;
    commodity?: number;
    currency?: number;
};

type OptionChartRequest = {
    /**
     * | **Enums**    | **Exchange** | **Segment**       |
     * |--------------|--------------|-------------------|
     * | NSE_EQ       | NSE          | Equity Cash       |
     * | NSE_FNO      | NSE          | Futures & Options |
     * | BSE_EQ       | BSE          | Equity Cash       |
     * | BSE_FNO      | BSE          | Futures & Options |
     * | MCX_COMM     | MCX          | Commodity         |
     * | IDX_I        | INDEX        | Indices           |
     */
    exchangeSegment?: OptionChartRequest.exchangeSegment;
    /**
     * Represents time interval in minute, refer charts annexure for possible values.
     */
    interval?: OptionChartRequest.interval;
    /**
     * Underlying security Id
     */
    securityId?: number;
    /**
     * Represents the security instrument type, refer charts annexure for possible values.
     */
    instrument?: OptionChartRequest.instrument;
    /**
     * Expiry flag indicating type of expiry
     */
    expiryFlag?: OptionChartRequest.expiryFlag;
    /**
     * Expiry code value
     */
    expiryCode?: OptionChartRequest.expiryCode;
    /**
     * | **Strike** | **Description**                        |
     * |------------|----------------------------------------|
     * | ATM        | At The Money (default)                 |
     * | ATM±3~3    | ±3 to ±3 strikes (all instruments)     |
     * | ATM±10~10   | ±10 to ±10 (only for index near expiry) |
     */
    strike?: string;
    /**
     * Option Type
     */
    drvOptionType?: OptionChartRequest.drvOptionType;
    /**
     * Requested data type
     */
    requiredData?: OptionChartRequest.requiredData;
    /**
     * Chart data request start date in format YYYY-MM-DD
     */
    fromDate?: string;
    /**
     * Chart data request end date in format YYYY-MM-DD
     */
    toDate?: string;
};
declare namespace OptionChartRequest {
    /**
     * | **Enums**    | **Exchange** | **Segment**       |
     * |--------------|--------------|-------------------|
     * | NSE_EQ       | NSE          | Equity Cash       |
     * | NSE_FNO      | NSE          | Futures & Options |
     * | BSE_EQ       | BSE          | Equity Cash       |
     * | BSE_FNO      | BSE          | Futures & Options |
     * | MCX_COMM     | MCX          | Commodity         |
     * | IDX_I        | INDEX        | Indices           |
     */
    enum exchangeSegment {
        NSE_EQ = "NSE_EQ",
        NSE_FNO = "NSE_FNO",
        BSE_EQ = "BSE_EQ",
        BSE_FNO = "BSE_FNO",
        MCX_COMM = "MCX_COMM",
        IDX_I = "IDX_I"
    }
    /**
     * Represents time interval in minute, refer charts annexure for possible values.
     */
    enum interval {
        _1 = "1",
        _5 = "5",
        _15 = "15",
        _25 = "25",
        _60 = "60"
    }
    /**
     * Represents the security instrument type, refer charts annexure for possible values.
     */
    enum instrument {
        INDEX = "INDEX",
        FUTIDX = "FUTIDX",
        OPTIDX = "OPTIDX",
        EQUITY = "EQUITY",
        FUTSTK = "FUTSTK",
        OPTSTK = "OPTSTK",
        FUTCOM = "FUTCOM",
        OPTFUT = "OPTFUT"
    }
    /**
     * Expiry flag indicating type of expiry
     */
    enum expiryFlag {
        MONTH = "MONTH",
        WEEK = "WEEK"
    }
    /**
     * Expiry code value
     */
    enum expiryCode {
        '_1' = 1,
        '_2' = 2,
        '_3' = 3
    }
    /**
     * Option Type
     */
    enum drvOptionType {
        CALL = "CALL",
        PUT = "PUT"
    }
    /**
     * Requested data type
     */
    enum requiredData {
        OPEN = "open",
        HIGH = "high",
        LOW = "low",
        CLOSE = "close",
        IV = "iv",
        VOLUME = "volume",
        STRIKE = "strike",
        OI = "oi",
        SPOT = "spot"
    }
}

type OptionChartResponse = {
    data?: ChartData;
};

type PnlBasedExitRequest = {
    /**
     * User specific identification generated by Dhan
     */
    dhanClientId?: string;
    /**
     * User-defined target profit amount for the PNL exit
     */
    profitValue?: number;
    /**
     * User-defined target loss amount for the PNL exit
     */
    lossValue?: number;
    /**
     * Indicates if the kill switch is enabled for this PNL exit
     */
    enableKillSwitch?: boolean;
    /**
     * | **Enum Values** | **Description** |
     * |-----------------|----------------|
     * | INTRADAY         | Intraday for Equity, Futures & Options |
     * | DELIVERY         | Delivery for equity deliveries |
     */
    productType?: Array<string>;
};

type PnlExitResponse = {
    message?: string;
    /**
     * | **Enum Values** | **Description** |
     * |-----------------|----------------|
     * | ACTIVE         | P&L based exit configured successfully |
     * | INACTIVE       | No active P&L based exit configured for the current trading day |
     */
    pnlExitStatus?: string;
};

type PositionConversionRequest = {
    /**
     * User specific identification generated by Dhan
     */
    dhanClientId?: string;
    /**
     * | **Enum Values** | **Description**                                |
     * |-----------------|------------------------------------------------|
     * | CNC             | Cash & Carry for equity deliveries             |
     * | INTRADAY        | Intraday for Equity, Futures & Options         |
     * | MARGIN          | Carry Forward in Futures & Options             |
     */
    fromProductType?: PositionConversionRequest.fromProductType;
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
    exchangeSegment?: PositionConversionRequest.exchangeSegment;
    /**
     * | **Enum Values** | **Description**                                     |
     * |-----------------|-----------------------------------------------------|
     * | LONG            | When net bought quantity is more than sold quantity |
     * | SHORT           | When net sold quantity is more than bought quantity |
     * | CLOSED          | When no open position standing                      |
     */
    positionType?: PositionConversionRequest.positionType;
    /**
     * Exchange standard identification for each scrip
     */
    securityId?: string;
    /**
     * Number of shares for the conversion
     */
    convertQty?: number;
    /**
     * | **Enum Values** | **Description**                                |
     * |-----------------|------------------------------------------------|
     * | CNC             | Cash & Carry for equity deliveries             |
     * | INTRADAY        | Intraday for Equity, Futures & Options         |
     * | MARGIN          | Carry Forward in Futures & Options             |
     */
    toProductType?: PositionConversionRequest.toProductType;
};
declare namespace PositionConversionRequest {
    /**
     * | **Enum Values** | **Description**                                |
     * |-----------------|------------------------------------------------|
     * | CNC             | Cash & Carry for equity deliveries             |
     * | INTRADAY        | Intraday for Equity, Futures & Options         |
     * | MARGIN          | Carry Forward in Futures & Options             |
     */
    enum fromProductType {
        CNC = "CNC",
        INTRADAY = "INTRADAY",
        MARGIN = "MARGIN",
        MTF = "MTF",
        CO = "CO",
        BO = "BO"
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
     * | **Enum Values** | **Description**                                     |
     * |-----------------|-----------------------------------------------------|
     * | LONG            | When net bought quantity is more than sold quantity |
     * | SHORT           | When net sold quantity is more than bought quantity |
     * | CLOSED          | When no open position standing                      |
     */
    enum positionType {
        LONG = "LONG",
        SHORT = "SHORT",
        CLOSED = "CLOSED"
    }
    /**
     * | **Enum Values** | **Description**                                |
     * |-----------------|------------------------------------------------|
     * | CNC             | Cash & Carry for equity deliveries             |
     * | INTRADAY        | Intraday for Equity, Futures & Options         |
     * | MARGIN          | Carry Forward in Futures & Options             |
     */
    enum toProductType {
        CNC = "CNC",
        INTRADAY = "INTRADAY",
        MARGIN = "MARGIN",
        MTF = "MTF",
        CO = "CO",
        BO = "BO"
    }
}

type PositionResponse = {
    /**
     * User specific identification generated by Dhan
     */
    dhanClientId?: string;
    /**
     * Exchange standard  trading symbol
     */
    tradingSymbol?: string;
    /**
     * Exchange standard identification for each scrip
     */
    securityId?: string;
    /**
     * | **Enum Values** | **Description**                                     |
     * |-----------------|-----------------------------------------------------|
     * | LONG            | When net bought quantity is more than sold quantity |
     * | SHORT           | When net sold quantity is more than bought quantity |
     * | CLOSED          | When no open position standing                      |
     */
    positionType?: PositionResponse.positionType;
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
    exchangeSegment?: PositionResponse.exchangeSegment;
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
    productType?: PositionResponse.productType;
    /**
     * Average buy price
     */
    buyAvg?: number;
    /**
     * Cost price
     */
    costPrice?: number;
    /**
     * Total quantity bought
     */
    buyQty?: number;
    /**
     *  Average sell price
     */
    sellAvg?: number;
    /**
     * Total quantities sold
     */
    sellQty?: number;
    /**
     * buyQty minus sellQty equals netQty
     */
    netQty?: number;
    /**
     * Profit or loss booked
     */
    realizedProfit?: number;
    /**
     * Profit or loss standing for open position
     */
    unrealizedProfit?: number;
    /**
     * RBI mandated reference rate for forex
     */
    rbiReferenceRate?: number;
    /**
     * Multiplying factor for currency F&O
     */
    multiplier?: number;
    /**
     * Carry forward F&O long quantities
     */
    carryForwardBuyQty?: number;
    /**
     * Carry forward F&O short quantities
     */
    carryForwardSellQty?: number;
    /**
     * Carry forward F&O long value
     */
    carryForwardBuyValue?: number;
    /**
     * Carry forward F&O short value
     */
    carryForwardSellValue?: number;
    /**
     * Quantities bought today
     */
    dayBuyQty?: number;
    /**
     * Quantities sold today
     */
    daySellQty?: number;
    /**
     * Value of quantities bought today
     */
    dayBuyValue?: number;
    /**
     * Value of quantities sold today
     */
    daySellValue?: number;
    /**
     * For F&O, expiry date of contract
     */
    drvExpiryDate?: string;
    /**
     * For Options, type CALL or PUT
     */
    drvOptionType?: PositionResponse.drvOptionType;
    /**
     * For Options, Strike Price
     */
    drvStrikePrice?: number;
    crossCurrency?: boolean;
};
declare namespace PositionResponse {
    /**
     * | **Enum Values** | **Description**                                     |
     * |-----------------|-----------------------------------------------------|
     * | LONG            | When net bought quantity is more than sold quantity |
     * | SHORT           | When net sold quantity is more than bought quantity |
     * | CLOSED          | When no open position standing                      |
     */
    enum positionType {
        LONG = "LONG",
        SHORT = "SHORT",
        CLOSED = "CLOSED"
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
     * For Options, type CALL or PUT
     */
    enum drvOptionType {
        CALL = "CALL",
        PUT = "PUT",
        NA = "NA"
    }
}

type UserIPRequest = {
    /**
     * User specific identification generated by Dhan
     */
    dhanClientId?: string;
    /**
     * User specific IP
     */
    ip: string;
    /**
     * | **Enum Values** | **Description** |
     * |-----------------|-----------------------------|
     * | PRIMARY         | Primary IP          |
     * | SECONDARY       | Secondary IP        |
     */
    ipFlag: string;
};

type UserIPResponse = {
    message?: string;
    /**
     * | **Enum Values** | **Description** |
     * |-----------------|----------------|
     * | SUCCESS         | Operation was successful |
     * | ERROR           | Operation failed |
     */
    status?: string;
};

declare class Alerts {
    private readonly httpClient;
    constructor(httpClient: HttpClient);
    list(): Promise<GetAlertResponse[]>;
    getById(alertId: string): Promise<GetAlertResponse>;
    place(request: AlertOrderRequest): Promise<AlertOrderResponse>;
    modify(alertId: string, request: AlertModifyRequest): Promise<AlertOrderResponse>;
    delete(alertId: string): Promise<AlertOrderResponse>;
}

declare class Charts {
    private readonly httpClient;
    constructor(httpClient: HttpClient);
    option(request: OptionChartRequest): Promise<OptionChartResponse>;
    intraday(request: IntradayChartsRequest): Promise<ChartsResponse>;
    historical(request: HistoricalChartsRequest): Promise<ChartsResponse>;
}

declare class Edis {
    private readonly httpClient;
    constructor(httpClient: HttpClient);
    form(request: EdisFormRequest): Promise<EdisFormResponse>;
    bulkForm(request: EdisBulkFormRequest): Promise<EdisFormResponse>;
    requestTpin(): Promise<unknown>;
    getQuantityStatus(isin: string): Promise<EdisQtyStatusResponse>;
}

declare class ForeverOrders {
    private readonly httpClient;
    constructor(httpClient: HttpClient);
    list(): Promise<GttOrderResponse[]>;
    place(request: GTTOrderModel): Promise<GttOrderStatusResponse>;
    modify(orderId: string, request: GttModifyRequest): Promise<GttOrderStatusResponse>;
    cancel(orderId: string): Promise<GttOrderStatusResponse>;
}

declare class Funds {
    private readonly httpClient;
    constructor(httpClient: HttpClient);
    getLimit(): Promise<FundLimitResponse>;
    calculateMargin(request: KnowYourMarginReq): Promise<KnowYourMarginResponse>;
    calculateMultiMargin(request: MultiScripMarginCalcRequest): Promise<MultiScripMarginCalcResponse>;
}

/** A scrip-master row, normalized out of the segment CSV. */
interface Instrument {
    securityId: string;
    symbolName?: string;
    displayName?: string;
    exchange?: string;
    segment?: string;
    exchangeSegment?: string;
    instrument?: string;
    series?: string;
    lotSize?: number;
    tickSize?: number;
    expiryDate?: string;
    strikePrice?: number;
    optionType?: string;
    underlyingSymbol?: string;
    isin?: string;
    instrumentType?: string;
    expiryFlag?: string;
    bracketFlag?: string;
    coverFlag?: string;
    asmGsmFlag?: string;
    asmGsmCategory?: string;
    buySellIndicator?: string;
    buyCoMinMarginPer?: number;
    sellCoMinMarginPer?: number;
    mtfLeverage?: number;
}
interface InstrumentSearchOptions {
    /** Match the whole symbol rather than a substring. Defaults to `false`. */
    exactMatch?: boolean;
    /** Defaults to `false` — symbols are upcased on both sides before comparing. */
    caseSensitive?: boolean;
    /** Cap on returned rows. Defaults to 25. */
    limit?: number;
}
interface InstrumentsConfig {
    /**
     * How long a segment's parsed CSV stays cached, in milliseconds. The scrip
     * master changes once a day, so the default is one hour.
     */
    cacheTtlMs?: number;
}
/**
 * Segment-wise instrument (scrip master) lookups.
 *
 * `GET /v2/instrument/{segment}` returns CSV, not JSON, and a single segment
 * can run to hundreds of thousands of rows — so parsed segments are cached in
 * memory and every lookup goes through that cache.
 */
declare class Instruments {
    private readonly httpClient;
    private readonly cacheTtlMs;
    private readonly cache;
    private readonly inFlight;
    constructor(httpClient: HttpClient, config?: InstrumentsConfig);
    /** Every instrument in a segment, cached for {@link InstrumentsConfig.cacheTtlMs}. */
    bySegment(exchangeSegment: string): Promise<Instrument[]>;
    /** Drops cached segments so the next lookup re-downloads. */
    clearCache(exchangeSegment?: string): void;
    /**
     * First instrument in a segment matching `symbol`.
     *
     * Equities are matched on `UNDERLYING_SYMBOL` when present, indices and
     * derivatives on `SYMBOL_NAME`, which is what makes `find("IDX_I", "NIFTY")`
     * and `find("NSE_EQ", "RELIANCE")` both resolve.
     */
    find(exchangeSegment: string, symbol: string, options?: InstrumentSearchOptions): Promise<Instrument | undefined>;
    /** Instrument with this security id inside a segment. */
    findBySecurityId(exchangeSegment: string, securityId: string | number): Promise<Instrument | undefined>;
    /**
     * Search across several segments at once, returning up to `limit` matches.
     * Used by the `dhan_search_instruments` agent tool to resolve a free-text
     * symbol to a security id.
     */
    search(query: string, options?: InstrumentSearchOptions & {
        segments?: string[];
    }): Promise<Instrument[]>;
    /** First match for `symbol` across `segments`, in the order given. */
    findAnywhere(symbol: string, options?: InstrumentSearchOptions & {
        segments?: string[];
    }): Promise<Instrument | undefined>;
    private fetchSegment;
}
/**
 * Minimal RFC 4180 CSV reader — handles quoted fields, escaped quotes and both
 * line ending conventions. The scrip master has no embedded newlines, but
 * DISPLAY_NAME does contain commas inside quotes.
 */
declare function parseCsv(text: string): Array<Record<string, string>>;

declare class IpSetup {
    private readonly httpClient;
    constructor(httpClient: HttpClient);
    get(): Promise<GetIPDetailsResponse>;
    set(request: UserIPRequest): Promise<UserIPResponse>;
    modify(request: UserIPRequest): Promise<UserIPResponse>;
}

/**
 * Instruments keyed by exchange segment, e.g. `{ NSE_EQ: [11536], IDX_I: [13] }`.
 * Up to 1000 instruments per request.
 */
type MarketFeedInstruments = Record<string, Array<number | string>>;
interface LtpQuote {
    last_price?: number;
    [key: string]: unknown;
}
interface OhlcQuote extends LtpQuote {
    ohlc?: {
        open?: number;
        high?: number;
        low?: number;
        close?: number;
    };
}
interface DepthLevel {
    quantity?: number;
    orders?: number;
    price?: number;
}
interface FullQuote extends OhlcQuote {
    volume?: number;
    oi?: number;
    buy_quantity?: number;
    sell_quantity?: number;
    net_change?: number;
    depth?: {
        buy?: DepthLevel[];
        sell?: DepthLevel[];
    };
}
/**
 * A market feed response is keyed by exchange segment then by security id, both
 * as strings: `{ NSE_EQ: { "11536": { last_price: 2800 } } }`.
 */
interface MarketFeedResponse<TQuote> {
    status?: string;
    data?: Record<string, Record<string, TQuote>>;
    [key: string]: unknown;
}
/**
 * On-demand market data snapshots (`/v2/marketfeed/*`).
 *
 * These are snapshot reads, not a stream — for continuous updates use
 * {@link MarketFeedWS}.
 */
declare class MarketFeed {
    private readonly httpClient;
    constructor(httpClient: HttpClient);
    /** Last traded price for up to 1000 instruments. */
    ltp(instruments: MarketFeedInstruments): Promise<MarketFeedResponse<LtpQuote>>;
    /** Open/high/low/close for up to 1000 instruments. */
    ohlc(instruments: MarketFeedInstruments): Promise<MarketFeedResponse<OhlcQuote>>;
    /** Full quote with market depth and open interest. */
    quote(instruments: MarketFeedInstruments): Promise<MarketFeedResponse<FullQuote>>;
    /**
     * Last traded price for a single instrument, or `undefined` when the feed has
     * no entry for it.
     */
    ltpFor(exchangeSegment: string, securityId: number | string): Promise<number | undefined>;
}

interface OptionChainRequest {
    underlyingScrip: number;
    underlyingSeg: string;
    expiry: string;
}
interface ExpiryListRequest {
    underlyingScrip: number;
    underlyingSeg: string;
}
interface OptionGreeks {
    delta?: number;
    theta?: number;
    gamma?: number;
    vega?: number;
}
/** One side (call or put) of a strike, as returned under `oc.<strike>.ce|pe`. */
interface OptionLeg {
    greeks?: OptionGreeks;
    implied_volatility?: number;
    last_price?: number;
    oi?: number;
    previous_oi?: number;
    volume?: number;
    previous_close_price?: number;
    previous_volume?: number;
    top_ask_price?: number;
    top_ask_quantity?: number;
    top_bid_price?: number;
    top_bid_quantity?: number;
    security_id?: string;
    [key: string]: unknown;
}
interface RawOptionChainResponse {
    status?: string;
    data?: {
        last_price?: number;
        oc?: Record<string, {
            ce?: OptionLeg;
            pe?: OptionLeg;
        }>;
    };
    [key: string]: unknown;
}
interface ExpiryListResponse {
    status?: string;
    data?: string[];
    [key: string]: unknown;
}
/** A single strike with both legs, normalized out of the keyed `oc` map. */
interface StrikeEntry {
    strike: number;
    call?: OptionLeg;
    put?: OptionLeg;
}
/**
 * Option chain normalized into an ordered list of strikes — the shape the
 * skills and option analytics layers consume.
 */
interface NormalizedOptionChain {
    lastPrice?: number;
    strikes: StrikeEntry[];
}
/**
 * Option chain data (`/v2/optionchain`).
 *
 * Note this endpoint is rate limited to one call every three seconds, well
 * below the other data APIs.
 */
declare class OptionChain {
    private readonly httpClient;
    constructor(httpClient: HttpClient);
    /** Raw option chain payload, exactly as the API returns it. */
    fetch(request: OptionChainRequest): Promise<RawOptionChainResponse>;
    /** Available expiry dates for an underlying, ascending. */
    expiryList(request: ExpiryListRequest): Promise<ExpiryListResponse>;
    /** Option chain with the strike map flattened and sorted ascending. */
    fetchNormalized(request: OptionChainRequest): Promise<NormalizedOptionChain>;
}
/**
 * Flattens the `oc` map (keyed by a stringified float strike) into a sorted
 * array. Strikes that do not parse as numbers are dropped rather than sorted
 * to the front as `NaN`.
 */
declare function normalizeOptionChain(response: RawOptionChainResponse): NormalizedOptionChain;
/** Strike closest to `target`, or `undefined` when the chain is empty. */
declare function nearestStrike(chain: NormalizedOptionChain, target: number): StrikeEntry | undefined;
/** Exact strike match within `tolerance`; `undefined` when no strike sits there. */
declare function findStrike(chain: NormalizedOptionChain, target: number, tolerance?: number): StrikeEntry | undefined;

type TransactionType = "BUY" | "SELL";
type ExchangeSegment = "NSE_EQ" | "NSE_FNO" | "NSE_COMM" | "BSE_EQ" | "BSE_FNO" | "MCX_COMM";
type ProductType = "CNC" | "INTRADAY" | "MARGIN" | "MTF" | "BO" | "CO";
type OrderType = "MARKET" | "LIMIT" | "STOP_LOSS" | "STOP_LOSS_MARKET";
type Validity = "DAY" | "IOC";
interface PlaceOrderRequest extends CorrelatedRequest {
    dhanClientId?: string;
    transactionType: TransactionType;
    exchangeSegment: ExchangeSegment;
    productType: ProductType;
    orderType: OrderType;
    validity?: Validity;
    quantity: number;
    disclosedQuantity?: number;
    price?: number;
    triggerPrice?: number;
    afterMarketOrder?: boolean;
    amoTime?: string;
    securityId: string;
    boProfitValue?: number;
    boStopLossValue?: number;
}
interface ModifyOrderRequest {
    orderId: string;
    orderType?: OrderType;
    validity?: Validity;
    quantity?: number;
    disclosedQuantity?: number;
    price?: number;
    triggerPrice?: number;
}
interface CancelOrderRequest {
    orderId: string;
}
interface TradeHistoryRequest {
    fromDate: string;
    toDate: string;
    pageNumber?: string;
}
interface OrderResponse {
    orderId: string;
    orderStatus?: string;
    correlationId?: string;
    [key: string]: unknown;
}
interface TradeResponse {
    [key: string]: unknown;
}

declare class Orders {
    private readonly httpClient;
    constructor(httpClient: HttpClient);
    place(request: PlaceOrderRequest): Promise<OrderOperationResult<OrderResponse>>;
    list(): Promise<OrderResponse[]>;
    getById(orderId: string): Promise<OrderResponse>;
    getByCorrelationId(correlationId: string): Promise<OrderResponse>;
    getTrades(orderId: string): Promise<TradeResponse[]>;
    listTrades(): Promise<TradeResponse[]>;
    getTradeHistory(request: TradeHistoryRequest): Promise<TradeResponse[]>;
    placeSlice(request: PlaceOrderRequest): Promise<Array<OrderResponse>>;
    modify(request: ModifyOrderRequest): Promise<OrderResponse>;
    cancel(orderId: string): Promise<OrderResponse>;
    private parsePlaceRequest;
}

declare class Positions {
    private readonly httpClient;
    constructor(httpClient: HttpClient);
    list(): Promise<PositionResponse[]>;
    listHoldings(): Promise<HoldingResponse[]>;
    convert(request: PositionConversionRequest): Promise<unknown>;
    exitAll(): Promise<UserIPResponse>;
}

interface ProfileResponse {
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
declare class Profile {
    private readonly httpClient;
    constructor(httpClient: HttpClient);
    get(): Promise<ProfileResponse>;
}

interface LedgerRequest {
    fromDate?: string;
    toDate?: string;
}
declare class Statements {
    private readonly httpClient;
    constructor(httpClient: HttpClient);
    ledger(request?: LedgerRequest): Promise<BoLedgerResponse>;
}

type SuperOrderProductType = "CNC" | "INTRADAY" | "MARGIN" | "MTF";
type SuperOrderType = "MARKET" | "LIMIT";
type SuperOrderLeg = "ENTRY_LEG" | "STOP_LOSS_LEG" | "TARGET_LEG";
interface PlaceSuperOrderRequest extends CorrelatedRequest {
    dhanClientId?: string;
    transactionType: TransactionType;
    exchangeSegment: ExchangeSegment;
    productType: SuperOrderProductType;
    orderType: SuperOrderType;
    quantity: number;
    price?: number;
    targetPrice?: number;
    stopLossPrice?: number;
    trailingJump?: number;
    securityId: string;
}
interface ModifySuperOrderRequest {
    orderId: string;
    price?: number;
    targetPrice?: number;
    stopLossPrice?: number;
    quantity?: number;
}
interface CancelSuperOrderRequest {
    orderId: string;
    orderLeg: SuperOrderLeg;
}
interface SuperOrderResponse {
    orderId: string;
    orderStatus?: string;
    correlationId?: string;
    [key: string]: unknown;
}

declare class SuperOrders {
    private readonly httpClient;
    constructor(httpClient: HttpClient);
    place(request: PlaceSuperOrderRequest): Promise<OrderOperationResult<SuperOrderResponse>>;
    list(): Promise<SuperOrderResponse[]>;
    modify(request: ModifySuperOrderRequest): Promise<SuperOrderResponse>;
    cancel(request: CancelSuperOrderRequest): Promise<SuperOrderResponse>;
    private parsePlaceRequest;
}

declare class TraderControls {
    private readonly httpClient;
    constructor(httpClient: HttpClient);
    getPnlExit(): Promise<ExitPnlResponse>;
    setPnlExit(request: PnlBasedExitRequest): Promise<PnlExitResponse>;
    stopPnlExit(): Promise<UserIPResponse>;
    getKillSwitchStatus(): Promise<KillSwitchResponse>;
    setKillSwitch(killSwitchStatus: string): Promise<KillSwitchResponse>;
}

type MarketFeedMode = "ticker" | "quote" | "full";
interface MarketDepthLevel {
    bidQuantity: number;
    askQuantity: number;
    bidOrders: number;
    askOrders: number;
    bidPrice: number;
    askPrice: number;
}
interface MarketPacketHeader {
    responseCode: number;
    messageLength: number;
    exchangeSegmentCode: number;
    exchangeSegment: string;
    securityId: string;
}
interface MarketTickerEvent extends MarketPacketHeader {
    type: "ticker";
    ltp: number;
    ltt: number;
    raw: Buffer;
}
interface MarketPrevCloseEvent extends MarketPacketHeader {
    type: "prev-close";
    previousClose: number;
    previousOpenInterest: number;
    raw: Buffer;
}
interface MarketQuoteEvent extends MarketPacketHeader {
    type: "quote";
    ltp: number;
    ltq: number;
    ltt: number;
    atp: number;
    volume: number;
    totalSellQuantity: number;
    totalBuyQuantity: number;
    dayOpen: number;
    dayClose: number;
    dayHigh: number;
    dayLow: number;
    raw: Buffer;
}
interface MarketOiEvent extends MarketPacketHeader {
    type: "oi";
    openInterest: number;
    raw: Buffer;
}
interface MarketFullEvent extends MarketPacketHeader {
    type: "full";
    ltp: number;
    ltq: number;
    ltt: number;
    atp: number;
    volume: number;
    totalSellQuantity: number;
    totalBuyQuantity: number;
    openInterest: number;
    highestOpenInterest: number;
    lowestOpenInterest: number;
    dayOpen: number;
    dayClose: number;
    dayHigh: number;
    dayLow: number;
    depth: MarketDepthLevel[];
    raw: Buffer;
}
interface MarketDisconnectEvent extends MarketPacketHeader {
    type: "disconnect";
    reasonCode: number;
    raw: Buffer;
}
type MarketFeedEvent = MarketTickerEvent | MarketPrevCloseEvent | MarketQuoteEvent | MarketOiEvent | MarketFullEvent | MarketDisconnectEvent;
interface OrderUpdateEvent {
    type: "order_alert";
    data: Record<string, unknown>;
    raw: string;
}
interface OrderState {
    orderId?: string;
    correlationId?: string;
    status?: string;
    tradedQty?: number;
    averageTradedPrice?: number;
    securityId?: string;
    raw: Record<string, unknown>;
}
interface MarketFeedWSOptions {
    token?: string;
    clientId: string;
    url?: string;
    reconnectDelayMs?: number;
    mode?: MarketFeedMode;
    webSocketFactory?: (url: string) => WebSocketLike;
    tokenProvider?: () => Promise<string> | string;
}
interface OrderUpdateWSOptions {
    token?: string;
    clientId: string;
    url?: string;
    reconnectDelayMs?: number;
    webSocketFactory?: (url: string) => WebSocketLike;
    tokenProvider?: () => Promise<string> | string;
    userType?: "SELF" | "PARTNER";
    partnerId?: string;
    partnerSecret?: string;
}
interface DhanWSOptions {
    token?: string;
    clientId: string;
    marketFeedUrl?: string;
    orderUpdateUrl?: string;
    reconnectDelayMs?: number;
    marketSocketFactory?: (url: string) => WebSocketLike;
    orderSocketFactory?: (url: string) => WebSocketLike;
    tokenProvider?: () => Promise<string> | string;
    orderUserType?: "SELF" | "PARTNER";
    partnerId?: string;
    partnerSecret?: string;
}
interface WebSocketLike {
    on(event: string, listener: (...args: unknown[]) => void): unknown;
    send(data: string | Buffer): unknown;
    close(): unknown;
}
interface StoredSubscription extends InstrumentSubscription {
    mode: MarketFeedMode;
}

declare abstract class BaseWS extends EventEmitter {
    private readonly urlFactory;
    private readonly reconnectDelayMs;
    private readonly webSocketFactory;
    private reconnectTimer?;
    protected connection?: WebSocketLike;
    protected manuallyClosed: boolean;
    protected reconnectAttempts: number;
    isConnected: boolean;
    constructor(urlFactory: () => Promise<string> | string, reconnectDelayMs: number, webSocketFactory: (url: string) => WebSocketLike);
    connect(): Promise<void>;
    disconnect(): void;
    protected send(payload: string | Buffer): void;
    private bindConnection;
    private scheduleReconnect;
    protected abstract onOpen(): Promise<void> | void;
    protected abstract onMessage(data: unknown): void;
    protected abstract onClose(): void;
}

declare class LTPStore {
    private readonly values;
    get(key: string): number | undefined;
    set(key: string, value: number): void;
    delete(key: string): void;
    clear(): void;
}

declare class MarketFeedWS extends BaseWS {
    private readonly subscriptions;
    private readonly ltpStore;
    private readonly mode;
    constructor(options: MarketFeedWSOptions, ltpStore: LTPStore);
    subscribe(instruments: InstrumentSubscription[]): void;
    unsubscribe(instruments: InstrumentSubscription[]): void;
    getSubscriptions(): StoredSubscription[];
    protected onOpen(): void;
    protected onMessage(data: unknown): void;
    protected onClose(): void;
    private sendSubscription;
    private subscriptionKey;
}

declare class OrderStore {
    private readonly byOrderId;
    private readonly byCorrelationId;
    upsert(state: OrderState): void;
    getByOrderId(orderId: string): OrderState | undefined;
    getByCorrelationId(correlationId: string): OrderState | undefined;
    clear(): void;
}

declare class OrderUpdateWS extends BaseWS {
    private readonly authResolver;
    private readonly clientId;
    private readonly orderStore;
    private readonly userType;
    private readonly partnerId?;
    private readonly partnerSecret?;
    constructor(options: OrderUpdateWSOptions, orderStore: OrderStore);
    protected onOpen(): Promise<void>;
    protected onMessage(data: unknown): void;
    protected onClose(): void;
}

declare class DhanWS {
    readonly ltpStore: LTPStore;
    readonly orderStore: OrderStore;
    readonly market: MarketFeedWS;
    readonly orders: OrderUpdateWS;
    constructor(options: DhanWSOptions);
    connect(): Promise<void>;
    disconnect(): void;
    subscribe(instruments: InstrumentSubscription[]): void;
}

interface DhanClientDependencies extends HttpClientDependencies {
}
declare class DhanClient {
    private readonly config;
    readonly generated: GeneratedClient;
    readonly orders: Orders;
    readonly superOrders: SuperOrders;
    readonly positions: Positions;
    readonly alerts: Alerts;
    readonly foreverOrders: ForeverOrders;
    readonly funds: Funds;
    readonly charts: Charts;
    readonly edis: Edis;
    readonly statements: Statements;
    readonly traderControls: TraderControls;
    readonly ipSetup: IpSetup;
    readonly profile: Profile;
    readonly marketFeed: MarketFeed;
    readonly optionChain: OptionChain;
    readonly instruments: Instruments;
    readonly ws: DhanWS;
    readonly auth: {
        generateAccessToken: typeof DhanAuth.generateAccessToken;
        generateTotp: typeof DhanAuth.generateTotp;
        renewWebToken: typeof DhanAuth.renewWebToken;
        enableAutoTokenManagement: (options: EnableAutoTokenManagementOptions) => TokenManager;
    };
    private tokenManager?;
    constructor(config: DhanClientConfig, dependencies?: DhanClientDependencies);
    getConfig(): DhanClientConfig;
    static fromTokenEndpoint(options: {
        endpointBaseUrl: string;
        bearerToken: string;
        axiosInstance?: AxiosInstance;
    }): Promise<DhanClient>;
}

/** Position fields the risk checks need, from `GET /v2/positions`. */
interface RiskPosition {
    netQty?: number;
    costPrice?: number;
    unrealizedProfit?: number;
    realizedProfit?: number;
    tradingSymbol?: string;
    securityId?: string;
    [key: string]: unknown;
}
/** Fund fields the risk checks need, from `GET /v2/fundlimit`. */
interface RiskFunds {
    availabelBalance?: number;
    availableBalance?: number;
    [key: string]: unknown;
}
/**
 * Where the account-level checks get their data.
 *
 * Kept as an interface rather than a hard dependency on {@link DhanClient} so
 * checks can be unit-tested with fixtures, and so a caller that already has
 * positions in hand can pass them without a second API call.
 */
interface RiskDataProvider {
    positions(): Promise<RiskPosition[]>;
    funds(): Promise<RiskFunds>;
}
/** Order arguments a check sees. Superset of a place-order request. */
interface RiskOrderArgs extends Partial<PlaceOrderRequest> {
    stopLoss?: number;
    target?: number;
    [key: string]: unknown;
}
interface RiskLimits {
    /** Largest quantity a single order may carry. */
    maxQuantity: number;
    /** Largest notional (quantity × price) a single order may carry. */
    maxNotional: number;
    /** Aggregate unrealized loss at which new orders stop, as a positive number. */
    dailyMaxLoss: number;
    /** Concurrent open positions allowed. */
    maxOpenPositions: number;
    /** Share of available balance one symbol may represent, in percent. */
    maxConcentrationPct: number;
    /** Order types permitted through the pipeline. */
    allowedOrderTypes: string[];
    /** Restrict options trading to index underlyings. */
    optionsIndexOnly: boolean;
    /** Require a stop loss and target on every options order. */
    requireOptionsStops: boolean;
}
declare const DEFAULT_RISK_LIMITS: RiskLimits;
interface RiskContext {
    args: RiskOrderArgs;
    instrument?: Instrument;
    now?: Date;
    limits: RiskLimits;
    provider?: RiskDataProvider;
}
/**
 * One pre-trade check. Throws {@link RiskViolationError} to reject; returning
 * normally means the order passed this check.
 */
interface RiskCheck {
    name: string;
    run(context: RiskContext): Promise<void> | void;
}

type RiskInstrumentKind = "equity" | "options";
/** Checks every order runs through, in order. */
declare const BASE_CHECKS: RiskCheck[];
/** Additional checks for options orders. */
declare const OPTION_CHECKS: RiskCheck[];
/** Account-wide checks, run last so cheaper per-order checks fail first. */
declare const DAILY_CHECKS: RiskCheck[];
interface PipelineConfig {
    limits?: Partial<RiskLimits>;
    provider?: RiskDataProvider;
    /** Replaces {@link BASE_CHECKS} wholesale when supplied. */
    checks?: RiskCheck[];
}
interface PipelineRunOptions {
    args: RiskOrderArgs;
    instrument?: Instrument;
    type?: RiskInstrumentKind;
    now?: Date;
}
interface RiskReport {
    passed: boolean;
    violations: Array<{
        check: string;
        message: string;
    }>;
}
/**
 * Pre-execution risk pipeline.
 *
 * Runs each check in sequence and throws {@link RiskViolationError} on the
 * first failure, so nothing reaches the broker after a rejection. Checks that
 * need account state go through a {@link RiskDataProvider}; without one, those
 * checks pass rather than block, which keeps the pipeline usable offline for
 * order-shape validation.
 *
 * These checks encode NSE/BSE rules and resolve instruments from the Indian
 * scrip master — they do not apply to the Global Stocks (US equities) book.
 */
declare class Pipeline {
    private readonly limits;
    private readonly provider?;
    private readonly checks;
    constructor(config?: PipelineConfig);
    /** Runs every applicable check. Throws on the first violation. */
    run(options: PipelineRunOptions): Promise<true>;
    /**
     * Runs every check and collects the failures instead of throwing — for
     * previews and dry runs, where the caller wants the full picture rather
     * than the first problem.
     */
    report(options: PipelineRunOptions): Promise<RiskReport>;
    getLimits(): RiskLimits;
}
/**
 * Picks the check set from an instrument's type — anything whose
 * `instrumentType` starts with `OPT` gets the options rules on top.
 */
declare function riskTypeFor(instrument?: Instrument): RiskInstrumentKind;

declare const READ_SCOPES: readonly ["portfolio:read", "market:read", "orders:read"];
declare const WRITE_SCOPES: readonly ["orders:write", "orders:cancel", "alerts:write", "risk:write"];
type ReadScope = (typeof READ_SCOPES)[number];
type WriteScope = (typeof WRITE_SCOPES)[number];
type AgentScope = ReadScope | WriteScope;
declare const ALL_SCOPES: AgentScope[];
/**
 * How much damage a tool can do.
 *
 * Anything ending in `write` goes through {@link Policy.requireWrite} and so
 * needs the live-trading gate open, not just the scope.
 */
type ToolRisk = "read_only" | "trade_adjacent_read" | "live_write" | "destructive_write";
interface PolicyOptions {
    scopes?: AgentScope[];
    /**
     * Overrides the `DHANHQ_MCP_ENABLE_WRITES` / `LIVE_TRADING` env gate. Set
     * explicitly only where the caller owns the confirmation flow itself.
     */
    writesEnabled?: boolean;
}
/**
 * Permission policy for the agent and MCP surfaces.
 *
 * Two independent gates guard writes: the caller must hold the scope, *and*
 * live trading must be switched on. Read tools need only the scope.
 */
declare class Policy {
    readonly scopes: readonly AgentScope[];
    private readonly writesEnabledOverride?;
    constructor(options?: PolicyOptions);
    /** Read scopes only — the safe default for an unattended agent. */
    static readOnly(): Policy;
    /** Every scope. Writes still require the live-trading gate. */
    static full(): Policy;
    /**
     * Reads `DHANHQ_AGENT_SCOPES` (comma or space separated), defaulting to
     * read-only when unset.
     */
    static fromEnv(env?: NodeJS.ProcessEnv): Policy;
    allows(scope: AgentScope): boolean;
    /** Throws unless the policy holds `scope`. */
    require(scope: AgentScope): true;
    /** True only when both env flags are set, unless explicitly overridden. */
    writesEnabled(env?: NodeJS.ProcessEnv): boolean;
    /** Throws unless the policy holds `scope` *and* writes are enabled. */
    requireWrite(scope: AgentScope, env?: NodeJS.ProcessEnv): true;
}

type SkillParamType = "string" | "integer" | "number" | "boolean";
interface SkillParam {
    type: SkillParamType;
    required?: boolean;
    default?: unknown;
    description?: string;
}
interface SkillDefinition {
    name: string;
    description: string;
    /**
     * Defaults to the most conservative tier so a skill that forgets to declare
     * one fails safe rather than exposing an ungated write.
     */
    risk: ToolRisk;
    scope: AgentScope;
    params: Record<string, SkillParam>;
}
/** Accumulated state threaded through a skill's steps. */
interface SkillContext extends Record<string, unknown> {
    client: DhanClient;
}
interface SkillStep<TContext extends SkillContext = SkillContext> {
    name: string;
    run(context: TContext): Promise<TContext> | TContext;
}
/**
 * Base class for composable trading skills.
 *
 * A skill is a named sequence of steps over a shared context. Steps run in
 * declaration order and each returns the context for the next, so a skill
 * stays inspectable — the registry can list its steps without running it.
 *
 * Skills that build multi-leg positions stop at an `intent`: they resolve
 * strikes and premiums but never place orders, leaving execution to an
 * explicit, separately-gated call.
 */
declare abstract class Skill<TContext extends SkillContext = SkillContext> {
    abstract readonly definition: SkillDefinition;
    protected abstract steps(): Array<SkillStep<TContext>>;
    /** Runs every step in order and returns the final context. */
    call(args: Record<string, unknown>, client: DhanClient): Promise<TContext>;
    /** Step names in execution order, for tool listings and docs. */
    stepNames(): string[];
    protected buildContext(args: Record<string, unknown>, client: DhanClient): TContext;
    protected validate(context: Record<string, unknown>): void;
}
/** The call or put leg of a strike. */
declare function legSide(entry: StrikeEntry, optionType: "CE" | "PE"): OptionLeg | undefined;
declare function legSecurityId(entry: StrikeEntry, optionType: "CE" | "PE"): string | undefined;
declare function legPremium(entry: StrikeEntry, optionType: "CE" | "PE"): number | undefined;
interface ResolvedChain {
    securityId: string;
    spotPrice: number;
    chain: NormalizedOptionChain;
}
/**
 * Resolves a symbol to its spot price and option chain — the opening move of
 * every option-structure skill.
 */
declare function resolveChain(client: DhanClient, symbol: string, expiry: string, segment: string): Promise<ResolvedChain>;
/** {@link resolveChain} against the index segment. */
declare function resolveIndexChain(client: DhanClient, symbol: string, expiry: string): Promise<ResolvedChain>;
/** {@link resolveChain} against the NSE cash segment. */
declare function resolveEquityChain(client: DhanClient, symbol: string, expiry: string): Promise<ResolvedChain>;

interface SkillListing extends SkillDefinition {
    steps: string[];
}
/**
 * Named lookup for trading skills.
 *
 * Every registered skill is also surfaced as an MCP tool named
 * `dhan_skill_<name>`, gated by the risk and scope the skill declares.
 */
declare class SkillRegistry {
    private readonly skills;
    register(skill: Skill<SkillContext>): this;
    registerAll(skills: Array<Skill<SkillContext>>): this;
    has(name: string): boolean;
    find(name: string): Skill<SkillContext>;
    names(): string[];
    /** Every skill with its parameters and steps, for tool listings. */
    list(): SkillListing[];
    call(name: string, args: Record<string, unknown>, client: DhanClient): Promise<Record<string, unknown>>;
    clear(): void;
}

/** A JSON Schema fragment. Kept loose — schemas are data, not typed shapes. */
type JsonSchema = Record<string, unknown>;
interface ToolExample {
    input: Record<string, unknown>;
    output: string;
}
/**
 * A single tool exposed to MCP clients and agent runtimes.
 *
 * `scope` is the {@link Policy} scope required to call it; `risk` decides
 * whether the call also needs the live-trading gate.
 */
interface Tool {
    name: string;
    description: string;
    scope: AgentScope;
    risk: ToolRisk;
    inputSchema: JsonSchema;
    outputSchema?: JsonSchema;
    version: string;
    examples?: ToolExample[];
    handler(args: Record<string, unknown>): Promise<unknown>;
}
/** Client-facing metadata — everything except the handler. */
type ToolDescriptor = Omit<Tool, "handler">;
declare function describeTool(tool: Tool): ToolDescriptor;
/** True when calling this tool changes account state. */
declare function isWriteTool(tool: Pick<Tool, "risk">): boolean;

interface ToolRegistryOptions {
    client: DhanClient;
    policy?: Policy;
    skills?: SkillRegistry;
    pipeline?: Pipeline;
    riskLimits?: Partial<RiskLimits>;
}
interface Capabilities {
    toolCount: number;
    tools: ToolDescriptor[];
    scopes: string[];
    riskLevels: string[];
    writeEnabled: boolean;
    skills: string[];
}
/**
 * Registry and dispatcher for the tools exposed to MCP clients and agents.
 *
 * Holds the catalogue and enforces {@link Policy} on every call — a write tool
 * is checked against the live-trading gate as well as its scope. Handlers
 * themselves contain no permission logic, so there is exactly one place where
 * an agent call can be refused.
 */
declare class AgentToolRegistry {
    private readonly tools;
    private readonly policy;
    private readonly skills;
    constructor(options: ToolRegistryOptions);
    list(): ToolDescriptor[];
    names(): string[];
    find(name: string): Tool;
    /** Checks policy, then dispatches to the tool's handler. */
    execute(name: string, args?: Record<string, unknown>): Promise<unknown>;
    /** Tools this policy may call right now, write gate included. */
    availableTools(): ToolDescriptor[];
    /** Capability manifest for an agent runtime. */
    capabilities(): Capabilities;
    getPolicy(): Policy;
    getSkills(): SkillRegistry;
}
/** Adapts a {@link DhanClient} to the risk layer's data provider interface. */
declare function riskProviderFor(client: DhanClient): {
    positions: () => Promise<Record<string, unknown>[]>;
    funds: () => Promise<Record<string, unknown>>;
};

declare const SUPPORTED_PROTOCOL_VERSIONS: string[];
declare const DEFAULT_TOOL_CALL_TIMEOUT_MS = 15000;
/** JSON-RPC error codes used by this server. */
declare const ErrorCode: {
    readonly PARSE_ERROR: -32700;
    readonly INVALID_REQUEST: -32600;
    readonly METHOD_NOT_FOUND: -32601;
    readonly INVALID_PARAMS: -32602;
    readonly INTERNAL_ERROR: -32603;
};
/** A well-formed request whose params are invalid — maps to -32602. */
declare class InvalidParamsError extends Error {
}
/** An unrecognized JSON-RPC method — maps to -32601. */
declare class UnknownMethodError extends Error {
}
interface ResourceDefinition {
    uri: string;
    name: string;
    description: string;
    mimeType: string;
}
declare const RESOURCES: ResourceDefinition[];
interface PromptDefinition {
    name: string;
    description: string;
    arguments: Array<{
        name: string;
        description: string;
        required: boolean;
    }>;
}
declare const PROMPTS: PromptDefinition[];
interface McpServerOptions {
    client: DhanClient;
    registry?: AgentToolRegistry;
    input?: NodeJS.ReadableStream;
    output?: NodeJS.WritableStream;
    /** Per-call ceiling, so a rate-limit backoff cannot hang the client. */
    toolCallTimeoutMs?: number;
    serverName?: string;
    serverVersion?: string;
}
/**
 * MCP server speaking JSON-RPC 2.0 over stdio.
 *
 * Exposes the agent tool registry as MCP tools, account state as resources,
 * and a handful of prompt templates. Every tool call goes through
 * {@link AgentToolRegistry}, so the scope and live-trading gates apply here
 * exactly as they do to a direct caller.
 */
declare class McpServer {
    private readonly client;
    private readonly registry;
    private readonly input;
    private readonly output;
    private readonly toolCallTimeoutMs;
    private readonly serverName;
    private readonly serverVersion;
    private reader?;
    constructor(options: McpServerOptions);
    /** Reads newline-delimited JSON-RPC from stdin until the stream closes. */
    run(): Promise<void>;
    close(): void;
    /** Handles one JSON-RPC line. Exposed for testing. */
    handleLine(line: string): Promise<void>;
    private dispatch;
    private callTool;
    private readResource;
    private resourceData;
    private getPrompt;
    private promptText;
    private marketAnalysisPrompt;
    private negotiateVersion;
    private respondResult;
    private respondError;
    private write;
}

export { type SkillParam as $, type AlertModifyRequest as A, type BoLedgerResponse as B, type ChartsResponse as C, type DhanClientConfig as D, EdisFormRequest as E, type FundLimitResponse as F, type GetAlertResponse as G, HistoricalChartsRequest as H, IntradayChartsRequest as I, DhanClient as J, KnowYourMarginReq as K, SkillRegistry as L, type MultiScripMarginCalcRequest as M, Pipeline as N, OptionChartRequest as O, PositionConversionRequest as P, type Instrument as Q, Skill as R, ScriptItem as S, type Tool as T, type UserIPRequest as U, type SkillContext as V, type NormalizedOptionChain as W, type SkillStep as X, type SkillDefinition as Y, nearestStrike as Z, type JsonSchema as _, type AlertOrderResponse as a, type OhlcQuote as a$, Charts as a0, type RiskCheck as a1, type RiskFunds as a2, ALL_SCOPES as a3, type AgentScope as a4, AgentToolRegistry as a5, Alerts as a6, BASE_CHECKS as a7, BaseWS as a8, type CancelOrderRequest as a9, type InstrumentSubscription as aA, Instruments as aB, type InstrumentsConfig as aC, InvalidParamsError as aD, IpSetup as aE, LTPStore as aF, type LedgerRequest as aG, type LtpQuote as aH, type MarketDepthLevel as aI, type MarketDisconnectEvent as aJ, MarketFeed as aK, type MarketFeedInstruments as aL, type MarketFeedMode as aM, type MarketFeedResponse as aN, MarketFeedWS as aO, type MarketFeedWSOptions as aP, type MarketFullEvent as aQ, type MarketOiEvent as aR, type MarketPacketHeader as aS, type MarketPrevCloseEvent as aT, type MarketQuoteEvent as aU, type MarketTickerEvent as aV, McpServer as aW, type McpServerOptions as aX, type ModifyOrderRequest as aY, type ModifySuperOrderRequest as aZ, OPTION_CHECKS as a_, type CancelSuperOrderRequest as aa, type Capabilities as ab, type CorrelatedRequest as ac, DAILY_CHECKS as ad, DEFAULT_RISK_LIMITS as ae, DEFAULT_TOOL_CALL_TIMEOUT_MS as af, type DepthLevel as ag, DhanAuth as ah, type DhanAuthDependencies as ai, type DhanClientDependencies as aj, DhanWS as ak, type DhanWSOptions as al, Edis as am, type EnableAutoTokenManagementOptions as an, ErrorCode as ao, type ExchangeSegment as ap, type ExpiryListRequest as aq, type ExpiryListResponse as ar, ForeverOrders as as, type FullQuote as at, Funds as au, type GenerateAccessTokenRequest as av, GeneratedClient as aw, HttpClient as ax, type HttpClientDependencies as ay, type InstrumentSearchOptions as az, type AlertOrderRequest as b, UnknownMethodError as b$, OptionChain as b0, type OptionChainRequest as b1, type OptionGreeks as b2, type OptionLeg as b3, type OrderOperationResult as b4, type OrderResponse as b5, type OrderState as b6, OrderStore as b7, type OrderType as b8, type OrderUpdateEvent as b9, type RiskDataProvider as bA, type RiskInstrumentKind as bB, type RiskLimits as bC, type RiskOrderArgs as bD, type RiskPosition as bE, type RiskReport as bF, SUPPORTED_PROTOCOL_VERSIONS as bG, type SkillListing as bH, type SkillParamType as bI, Statements as bJ, type StrikeEntry as bK, type SuperOrderLeg as bL, type SuperOrderProductType as bM, type SuperOrderResponse as bN, type SuperOrderType as bO, SuperOrders as bP, type TickEvent as bQ, TokenManager as bR, type TokenResponse as bS, type ToolDescriptor as bT, type ToolExample as bU, type ToolRegistryOptions as bV, type ToolRisk as bW, type TradeHistoryRequest as bX, type TradeResponse as bY, TraderControls as bZ, type TransactionType as b_, OrderUpdateWS as ba, type OrderUpdateWSOptions as bb, Orders as bc, PROMPTS as bd, type PipelineConfig as be, type PipelineRunOptions as bf, type PlaceOrderRequest as bg, type PlaceSuperOrderRequest as bh, Policy as bi, type PolicyOptions as bj, Positions as bk, type ProductType as bl, Profile as bm, type ProfileResponse as bn, type PromptDefinition as bo, READ_SCOPES as bp, RESOURCES as bq, RateLimiter as br, type RateLimiterConfig as bs, type RawOptionChainResponse as bt, type ReadScope as bu, type RenewWebTokenRequest as bv, type RequestOptions as bw, type ResolvedChain as bx, type ResourceDefinition as by, type RiskContext as bz, type OptionChartResponse as c, type Validity as c0, WRITE_SCOPES as c1, type WebSocketLike as c2, type WriteScope as c3, describeTool as c4, findStrike as c5, isWriteTool as c6, legPremium as c7, legSecurityId as c8, legSide as c9, normalizeOptionChain as ca, parseCsv as cb, resolveChain as cc, resolveEquityChain as cd, resolveIndexChain as ce, riskProviderFor as cf, riskTypeFor as cg, type EdisFormResponse as d, EdisBulkFormRequest as e, type EdisQtyStatusResponse as f, GttModifyRequest as g, GttOrderStatusResponse as h, GttOrderResponse as i, GTTOrderModel as j, type KnowYourMarginResponse as k, type MultiScripMarginCalcResponse as l, type UserIPResponse as m, type GetIPDetailsResponse as n, PositionResponse as o, HoldingResponse as p, type ExitPnlResponse as q, type PnlBasedExitRequest as r, type PnlExitResponse as s, type KillSwitchResponse as t, AlertCondition as u, AlertOrder as v, type ChartData as w, type OptionChartPayload as x, type StoredSubscription as y, type MarketFeedEvent as z };
