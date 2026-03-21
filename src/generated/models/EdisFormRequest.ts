/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type EdisFormRequest = {
    isin: string;
    qty: number;
    exchange: EdisFormRequest.exchange;
    segment: EdisFormRequest.segment;
    bulk: boolean;
};
export namespace EdisFormRequest {
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

