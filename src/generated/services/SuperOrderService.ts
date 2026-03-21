/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrderStatusResponse } from '../models/OrderStatusResponse';
import type { SuperModifyRequest } from '../models/SuperModifyRequest';
import type { SuperOrderRequest } from '../models/SuperOrderRequest';
import type { SuperOrderResponse } from '../models/SuperOrderResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SuperOrderService {
    /**
     * modify pending super order
     * This API can be used to modify any leg of a Super Order till it is in PENDING or PART_TRADED state.
     * @param accessToken
     * @param orderId
     * @param requestBody
     * @returns OrderStatusResponse Successful Operation
     * @throws ApiError
     */
    public static modifysuperorder(
        accessToken: string,
        orderId: string,
        requestBody: SuperModifyRequest,
    ): CancelablePromise<OrderStatusResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/super/orders/{order-id}',
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
     * get current super orders list
     * The API lets you retrieve an array of all orders with their last updated status along with legdetails.
     * @param accessToken
     * @returns SuperOrderResponse Successful operation
     * @throws ApiError
     */
    public static getsuperorders(
        accessToken: string,
    ): CancelablePromise<Array<SuperOrderResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/super/orders',
            headers: {
                'access-token': accessToken,
            },
        });
    }
    /**
     * place super order
     * The order API allows you to place a new order.
     * @param accessToken
     * @param requestBody
     * @returns OrderStatusResponse Successful Operation
     * @throws ApiError
     */
    public static placesuperorder(
        accessToken: string,
        requestBody: SuperOrderRequest,
    ): CancelablePromise<OrderStatusResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/super/orders',
            headers: {
                'access-token': accessToken,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * cancel super order
     * User can cancel any leg of a super order which is PENDING using this API.
     * @param accessToken
     * @param orderId Order ID of the Order being cancelled
     * @param orderLeg Order Leg to be cancelled
     * @returns OrderStatusResponse Successful operation
     * @throws ApiError
     */
    public static cancelsuperorder(
        accessToken: string,
        orderId: string,
        orderLeg: 'ENTRY_LEG' | 'STOP_LOSS_LEG' | 'TARGET_LEG',
    ): CancelablePromise<OrderStatusResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/super/orders/{order-id}/{order-leg}',
            path: {
                'order-id': orderId,
                'order-leg': orderLeg,
            },
            headers: {
                'access-token': accessToken,
            },
        });
    }
}
