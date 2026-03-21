/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type HistoricalChartsRequest = {
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
export namespace HistoricalChartsRequest {
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
}

