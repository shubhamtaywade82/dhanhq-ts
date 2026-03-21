/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HoldingResponse } from '../models/HoldingResponse';
import type { PositionConversionRequest } from '../models/PositionConversionRequest';
import type { PositionResponse } from '../models/PositionResponse';
import type { UserIPResponse } from '../models/UserIPResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PositionsPortfolioService {
    /**
     * convert position
     * Users can convert their open position from intraday to delivery or delivery to intraday.
     * @param accessToken
     * @param requestBody
     * @returns any Successful operation
     * @throws ApiError
     */
    public static convertposition(
        accessToken: string,
        requestBody: PositionConversionRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/positions/convert',
            headers: {
                'access-token': accessToken,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * get current positions
     * Users can retrieve a list of all open positions for the day. This includes all F&O carryforward positions as well.
     * @param accessToken
     * @returns PositionResponse Successful operation
     * @throws ApiError
     */
    public static getpositions(
        accessToken: string,
    ): CancelablePromise<Array<PositionResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/positions',
            headers: {
                'access-token': accessToken,
            },
        });
    }
    /**
     * exit all position
     * The Exit All Position API allows users to exit all active positions and cancel all open orders for the authenticated account.
     * Note: All open orders and positions are exited for the current trading day only.
     *
     * @param accessToken
     * @returns UserIPResponse Successful operation
     * @throws ApiError
     */
    public static orderExitAll(
        accessToken: string,
    ): CancelablePromise<UserIPResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/positions',
            headers: {
                'access-token': accessToken,
            },
        });
    }
    /**
     * get current holdings
     * Users can retrieve all holdings bought/sold in previous trading sessions. All T1 and delivered quantities can be fetched.
     * @param accessToken
     * @returns HoldingResponse Successful operation
     * @throws ApiError
     */
    public static getholdings(
        accessToken: string,
    ): CancelablePromise<Array<HoldingResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/holdings',
            headers: {
                'access-token': accessToken,
            },
        });
    }
}
