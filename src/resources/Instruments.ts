import { InstrumentType, SEGMENT_MAP } from "../constants";
import { HttpClient } from "../client/HttpClient";

/** A scrip-master row, normalized out of the segment CSV. */
export interface Instrument {
  securityId: string;
  symbolName?: string;
  displayName?: string;
  exchange?: string;
  segment?: string;
  exchangeSegment?: string;
  instrument?: string;
  series?: string;
  lotSize?: number;
  tickSize?: number;
  expiryDate?: string;
  strikePrice?: number;
  optionType?: string;
  underlyingSymbol?: string;
  isin?: string;
  instrumentType?: string;
  expiryFlag?: string;
  bracketFlag?: string;
  coverFlag?: string;
  asmGsmFlag?: string;
  asmGsmCategory?: string;
  buySellIndicator?: string;
  buyCoMinMarginPer?: number;
  sellCoMinMarginPer?: number;
  mtfLeverage?: number;
}

export interface InstrumentSearchOptions {
  /** Match the whole symbol rather than a substring. Defaults to `false`. */
  exactMatch?: boolean;
  /** Defaults to `false` — symbols are upcased on both sides before comparing. */
  caseSensitive?: boolean;
  /** Cap on returned rows. Defaults to 25. */
  limit?: number;
}

export interface InstrumentsConfig {
  /**
   * How long a segment's parsed CSV stays cached, in milliseconds. The scrip
   * master changes once a day, so the default is one hour.
   */
  cacheTtlMs?: number;
}

const DEFAULT_CACHE_TTL_MS = 60 * 60 * 1000;

const DEFAULT_SEARCH_SEGMENTS = [
  "NSE_EQ",
  "BSE_EQ",
  "IDX_I",
  "NSE_FNO",
  "NSE_CURRENCY",
];

interface CacheEntry {
  instruments: Instrument[];
  fetchedAt: number;
}

/**
 * Segment-wise instrument (scrip master) lookups.
 *
 * `GET /v2/instrument/{segment}` returns CSV, not JSON, and a single segment
 * can run to hundreds of thousands of rows — so parsed segments are cached in
 * memory and every lookup goes through that cache.
 */
export class Instruments {
  private readonly cacheTtlMs: number;
  private readonly cache = new Map<string, CacheEntry>();
  private readonly inFlight = new Map<string, Promise<Instrument[]>>();

  constructor(
    private readonly httpClient: HttpClient,
    config: InstrumentsConfig = {},
  ) {
    this.cacheTtlMs = config.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS;
  }

  /** Every instrument in a segment, cached for {@link InstrumentsConfig.cacheTtlMs}. */
  public async bySegment(exchangeSegment: string): Promise<Instrument[]> {
    const cached = this.cache.get(exchangeSegment);
    if (cached && Date.now() - cached.fetchedAt < this.cacheTtlMs) {
      return cached.instruments;
    }

    // Concurrent callers for a cold segment share one download rather than each
    // pulling several MB of CSV.
    const existing = this.inFlight.get(exchangeSegment);
    if (existing) {
      return existing;
    }

    const request = this.fetchSegment(exchangeSegment)
      .then((instruments) => {
        this.cache.set(exchangeSegment, { instruments, fetchedAt: Date.now() });
        return instruments;
      })
      .finally(() => {
        this.inFlight.delete(exchangeSegment);
      });

    this.inFlight.set(exchangeSegment, request);
    return request;
  }

  /** Drops cached segments so the next lookup re-downloads. */
  public clearCache(exchangeSegment?: string): void {
    if (exchangeSegment) {
      this.cache.delete(exchangeSegment);
      return;
    }

    this.cache.clear();
  }

  /**
   * First instrument in a segment matching `symbol`.
   *
   * Equities are matched on `UNDERLYING_SYMBOL` when present, indices and
   * derivatives on `SYMBOL_NAME`, which is what makes `find("IDX_I", "NIFTY")`
   * and `find("NSE_EQ", "RELIANCE")` both resolve.
   */
  public async find(
    exchangeSegment: string,
    symbol: string,
    options: InstrumentSearchOptions = { exactMatch: true },
  ): Promise<Instrument | undefined> {
    const instruments = await this.bySegment(exchangeSegment);
    const matches = matchSymbol(instruments, symbol, options);
    return matches[0];
  }

  /** Instrument with this security id inside a segment. */
  public async findBySecurityId(
    exchangeSegment: string,
    securityId: string | number,
  ): Promise<Instrument | undefined> {
    const instruments = await this.bySegment(exchangeSegment);
    return instruments.find(
      (instrument) => instrument.securityId === String(securityId),
    );
  }

  /**
   * Search across several segments at once, returning up to `limit` matches.
   * Used by the `dhan_search_instruments` agent tool to resolve a free-text
   * symbol to a security id.
   */
  public async search(
    query: string,
    options: InstrumentSearchOptions & { segments?: string[] } = {},
  ): Promise<Instrument[]> {
    const segments = options.segments ?? DEFAULT_SEARCH_SEGMENTS;
    const limit = options.limit ?? 25;
    const results: Instrument[] = [];

    for (const segment of segments) {
      if (results.length >= limit) {
        break;
      }

      const instruments = await this.bySegment(segment);
      results.push(
        ...matchSymbol(instruments, query, {
          ...options,
          limit: limit - results.length,
        }),
      );
    }

    return results.slice(0, limit);
  }

