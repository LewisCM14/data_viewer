import { ApolloLink, Observable } from "@apollo/client";
import type { FormattedExecutionResult } from "graphql";

/**
 * retryLink
 *
 * Simple retry link that retries on network errors up to `maxAttempts` with
 * exponential backoff. This is a lightweight implementation suitable for
 * unit testing the behaviour contract.
 */

type LinkResult = FormattedExecutionResult<
  Record<string, unknown>,
  Record<string, unknown>
>;

// NextLink is the forwarding function type from Apollo's link chain
type NextLink = (operation: unknown) => Observable<LinkResult>;

function subscribeOnceExternal(
  forward: NextLink,
  operation: unknown,
  observer: {
    next: (v: LinkResult) => void;
    error?: (e: unknown) => void;
    complete?: () => void;
  },
): { promise: Promise<void>; unsubscribe: () => void } {
  let sub: { unsubscribe: () => void } | null = null;
  const promise = new Promise<void>((resolve, reject) => {
    sub = forward(operation).subscribe({
      next: (value: LinkResult) => observer.next(value),
      error: (err: unknown) => reject(err),
      complete: () => resolve(),
    });
  });

  return { promise, unsubscribe: () => sub?.unsubscribe() };
}

async function runRetry(
  forward: NextLink,
  operation: unknown,
  observer: { next: (v: LinkResult) => void; error: (e: unknown) => void },
  baseDelay: number,
  maxAttempts: number,
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

export function retryLink({ maxAttempts = 3, baseDelay = 100 } = {}) {
  return new ApolloLink((operation, forward) => {
    return new Observable<LinkResult>((observer) => {
      const cancelToken = { cancelled: false };

      // Kick off the retry loop outside of deeply nested anonymous functions
      let activeUnsub: (() => void) | null = null;
      void runRetry(
        forward as NextLink,
        operation,
        observer,
        baseDelay,
        maxAttempts,
        cancelToken,
        (fn) => {
          activeUnsub = fn;
        },
      ).then(() => {
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
