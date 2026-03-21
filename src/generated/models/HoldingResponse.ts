/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type HoldingResponse = {
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
export namespace HoldingResponse {
    /**
     * Enum values is either NSE or BSE
     */
    export enum exchange {
        NSE = 'NSE',
        BSE = 'BSE',
        MCX = 'MCX',
        ALL = 'ALL',
    }
}

