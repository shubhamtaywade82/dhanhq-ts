/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FundLimitResponse } from '../models/FundLimitResponse';
import type { KnowYourMarginReq } from '../models/KnowYourMarginReq';
import type { KnowYourMarginResponse } from '../models/KnowYourMarginResponse';
import type { MultiScripMarginCalcRequest } from '../models/MultiScripMarginCalcRequest';
import type { MultiScripMarginCalcResponse } from '../models/MultiScripMarginCalcResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FundsMarginService {
    /**
     * margin calculator
     * Margin Calculation API lets you calculate span, exposure, var, brokerage, leverage, available  margin values for any type of order and instrument.
     * @param accessToken
     * @param requestBody
     * @returns KnowYourMarginResponse Successful operation
     * @throws ApiError
     */
    public static margincalculator(
        accessToken: string,
        requestBody: KnowYourMarginReq,
    ): CancelablePromise<KnowYourMarginResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/margincalculator',
            headers: {
                'access-token': accessToken,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * multi order margin calculator
     * The Multi Order Margin Calculator API allows users to calculate margin requirements for multiple scripts in a single request, including span, exposure, equity, FO, and commodity margins.
     * **Notes** :
     * Margin values returned are indicative and valid only for the current trading session.
     *
     * @param accessToken
     * @param requestBody
     * @returns MultiScripMarginCalcResponse Successful operation
     * @throws ApiError
     */
    public static margincalculatormulti(
        accessToken: string,
        requestBody: MultiScripMarginCalcRequest,
    ): CancelablePromise<MultiScripMarginCalcResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/margincalculator/multi',
            headers: {
                'access-token': accessToken,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * get fund limit details
     * Get all information of your trading account like balance, margin utilised, collateral, etc.
     * @param accessToken
     * @returns FundLimitResponse Successful operation
     * @throws ApiError
     */
    public static fundlimit(
        accessToken: string,
    ): CancelablePromise<FundLimitResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/fundlimit',
            headers: {
                'access-token': accessToken,
            },
        });
    }
}
