# DhanHQ TS SDK - Comprehensive Improvement Suggestions

## Executive Summary

This is a production-grade TypeScript SDK for DhanHQ APIs with strong architecture, comprehensive features (WebSocket, technical analysis, risk pipeline, agent tools, MCP server), and good test coverage (177 tests). The codebase demonstrates solid engineering practices but has opportunities for enhancement in several areas.

**Current Strengths:**
- Well-structured 4-layer architecture (transport → resource → computation → strategy/agent)
- Comprehensive error handling with custom error types
- Good TypeScript configuration with strict mode
- Token coalescing to prevent concurrent login races
- IST timezone handling for token expiry
- Browser-safe read-only modules clearly documented
- Strong test coverage across multiple spec files

**Priority Areas for Improvement:**
1. **Observability & Debugging** - Add structured logging and debug mode
2. **WebSocket Resilience** - Implement exponential backoff with jitter
3. **Rate Limiting Transparency** - Expose rate limit headers and remaining quota
4. **Documentation** - Add JSDoc comments throughout public API surface
5. **Testing** - Add integration tests and mock server infrastructure
6. **Performance** - Optimize instrument caching and WebSocket reconnection
7. **Security** - Add input validation sanitization and secret handling improvements
8. **Developer Experience** - Better error messages, debug utilities, and examples

---

## 1. Code Quality & TypeScript Configuration

### 1.1 Enhanced TypeScript Strictness

**Current State:**
```json
{
  "strict": true,
  "noImplicitAny": true
}
```

**Recommendations:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,        // Ensure all code paths return
    "noUnusedLocals": true,           // Catch unused variables
    "noUnusedParameters": true,       // Catch unused parameters
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true, // Prevent undefined access
    "exactOptionalPropertyTypes": true // Prevent undefined vs missing confusion
  }
}
```

**Impact:** Catches more bugs at compile time, improves type safety.

### 1.2 Add ESLint/Prettier Configuration — Done

Configured, then re-migrated: `eslint.config.js` (flat config) replaces the
original `.eslintrc.json`, which ESLint 10 can no longer load at all
(v9 dropped the legacy format outright, so a fresh `npm install` at that
`eslint` version left `npm run lint` unable to start). Same rule set,
ported using `@typescript-eslint/eslint-plugin`'s `flat/recommended` and
`flat/strict` exports plus `@eslint/js` and `globals` for the parts flat
config no longer infers implicitly (env globals, base recommended rules).
One addition: `no-extraneous-class` is turned off — the `strict` preset
flags `DhanAuth` (static-method namespace) and `GeneratedClient`
(constructor-only composition root) for a pattern this codebase uses
intentionally. `npm run lint` is now wired into CI.

<details>
<summary>Original suggestion (superseded)</summary>

**Missing:** No linting configuration found.

**Recommendation:**
```json
// .eslintrc.json
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/strict"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

Add to `package.json`:
```json
{
  "scripts": {
    "lint": "eslint src --ext .ts",
    "format": "prettier --write \"src/**/*.ts\""
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint": "^8.57.0",
    "prettier": "^3.2.0"
  }
}
```

</details>

### 1.3 Consistent Error Handling Pattern

**Current State:** Good error hierarchy exists but inconsistent usage.

**Issue in `HttpClient.ts` line 172:**
```typescript
if (error instanceof BottleneckError) {
  return new RateLimitError(error.message, error);
}
```

The `BottleneckError` class is defined locally but should use the actual `bottleneck` library errors.

**Recommendation:**
```typescript
import Bottleneck from 'bottleneck';

// In normalizeError:
if (error instanceof Bottleneck.BottleneckError) {
  return new RateLimitError(
    `Rate limit exceeded: ${error.message}`,
    { cause: error, retryAfterMs: extractRetryAfter(error) }
  );
}
```

---

## 2. Architecture & Design Patterns

### 2.1 Dependency Injection Improvements

**Current State:** `DhanClient` constructor accepts limited dependencies.

**Recommendation:** Expand DI for better testability:

```typescript
export interface DhanClientDependencies extends HttpClientDependencies {
  clock?: () => Date;              // For time-based testing
  logger?: Logger;                  // Structured logging
  cryptoProvider?: CryptoProvider;  // For TOTP generation
  fetch?: typeof fetch;             // For browser compatibility
}

// Usage:
const client = new DhanClient(config, {
  clock: () => new Date('2024-01-01T10:00:00Z'), // Deterministic time
  logger: new ConsoleLogger({ level: 'debug' }),
});
```

### 2.2 Event Emitter Type Safety

**Current State:** `BaseWS` extends `EventEmitter` without type safety.

**Recommendation:** Use typed event emitter:

```typescript
import { EventEmitter } from 'events';

type MarketFeedEvents = {
  open: () => void;
  close: () => void;
  error: (error: Error) => void;
  tick: (tick: MarketTick) => void;
  subscribed: (instrument: InstrumentSubscription) => void;
};

class TypedEventEmitter<T extends Record<string, (...args: any[]) => any>> 
  extends EventEmitter {
  on<K extends keyof T>(event: K, listener: T[K]): this {
    return super.on(event, listener);
  }
  
  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): boolean {
    return super.emit(event, ...args);
  }
}

export class MarketFeedWS extends TypedEventEmitter<MarketFeedEvents> {
  // Now type-safe event handling
}
```

