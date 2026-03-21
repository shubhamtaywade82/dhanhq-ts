/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BoLedgerResponse } from '../models/BoLedgerResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StatementsService {
    /**
     * get ledger report
     * The api allows user to fetch trading account ledger with all credit and debit transaction details
     * @param accessToken
     * @param fromDate date format : yyyy-MM-dd
     * @param toDate date format : yyyy-MM-dd
     * @returns BoLedgerResponse Successful operation
     * @throws ApiError
     */
    public static ledger(
        accessToken: string,
        fromDate?: string,
        toDate?: string,
    ): CancelablePromise<BoLedgerResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/ledger',
            headers: {
                'access-token': accessToken,
            },
            query: {
                'from-date': fromDate,
                'to-date': toDate,
            },
        });
    }
}
