/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type IntradayChartsRequest = {
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
export namespace IntradayChartsRequest {
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
     * Represents time interval in minute, refer charts annexure for possible values.
     */
    export enum interval {
        _1 = '1',
        _5 = '5',
        _15 = '15',
        _25 = '25',
        _60 = '60',
    }
}