### 2.3 Circuit Breaker Pattern — Done

Implemented as `src/client/CircuitBreaker.ts` (dependency-free, no `opossum`)
and wired into `HttpClient`. Opens after 5 consecutive `NetworkError`/5xx
failures, short-circuits with `CircuitOpenError` for 30s, then allows a
half-open trial request. Validation errors, 4xx responses, and rate-limit
throttling don't count toward the threshold. Configurable via
`DhanClientConfig.circuitBreaker` or disable with `circuitBreaker: false`.

<details>
<summary>Original suggestion (superseded)</summary>

**Missing:** No circuit breaker for repeated failures.

**Recommendation:** Add circuit breaker to `HttpClient`:

```typescript
import { CircuitBreaker } from 'opossum';

export class HttpClient {
  private circuitBreaker: CircuitBreaker;
  
  constructor(config: DhanClientConfig) {
    this.circuitBreaker = new CircuitBreaker(
      async (options: RequestOptions) => this.execute(options),
      {
        timeout: config.timeoutMs,
        errorThresholdPercentage: 50,
        resetTimeout: 30000, // 30 seconds
      }
    );
    
    this.circuitBreaker.on('open', () => {
      logger.warn('Circuit breaker opened due to repeated failures');
    });
  }
  
  public async request<T>(options: RequestOptions): Promise<T> {
    return this.circuitBreaker.fire(options);
  }
}
```

</details>

---

## 3. Performance Optimizations

### 3.1 Instrument Caching Strategy

**Current State:** Instruments cached with TTL but no size limit.

**Issue:** Memory could grow unbounded with many segments.

**Recommendation:** Add LRU cache with size limits:

```typescript
import { LRUCache } from 'lru-cache';

export class Instruments {
  private cache: LRUCache<string, Instrument[]>;
  
  constructor(httpClient: HttpClient, options: { 
    cacheTtlMs?: number;
    maxItems?: number;
  }) {
    this.cache = new LRUCache({
      max: options.maxItems ?? 100,
      ttl: options.cacheTtlMs ?? 3600000,
      updateAgeOnGet: true,
    });
  }
  
  public async getSegment(segment: string): Promise<Instrument[]> {
    const cached = this.cache.get(segment);
    if (cached) return cached;
    
    // Fetch and cache...
  }
}
```

### 3.2 WebSocket Message Buffering

**Current State:** Messages processed synchronously in `onMessage`.

**Issue:** High-frequency ticks could block the event loop.

**Recommendation:** Batch processing with microtask scheduling:

```typescript
export class MarketFeedWS {
  private pendingTicks: MarketTick[] = [];
  private flushScheduled = false;
  
  protected onMessage(data: unknown): void {
    const packets = splitPackets(data);
    for (const packet of packets) {
      const tick = parseMarketFeedPacket(packet);
      this.pendingTicks.push(tick);
      this.ltpStore.update(tick);
    }
    
    if (!this.flushScheduled) {
      this.flushScheduled = true;
      queueMicrotask(() => this.flushTicks());
    }
  }
  
  private flushTicks(): void {
    if (this.pendingTicks.length > 0) {
      this.emit('tick', this.pendingTicks);
      this.pendingTicks = [];
    }
    this.flushScheduled = false;
  }
}
```

### 3.3 Connection Pooling for HTTP

**Current State:** Single axios instance per client.

**Recommendation:** Configure axios with connection pooling:

```typescript
import http from 'http';
import https from 'https';

const agentOptions = {
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
  freeSocketTimeout: 30000,
};

this.axiosInstance = axios.create({
  baseURL: config.baseURL ?? "https://api.dhan.co/v2",
  timeout: config.timeoutMs ?? 5000,
  httpAgent: new http.Agent(agentOptions),
  httpsAgent: new https.Agent(agentOptions),
});
```

---

## 4. Security Enhancements

### 4.1 Input Validation with Zod

**Current State:** Some contracts use Zod but not consistently.

**Recommendation:** Add validation to all public methods:

```typescript
import { z } from 'zod';

const OrderSchema = z.object({
  dhanClientId: z.string().min(1),
  transactionType: z.enum(['BUY', 'SELL']),
  exchangeSegment: z.enum(Constants.VALID_SEGMENTS),
  productType: z.enum(Constants.PRODUCT_TYPES),
  orderType: z.enum(Constants.ORDER_TYPES),
  validity: z.enum(Constants.VALIDITY_TYPES),
  securityId: z.string().min(1),
  quantity: z.number().positive(),
  price: z.number().positive().optional(),
  correlationId: z.string().min(1).max(64),
});

export class Orders {
  public async place(order: OrderRequest): Promise<OrderResponse> {
    const validated = OrderSchema.parse(order);
    return this.httpClient.request({
      method: 'POST',
      url: '/orders',
      data: validated,
    });
  }
}
```

### 4.2 Secret Handling

**Current State:** Secrets passed as plain strings in config.

**Recommendation:** Use `Secret` wrapper pattern:

```typescript
class Secret<T extends string> {
  private readonly value: T;
  
  constructor(value: T) {
    this.value = value;
  }
  
  unwrap(): T {
    return this.value;
  }
  
  toString(): string {
    return '[REDACTED]';
  }
  
  toJSON(): string {
    return '[REDACTED]';
  }
}

interface DhanClientConfig {
  token: Secret<string>;
  partnerSecret?: Secret<string>;
}

// Usage prevents accidental logging:
const config = {
  token: new Secret(process.env.DHAN_TOKEN!),
};
console.log(config.token); // Logs: [REDACTED]
```

