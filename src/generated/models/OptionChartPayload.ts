/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Chart data for Put options, null if option_type is CE
 */
export type OptionChartPayload = {
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

