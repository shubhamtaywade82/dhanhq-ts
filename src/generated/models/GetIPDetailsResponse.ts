/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GetIPDetailsResponse = {
    /**
     * Date when secondary IP can be modified again (format: yyyy-MM-dd)
     */
    modifyDatePrimary?: string;
    /**
     * Date when primary IP can be modified again (format: yyyy-MM-dd)
     */
    modifyDateSecondary?: string;
    /**
     * Primary IP address associated with the user
     */
    primaryIP?: string;
    /**
     * Secondary IP address associated with the user
     */
    secondaryIP?: string;
};

