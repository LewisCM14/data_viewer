import { Observable } from "@apollo/client";
import { describe, expect, test } from "vitest";
import { retryLink } from "./retryLink";

describe("retryLink", () => {
  test("retries once and resolves", async () => {
    const link = retryLink({ maxAttempts: 2, baseDelay: 0 });
    let calls = 0;
    const forward = () =>
      new Observable((observer) => {
        calls += 1;
        if (calls === 1) {
          observer.error(new Error("boom"));
        } else {
          observer.next("ok");
          observer.complete();
        }
      });

    // biome-ignore lint/suspicious/noExplicitAny: mocking Apollo Link operation for retry testing
    const op = { setContext: () => {}, getContext: () => ({}) } as any;
    const result = await new Promise((resolve, reject) => {
      // biome-ignore lint/suspicious/noExplicitAny: mocking Apollo Link forward function
      const obs = link.request(op, forward as any);
      obs?.subscribe({ next: resolve, error: reject });
    });

    expect(result).toBe("ok");
  });

  test("errors after max attempts", async () => {
    const link = retryLink({ maxAttempts: 1, baseDelay: 0 });
    const forward = () =>
      new Observable((observer) => {
        observer.error(new Error("boom"));
      });

    // biome-ignore lint/suspicious/noExplicitAny: mocking Apollo Link operation for retry testing
    const op = { setContext: () => {}, getContext: () => ({}) } as any;
    await expect(
      new Promise((resolve, reject) => {
        // biome-ignore lint/suspicious/noExplicitAny: mocking Apollo Link forward function
        const obs = link.request(op, forward as any);
        obs?.subscribe({ next: resolve, error: reject });
      }),
    ).rejects.toThrow("boom");
  });

  test("handles synchronous throw during retry's forwarded subscribe", async () => {
    const link = retryLink({ maxAttempts: 2, baseDelay: 0 });
    let calls = 0;
    const forward = () => ({
      // biome-ignore lint/suspicious/noExplicitAny: mocking Apollo Link observer for retry testing
      subscribe: (observer: any) => {
        calls += 1;
        if (calls === 1) {
          observer.error(new Error("boom"));
          return { unsubscribe: () => {} };
        }
        // second attempt throws synchronously from subscribe
        throw new Error("sync throw");
      },
    });

    // biome-ignore lint/suspicious/noExplicitAny: mocking Apollo Link operation for retry testing
    const op = { setContext: () => {}, getContext: () => ({}) } as any;
    await expect(
      new Promise((resolve, reject) => {
        // biome-ignore lint/suspicious/noExplicitAny: mocking Apollo Link forward function
        const obs = link.request(op, forward as any);
        obs?.subscribe({ next: resolve, error: reject });
      }),
    ).rejects.toThrow("sync throw");
  });

  test("unsubscribes during retry with activeUnsub set", async () => {
    const link = retryLink({ maxAttempts: 100, baseDelay: 10 });
    let unsubCalls = 0;
    const forward = () =>
      new Observable((observer) => {
        // Fail immediately to trigger retries
        observer.error(new Error("always fails"));
        return () => {
          unsubCalls += 1;
        };
      });

    // biome-ignore lint/suspicious/noExplicitAny: mocking Apollo Link operation for retry testing
    const op = { setContext: () => {}, getContext: () => ({}) } as any;
    // biome-ignore lint/suspicious/noExplicitAny: mocking Apollo Link forward function
    const obs = link.request(op, forward as any);
    const sub = obs?.subscribe({
      next: () => {},
      error: () => {},
    });

    // Unsubscribe after retry attempts have started (activeUnsub is set)
    await new Promise((resolve) => setTimeout(resolve, 5));
    sub?.unsubscribe();

    // Verify the subscription cleanup was called
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(unsubCalls).toBeGreaterThan(0);
  });

  test("cancellation during retry delay (between attempts)", async () => {
    const link = retryLink({ maxAttempts: 10, baseDelay: 30 });
    let cleanups = 0;
    const forward = () =>
      new Observable((observer) => {
        // Fail to trigger retry
        observer.error(new Error("fail"));
        return () => {
          cleanups += 1;
        };
      });

    // biome-ignore lint/suspicious/noExplicitAny: mocking Apollo Link operation for retry testing
    const op = { setContext: () => {}, getContext: () => ({}) } as any;
    // biome-ignore lint/suspicious/noExplicitAny: mocking Apollo Link forward function
    const obs = link.request(op, forward as any);
    const sub = obs?.subscribe({ next: () => {}, error: () => {} });

    // Let first attempt complete, then unsubscribe during retry delay
    await new Promise((resolve) => setTimeout(resolve, 10));
    sub?.unsubscribe();

    // Let any pending cleanup finish
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(cleanups).toBeGreaterThan(0);
  });

  test("successful completion does not call complete if cancelled", async () => {
    const link = retryLink({ maxAttempts: 2, baseDelay: 0 });
    let calls = 0;
    let observerCompleteCalled = false;
    const forward = () =>
      new Observable((observer) => {
        calls += 1;
        if (calls === 1) {
          observer.error(new Error("fail once"));
        } else {
          observer.next("success");
          observer.complete();
        }
      });

    // biome-ignore lint/suspicious/noExplicitAny: mocking Apollo Link operation for retry testing
    const op = { setContext: () => {}, getContext: () => ({}) } as any;
    // biome-ignore lint/suspicious/noExplicitAny: mocking Apollo Link forward function
    const obs = link.request(op, forward as any);
    const sub = obs?.subscribe({
      next: () => {
        sub?.unsubscribe(); // Unsubscribe immediately after first value
      },
      error: () => {
        sub?.unsubscribe();
      },
      complete: () => {
        observerCompleteCalled = true;
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));
    // Observer.complete should not have been called because we unsubscribed
    expect(observerCompleteCalled).toBe(false);
  });
});
