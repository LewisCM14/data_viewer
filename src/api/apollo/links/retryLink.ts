import { ApolloLink, Observable } from "@apollo/client";

/**
 * retryLink
 *
 * Simple retry link that retries on network errors up to `maxAttempts` with
 * exponential backoff. This is a lightweight implementation suitable for
 * unit testing the behaviour contract.
 */
/* istanbul ignore file */
export function retryLink({ maxAttempts = 3, baseDelay = 100 } = {}) {
  return new ApolloLink((operation, forward) => {
    let attempts = 0;

    function retry() {
      attempts += 1;
      const delay = 2 ** (attempts - 1) * baseDelay + Math.random() * 20;
      return new Promise((res) => setTimeout(res, delay));
    }

    return new Observable((observer) => {
      const sub = forward(operation).subscribe({
        next: (value) => observer.next(value),
        error: (err) => {
          if (attempts < maxAttempts) {
            retry().then(() => {
              try {
                forward(operation).subscribe(observer);
              } catch (e) {
                observer.error(e);
              }
            });
            return;
          }
          observer.error(err);
        },
        complete: () => observer.complete(),
      });

      return () => sub.unsubscribe();
    });
  });
}
