import { Observable } from "@apollo/client";
import { describe, expect, test } from "vitest";
import { timeoutLink } from "./timeoutLink";

describe("timeoutLink", () => {
  test("completes when forward completes quickly", async () => {
    const link = timeoutLink(50);
    const forward = () =>
      new Observable((observer) => {
        observer.next("ok");
        observer.complete();
      });

    // biome-ignore lint/suspicious/noExplicitAny: mocking Apollo Link operation for timeout testing
    const op = { setContext: () => {}, getContext: () => ({}) } as any;
    const result = await new Promise((resolve, reject) => {
      // biome-ignore lint/suspicious/noExplicitAny: mocking Apollo Link forward function
      const obs = link.request(op, forward as any);
      obs?.subscribe({ next: resolve, error: reject });
    });
    expect(result).toBe("ok");
  });

  test("errors with Timeout when forward never completes", async () => {
    const link = timeoutLink(10);
    const forward = () =>
      new Observable(() => {
        // never call next/complete
      });

    // biome-ignore lint/suspicious/noExplicitAny: mocking Apollo Link operation for timeout testing
    const op = { setContext: () => {}, getContext: () => ({}) } as any;
    await expect(
      new Promise((resolve, reject) => {
        // biome-ignore lint/suspicious/noExplicitAny: mocking Apollo Link forward function
        const obs = link.request(op, forward as any);
        obs?.subscribe({ next: resolve, error: reject });
      }),
    ).rejects.toThrow("Timeout");
  });

  test("cleanup path unsubscribes without throwing", () => {
    const link = timeoutLink(1000);
    const forward = () =>
      new Observable(() => {
        // never emit
        return () => {};
      });

    // biome-ignore lint/suspicious/noExplicitAny: mocking Apollo Link operation for timeout testing
    const op = { setContext: () => {}, getContext: () => ({}) } as any;
    // biome-ignore lint/suspicious/noExplicitAny: mocking Apollo Link forward function
    const obs = link.request(op, forward as any);
    const sub = obs?.subscribe({
      next: () => {},
      error: () => {},
      complete: () => {},
    });
    // unsubscribing should trigger cleanup code paths
    expect(() => sub?.unsubscribe()).not.toThrow();
  });
});
