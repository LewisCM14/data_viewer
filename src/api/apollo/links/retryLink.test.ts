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
});
