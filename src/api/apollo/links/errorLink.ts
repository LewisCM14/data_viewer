import { ApolloLink, Observable } from "@apollo/client";
import type { FormattedExecutionResult, GraphQLError } from "graphql";
import useNotificationSlice from "../../../store/slices/notificationSlice";

/**
 * Observer interface for handling Observable subscription events.
 */
interface Observer<T> {
  next(value: T): void;
  error(error: unknown): void;
  complete(): void;
}

/**
 * Safely converts a value to a string, handling circular references, functions, and errors.
 *
 * @param value - The value to stringify
 * @returns A safe string representation of the value
 *
 * @example
 * ```ts
 * safeStringify(new Error("Test")) // => "Test"
 * safeStringify({ a: 1, fn: () => {} }) // => '{"a":1,"fn":"[Function: fn]"}'
 * ```
 */
function safeStringify(value: unknown): string {
  if (!value) return String(value);
  if (value instanceof Error) return value.message;
  if (typeof value === "string") return value;

  // Handle circular references and other non-serialisable values.
  const seen = new WeakSet();
  try {
    return JSON.stringify(value, (_key, val) => {
      if (val && typeof val === "object") {
        if (seen.has(val as object)) return "[Circular]";
        seen.add(val as object);
      }
      // convert functions to a short description
      if (typeof val === "function")
        return `[Function: ${val.name || "anonymous"}]`;
      return val;
    });
  } catch (e) {
    // Fallback: best-effort string conversion
    try {
      return String((e as Error).message ?? value);
    } catch {
      return Object.prototype.toString.call(value);
    }
  }
}

/**
 * Creates an Apollo Link that observes responses and reports GraphQL and network errors
 * via the notification slice, providing centralized error handling for all GraphQL operations.
 *
 * @returns An ApolloLink instance that intercepts responses and reports errors
 *
 * @example
 * ```ts
 * const errorLink = errorLink();
 * const client = new ApolloClient({
 *   link: ApolloLink.from([errorLink, httpLink]),
 *   cache: new InMemoryCache(),
 * });
 * ```
 */
export function errorLink() {
  // Note: returns an ApolloLink that observes responses and reports
  // GraphQL and network errors via the notification slice.
  const notifier = useNotificationSlice();

  // Handle successful responses and GraphQL errors
  function handleResponseData(
    result: FormattedExecutionResult<
      Record<string, unknown>,
      Record<string, unknown>
    >,
    observer: Observer<
      FormattedExecutionResult<Record<string, unknown>, Record<string, unknown>>
    >,
  ): void {
    const graphQLErrors = result?.errors as GraphQLError[] | undefined;
    if (Array.isArray(graphQLErrors) && graphQLErrors.length > 0) {
      const msgs = graphQLErrors.map((err) => err.message).join(", ");
      notifier.showNotification(msgs, "error");
    }
    observer.next(result);
  }

  // Handle network errors
  function handleNetworkError(
    networkError: unknown,
    observer: Observer<
      FormattedExecutionResult<Record<string, unknown>, Record<string, unknown>>
    >,
  ): void {
    notifier.showNotification(safeStringify(networkError), "error");
    observer.error(networkError);
  }

  function createErrorReportingObservable(
    sourceObs: Observable<
      FormattedExecutionResult<Record<string, unknown>, Record<string, unknown>>
    >,
  ): Observable<
    FormattedExecutionResult<Record<string, unknown>, Record<string, unknown>>
  > {
    // Return an Observable typed to the same FormattedExecutionResult to satisfy
    // ApolloLink's expected RequestHandler signature.
    return new Observable<
      FormattedExecutionResult<Record<string, unknown>, Record<string, unknown>>
    >((observer) => {
      const sub = sourceObs.subscribe({
        next: (result) => handleResponseData(result, observer),
        error: (networkError) => handleNetworkError(networkError, observer),
        complete: () => observer.complete(),
      });

      return () => {
        sub.unsubscribe();
      };
    });
  }

  return new ApolloLink((operation, forward) => {
    const obs = forward
      ? (forward(operation) as Observable<
          FormattedExecutionResult<
            Record<string, unknown>,
            Record<string, unknown>
          >
        >)
      : null;
    if (!obs) {
      return new Observable<
        FormattedExecutionResult<
          Record<string, unknown>,
          Record<string, unknown>
        >
      >((observer) => {
        observer.complete();
        return () => undefined;
      });
    }

    return createErrorReportingObservable(obs);
  });
}
