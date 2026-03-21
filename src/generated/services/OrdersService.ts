/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrderModifyRequest } from '../models/OrderModifyRequest';
import type { OrderRequest } from '../models/OrderRequest';
import type { OrderResponse } from '../models/OrderResponse';
import type { OrderStatusResponse } from '../models/OrderStatusResponse';
import type { TradeHistoryResponseModel } from '../models/TradeHistoryResponseModel';
import type { TradeResponse } from '../models/TradeResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OrdersService {
    /**
     * get order by id
     * The api allows you to retrieve the details of an order placed during the day with their last updated status, with their order id.
     * @param accessToken
     * @param orderId
     * @returns OrderResponse Successful operation
     * @throws ApiError
     */
    public static getorderbyorderid(
        accessToken: string,
        orderId: string,
    ): CancelablePromise<OrderResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orders/{order-id}',
            path: {
                'order-id': orderId,
            },
            headers: {
                'access-token': accessToken,
            },
        });
    }
    /**
     * modify pending order
     * The api allows you modify pending order in orderbook. The fields that can be modified are price, quantity, order type & validity.
     * @param accessToken
     * @param orderId
     * @param requestBody
     * @returns OrderStatusResponse Successful operation
     * @throws ApiError
     */
    public static modifyorder(
        accessToken: string,
        orderId: string,
        requestBody: OrderModifyRequest,
    ): CancelablePromise<OrderStatusResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/orders/{order-id}',
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
     * cancel given order
     * The api allows you to cancel a pending order using the order id
     * @param accessToken
     * @param orderId
     * @returns OrderStatusResponse Successful operation
     * @throws ApiError
     */
    public static cancelorder(
        accessToken: string,
        orderId: string,
    ): CancelablePromise<OrderStatusResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/orders/{order-id}',
            path: {
                'order-id': orderId,
            },
            headers: {
                'access-token': accessToken,
            },
        });
    }
    /**
     * get current orders list
     * The API lets you retrieve an array of all orders requested in a day with their last updated status.
     * @param accessToken
     * @returns OrderResponse Successful operation
     * @throws ApiError
     */
    public static getorders(
        accessToken: string,
    ): CancelablePromise<Array<OrderResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orders',
            headers: {
                'access-token': accessToken,
            },
        });
    }
    /**
     * place an order
     * The order request API allows you to place new order.
     * @param accessToken
     * @param requestBody
     * @returns OrderStatusResponse Successful operation
     * @throws ApiError
     */
    public static placeorder(
        accessToken: string,
        requestBody: OrderRequest,
    ): CancelablePromise<OrderStatusResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/orders',
            headers: {
                'access-token': accessToken,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * place slice order
     * The order request API allows you to place a new slice order.
     * @param accessToken
     * @param requestBody
     * @returns OrderStatusResponse Successful operation
     * @throws ApiError
     */
    public static placesliceorder(
        accessToken: string,
        requestBody: OrderRequest,
    ): CancelablePromise<Array<OrderStatusResponse>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/orders/slicing',
            headers: {
                'access-token': accessToken,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * get all trades
     * The api allows you retrieve an array of all trades executed in a day.
     * @param accessToken
     * @returns TradeResponse Successful operation
     * @throws ApiError
     */
    public static getalltrades(
        accessToken: string,
    ): CancelablePromise<Array<TradeResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/trades',
            headers: {
                'access-token': accessToken,
            },
        });
    }
    /**
     * get trade by order id
     * The api allows user to retrieve trade details using an order id. Often during partial trades or Bracket/ Cover Orders, traders get confused in reading trade from tradebook. The response of this API will include all the trades generated for a particular order id.
     * @param accessToken
     * @param orderId
     * @returns TradeResponse Successful operation
     * @throws ApiError
     */
    public static gettradebyorderid(
        accessToken: string,
        orderId: string,
    ): CancelablePromise<Array<TradeResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/trades/{order-id}',
            path: {
                'order-id': orderId,
            },
            headers: {
                'access-token': accessToken,
            },
        });
    }
    /**
     * get trade history
     * The api allows user to retrieve the trade history Often during partial trades or Bracket/ Cover Orders, traders get confused in reading trade from tradebook. The response of the api will include all the trades generated for a particular order id.
     * @param accessToken
     * @param fromDate date format : yyyy-MM-dd
     * @param toDate date format : yyyy-MM-dd
     * @param pageNumber default value : 0
     * @returns TradeHistoryResponseModel Successful operation
     * @throws ApiError
     */
    public static gettradehistory(
        accessToken: string,
        fromDate: string,
        toDate: string,
        pageNumber: string,
    ): CancelablePromise<Array<TradeHistoryResponseModel>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/trades/{from-date}/{to-date}/{page-number}',
            path: {
                'from-date': fromDate,
                'to-date': toDate,
                'page-number': pageNumber,
            },
            headers: {
                'access-token': accessToken,
            },
        });
    }
    /**
     * get order by correlation id
     * The api allows you to retrieve the details of an order placed during the day, with its most recent status, using a correlation id provided by the API consumer at the time of order placement. This feature is available in case the user has missed the order id for any reason.
     * @param accessToken
     * @param correlationId
     * @returns OrderResponse Successful operation
     * @throws ApiError
     */
    public static getorderbycorrelationid(
        accessToken: string,
        correlationId: string,
    ): CancelablePromise<OrderResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orders/external/{correlation-id}',
            path: {
                'correlation-id': correlationId,
            },
            headers: {
                'access-token': accessToken,
            },
        });
    }
}
