/* istanbul ignore file */
import { ApolloLink, Observable } from "@apollo/client";

export function timeoutLink(timeout = 30000) {
  return new ApolloLink(
    (operation, forward) =>
      new Observable((observer) => {
        const controller = new AbortController();
        const timer = setTimeout(() => {
          controller.abort();
          observer.error(new Error("Timeout"));
        }, timeout);

        // attach signal to context so downstream links/HttpLink can use it
        operation.setContext(({ fetchOptions = {} } = {}) => ({
          fetchOptions: { ...fetchOptions, signal: controller.signal },
        }));

        const sub = forward(operation).subscribe({
          next: (v) => observer.next(v),
          error: (e) => observer.error(e),
          complete: () => observer.complete(),
        });

        return () => {
          clearTimeout(timer);
          sub.unsubscribe();
          controller.abort();
        };
      }),
  );
}
