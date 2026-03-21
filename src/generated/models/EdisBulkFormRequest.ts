/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type EdisBulkFormRequest = {
    isin: Array<string>;
    exchange: EdisBulkFormRequest.exchange;
    segment: EdisBulkFormRequest.segment;
};
export namespace EdisBulkFormRequest {
    export enum exchange {
        NSE = 'NSE',
        BSE = 'BSE',
        MCX = 'MCX',
        ALL = 'ALL',
    }
    export enum segment {
        EQ = 'EQ',
        COMM = 'COMM',
        FNO = 'FNO',
    }
}

