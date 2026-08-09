import { ApolloLink, Observable } from "@apollo/client";
import type { FetchResult } from "@apollo/client";

/**
 * retryLink
 *
 * Simple retry link that retries on network errors up to `maxAttempts` with
 * exponential backoff. This is a lightweight implementation suitable for
 * unit testing the behaviour contract.
 */

export function retryLink({ maxAttempts = 3, baseDelay = 100 } = {}) {
  // Helper moved outside the Observable below to reduce nested function
  // depth inside the main callback (satisfies Sonar's nesting rule).
  function subscribeOnceExternal(
    forward: ApolloLink["request"] | undefined,
    operation: Parameters<NonNullable<ApolloLink["request"]>>[0] | undefined,
    observer: {
      next: (v: FetchResult) => void;
      error?: (e: unknown) => void;
      complete?: () => void;
    },
  ): { promise: Promise<void>; unsubscribe: () => void } {
    if (!forward)
      return { promise: Promise.resolve(), unsubscribe: () => undefined };

    let sub: { unsubscribe: () => void } | null = null;
    const promise = new Promise<void>((resolve, reject) => {
      // `forward` expects a GraphQLRequest; we cast narrowly to satisfy types.
      sub = forward(
        operation as unknown as Parameters<
          NonNullable<ApolloLink["request"]>
        >[0],
      ).subscribe({
        next: (value: FetchResult) => observer.next(value),
        error: (err: unknown) => reject(err),
        complete: () => resolve(),
      });
    });

    return { promise, unsubscribe: () => sub?.unsubscribe() };
  }

  async function runRetry(
    forward: ApolloLink["request"] | undefined,
    operation: Parameters<NonNullable<ApolloLink["request"]>>[0] | undefined,
    observer: { next: (v: FetchResult) => void; error: (e: unknown) => void },
    cancelToken: { cancelled: boolean },
    setActiveUnsub?: (fn: (() => void) | null) => void,
  ): Promise<void> {
    let attempts = 0;

    const delayMs = (attempt: number) =>
      2 ** (attempt - 1) * baseDelay + Math.random() * 20;

    while (!cancelToken.cancelled) {
      attempts += 1;
      const { promise, unsubscribe } = subscribeOnceExternal(
        forward,
        operation,
        observer,
      );
      setActiveUnsub?.(unsubscribe);
      try {
        // wait for the subscription to complete or fail
        await promise;
        return; // success
      } catch (err) {
        if (attempts >= maxAttempts) {
          observer.error(err);
          return;
        }
        await new Promise((res) => setTimeout(res, delayMs(attempts)));
        setActiveUnsub?.(null);
        // try again
      }
    }
  }

  return new ApolloLink((operation, forward) => {
    return new Observable<FetchResult>((observer) => {
      const cancelToken = { cancelled: false };

      // Kick off the retry loop outside of deeply nested anonymous functions
      let activeUnsub: (() => void) | null = null;
      void runRetry(forward, operation, observer, cancelToken, (fn) => {
        activeUnsub = fn;
      }).then(() => {
        if (!cancelToken.cancelled) observer.complete();
      });

      // the Observable unsubscribe should signal cancellation and clear any
      // active subscription via `activeUnsub` when present.
      return () => {
        cancelToken.cancelled = true;
        if (activeUnsub) activeUnsub();
      };
    });
  });
}