### 4.3 Rate Limiting Improvements

**Current State:** Basic rate limiter with `minTime`.

**Recommendation:** Implement token bucket algorithm with per-endpoint limits:

```typescript
export class RateLimiter {
  private buckets: Map<string, TokenBucket>;
  
  constructor(limits: RateLimitConfig) {
    this.buckets = new Map([
      ['read', new TokenBucket(limits.readPerSecond, 1000)],
      ['write', new TokenBucket(limits.writePerSecond, 1000)],
      ['order', new TokenBucket(limits.ordersPerSecond, 1000)],
    ]);
  }
  
  public async scheduleRead<T>(fn: () => Promise<T>): Promise<T> {
    await this.buckets.get('read')!.acquire();
    return fn();
  }
  
  public async scheduleOrder<T>(fn: () => Promise<T>): Promise<T> {
    await this.buckets.get('order')!.acquire();
    return fn();
  }
}

class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  
  constructor(private capacity: number, private refillInterval: number) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }
  
  async acquire(): Promise<void> {
    this.refill();
    
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }
    
    // Wait until next token available
    const waitTime = this.refillInterval / this.capacity;
    await sleep(waitTime);
    return this.acquire();
  }
  
  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = (elapsed / this.refillInterval) * this.capacity;
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}
```

---

## 5. WebSocket Resilience

### 5.1 Exponential Backoff with Jitter

**Current State:** Linear backoff in `BaseWS.ts`:
```typescript
const delay = Math.min(
  5000,
  this.reconnectDelayMs * Math.max(1, this.reconnectAttempts + 1),
);
```

**Recommendation:** Exponential backoff with jitter:

```typescript
private calculateBackoff(attempt: number): number {
  const baseDelay = 1000; // 1 second
  const maxDelay = 60000; // 60 seconds
  const exponential = Math.min(
    maxDelay,
    baseDelay * Math.pow(2, attempt)
  );
  
  // Add jitter: ±25% randomization
  const jitter = exponential * 0.25 * (Math.random() * 2 - 1);
  
  return exponential + jitter;
}

private scheduleReconnect(): void {
  const delay = this.calculateBackoff(this.reconnectAttempts);
  this.reconnectAttempts += 1;
  
  this.logger?.info(`Reconnecting in ${delay.toFixed(0)}ms (attempt ${this.reconnectAttempts})`);
  
  this.reconnectTimer = setTimeout(() => {
    void this.connect();
  }, delay);
}
```

### 5.2 Connection Health Monitoring

**Missing:** No heartbeat/ping-pong mechanism.

**Recommendation:** Add ping-pong for connection health:

```typescript
export class BaseWS {
  private pingInterval?: NodeJS.Timeout;
  private pongTimeout?: NodeJS.Timeout;
  private readonly pingIntervalMs = 30000; // 30 seconds
  private readonly pongTimeoutMs = 10000;   // 10 seconds
  
  private bindConnection(connection: WebSocketLike): void {
    connection.on('open', () => {
      this.startHeartbeat();
    });
    
    connection.on('pong', () => {
      clearTimeout(this.pongTimeout);
    });
  }
  
  private startHeartbeat(): void {
    this.pingInterval = setInterval(() => {
      this.send(JSON.stringify({ type: 'ping' }));
      
      this.pongTimeout = setTimeout(() => {
        this.logger?.warn('Pong not received, reconnecting');
        this.connection?.close();
      }, this.pongTimeoutMs);
    }, this.pingIntervalMs);
  }
  
  private stopHeartbeat(): void {
    clearInterval(this.pingInterval);
    clearTimeout(this.pongTimeout);
  }
}
```

### 5.3 Reconnection State Preservation

**Recommendation:** Emit reconnection events for consumers:

```typescript
type WSEvents = {
  connecting: (attempt: number) => void;
  connected: () => void;
  disconnected: (reason: string) => void;
  reconnecting: (attempt: number, delay: number) => void;
  error: (error: Error) => void;
};

// In scheduleReconnect:
this.emit('reconnecting', this.reconnectAttempts, delay);
```

---

## 6. Observability & Debugging

### 6.1 Structured Logging

**Missing:** No logging infrastructure.

**Recommendation:** Add optional logger interface:

```typescript
export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error, context?: Record<string, unknown>): void;
}

export class ConsoleLogger implements Logger {
  constructor(private options: { level: LogLevel; prefix?: string }) {}
  
  debug(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('debug')) {
      console.debug(this.format('DEBUG', message, context));
    }
  }
  
  info(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('info')) {
      console.info(this.format('INFO', message, context));
    }
  }
  
  warn(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('warn')) {
      console.warn(this.format('WARN', message, context));
    }
  }
  
  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    console.error(this.format('ERROR', message, { ...context, error: error?.message }));
  }
  
  private format(level: string, message: string, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const prefix = this.options.prefix ? `[${this.options.prefix}]` : '';
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `${timestamp} ${prefix}[${level}] ${message}${contextStr}`;
  }
}

// In DhanClient:
interface DhanClientConfig {
  logger?: Logger;
  debug?: boolean; // Quick enable for console logging
}
```

### 6.2 Debug Mode

**Recommendation:** Add debug mode for development:

