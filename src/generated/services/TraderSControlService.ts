/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExitPnlResponse } from '../models/ExitPnlResponse';
import type { KillSwitchResponse } from '../models/KillSwitchResponse';
import type { PnlBasedExitRequest } from '../models/PnlBasedExitRequest';
import type { PnlExitResponse } from '../models/PnlExitResponse';
import type { UserIPResponse } from '../models/UserIPResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TraderSControlService {
    /**
     * get P&L based exit
     * The Get P&L Based Exit API allows users to fetch the currently active P&L based exit configuration, including profit/loss thresholds and exit behavior.
     * **Notes** :
     * Returns the active P&L based exit configuration for the current trading day, if any
     * @param accessToken
     * @returns ExitPnlResponse Successful operation
     * @throws ApiError
     */
    public static getPnlExit(
        accessToken: string,
    ): CancelablePromise<ExitPnlResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/pnlExit',
            headers: {
                'access-token': accessToken,
            },
        });
    }
    /**
     * P&L based exit
     * The P&L Based Exit API allows users to configure automatic exit rules based on cumulative profit or loss thresholds. When the defined limits are breached, all applicable positions are exited.
     * **Notes** :
     * The configured P&L based exit remains active for the current trading day and is reset at the end of the session
     *
     * @param accessToken
     * @param requestBody
     * @returns PnlExitResponse Successful operation
     * @throws ApiError
     */
    public static pnlExit(
        accessToken: string,
        requestBody: PnlBasedExitRequest,
    ): CancelablePromise<PnlExitResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/pnlExit',
            headers: {
                'access-token': accessToken,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * stop P&L based exit
     * The Stop P&L Based Exit API allows users to disable an active P&L based exit configuration. Once stopped, no automatic exits will be triggered based on profit or loss thresholds.
     * **Notes** :
     * Disabling the P&L based exit applies only to the current trading day.
     *
     * @param accessToken
     * @returns UserIPResponse Successful operation
     * @throws ApiError
     */
    public static stopPnlExit(
        accessToken: string,
    ): CancelablePromise<UserIPResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/pnlExit',
            headers: {
                'access-token': accessToken,
            },
        });
    }
    /**
     * kill switch status
     * The api allows you to check  killSwitch status for your account, which will disable trading for current trading day
     * @param accessToken
     * @returns KillSwitchResponse Successful operation
     * @throws ApiError
     */
    public static killSwitchStatus(
        accessToken: string,
    ): CancelablePromise<KillSwitchResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/killswitch',
            headers: {
                'access-token': accessToken,
            },
        });
    }
    /**
     * manage kill switch
     * The api allows you to control killSwitch for your account, which will disable trading for current trading day
     * @param accessToken
     * @param killSwitchStatus
     * @returns KillSwitchResponse Successful operation
     * @throws ApiError
     */
    public static killswitch(
        accessToken: string,
        killSwitchStatus: string,
    ): CancelablePromise<KillSwitchResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/killswitch',
            headers: {
                'access-token': accessToken,
            },
            query: {
                'killSwitchStatus': killSwitchStatus,
            },
        });
    }
}