  /** First match for `symbol` across `segments`, in the order given. */
  public async findAnywhere(
    symbol: string,
    options: InstrumentSearchOptions & { segments?: string[] } = {},
  ): Promise<Instrument | undefined> {
    const results = await this.search(symbol, { ...options, limit: 1 });
    return results[0];
  }

  private async fetchSegment(exchangeSegment: string): Promise<Instrument[]> {
    const csv = await this.httpClient.request<string>({
      method: "GET",
      url: `/instrument/${encodeURIComponent(exchangeSegment)}`,
      headers: { Accept: "text/csv" },
      safeToRetry: true,
    });

    if (typeof csv !== "string" || csv.length === 0) {
      return [];
    }

    return parseCsv(csv).map(normalizeRow);
  }
}

function matchSymbol(
  instruments: Instrument[],
  symbol: string,
  options: InstrumentSearchOptions,
): Instrument[] {
  const exactMatch = options.exactMatch ?? false;
  const caseSensitive = options.caseSensitive ?? false;
  const limit = options.limit ?? Infinity;
  const needle = caseSensitive ? symbol : symbol.toUpperCase();

  const matches: Instrument[] = [];
  for (const instrument of instruments) {
    if (matches.length >= limit) {
      break;
    }

    const raw = comparableSymbol(instrument);
    if (raw === undefined) {
      continue;
    }

    const candidate = caseSensitive ? raw : raw.toUpperCase();
    if (exactMatch ? candidate === needle : candidate.includes(needle)) {
      matches.push(instrument);
    }
  }

  return matches;
}

function comparableSymbol(instrument: Instrument): string | undefined {
  if (
    instrument.instrument === InstrumentType.EQUITY &&
    instrument.underlyingSymbol
  ) {
    return instrument.underlyingSymbol;
  }

  return instrument.symbolName;
}

function normalizeRow(row: Record<string, string>): Instrument {
  const exchange = row.EXCH_ID || row.EXCHANGE;
  const segment = row.SEGMENT;
  const exchangeSegment =
    exchange && segment ? SEGMENT_MAP[`${exchange}:${segment}`] : exchange;

  return {
    securityId: String(row.SECURITY_ID ?? ""),
    symbolName: emptyToUndefined(row.SYMBOL_NAME),
    displayName: emptyToUndefined(row.DISPLAY_NAME),
    exchange: emptyToUndefined(exchange),
    segment: emptyToUndefined(segment),
    exchangeSegment: emptyToUndefined(exchangeSegment),
    instrument: emptyToUndefined(row.INSTRUMENT),
    series: emptyToUndefined(row.SERIES),
    lotSize: toNumber(row.LOT_SIZE),
    tickSize: toNumber(row.TICK_SIZE),
    expiryDate: emptyToUndefined(row.SM_EXPIRY_DATE),
    strikePrice: toNumber(row.STRIKE_PRICE),
    optionType: emptyToUndefined(row.OPTION_TYPE),
    underlyingSymbol: emptyToUndefined(row.UNDERLYING_SYMBOL),
    isin: emptyToUndefined(row.ISIN),
    instrumentType: emptyToUndefined(row.INSTRUMENT_TYPE),
    expiryFlag: emptyToUndefined(row.EXPIRY_FLAG),
    bracketFlag: emptyToUndefined(row.BRACKET_FLAG),
    coverFlag: emptyToUndefined(row.COVER_FLAG),
    asmGsmFlag: emptyToUndefined(row.ASM_GSM_FLAG),
    asmGsmCategory: emptyToUndefined(row.ASM_GSM_CATEGORY),
    buySellIndicator: emptyToUndefined(row.BUY_SELL_INDICATOR),
    buyCoMinMarginPer: toNumber(row.BUY_CO_MIN_MARGIN_PER),
    sellCoMinMarginPer: toNumber(row.SELL_CO_MIN_MARGIN_PER),
    mtfLeverage: toNumber(row.MTF_LEVERAGE),
  };
}

function emptyToUndefined(value: string | undefined): string | undefined {
  return value === undefined || value === "" ? undefined : value;
}

function toNumber(value: string | undefined): number | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Minimal RFC 4180 CSV reader — handles quoted fields, escaped quotes and both
 * line ending conventions. The scrip master has no embedded newlines, but
 * DISPLAY_NAME does contain commas inside quotes.
 */
export function parseCsv(text: string): Array<Record<string, string>> {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      // Swallow the LF of a CRLF pair so it does not open an empty row.
      if (char === "\r" && text[index + 1] === "\n") {
        index += 1;
      }
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const header = rows.shift();
  if (!header) {
    return [];
  }

  return rows
    .filter((entry) => entry.length > 1 || entry[0] !== "")
    .map((entry) => {
      const record: Record<string, string> = {};
      header.forEach((key, position) => {
        record[key.trim()] = entry[position] ?? "";
      });
      return record;
    });
}
