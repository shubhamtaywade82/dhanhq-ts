/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Alert condition details
 */
export type AlertCondition = {
    /**
     * Type of comparison
     */
    comparisonType?: AlertCondition.comparisonType;
    /**
     * The exchange where the condition is checked
     */
    exchangeSegment?: AlertCondition.exchangeSegment;
    /**
     * Condition security
     */
    securityId: string;
    /**
     * Name of the indicator
     */
    indicatorName?: AlertCondition.indicatorName;
    /**
     * Time frame for technical indicators
     */
    timeFrame?: AlertCondition.timeFrame;
    /**
     * Comparison operator
     */
    operator?: AlertCondition.operator;
    /**
     * Target value for comparison
     */
    comparingValue?: number;
    /**
     * The technical indicator to compare against when using TechnicalWithIndicator conditions.
     * This represents the right-hand side (RHS) indicator in a technical comparison
     * For e.g. SMA_20 crossing above SMA_50
     */
    comparingIndicatorName?: AlertCondition.comparingIndicatorName;
    /**
     * Expiry date of alert
     */
    expDate?: string;
    /**
     * Evaluation frequency
     */
    frequency?: AlertCondition.frequency;
    /**
     * User-provided note
     * For eg. Price crossing SMA
     */
    userNote?: string;
};
export namespace AlertCondition {
    /**
     * Type of comparison
     */
    export enum comparisonType {
        TECHNICAL_WITH_VALUE = 'TECHNICAL_WITH_VALUE',
        TECHNICAL_WITH_INDICATOR = 'TECHNICAL_WITH_INDICATOR',
        TECHNICAL_WITH_CLOSE = 'TECHNICAL_WITH_CLOSE',
        PRICE_WITH_VALUE = 'PRICE_WITH_VALUE',
    }
    /**
     * The exchange where the condition is checked
     */
    export enum exchangeSegment {
        NSE_EQ = 'NSE_EQ',
        BSE_EQ = 'BSE_EQ',
        IDX_I = 'IDX_I',
    }
    /**
     * Name of the indicator
     */
    export enum indicatorName {
        SMA_5 = 'SMA_5',
        SMA_10 = 'SMA_10',
        SMA_20 = 'SMA_20',
        SMA_50 = 'SMA_50',
        SMA_100 = 'SMA_100',
        SMA_200 = 'SMA_200',
        EMA_5 = 'EMA_5',
        EMA_10 = 'EMA_10',
        EMA_20 = 'EMA_20',
        EMA_50 = 'EMA_50',
        EMA_100 = 'EMA_100',
        EMA_200 = 'EMA_200',
        BB_UPPER = 'BB_UPPER',
        BB_LOWER = 'BB_LOWER',
        RSI_14 = 'RSI_14',
        ATR_14 = 'ATR_14',
        STOCHASTIC = 'STOCHASTIC',
        STOCHRSI_14 = 'STOCHRSI_14',
        MACD_26 = 'MACD_26',
        MACD_12 = 'MACD_12',
        MACD_HIST = 'MACD_HIST',
    }
    /**
     * Time frame for technical indicators
     */
    export enum timeFrame {
        DAY = 'DAY',
        ONE_MIN = 'ONE_MIN',
        FIVE_MIN = 'FIVE_MIN',
        FIFTEEN_MIN = 'FIFTEEN_MIN',
    }
    /**
     * Comparison operator
     */
    export enum operator {
        CROSSING_UP = 'CROSSING_UP',
        CROSSING_DOWN = 'CROSSING_DOWN',
        CROSSING_ANY_SIDE = 'CROSSING_ANY_SIDE',
        GREATER_THAN = 'GREATER_THAN',
        LESS_THAN = 'LESS_THAN',
        GREATER_THAN_EQUAL = 'GREATER_THAN_EQUAL',
        LESS_THAN_EQUAL = 'LESS_THAN_EQUAL',
        EQUAL = 'EQUAL',
        NOT_EQUAL = 'NOT_EQUAL',
    }
    /**
     * The technical indicator to compare against when using TechnicalWithIndicator conditions.
     * This represents the right-hand side (RHS) indicator in a technical comparison
     * For e.g. SMA_20 crossing above SMA_50
     */
    export enum comparingIndicatorName {
        SMA_5 = 'SMA_5',
        SMA_10 = 'SMA_10',
        SMA_20 = 'SMA_20',
        SMA_50 = 'SMA_50',
        SMA_100 = 'SMA_100',
        SMA_200 = 'SMA_200',
        EMA_5 = 'EMA_5',
        EMA_10 = 'EMA_10',
        EMA_20 = 'EMA_20',
        EMA_50 = 'EMA_50',
        EMA_100 = 'EMA_100',
        EMA_200 = 'EMA_200',
        BB_UPPER = 'BB_UPPER',
        BB_LOWER = 'BB_LOWER',
        RSI_14 = 'RSI_14',
        ATR_14 = 'ATR_14',
        STOCHASTIC = 'STOCHASTIC',
        STOCHRSI_14 = 'STOCHRSI_14',
        MACD_26 = 'MACD_26',
        MACD_12 = 'MACD_12',
        MACD_HIST = 'MACD_HIST',
    }
    /**
     * Evaluation frequency
     */
    export enum frequency {
        ONCE = 'ONCE',
    }
}

