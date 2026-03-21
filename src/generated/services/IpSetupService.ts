/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetIPDetailsResponse } from '../models/GetIPDetailsResponse';
import type { UserIPRequest } from '../models/UserIPRequest';
import type { UserIPResponse } from '../models/UserIPResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class IpSetupService {
    /**
     * modify the static IP
     * You can use this API to modify the Primary & Secondary IP for your account. You can modify the set IP only once in a specified period
     * @param accessToken
     * @param requestBody
     * @returns UserIPResponse Successful operation
     * @throws ApiError
     */
    public static modifyIp(
        accessToken: string,
        requestBody: UserIPRequest,
    ): CancelablePromise<UserIPResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/ip/modifyIP',
            headers: {
                'access-token': accessToken,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * static IP Setup
     * You can use this API to set the Primary & Secondary IP to be mapped to your account in order to enable Order Placement.
     * @param accessToken
     * @param requestBody
     * @returns UserIPResponse Successful operation
     * @throws ApiError
     */
    public static setIp(
        accessToken: string,
        requestBody: UserIPRequest,
    ): CancelablePromise<UserIPResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/ip/setIP',
            headers: {
                'access-token': accessToken,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * get the static IP
     * Fetch the current Primary & Secondary IP for your account.
     * @param accessToken
     * @returns GetIPDetailsResponse Successful operation
     * @throws ApiError
     */
    public static getIp(
        accessToken: string,
    ): CancelablePromise<GetIPDetailsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/ip/getIP',
            headers: {
                'access-token': accessToken,
            },
        });
    }
}
