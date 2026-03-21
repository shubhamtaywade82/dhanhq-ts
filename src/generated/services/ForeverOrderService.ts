/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GttModifyRequest } from '../models/GttModifyRequest';
import type { GTTOrderModel } from '../models/GTTOrderModel';
import type { GttOrderResponse } from '../models/GttOrderResponse';
import type { GttOrderStatusResponse } from '../models/GttOrderStatusResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ForeverOrderService {
    /**
     * modify pending forever order
     * The api allows you to modify pending forever order in orderbook. The fields that can be modified are price, quantity and order type.
     * @param accessToken
     * @param orderId
     * @param requestBody
     * @returns GttOrderStatusResponse Successful operation
     * @throws ApiError
     */
    public static modifyforeverorder(
        accessToken: string,
        orderId: string,
        requestBody: GttModifyRequest,
    ): CancelablePromise<GttOrderStatusResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/forever/orders/{order-id}',
            path: {
                'order-id': orderId,
            },
            headers: {
                'access-token': accessToken,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * cancel given forever order
     * The api allows you to cancel existing forever order.
     * @param accessToken
     * @param orderId
     * @returns GttOrderStatusResponse Successful operation
     * @throws ApiError
     */
    public static cancelforeverorder(
        accessToken: string,
        orderId: string,
    ): CancelablePromise<GttOrderStatusResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/forever/orders/{order-id}',
            path: {
                'order-id': orderId,
            },
            headers: {
                'access-token': accessToken,
            },
        });
    }
    /**
     * get forever orders list
     * The api allows you to retrieve an array of all forever orders placed with their last updated status.
     * @param accessToken
     * @returns GttOrderResponse Successful operation
     * @throws ApiError
     */
    public static getforeverorders(
        accessToken: string,
    ): CancelablePromise<Array<GttOrderResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/forever/orders',
            headers: {
                'access-token': accessToken,
            },
        });
    }
    /**
     * place forever order
     * The order request api allows you place a new forever order.
     * @param accessToken
     * @param requestBody
     * @returns GttOrderStatusResponse Successful operation
     * @throws ApiError
     */
    public static placeforeverorder(
        accessToken: string,
        requestBody: GTTOrderModel,
    ): CancelablePromise<GttOrderStatusResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/forever/orders',
            headers: {
                'access-token': accessToken,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
