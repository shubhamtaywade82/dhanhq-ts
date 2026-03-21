/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ExitPnlResponse = {
    /**
     * Current status of the PNL exit operation
     */
    pnlExitStatus?: string;
    /**
     * User-defined target profit amount for the PNL exit
     */
    profit?: number;
    /**
     * User-defined target loss amount for the PNL exit
     */
    loss?: number;
    /**
     * Indicates if the kill switch is enabled for this PNL exit
     */
    enableKillSwitch?: boolean;
    /**
     * | **Enum Values** | **Description** |
     * |-----------------|----------------|
     * | INTRADAY         | Intraday for Equity, Futures & Options |
     * | DELIVERY         | Delivery for equity deliveries |
     */
    productType?: Array<string>;
};

