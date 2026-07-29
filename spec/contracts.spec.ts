import {
  expiredOptionsDataSchema,
  historicalChartsSchema,
  intradayChartsSchema,
  optionChainRequestSchema,
} from "../src/contracts";
import { getMarketSessionInfo } from "../src/ta/marketCalendar";

describe("Runtime contracts validation", () => {
  describe("intradayChartsSchema", () => {
    it("validates correct intraday chart requests", () => {
      const valid = intradayChartsSchema.safeParse({
        securityId: "1333",
        exchangeSegment: "NSE_EQ",
        instrument: "EQUITY",
        interval: 15,
        fromDate: "2026-07-01",
        toDate: "2026-07-28",
      });
      expect(valid.success).toBe(true);
    });

    it("allows same-date intraday chart requests (fromDate == toDate)", () => {
      const valid = intradayChartsSchema.safeParse({
        securityId: "1333",
        exchangeSegment: "NSE_EQ",
        instrument: "EQUITY",
        interval: 15,
        fromDate: "2026-07-28",
        toDate: "2026-07-28",
      });
      expect(valid.success).toBe(true);
    });

    it("rejects invalid exchange segments", () => {
      const invalid = intradayChartsSchema.safeParse({
        securityId: "1333",
        exchangeSegment: "INVALID_SEG",
        instrument: "EQUITY",
        interval: 15,
      });
      expect(invalid.success).toBe(false);
    });

    it("rejects fromDate > toDate", () => {
      const invalid = intradayChartsSchema.safeParse({
        securityId: "1333",
        exchangeSegment: "NSE_EQ",
        instrument: "EQUITY",
        interval: 15,
        fromDate: "2026-07-28",
        toDate: "2026-07-01",
      });
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.issues[0].message).toContain("must be <= toDate");
      }
    });

    it("rejects date range exceeding 90 days for intraday", () => {
      const invalid = intradayChartsSchema.safeParse({
        securityId: "1333",
        exchangeSegment: "NSE_EQ",
        instrument: "EQUITY",
        interval: 15,
        fromDate: "2026-01-01",
        toDate: "2026-06-01",
      });
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.issues[0].message).toContain("exceeds maximum limit of 90 days");
      }
    });

    it("rejects future toDate beyond today in IST", () => {
      const invalid = intradayChartsSchema.safeParse({
        securityId: "1333",
        exchangeSegment: "NSE_EQ",
        instrument: "EQUITY",
        interval: 15,
        fromDate: "2026-07-01",
        toDate: "2099-01-01",
      });
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.issues[0].message).toContain("cannot be in the future");
      }
    });
  });

  describe("expiredOptionsDataSchema", () => {
    it("validates correct expired options data requests", () => {
      const valid = expiredOptionsDataSchema.safeParse({
        securityId: 13,
        exchangeSegment: "NSE_FNO",
        instrument: "INDEX",
        expiryFlag: "WEEK",
        expiryCode: 1,
        strike: "ATM",
        drvOptionType: "CALL",
        interval: "15",
        fromDate: "2026-07-01",
        toDate: "2026-07-28",
      });
      expect(valid.success).toBe(true);
    });

    it("rejects missing instrument and instrumentType", () => {
      const invalid = expiredOptionsDataSchema.safeParse({
        securityId: 13,
        exchangeSegment: "NSE_FNO",
        expiryFlag: "WEEK",
        expiryCode: 1,
        strike: "ATM",
        drvOptionType: "CALL",
        fromDate: "2026-07-01",
        toDate: "2026-07-28",
      });
      expect(invalid.success).toBe(false);
    });

    it("rejects date range exceeding 180 days for expired options", () => {
      const invalid = expiredOptionsDataSchema.safeParse({
        securityId: 13,
        exchangeSegment: "NSE_FNO",
        instrument: "INDEX",
        expiryFlag: "WEEK",
        expiryCode: 1,
        strike: "ATM",
        drvOptionType: "CALL",
        fromDate: "2025-01-01",
        toDate: "2025-10-01",
      });
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.issues[0].message).toContain("exceeds maximum limit of 180 days");
      }
    });
  });

  describe("optionChainRequestSchema", () => {
    it("validates correct option chain requests", () => {
      const valid = optionChainRequestSchema.safeParse({
        underlyingScrip: 13,
        underlyingSeg: "IDX_I",
        expiry: "2026-07-30",
      });
      expect(valid.success).toBe(true);
    });

    it("rejects non-date expiry string", () => {
      const invalid = optionChainRequestSchema.safeParse({
        underlyingScrip: 13,
        underlyingSeg: "IDX_I",
        expiry: "INVALID-DATE",
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe("marketCalendar session info", () => {
    it("returns IST market session state accurately", () => {
      const session = getMarketSessionInfo();
      expect(session).toHaveProperty("istDate");
      expect(session).toHaveProperty("sessionState");
      expect(session).toHaveProperty("lastCompletedTradingDay");
      expect(["PRE_MARKET", "IN_SESSION", "POST_MARKET", "CLOSED"]).toContain(session.sessionState);
    });
  });
});
