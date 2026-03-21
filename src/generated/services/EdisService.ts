/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EdisBulkFormRequest } from '../models/EdisBulkFormRequest';
import type { EdisFormRequest } from '../models/EdisFormRequest';
import type { EdisFormResponse } from '../models/EdisFormResponse';
import type { EdisQtyStatusResponse } from '../models/EdisQtyStatusResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class EdisService {
    /**
     * generate edis form
     * Retrieve escaped html form of CDSL and enter T-PIN to mark the stock for EDIS approval. Partner has to render this form at their end to unescape.
     * @param accessToken
     * @param requestBody
     * @returns EdisFormResponse Successful operation
     * @throws ApiError
     */
    public static edisform(
        accessToken: string,
        requestBody: EdisFormRequest,
    ): CancelablePromise<EdisFormResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/edis/form',
            headers: {
                'access-token': accessToken,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * generate bulk edis form
     * Retrieve escaped html form of CDSL and enter T-PIN to mark the stock for EDIS approval. Partner has to render this form at their end to unescape.
     * @param accessToken
     * @param requestBody
     * @returns EdisFormResponse Successful operation
     * @throws ApiError
     */
    public static bulkedisform(
        accessToken: string,
        requestBody: EdisBulkFormRequest,
    ): CancelablePromise<EdisFormResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/edis/bulkform',
            headers: {
                'access-token': accessToken,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * generate edis T-pin
     * Get T-pin on registered mobile number using this API.
     * @param accessToken
     * @returns any Successful operation
     * @throws ApiError
     */
    public static edistpin(
        accessToken: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/edis/tpin',
            headers: {
                'access-token': accessToken,
            },
        });
    }
    /**
     * get edis authorized quantity
     * The api allows user to check the edis status of the securities. User have to enter isin of the stock. An international securities identification number (ISIN) is a 12-digit alphanumeric code that uniquely identifies a specific security. You can get ISIN of portfolio stocks, in response of holdings api.Or use ALL as a special case to query all holdings' edis auth status
     * @param accessToken
     * @param isin
     * @returns EdisQtyStatusResponse Successful operation
     * @throws ApiError
     */
    public static edisqtystatus(
        accessToken: string,
        isin: string,
    ): CancelablePromise<EdisQtyStatusResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/edis/inquire/{isin}',
            path: {
                'isin': isin,
            },
            headers: {
                'access-token': accessToken,
            },
        });
    }
}
