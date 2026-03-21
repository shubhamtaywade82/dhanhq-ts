/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type OptionChartRequest = {
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
export namespace OptionChartRequest {
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
    export enum exchangeSegment {
        NSE_EQ = 'NSE_EQ',
        NSE_FNO = 'NSE_FNO',
        BSE_EQ = 'BSE_EQ',
        BSE_FNO = 'BSE_FNO',
        MCX_COMM = 'MCX_COMM',
        IDX_I = 'IDX_I',
    }
    /**
     * Represents time interval in minute, refer charts annexure for possible values.
     */
    export enum interval {
        _1 = '1',
        _5 = '5',
        _15 = '15',
        _25 = '25',
        _60 = '60',
    }
    /**
     * Represents the security instrument type, refer charts annexure for possible values.
     */
    export enum instrument {
        INDEX = 'INDEX',
        FUTIDX = 'FUTIDX',
        OPTIDX = 'OPTIDX',
        EQUITY = 'EQUITY',
        FUTSTK = 'FUTSTK',
        OPTSTK = 'OPTSTK',
        FUTCOM = 'FUTCOM',
        OPTFUT = 'OPTFUT',
    }
    /**
     * Expiry flag indicating type of expiry
     */
    export enum expiryFlag {
        MONTH = 'MONTH',
        WEEK = 'WEEK',
    }
    /**
     * Expiry code value
     */
    export enum expiryCode {
        '_1' = 1,
        '_2' = 2,
        '_3' = 3,
    }
    /**
     * Option Type
     */
    export enum drvOptionType {
        CALL = 'CALL',
        PUT = 'PUT',
    }
    /**
     * Requested data type
     */
    export enum requiredData {
        OPEN = 'open',
        HIGH = 'high',
        LOW = 'low',
        CLOSE = 'close',
        IV = 'iv',
        VOLUME = 'volume',
        STRIKE = 'strike',
        OI = 'oi',
        SPOT = 'spot',
    }
}

