/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PnlExitResponse = {
    message?: string;
    /**
     * | **Enum Values** | **Description** |
     * |-----------------|----------------|
     * | ACTIVE         | P&L based exit configured successfully |
     * | INACTIVE       | No active P&L based exit configured for the current trading day |
     */
    pnlExitStatus?: string;
};

