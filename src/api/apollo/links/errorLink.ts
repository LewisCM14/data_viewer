import { ApolloLink, Observable } from "@apollo/client";
import type { GraphQLError, FormattedExecutionResult } from "graphql";
import useNotificationSlice from "../../../store/slices/notificationSlice";

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

export function errorLink() {
  // Note: returns an ApolloLink that observes responses and reports
  // GraphQL and network errors via the notification slice.
  const notifier = useNotificationSlice();

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
        next: (result) => {
          const graphQLErrors = result?.errors as GraphQLError[] | undefined;
          if (Array.isArray(graphQLErrors) && graphQLErrors.length > 0) {
            const msgs = graphQLErrors.map((err) => err.message).join(", ");
            notifier.showNotification(msgs, "error");
          }
          observer.next(
            result as FormattedExecutionResult<
              Record<string, unknown>,
              Record<string, unknown>
            >,
          );
        },
        error: (networkError) => {
          notifier.showNotification(safeStringify(networkError), "error");
          observer.error(networkError);
        },
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