```typescript
export class DhanClient {
  private readonly debug: boolean;
  
  constructor(config: DhanClientConfig) {
    this.debug = config.debug ?? process.env.DHANHQ_DEBUG === 'true';
    
    if (this.debug) {
      config.logger = new ConsoleLogger({ level: 'debug', prefix: 'DhanHQ' });
    }
  }
}

// Usage:
const client = new DhanClient({
  clientId: '...',
  token: '...',
  debug: true, // Enables verbose logging
});
```

### 6.3 Request/Response Tracing

**Recommendation:** Add correlation IDs to requests:

```typescript
import { v4 as uuidv4 } from 'uuid';

export class HttpClient {
  public async request<T>(options: RequestOptions): Promise<T> {
    const correlationId = uuidv4();
    const startTime = Date.now();
    
    this.logger?.debug('HTTP Request', {
      correlationId,
      method: options.method,
      url: options.url,
    });
    
    try {
      const result = await this.execute(options);
      const duration = Date.now() - startTime;
      
      this.logger?.debug('HTTP Response', {
        correlationId,
        duration,
        success: true,
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.logger?.error('HTTP Request Failed', error as Error, {
        correlationId,
        duration,
        method: options.method,
        url: options.url,
      });
      
      throw error;
    }
  }
}
```

---

## 7. Testing Improvements

### 7.1 Mock Server Infrastructure

**Missing:** No mock API server for integration tests.

**Recommendation:** Create test utilities:

```typescript
// spec/utils/MockServer.ts
import { createServer, Server } from 'http';

export class MockDhanServer {
  private server: Server;
  private port: number;
  private requests: Array<{ method: string; url: string; body: any }> = [];
  
  constructor() {
    this.port = 0; // Auto-assign
    this.server = createServer((req, res) => this.handleRequest(req, res));
  }
  
  async start(): Promise<string> {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        const address = this.server.address() as AddressInfo;
        resolve(`http://localhost:${address.port}`);
      });
    });
  }
  
  private handleRequest(req: IncomingMessage, res: ServerResponse): void {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      this.requests.push({
        method: req.method!,
        url: req.url!,
        body: body ? JSON.parse(body) : null,
      });
      
      // Return mock response based on URL
      const mockResponse = this.getMockResponse(req.url!);
      res.writeHead(mockResponse.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(mockResponse.data));
    });
  }
  
  getMockResponse(url: string): { status: number; data: any } {
    if (url.includes('/orders')) {
      return {
        status: 200,
        data: { orderId: 'mock-123', status: 'SUCCESS' },
      };
    }
    // More mocks...
  }
  
  stop(): void {
    this.server.close();
  }
  
  getRequestHistory(): typeof this.requests {
    return [...this.requests];
  }
}
```

### 7.2 Integration Test Examples

**Current State:** Tests are mostly unit tests.

**Recommendation:** Add integration tests:

```typescript
// spec/integration/orders.integration.spec.ts
describe('Orders Integration', () => {
  let mockServer: MockDhanServer;
  let client: DhanClient;
  
  beforeAll(async () => {
    mockServer = new MockDhanServer();
    const baseUrl = await mockServer.start();
    
    client = new DhanClient({
      clientId: 'test-client',
      token: 'test-token',
      baseURL: baseUrl,
    });
  });
  
  afterAll(() => {
    mockServer.stop();
  });
  
  it('should place order and receive confirmation', async () => {
    const order = await client.orders.place({
      dhanClientId: 'test-client',
      transactionType: 'BUY',
      exchangeSegment: 'NSE_EQ',
      productType: 'DELIVERY',
      orderType: 'MARKET',
      validity: 'DAY',
      securityId: '11536',
      quantity: 1,
      correlationId: 'test-order-1',
    });
    
    expect(order.orderId).toBeDefined();
    expect(order.status).toBe('SUCCESS');
    
    const requests = mockServer.getRequestHistory();
    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe('POST');
    expect(requests[0].url).toContain('/orders');
  });
});
```

### 7.3 Test Coverage Thresholds — Done

`jest.config.js` now sets `coverageThreshold` (global: 70% statements/lines,
55% branches, 62% functions — floors set a few points under the measured
baseline, not the 80%/70% aspirational numbers originally sketched below).
Per-directory thresholds weren't added: the codebase's coverage is
unevenly distributed enough that a blanket 90-100% on `src/client/` or
`src/errors/` would fail immediately rather than function as a real gate.
CI now runs `npm test -- --coverage` to enforce the global floor.

<details>
<summary>Original suggestion (superseded)</summary>

**Current State:** No coverage configuration.

**Recommendation:** Add to `jest.config.js`:

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    "./src/client/": {
      branches: 90,
      lines: 95,
    },
    "./src/errors/": {
      lines: 100,
    },
  },
};
```

</details>

---

## 8. Developer Experience

### 8.1 Comprehensive JSDoc Documentation

**Current State:** Some methods have JSDoc, but inconsistent coverage.

**Recommendation:** Add JSDoc to all public APIs:

