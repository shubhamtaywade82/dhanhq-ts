import { AxiosInstance } from 'axios';
import { EventEmitter } from 'events';
import { z, ZodError } from 'zod';

interface DhanClientConfig {
    token: string;
    clientId: string;
    baseURL?: string;
    timeoutMs?: number;
    rateLimitMinTimeMs?: number;
    wsUrl?: string;
    marketFeedUrl?: string;
    orderUpdateUrl?: string;
    wsReconnectDelayMs?: number;
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
    private readonly accessToken;
    private readonly clientId;
    constructor(config: DhanClientConfig, dependencies?: HttpClientDependencies);
    request<TResponse, TBody = unknown>(options: RequestOptions<TBody>): Promise<TResponse>;
    getClientId(): string;
    getAccessToken(): string;
    private execute;
    private toAxiosConfig;
    private shouldRetry;
    private normalizeError;
    private extractErrorPayload;
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

type OrderResponse$1 = {
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
    orderStatus?: OrderResponse$1.orderStatus;
    /**
     * Signifies the type of transaction whether it's BUY or SELL
     */
    transactionType?: OrderResponse$1.transactionType;
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
    exchangeSegment?: OrderResponse$1.exchangeSegment;
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
    productType?: OrderResponse$1.productType;
    /**
     * | **Enum Values**  | **Description**             |
     * |------------------|-----------------------------|
     * | LIMIT            | For Limit Order types       |
     * | MARKET           | For market Order types      |
     * | STOP_LOSS        | For Stop Loss Limit orders  |
     * | STOP_LOSS_MARKET | For Stop Loss Market orders |
     */
    orderType?: OrderResponse$1.orderType;
    /**
     * | **Enum Values** | **Description**       |
     * |-----------------|-----------------------|
     * | DAY             | Valid till end of day |
     * | IOC             | Immediate or Cancel   |
     */
    validity?: OrderResponse$1.validity;
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
    legName?: OrderResponse$1.legName;
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
    drvOptionType?: OrderResponse$1.drvOptionType;
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
declare namespace OrderResponse$1 {
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
type SuperOrderLeg$1 = {
    /**
     * Order specific identification generated by Dhan
     */
    orderId?: string;
    /**
     * Order leg where modification is to be done
     */
    legName?: SuperOrderLeg$1.legName;
    /**
     * Signifies the type of transaction whether it's BUY or SELL
     */
    transactionType?: SuperOrderLeg$1.transactionType;
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
    orderStatus?: SuperOrderLeg$1.orderStatus;
    /**
     * Price Jump by which Stop Loss should be trailed
     */
    trailingJump?: number;
};
declare namespace SuperOrderLeg$1 {
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

type SuperOrderResponse$1 = {
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
    orderStatus?: SuperOrderResponse$1.orderStatus;
    /**
     * The trading side of transaction
     */
    transactionType?: SuperOrderResponse$1.transactionType;
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
    exchangeSegment?: SuperOrderResponse$1.exchangeSegment;
    /**
     * | **Enum Values** | **Description**                                |
     * |-----------------|------------------------------------------------|
     * | CNC             | Cash & Carry for equity deliveries             |
     * | INTRADAY        | Intraday for Equity, Futures & Options         |
     * | MARGIN          | Carry Forward in Futures & Options             |
     * | MTF             | Margin Traded Fund                             |
     *
     */
    productType?: SuperOrderResponse$1.productType;
    /**
     * | **Enum Values**  | **Description**             |
     * |------------------|-----------------------------|
     * | LIMIT            | For Limit Order types       |
     * | MARKET           | For market Order types      |
     */
    orderType?: SuperOrderResponse$1.orderType;
    /**
     * | **Enum Values** | **Description**       |
     * |-----------------|-----------------------|
     * | DAY             | Valid till end of day |
     * | IOC             | Immediate or Cancel   |
     */
    validity?: SuperOrderResponse$1.validity;
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
    legName?: SuperOrderResponse$1.legName;
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
    legDetails?: Array<SuperOrderLeg$1>;
    /**
     * Average price at which order is traded
     */
    averageTradedPrice?: number;
    /**
     * Quantity of order traded on Exchange
     */
    filledQty?: number;
};
declare namespace SuperOrderResponse$1 {
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

type TradeResponse$1 = {
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
    transactionType?: TradeResponse$1.transactionType;
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
    exchangeSegment?: TradeResponse$1.exchangeSegment;
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
    productType?: TradeResponse$1.productType;
    /**
     * | **Enum Values**  | **Description**             |
     * |------------------|-----------------------------|
     * | LIMIT            | For Limit Order types       |
     * | MARKET           | For market Order types      |
     * | STOP_LOSS        | For Stop Loss Limit orders  |
     * | STOP_LOSS_MARKET | For Stop Loss Market orders |
     */
    orderType?: TradeResponse$1.orderType;
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
    drvOptionType?: TradeResponse$1.drvOptionType;
    /**
     * For Options, Strike Price
     */
    drvStrikePrice?: number;
};
declare namespace TradeResponse$1 {
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
    static getorderbyorderid(accessToken: string, orderId: string): CancelablePromise<OrderResponse$1>;
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
    static getorders(accessToken: string): CancelablePromise<Array<OrderResponse$1>>;
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
    static getalltrades(accessToken: string): CancelablePromise<Array<TradeResponse$1>>;
    /**
     * get trade by order id
     * The api allows user to retrieve trade details using an order id. Often during partial trades or Bracket/ Cover Orders, traders get confused in reading trade from tradebook. The response of this API will include all the trades generated for a particular order id.
     * @param accessToken
     * @param orderId
     * @returns TradeResponse Successful operation
     * @throws ApiError
     */
    static gettradebyorderid(accessToken: string, orderId: string): CancelablePromise<Array<TradeResponse$1>>;
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
    static getorderbycorrelationid(accessToken: string, correlationId: string): CancelablePromise<OrderResponse$1>;
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
    static getsuperorders(accessToken: string): CancelablePromise<Array<SuperOrderResponse$1>>;
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
type index_AlertModifyRequest = AlertModifyRequest;
declare const index_AlertOrder: typeof AlertOrder;
type index_AlertOrderRequest = AlertOrderRequest;
type index_AlertOrderResponse = AlertOrderResponse;
type index_ApiError = ApiError;
declare const index_ApiError: typeof ApiError;
type index_BoLedgerResponse = BoLedgerResponse;
type index_CancelError = CancelError;
declare const index_CancelError: typeof CancelError;
type index_CancelablePromise<T> = CancelablePromise<T>;
declare const index_CancelablePromise: typeof CancelablePromise;
type index_ChartData = ChartData;
type index_ChartsResponse = ChartsResponse;
type index_ConditionalTriggersService = ConditionalTriggersService;
declare const index_ConditionalTriggersService: typeof ConditionalTriggersService;
type index_DataApiSService = DataApiSService;
declare const index_DataApiSService: typeof DataApiSService;
declare const index_EdisBulkFormRequest: typeof EdisBulkFormRequest;
declare const index_EdisFormRequest: typeof EdisFormRequest;
type index_EdisFormResponse = EdisFormResponse;
type index_EdisQtyStatusResponse = EdisQtyStatusResponse;
type index_EdisService = EdisService;
declare const index_EdisService: typeof EdisService;
type index_ExitPnlResponse = ExitPnlResponse;
type index_ForeverOrderService = ForeverOrderService;
declare const index_ForeverOrderService: typeof ForeverOrderService;
type index_FundLimitResponse = FundLimitResponse;
type index_FundsMarginService = FundsMarginService;
declare const index_FundsMarginService: typeof FundsMarginService;
declare const index_GTTOrderModel: typeof GTTOrderModel;
type index_GetAlertResponse = GetAlertResponse;
type index_GetIPDetailsResponse = GetIPDetailsResponse;
declare const index_GttModifyRequest: typeof GttModifyRequest;
declare const index_GttOrderResponse: typeof GttOrderResponse;
declare const index_GttOrderStatusResponse: typeof GttOrderStatusResponse;
declare const index_HistoricalChartsRequest: typeof HistoricalChartsRequest;
declare const index_HoldingResponse: typeof HoldingResponse;
declare const index_IntradayChartsRequest: typeof IntradayChartsRequest;
type index_IpSetupService = IpSetupService;
declare const index_IpSetupService: typeof IpSetupService;
type index_KillSwitchResponse = KillSwitchResponse;
declare const index_KnowYourMarginReq: typeof KnowYourMarginReq;
type index_KnowYourMarginResponse = KnowYourMarginResponse;
type index_MultiScripMarginCalcRequest = MultiScripMarginCalcRequest;
type index_MultiScripMarginCalcResponse = MultiScripMarginCalcResponse;
declare const index_OpenAPI: typeof OpenAPI;
type index_OpenAPIConfig = OpenAPIConfig;
type index_OptionChartPayload = OptionChartPayload;
declare const index_OptionChartRequest: typeof OptionChartRequest;
type index_OptionChartResponse = OptionChartResponse;
declare const index_OrderModifyRequest: typeof OrderModifyRequest;
declare const index_OrderRequest: typeof OrderRequest;
declare const index_OrderStatusResponse: typeof OrderStatusResponse;
type index_OrdersService = OrdersService;
declare const index_OrdersService: typeof OrdersService;
type index_PnlBasedExitRequest = PnlBasedExitRequest;
type index_PnlExitResponse = PnlExitResponse;
declare const index_PositionConversionRequest: typeof PositionConversionRequest;
declare const index_PositionResponse: typeof PositionResponse;
type index_PositionsPortfolioService = PositionsPortfolioService;
declare const index_PositionsPortfolioService: typeof PositionsPortfolioService;
declare const index_ScriptItem: typeof ScriptItem;
type index_StatementsService = StatementsService;
declare const index_StatementsService: typeof StatementsService;
declare const index_SuperModifyRequest: typeof SuperModifyRequest;
declare const index_SuperOrderRequest: typeof SuperOrderRequest;
type index_SuperOrderService = SuperOrderService;
declare const index_SuperOrderService: typeof SuperOrderService;
declare const index_TradeHistoryResponseModel: typeof TradeHistoryResponseModel;
type index_TraderSControlService = TraderSControlService;
declare const index_TraderSControlService: typeof TraderSControlService;
type index_UserIPRequest = UserIPRequest;
type index_UserIPResponse = UserIPResponse;
declare namespace index {
  export { index_AlertCondition as AlertCondition, type index_AlertModifyRequest as AlertModifyRequest, index_AlertOrder as AlertOrder, type index_AlertOrderRequest as AlertOrderRequest, type index_AlertOrderResponse as AlertOrderResponse, index_ApiError as ApiError, type index_BoLedgerResponse as BoLedgerResponse, index_CancelError as CancelError, index_CancelablePromise as CancelablePromise, type index_ChartData as ChartData, type index_ChartsResponse as ChartsResponse, index_ConditionalTriggersService as ConditionalTriggersService, index_DataApiSService as DataApiSService, index_EdisBulkFormRequest as EdisBulkFormRequest, index_EdisFormRequest as EdisFormRequest, type index_EdisFormResponse as EdisFormResponse, type index_EdisQtyStatusResponse as EdisQtyStatusResponse, index_EdisService as EdisService, type index_ExitPnlResponse as ExitPnlResponse, index_ForeverOrderService as ForeverOrderService, type index_FundLimitResponse as FundLimitResponse, index_FundsMarginService as FundsMarginService, index_GTTOrderModel as GTTOrderModel, type index_GetAlertResponse as GetAlertResponse, type index_GetIPDetailsResponse as GetIPDetailsResponse, index_GttModifyRequest as GttModifyRequest, index_GttOrderResponse as GttOrderResponse, index_GttOrderStatusResponse as GttOrderStatusResponse, index_HistoricalChartsRequest as HistoricalChartsRequest, index_HoldingResponse as HoldingResponse, index_IntradayChartsRequest as IntradayChartsRequest, index_IpSetupService as IpSetupService, type index_KillSwitchResponse as KillSwitchResponse, index_KnowYourMarginReq as KnowYourMarginReq, type index_KnowYourMarginResponse as KnowYourMarginResponse, type index_MultiScripMarginCalcRequest as MultiScripMarginCalcRequest, type index_MultiScripMarginCalcResponse as MultiScripMarginCalcResponse, index_OpenAPI as OpenAPI, type index_OpenAPIConfig as OpenAPIConfig, type index_OptionChartPayload as OptionChartPayload, index_OptionChartRequest as OptionChartRequest, type index_OptionChartResponse as OptionChartResponse, index_OrderModifyRequest as OrderModifyRequest, index_OrderRequest as OrderRequest, OrderResponse$1 as OrderResponse, index_OrderStatusResponse as OrderStatusResponse, index_OrdersService as OrdersService, type index_PnlBasedExitRequest as PnlBasedExitRequest, type index_PnlExitResponse as PnlExitResponse, index_PositionConversionRequest as PositionConversionRequest, index_PositionResponse as PositionResponse, index_PositionsPortfolioService as PositionsPortfolioService, index_ScriptItem as ScriptItem, index_StatementsService as StatementsService, index_SuperModifyRequest as SuperModifyRequest, SuperOrderLeg$1 as SuperOrderLeg, index_SuperOrderRequest as SuperOrderRequest, SuperOrderResponse$1 as SuperOrderResponse, index_SuperOrderService as SuperOrderService, index_TradeHistoryResponseModel as TradeHistoryResponseModel, TradeResponse$1 as TradeResponse, index_TraderSControlService as TraderSControlService, type index_UserIPRequest as UserIPRequest, type index_UserIPResponse as UserIPResponse };
}

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

declare class IpSetup {
    private readonly httpClient;
    constructor(httpClient: HttpClient);
    get(): Promise<GetIPDetailsResponse>;
    set(request: UserIPRequest): Promise<UserIPResponse>;
    modify(request: UserIPRequest): Promise<UserIPResponse>;
}

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
    token: string;
    clientId: string;
    url?: string;
    reconnectDelayMs?: number;
    mode?: MarketFeedMode;
    webSocketFactory?: (url: string) => WebSocketLike;
}
interface OrderUpdateWSOptions {
    token: string;
    clientId: string;
    url?: string;
    reconnectDelayMs?: number;
    webSocketFactory?: (url: string) => WebSocketLike;
}
interface DhanWSOptions {
    token: string;
    clientId: string;
    marketFeedUrl?: string;
    orderUpdateUrl?: string;
    reconnectDelayMs?: number;
    marketSocketFactory?: (url: string) => WebSocketLike;
    orderSocketFactory?: (url: string) => WebSocketLike;
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
    private readonly url;
    private readonly reconnectDelayMs;
    private readonly webSocketFactory;
    private reconnectTimer?;
    protected connection?: WebSocketLike;
    protected manuallyClosed: boolean;
    protected reconnectAttempts: number;
    constructor(url: string, reconnectDelayMs: number, webSocketFactory: (url: string) => WebSocketLike);
    connect(): void;
    disconnect(): void;
    protected send(payload: string | Buffer): void;
    private bindConnection;
    private scheduleReconnect;
    protected abstract onOpen(): void;
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
    private readonly token;
    private readonly clientId;
    private readonly orderStore;
    constructor(options: OrderUpdateWSOptions, orderStore: OrderStore);
    protected onOpen(): void;
    protected onMessage(data: unknown): void;
    protected onClose(): void;
}

declare class DhanWS {
    readonly ltpStore: LTPStore;
    readonly orderStore: OrderStore;
    readonly market: MarketFeedWS;
    readonly orders: OrderUpdateWS;
    constructor(options: DhanWSOptions);
    connect(): void;
    disconnect(): void;
    subscribe(instruments: InstrumentSubscription[]): void;
}

declare function parseMarketFeedPacket(packet: Buffer, subscriptions: StoredSubscription[]): MarketFeedEvent | null;

declare function splitPackets(buffer: Buffer): Buffer[];

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
    readonly ws: DhanWS;
    constructor(config: DhanClientConfig, dependencies?: DhanClientDependencies);
    getConfig(): DhanClientConfig;
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

declare class NetworkError extends DhanError {
    constructor(message: string, cause?: unknown);
}

declare class RateLimitError extends DhanError {
    constructor(message?: string, cause?: unknown);
}

declare class ValidationError extends DhanError {
    readonly issues: ZodError["issues"];
    constructor(error: ZodError);
}

export { Alerts, ApiResponseError, BaseWS, type CancelOrderRequest, type CancelSuperOrderRequest, Charts, type CorrelatedRequest, DhanClient, type DhanClientConfig, type DhanClientDependencies, DhanError, DhanWS, type DhanWSOptions, Edis, type ExchangeSegment, ForeverOrders, Funds, index as Generated, GeneratedClient, HttpClient, type HttpClientDependencies, type InstrumentSubscription, IpSetup, LTPStore, type LedgerRequest, type MarketDepthLevel, type MarketDisconnectEvent, type MarketFeedEvent, type MarketFeedMode, MarketFeedWS, type MarketFeedWSOptions, type MarketFullEvent, type MarketOiEvent, type MarketPacketHeader, type MarketPrevCloseEvent, type MarketQuoteEvent, type MarketTickerEvent, type ModifyOrderRequest, type ModifySuperOrderRequest, NetworkError, type OrderOperationResult, type OrderResponse, type OrderState, OrderStore, type OrderType, type OrderUpdateEvent, OrderUpdateWS, type OrderUpdateWSOptions, Orders, type PlaceOrderRequest, type PlaceSuperOrderRequest, Positions, type ProductType, RateLimitError, RateLimiter, type RateLimiterConfig, type RequestOptions, Statements, type StoredSubscription, type SuperOrderLeg, type SuperOrderProductType, type SuperOrderResponse, type SuperOrderType, SuperOrders, type TickEvent, type TradeHistoryRequest, type TradeResponse, TraderControls, type TransactionType, ValidationError, type Validity, type WebSocketLike, orderSchema, parseMarketFeedPacket, splitPackets, superOrderSchema };
