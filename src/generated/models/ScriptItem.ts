/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ScriptItem = {
    exchangeSegment?: ScriptItem.exchangeSegment;
    transactionType?: ScriptItem.transactionType;
    quantity?: number;
    productType?: ScriptItem.productType;
    securityId?: string;
    price?: number;
    triggerPrice?: number;
};
export namespace ScriptItem {
    export enum exchangeSegment {
        NSE_EQ = 'NSE_EQ',
        NSE_FNO = 'NSE_FNO',
        NSE_COMM = 'NSE_COMM',
        BSE_EQ = 'BSE_EQ',
        BSE_FNO = 'BSE_FNO',
        MCX_COMM = 'MCX_COMM',
    }
    export enum transactionType {
        BUY = 'BUY',
        SELL = 'SELL',
    }
    export enum productType {
        CNC = 'CNC',
        INTRADAY = 'INTRADAY',
        MARGIN = 'MARGIN',
        MTF = 'MTF',
        CO = 'CO',
        BO = 'BO',
    }
}