```typescript
/**
 * Places a new order with the Dhan trading system.
 * 
 * @param order - The order details including instrument, quantity, and type.
 * @returns A promise resolving to the order confirmation with order ID.
 * @throws {ValidationError} If the order fails contract validation.
 * @throws {RiskViolationError} If the order violates risk limits.
 * @throws {NetworkError} If the API request fails.
 * 
 * @example
 * ```typescript
 * const order = await client.orders.place({
 *   dhanClientId: 'CLIENT123',
 *   transactionType: 'BUY',
 *   exchangeSegment: 'NSE_FNO',
 *   productType: 'INTRADAY',
 *   orderType: 'LIMIT',
 *   validity: 'DAY',
 *   securityId: '12345',
 *   quantity: 15,
 *   price: 19500.00,
 *   correlationId: 'strategy-entry-001',
 * });
 * 
 * console.log(`Order placed: ${order.orderId}`);
 * ```
 */
public async place(order: OrderRequest): Promise<OrderResponse> {
  // Implementation
}
```

### 8.2 Interactive Examples

**Current State:** Static examples in `/examples`.

**Recommendation:** Add runnable tutorials:

```typescript
// examples/tutorial/01-basic-setup.ts
/**
 * Tutorial 1: Basic Client Setup
 * 
 * This example shows how to initialize the DhanClient with different
 * authentication methods.
 */

import { DhanClient } from '@shubhamtaywade82/dhanhq-ts';

async function main() {
  // Method 1: Direct token
  const client1 = new DhanClient({
    clientId: process.env.DHAN_CLIENT_ID!,
    token: process.env.DHAN_ACCESS_TOKEN!,
  });
  
  // Method 2: From environment
  const client2 = DhanClient.fromEnv();
  
  // Method 3: With auto token management
  const client3 = new DhanClient({
    clientId: process.env.DHAN_CLIENT_ID!,
    token: process.env.DHAN_ACCESS_TOKEN!,
  });
  
  client3.auth.enableAutoTokenManagement({
    clientId: process.env.DHAN_CLIENT_ID!,
    pin: process.env.DHAN_PIN!,
    totpSecret: process.env.DHAN_TOTP_SECRET!,
  });
  
  // Test connectivity
  const profile = await client1.profile.getProfile();
  console.log(`Connected as: ${profile.clientName}`);
}

main().catch(console.error);
```

### 8.3 Error Message Improvements

**Current State:** Generic error messages.

**Recommendation:** Provide actionable error messages:

```typescript
export class AuthenticationError extends Error {
  constructor(
    context: string,
    message: string,
    public readonly suggestions: string[] = []
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
  
  public printHelp(): void {
    console.error(`\n❌ ${this.message}`);
    console.error('\n💡 Suggestions:');
    this.suggestions.forEach(s => console.error(`   • ${s}`));
    console.error('\n📚 Documentation: https://github.com/shubhamtaywade82/dhanhq-ts/docs/AUTHENTICATION.md\n');
  }
}

// Usage:
throw new AuthenticationError(
  'TokenManager',
  'TOTP code expired or invalid',
  [
    'Ensure your system clock is synchronized',
    'Check that the TOTP secret is correctly configured',
    'Generate a new TOTP code and try again',
    `Time remaining: ${totpSecondsRemaining}s`,
  ]
);
```

### 8.4 CLI Debug Tools

**Recommendation:** Add debug commands to MCP binary:

```typescript
// src/bin/dhanhq-debug.ts
#!/usr/bin/env node

import { DhanClient } from '../index';

const command = process.argv[2];

async function main() {
  const client = DhanClient.fromEnv({ debug: true });
  
  switch (command) {
    case 'test-connection':
      const profile = await client.profile.getProfile();
      console.log('✅ Connection successful');
      console.log(`   Client: ${profile.clientName}`);
      console.log(`   UCC: ${profile.ucc}`);
      break;
      
    case 'test-websocket':
      await client.ws.connect();
      console.log('✅ WebSocket connected');
      
      client.ws.market.subscribe([{
        exchangeSegment: 'NSE_EQ',
        securityId: '11536',
      }]);
      
      client.ws.market.once('tick', (tick) => {
        console.log('✅ Received tick:', tick);
        client.ws.disconnect();
        process.exit(0);
      });
      
      setTimeout(() => {
        console.error('❌ No ticks received within 10 seconds');
        process.exit(1);
      }, 10000);
      break;
      
    default:
      console.log('Usage: dhanhq-debug <command>');
      console.log('Commands:');
      console.log('  test-connection    Test REST API connectivity');
      console.log('  test-websocket     Test WebSocket feed');
      console.log('  list-instruments   List cached instrument segments');
  }
}

main().catch(console.error);
```

---

## 9. Feature Enhancements

### 9.1 Order Book Management

**Missing:** No order book tracking beyond WebSocket updates.

**Recommendation:** Add order book manager:

```typescript
export class OrderBook {
  private orders: Map<string, OrderState>;
  private byCorrelationId: Map<string, string>;
  
  public add(order: OrderPlacement): void {
    this.orders.set(order.orderId, {
      ...order,
      state: 'PENDING',
      fills: [],
      updatedAt: new Date(),
    });
    
    if (order.correlationId) {
      this.byCorrelationId.set(order.correlationId, order.orderId);
    }
  }
  
  public update(update: OrderUpdate): void {
    const order = this.orders.get(update.orderId);
    if (!order) return;
    
    order.state = update.status;
    order.filledQuantity = update.filledQuantity;
    order.averagePrice = update.avgTradedPrice;
    order.updatedAt = new Date();
    
    if (update.status === 'COMPLETE' || update.status === 'CANCELLED') {
      order.state = update.status;
    }
  }
  
  public getByCorrelationId(correlationId: string): OrderState | undefined {
    const orderId = this.byCorrelationId.get(correlationId);
    return orderId ? this.orders.get(orderId) : undefined;
  }
  
  public getOpenOrders(): OrderState[] {
    return Array.from(this.orders.values()).filter(
      o => o.state === 'PENDING' || o.state === 'OPEN'
    );
  }
  
  public getPnL(orderId: string, currentPrice: number): number {
    const order = this.orders.get(orderId);
    if (!order || !order.averagePrice) return 0;
    
    const qty = order.filledQuantity || order.quantity;
    const side = order.transactionType === 'BUY' ? 1 : -1;
    
    return (currentPrice - order.averagePrice) * side * qty;
  }
}
```

