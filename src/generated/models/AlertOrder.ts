/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * List of orders to execute when alert is triggered
 */
export type AlertOrder = {
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
export namespace AlertOrder {
    /**
     * Type of transaction
     */
    export enum transactionType {
        BUY = 'BUY',
        SELL = 'SELL',
    }
    /**
     * The exchange where the transaction takes place
     */
    export enum exchangeSegment {
        NSE_EQ = 'NSE_EQ',
        NSE_FNO = 'NSE_FNO',
        NSE_COMM = 'NSE_COMM',
        BSE_EQ = 'BSE_EQ',
        BSE_FNO = 'BSE_FNO',
        MCX_COMM = 'MCX_COMM',
    }
    /**
     * Product type
     */
    export enum productType {
        CNC = 'CNC',
        INTRADAY = 'INTRADAY',
        MARGIN = 'MARGIN',
        MTF = 'MTF',
        CO = 'CO',
        BO = 'BO',
    }
    /**
     * Type of order
     */
    export enum orderType {
        LIMIT = 'LIMIT',
        MARKET = 'MARKET',
        STOP_LOSS = 'STOP_LOSS',
        STOP_LOSS_MARKET = 'STOP_LOSS_MARKET',
    }
    /**
     * Order validity
     */
    export enum validity {
        DAY = 'DAY',
        IOC = 'IOC',
    }
}

