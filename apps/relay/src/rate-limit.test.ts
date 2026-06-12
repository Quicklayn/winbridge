import { describe, expect, it } from "vitest";
import { createDevelopmentRateLimiter, SlidingWindowRateLimiter } from "./rate-limit.js";

describe("SlidingWindowRateLimiter", () => {
  it("allows attempts until the limit is reached", () => {
    const limiter = new SlidingWindowRateLimiter({ limit: 2, windowMs: 1000 });
    const now = new Date("2026-06-11T00:00:00.000Z");

    expect(limiter.consume("peer", now)).toMatchObject({ allowed: true, remaining: 1 });
    expect(limiter.consume("peer", now)).toMatchObject({ allowed: true, remaining: 0 });
    expect(limiter.consume("peer", now)).toMatchObject({ allowed: false, remaining: 0 });
  });

  it("allows attempts again after the window resets", () => {
    const limiter = new SlidingWindowRateLimiter({ limit: 1, windowMs: 1000 });

    expect(limiter.consume("peer", new Date("2026-06-11T00:00:00.000Z")).allowed).toBe(true);
    expect(limiter.consume("peer", new Date("2026-06-11T00:00:00.500Z")).allowed).toBe(false);
    expect(limiter.consume("peer", new Date("2026-06-11T00:00:01.001Z")).allowed).toBe(true);
  });

  it("supports environment defaults and overrides", () => {
    expect(createDevelopmentRateLimiter({}, "WINBRIDGE_RELAY_TEST").consume("peer").limit).toBe(5);

    const limiter = createDevelopmentRateLimiter(
      {
        WINBRIDGE_RELAY_TEST_LIMIT: "3",
        WINBRIDGE_RELAY_TEST_WINDOW_MS: "2000"
      },
      "WINBRIDGE_RELAY_TEST"
    );

    expect(limiter.consume("peer").limit).toBe(3);
  });

  it("uses canonical environment override values", () => {
    const limiter = createDevelopmentRateLimiter(
      {
        WINBRIDGE_RELAY_TEST_LIMIT: "10",
        WINBRIDGE_RELAY_TEST_WINDOW_MS: "1000"
      },
      "WINBRIDGE_RELAY_TEST"
    );

    const decision = limiter.consume("peer", new Date("2026-06-11T00:00:00.000Z"));

    expect(decision).toMatchObject({
      allowed: true,
      limit: 10,
      remaining: 9,
      resetAt: "2026-06-11T00:00:01.000Z"
    });
  });

  it("rejects malformed environment overrides", () => {
    for (const limit of ["", "0", "-1", "1.5", "5x", "01", "05"]) {
      expect(() =>
        createDevelopmentRateLimiter(
          { WINBRIDGE_RELAY_TEST_LIMIT: limit },
          "WINBRIDGE_RELAY_TEST"
        )
      ).toThrow("WINBRIDGE_RELAY_TEST_LIMIT");
    }

    for (const windowMs of ["", "999", "-1", "1000.5", "60000x", "01000", "060000"]) {
      expect(() =>
        createDevelopmentRateLimiter(
          { WINBRIDGE_RELAY_TEST_WINDOW_MS: windowMs },
          "WINBRIDGE_RELAY_TEST"
        )
      ).toThrow("WINBRIDGE_RELAY_TEST_WINDOW_MS");
    }
  });
});
