import { HttpClient } from "../client/HttpClient";

/**
 * Instruments keyed by exchange segment, e.g. `{ NSE_EQ: [11536], IDX_I: [13] }`.
 * Up to 1000 instruments per request.
 */
export type MarketFeedInstruments = Record<string, Array<number | string>>;

export interface LtpQuote {
  last_price?: number;
  [key: string]: unknown;
}

export interface OhlcQuote extends LtpQuote {
  ohlc?: {
    open?: number;
    high?: number;
    low?: number;
    close?: number;
  };
}

export interface DepthLevel {
  quantity?: number;
  orders?: number;
  price?: number;
}

export interface FullQuote extends OhlcQuote {
  volume?: number;
  oi?: number;
  buy_quantity?: number;
  sell_quantity?: number;
  net_change?: number;
  depth?: {
    buy?: DepthLevel[];
    sell?: DepthLevel[];
  };
}

/**
 * A market feed response is keyed by exchange segment then by security id, both
 * as strings: `{ NSE_EQ: { "11536": { last_price: 2800 } } }`.
 */
export interface MarketFeedResponse<TQuote> {
  status?: string;
  data?: Record<string, Record<string, TQuote>>;
  [key: string]: unknown;
}

/**
 * On-demand market data snapshots (`/v2/marketfeed/*`).
 *
 * These are snapshot reads, not a stream — for continuous updates use
 * {@link MarketFeedWS}.
 */
export class MarketFeed {
  constructor(private readonly httpClient: HttpClient) {}

  /** Last traded price for up to 1000 instruments. */
  public async ltp(
    instruments: MarketFeedInstruments,
  ): Promise<MarketFeedResponse<LtpQuote>> {
    return this.httpClient.request<
      MarketFeedResponse<LtpQuote>,
      MarketFeedInstruments
    >({
      method: "POST",
      url: "/marketfeed/ltp",
      data: instruments,
      safeToRetry: true,
    });
  }

  /** Open/high/low/close for up to 1000 instruments. */
  public async ohlc(
    instruments: MarketFeedInstruments,
  ): Promise<MarketFeedResponse<OhlcQuote>> {
    return this.httpClient.request<
      MarketFeedResponse<OhlcQuote>,
      MarketFeedInstruments
    >({
      method: "POST",
      url: "/marketfeed/ohlc",
      data: instruments,
      safeToRetry: true,
    });
  }

  /** Full quote with market depth and open interest. */
  public async quote(
    instruments: MarketFeedInstruments,
  ): Promise<MarketFeedResponse<FullQuote>> {
    return this.httpClient.request<
      MarketFeedResponse<FullQuote>,
      MarketFeedInstruments
    >({
      method: "POST",
      url: "/marketfeed/quote",
      data: instruments,
      safeToRetry: true,
    });
  }

  /**
   * Last traded price for a single instrument, or `undefined` when the feed has
   * no entry for it.
   */
  public async ltpFor(
    exchangeSegment: string,
    securityId: number | string,
  ): Promise<number | undefined> {
    const response = await this.ltp({ [exchangeSegment]: [securityId] });
    return response.data?.[exchangeSegment]?.[String(securityId)]?.last_price;
  }
}
