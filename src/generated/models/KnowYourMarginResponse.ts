/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type KnowYourMarginResponse = {
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

