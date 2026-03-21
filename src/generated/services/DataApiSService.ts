/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChartsResponse } from '../models/ChartsResponse';
import type { HistoricalChartsRequest } from '../models/HistoricalChartsRequest';
import type { IntradayChartsRequest } from '../models/IntradayChartsRequest';
import type { OptionChartRequest } from '../models/OptionChartRequest';
import type { OptionChartResponse } from '../models/OptionChartResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DataApiSService {
    /**
     * fetch expired option data
     * Fetch minute-wise rolling option chart data of expired contracts - including OHLC, volume, IV based on strike.
     * @param accessToken
     * @param requestBody
     * @returns OptionChartResponse Successful operation
     * @throws ApiError
     */
    public static optionchart(
        accessToken: string,
        requestBody: OptionChartRequest,
    ): CancelablePromise<OptionChartResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/charts/rollingoption',
            headers: {
                'access-token': accessToken,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * fetch OHLC for minute timeframe
     * Retrieve OHLC & Volume of minute candle for desired instrument for current day. This data available for all segments including futures & options.
     * @param accessToken
     * @param requestBody
     * @returns ChartsResponse Successful operation
     * @throws ApiError
     */
    public static intradaycharts(
        accessToken: string,
        requestBody: IntradayChartsRequest,
    ): CancelablePromise<ChartsResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/charts/intraday',
            headers: {
                'access-token': accessToken,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * fetch OHLC for daily candle
     * Retrieve OHLC & Volume of daily candle for desired instrument. The data for any scrip is available back upto the date of its inception.
     * @param accessToken
     * @param requestBody
     * @returns ChartsResponse Successful operation
     * @throws ApiError
     */
    public static historicalcharts(
        accessToken: string,
        requestBody: HistoricalChartsRequest,
    ): CancelablePromise<ChartsResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/charts/historical',
            headers: {
                'access-token': accessToken,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