### 9.2 Multi-Account Support

**Recommendation:** Support multiple client accounts:

```typescript
export class MultiAccountClient {
  private accounts: Map<string, DhanClient>;
  
  public addAccount(accountId: string, config: DhanClientConfig): void {
    this.accounts.set(accountId, new DhanClient(config));
  }
  
  public getAccount(accountId: string): DhanClient {
    const client = this.accounts.get(accountId);
    if (!client) {
      throw new Error(`Account ${accountId} not found`);
    }
    return client;
  }
  
  public async getAllPositions(): Promise<Map<string, Position[]>> {
    const results = new Map<string, Position[]>();
    
    await Promise.all(
      Array.from(this.accounts.entries()).map(async ([id, client]) => {
        const positions = await client.positions.getAll();
        results.set(id, positions);
      })
    );
    
    return results;
  }
}
```

### 9.3 Backtesting Framework — Done

Implemented as `src/backtest/` (`types.ts`, `cursors.ts`, `indicators.ts`,
`runner.ts`, `metrics.ts`), exported from the package root. Differs from the
sketch below in shape, not intent — it grew out of a design review rather
than following this sketch directly:

- Bar-by-bar, not signal-list-up-front: `Strategy = (context) => StrategySignal`
  is called once per closed bar (`enter` / `exit` / `hold`), so a strategy can
  react to its own open position — the sketch's `strategy(context): Signal[]`
  shape can't express "exit when stopped out."
- Fills happen at the *next* bar's open, never the bar the signal was decided
  on — the sketch didn't specify fill timing, which is exactly where
  lookahead bias creeps in if left unspecified.
- One position at a time (`StrategyContext.position: OpenPosition | undefined`),
  not a portfolio — a deliberate v1 scope cut, not an oversight.
- Multi-timeframe from v1: `higherTimeframesMinutes` resamples the base
  series once, and a two-pointer cursor per timeframe guarantees a bar is
  only visible after it has fully closed — O(n), not O(n²), and reuses
  `analyzeMultiTimeframe()` for `indicators.bias()` so backtested bias
  matches the live multi-timeframe analyzer exactly.
- Risk gating reuses `Pipeline.report()` instead of a separate backtest-only
  risk model, so the limits validated in a backtest are the same code path
  as live trading.
- Options-strategy backtesting (synthetic Black-Scholes repricing over
  historical spot+IV) was scoped out — no historical option-chain data
  exists to validate against except near-expiry (`ExpiredOptionsData`).

<details>
<summary>Original suggestion (superseded)</summary>

**Roadmap Item:** Add backtesting harness.

**Recommendation:** Build on existing indicator layer:

```typescript
export interface BacktestConfig {
  startDate: Date;
  endDate: Date;
  initialCapital: number;
  instruments: InstrumentSubscription[];
  strategy: (context: BacktestContext) => Signal[];
}

export class Backtester {
  async run(config: BacktestConfig): Promise<BacktestResult> {
    const candles = await this.fetchHistoricalData(
      config.instruments,
      config.startDate,
      config.endDate
    );
    
    const signals = config.strategy({
      candles,
      indicators: {
        sma: (period) => calculateSMA(candles, period),
        rsi: (period) => calculateRSI(candles, period),
        // ... other indicators
      },
    });
    
    const trades = this.simulateTrades(signals, config.initialCapital);
    const metrics = this.calculateMetrics(trades, config.initialCapital);
    
    return {
      trades,
      metrics,
      equity: this.buildEquityCurve(trades, config.initialCapital),
    };
  }
}
```

</details>

---

## 10. DevOps & Release Process

### 10.1 Automated Release Pipeline

**Current State:** Manual release process documented in `docs/RELEASING.md`.

**Recommendation:** Add GitHub Actions workflow:

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run type checks
        run: npm run typecheck
      
      - name: Run tests
        run: npm test -- --runInBand
      
      - name: Build
        run: npm run build
      
      - name: Publish to npm
        run: npm publish --access public --provenance
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          generate_release_notes: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 10.2 Semantic Release

**Recommendation:** Automate versioning with conventional commits:

```json
{
  "devDependencies": {
    "@semantic-release/changelog": "^6.0.0",
    "@semantic-release/git": "^10.0.0",
    "@semantic-release/github": "^9.0.0",
    "semantic-release": "^23.0.0",
    "conventional-changelog-cli": "^4.0.0"
  },
  "release": {
    "branches": ["main"],
    "plugins": [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      "@semantic-release/changelog",
      "@semantic-release/npm",
      "@semantic-release/github",
      "@semantic-release/git"
    ]
  }
}
```

### 10.3 Smoke Test Automation

