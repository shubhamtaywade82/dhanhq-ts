import { CircuitBreaker } from "../src/client/CircuitBreaker";
import { CircuitOpenError } from "../src/errors/CircuitOpenError";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("CircuitBreaker", () => {
  it("stays closed and passes through results while calls succeed", async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 3 });

    const result = await breaker.execute(async () => "ok");

    expect(result).toBe("ok");
    expect(breaker.getState()).toBe("closed");
  });

  it("opens after the configured number of consecutive failures", async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 2, resetTimeoutMs: 10_000 });
    const failing = () => Promise.reject(new Error("boom"));

    await expect(breaker.execute(failing)).rejects.toThrow("boom");
    expect(breaker.getState()).toBe("closed");

    await expect(breaker.execute(failing)).rejects.toThrow("boom");
    expect(breaker.getState()).toBe("open");
  });

  it("rejects immediately with CircuitOpenError while open, without calling the task", async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 10_000 });
    await expect(breaker.execute(() => Promise.reject(new Error("boom")))).rejects.toThrow();

    const task = jest.fn(async () => "should not run");
    await expect(breaker.execute(task)).rejects.toBeInstanceOf(CircuitOpenError);
    expect(task).not.toHaveBeenCalled();
  });

  it("only counts errors matching isFailure", async () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 1,
      isFailure: (error) => error instanceof RangeError,
    });

    await expect(breaker.execute(() => Promise.reject(new TypeError("ignored")))).rejects.toThrow();
    expect(breaker.getState()).toBe("closed");

    await expect(breaker.execute(() => Promise.reject(new RangeError("counted")))).rejects.toThrow();
    expect(breaker.getState()).toBe("open");
  });

  it("moves to half-open after the reset timeout and closes again on a successful trial", async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 20 });
    await expect(breaker.execute(() => Promise.reject(new Error("boom")))).rejects.toThrow();
    expect(breaker.getState()).toBe("open");

    await sleep(30);
    expect(breaker.getState()).toBe("half-open");

    const result = await breaker.execute(async () => "recovered");
    expect(result).toBe("recovered");
    expect(breaker.getState()).toBe("closed");
  });

  it("reopens immediately if the half-open trial fails", async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 5, resetTimeoutMs: 20 });
    await expect(breaker.execute(() => Promise.reject(new Error("first")))).rejects.toThrow();
    // Below threshold, still closed.
    expect(breaker.getState()).toBe("closed");

    // Force it open with more failures to exercise the half-open path independently.
    const openBreaker = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 20 });
    await expect(openBreaker.execute(() => Promise.reject(new Error("boom")))).rejects.toThrow();
    await sleep(30);
    expect(openBreaker.getState()).toBe("half-open");

    await expect(
      openBreaker.execute(() => Promise.reject(new Error("still failing"))),
    ).rejects.toThrow("still failing");
    expect(openBreaker.getState()).toBe("open");
  });
});
