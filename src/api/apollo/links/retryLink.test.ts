import { Observable } from "@apollo/client";
import { afterEach, describe, expect, test, vi } from "vitest";
import { retryLink } from "./retryLink";

describe("retryLink", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("retries once and resolves", async () => {
    vi.useFakeTimers();
    let calls = 0;
    const response = { data: { node: "ok" } };
    const forward = () =>
      new Observable((observer) => {
        calls += 1;
        if (calls === 1) {
          observer.error(new Error("boom"));
        } else {
          // biome-ignore lint/suspicious/noExplicitAny: mock graphql response shape
          observer.next(response as any);
          observer.complete();
        }
      });

    // biome-ignore lint/suspicious/noExplicitAny: mocking Apollo Link operation for retry testing
    const op = { setContext: () => {}, getContext: () => ({}) } as any;
    let result: unknown;
    // biome-ignore lint/suspicious/noExplicitAny: mocking Apollo Link forward function
    retryLink.request(op, forward as any)?.subscribe({
      next: (v) => {
        result = v;
      },
      error: () => {},
    });

    await vi.runAllTimersAsync();
    expect(result).toEqual(response);
  });

  test("errors after max attempts", async () => {
    vi.useFakeTimers();
    const forward = () =>
      new Observable((observer) => {
        observer.error(new Error("boom"));
      });

    // biome-ignore lint/suspicious/noExplicitAny: mocking Apollo Link operation for retry testing
    const op = { setContext: () => {}, getContext: () => ({}) } as any;
    let capturedError: unknown;
    // biome-ignore lint/suspicious/noExplicitAny: mocking Apollo Link forward function
    retryLink.request(op, forward as any)?.subscribe({
      next: () => {},
      error: (e) => {
        capturedError = e;
      },
    });

    await vi.runAllTimersAsync();
    expect(capturedError).toBeInstanceOf(Error);
    expect((capturedError as Error).message).toBe("boom");
  });

  test("does not retry on AbortError", async () => {
    let calls = 0;
    const forward = () =>
      new Observable((observer) => {
        calls += 1;
        const err = new Error("aborted");
        err.name = "AbortError";
        observer.error(err);
      });

    // biome-ignore lint/suspicious/noExplicitAny: mocking Apollo Link operation for retry testing
    const op = { setContext: () => {}, getContext: () => ({}) } as any;
    await expect(
      new Promise((resolve, reject) => {
        // biome-ignore lint/suspicious/noExplicitAny: mocking Apollo Link forward function
        retryLink.request(op, forward as any)?.subscribe({ next: resolve, error: reject });
      }),
    ).rejects.toThrow("aborted");
    expect(calls).toBe(1);
  });

  test("does not retry when userSignal is aborted", async () => {
    let calls = 0;
    const forward = () =>
      new Observable((observer) => {
        calls += 1;
        observer.error(new Error("network error"));
      });

    // biome-ignore lint/suspicious/noExplicitAny: mocking Apollo Link operation with aborted signal
    const op = {
      setContext: () => {},
      getContext: () => ({ userSignal: { aborted: true } }),
    } as any;
    await expect(
      new Promise((resolve, reject) => {
        // biome-ignore lint/suspicious/noExplicitAny: mocking Apollo Link forward function
        retryLink.request(op, forward as any)?.subscribe({ next: resolve, error: reject });
      }),
    ).rejects.toThrow("network error");
    expect(calls).toBe(1);
  });
});