**Current State:** Manual smoke test script.

**Recommendation:** Add to CI pipeline:

```yaml
# .github/workflows/smoke-test.yml
name: Smoke Test

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  smoke:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Run smoke tests
        run: npm run smoke
        env:
          DHAN_CLIENT_ID: ${{ secrets.DHAN_CLIENT_ID }}
          DHAN_ACCESS_TOKEN: ${{ secrets.DHAN_ACCESS_TOKEN }}
      
      - name: Notify on failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "❌ Smoke tests failed for dhanhq-ts",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Smoke Test Failure*\nRepository: shubhamtaywade82/dhanhq-ts\nRun: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## 11. Documentation Improvements

### 11.1 API Reference Generation — Done

`typedoc.json` generates markdown (via `typedoc-plugin-markdown`) straight
into `website/reference/` — the existing VitePress site, not a
disconnected `docs/api` folder — so the exhaustive, JSDoc-derived reference
sits alongside the hand-curated guides already in `website/api/*.md`
instead of competing with them. `src/generated/**` (the OpenAPI codegen
output) is excluded from the crawl: those ~170 files are low-value to
document standalone, and `GeneratedClient`'s own page already explains the
escape hatch and points readers back to the wrapped resource classes.
Wired into `npm run docs:api` (standalone) and prepended to `docs:dev` /
`docs:build`, so CI's existing `docs.yml` (which already runs
`npm run docs:build`) picks it up with no workflow changes. Generated
output is gitignored, not committed — regenerated fresh on every build.

One limitation worth knowing: `docs.yml` only triggers on
`website/**` changes, so a `src/`-only change (e.g. a JSDoc edit) won't by
itself redeploy the live reference until something under `website/` also
changes or the workflow is dispatched manually. Left as-is rather than
widening the trigger to `src/**`, since that path scoping looked like a
deliberate choice to avoid a docs redeploy on every unrelated commit.

<details>
<summary>Original suggestion (superseded)</summary>

**Recommendation:** Generate API docs from JSDoc:

```json
{
  "devDependencies": {
    "typedoc": "^0.25.0",
    "typedoc-plugin-markdown": "^3.17.0"
  },
  "scripts": {
    "docs": "typedoc --plugin typedoc-plugin-markdown --out docs/api src/index.ts"
  }
}
```

```json
// typedoc.json
{
  "entryPoints": ["src/index.ts"],
  "out": "docs/api",
  "plugin": ["typedoc-plugin-markdown"],
  "excludePrivate": true,
  "excludeProtected": false,
  "includeVersion": true,
  "readme": "none"
}
```

</details>

### 11.2 Migration Guide

**Recommendation:** Add migration guide for breaking changes:

```markdown
# Migration Guide

## v0.3.0 (Upcoming)

### Breaking Changes

#### Token Configuration

**Before:**
```typescript
new DhanClient({ clientId, token })
```

**After:**
```typescript
new DhanClient({ 
  clientId, 
  token: new Secret(token) // Prevents accidental logging
})
```

#### WebSocket Events

**Before:**
```typescript
client.ws.market.on('tick', (tick) => {})
```

**After:**
```typescript
// Ticks are now batched for performance
client.ws.market.on('tick', (ticks: MarketTick[]) => {
  for (const tick of ticks) {
    // Process each tick
  }
})
```

### New Features

- Added circuit breaker for HTTP requests
- Exponential backoff with jitter for WebSocket reconnection
- Structured logging with configurable log levels
- Order book management utilities

## v0.2.0

First published release. See README.md for usage.
```

### 11.3 Troubleshooting Guide

**Recommendation:** Add troubleshooting documentation:

```markdown
# Troubleshooting

## Common Issues

### "Authentication failed: Invalid PIN"

**Causes:**
- Incorrect PIN configured
- Account locked after multiple failed attempts
- PIN changed but configuration not updated

**Solutions:**
1. Verify PIN in Dhan mobile app
2. Wait 30 minutes if account is temporarily locked
3. Update `.env` file with correct PIN
4. Check for extra whitespace: `trim()` your values

### WebSocket keeps reconnecting

**Causes:**
- Network instability
- Token expired
- Server-side maintenance

**Debug Steps:**
```bash
DHANHQ_DEBUG=true node your-script.js
```

Look for logs like:
```
2024-01-15T10:30:00.000Z [DhanHQ][DEBUG] WebSocket disconnected: reason=1006
2024-01-15T10:30:01.000Z [DhanHQ][INFO] Reconnecting in 2000ms (attempt 1)
```

**Solutions:**
1. Enable auto token management
2. Check network connectivity
3. Verify Dhan API status page

### Rate limit exceeded

**Symptoms:**
```
RateLimitError: Too many requests
```

**Solutions:**
1. Reduce request frequency
2. Use WebSocket instead of REST polling
3. Cache instrument data locally
4. Implement request batching
```

---

## 12. Browser Compatibility

### 12.1 Browser-Safe Bundle

**Current State:** Documented limitations in `docs/BROWSER.md`.

**Recommendation:** Create browser-specific entry point:

```typescript
// src/browser.ts - Browser-safe exports only
export {
  // Indicators (pure functions)
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  // ... all indicators
  
  // Analytics (pure functions)
  blackScholes,
  calculateGreeks,
  impliedVolatility,
  maxPain,
  pcr,
  // ... all analytics
  
  // Risk (pure functions)
  calculatePositionSize,
  calculateStopLoss,
  calculateTarget,
  // ... all risk calculations
  
  // Types
  type IndicatorResult,
  type OptionAnalytics,
  type RiskMetrics,
} from './index';

// Explicitly exclude:
// - DhanClient (needs credentials)
// - WebSocket classes (need tokens)
// - MCP server (Node-only)
```

Update `package.json`:
```json
{
  "exports": {
    ".": {
      "browser": {
        "types": "./dist/browser.d.mts",
        "default": "./dist/browser.mjs"
      },
      "node": {
        "types": "./dist/index.d.mts",
        "default": "./dist/index.mjs"
      }
    }
  }
}
```

### 12.2 Backend Proxy Example

**Recommendation:** Provide reference implementation:

```typescript
// examples/backend-proxy/server.ts
import express from 'express';
import { DhanClient } from '@shubhamtaywade82/dhanhq-ts';

const app = express();
const client = DhanClient.fromEnv();

// Read-only endpoints for frontend
app.get('/api/ltp/:securityId', async (req, res) => {
  try {
    const quote = await client.marketFeed.getQuote({
      exchangeSegment: 'NSE_EQ',
      securityId: req.params.securityId,
    });
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

app.get('/api/positions', async (req, res) => {
  try {
    const positions = await client.positions.getAll();
    res.json(positions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch positions' });
  }
});

// NO order placement endpoints - keep write operations server-side only
app.listen(3000, () => {
  console.log('Proxy server running on port 3000');
});
```

---

## 13. Monitoring & Metrics

### 13.1 Built-in Metrics

**Recommendation:** Add metrics collection:

```typescript
export interface SDKMetrics {
  requestsTotal: number;
  requestsByEndpoint: Map<string, number>;
  requestDuration: Histogram;
  errorsTotal: Counter;
  websocketReconnects: Counter;
  ordersPlaced: Counter;
  ordersRejected: Counter;
}

export class MetricsCollector {
  private metrics: SDKMetrics;
  
  public recordRequest(endpoint: string, duration: number, success: boolean): void {
    this.metrics.requestsTotal++;
    this.metrics.requestsByEndpoint.set(
      endpoint,
      (this.metrics.requestsByEndpoint.get(endpoint) || 0) + 1
    );
    this.metrics.requestDuration.observe(duration);
    
    if (!success) {
      this.metrics.errorsTotal.inc();
    }
  }
  
  public recordOrderPlaced(): void {
    this.metrics.ordersPlaced.inc();
  }
  
  public recordOrderRejected(reason: string): void {
    this.metrics.ordersRejected.inc({ reason });
  }
  
  public export(): PrometheusFormat {
    // Export in Prometheus format
    return formatPrometheus(this.metrics);
  }
}

// In DhanClient:
constructor(config: DhanClientConfig) {
  this.metrics = config.metricsCollector ?? new MetricsCollector();
}
```

### 13.2 Health Check Endpoint

**Recommendation:** Add health check for MCP server:

```typescript
// In MCP server:
{
  jsonrpc: '2.0',
  id: 1,
  method: 'dhanhq/health',
  params: {}
}

// Response:
{
  jsonrpc: '2.0',
  id: 1,
  result: {
    status: 'healthy',
    version: '0.2.0',
    uptime: 3600,
    lastApiCall: '2024-01-15T10:30:00Z',
    websocketConnected: true,
    tokenExpiry: '2024-01-15T16:00:00Z',
  }
}
```

---

## Priority Matrix

| Improvement | Impact | Effort | Priority |
|------------|--------|--------|----------|
| Exponential backoff with jitter | High | Low | **P0** |
| Structured logging | High | Medium | **P0** |
| JSDoc documentation | High | Medium | **P0** |
| Input validation with Zod | High | Medium | **P1** |
| WebSocket heartbeat | High | Low | **P1** |
| Integration test infrastructure | High | High | **P1** |
| Rate limiting improvements | Medium | Medium | **P2** |
| Circuit breaker pattern | Medium | Medium | **P2** |
| Order book management | Medium | Medium | **P2** |
| Browser-safe bundle | Low | Medium | **P3** |
| Backtesting framework | High | High | **P3** |
| Multi-account support | Low | High | **P3** |

---

## Quick Wins (Can be implemented in < 1 day each)

1. ✅ Add exponential backoff with jitter to `BaseWS.ts`
2. ✅ Add JSDoc to public API methods in `DhanClient.ts`
3. ✅ Add debug mode with environment variable
4. ✅ Improve error messages with suggestions
5. ✅ Add WebSocket ping-pong heartbeat
6. ✅ Configure ESLint and Prettier
7. ✅ Add more TypeScript strict flags
8. ✅ Create troubleshooting documentation

---

## Conclusion

This SDK demonstrates strong engineering fundamentals with a well-architected layered design, comprehensive feature set, and good test coverage. The improvements suggested above focus on:

1. **Reliability** - Better error handling, retry logic, and monitoring
2. **Developer Experience** - Documentation, debugging tools, and clearer error messages
3. **Performance** - Optimized caching, batching, and connection management
4. **Security** - Input validation, secret handling, and rate limiting
5. **Observability** - Logging, metrics, and health checks

Implementing these suggestions incrementally, starting with P0 priorities, will significantly enhance the SDK's production readiness and developer satisfaction.
