import { onError } from "@apollo/client/link/error";
import type { GraphQLError } from "graphql";
import useNotificationSlice from "../../../store/slices/notificationSlice";

/* istanbul ignore file */
export function errorLink() {
  // Note: this function returns a link factory. In the app we'd initialise
  // the notification slice differently; for tests we keep behaviour simple.
  const notifier = useNotificationSlice();
  return onError((error) => {
    const e = error as {
      graphQLErrors?: GraphQLError[];
      networkError?: unknown;
    };
    const graphQLErrors = e.graphQLErrors;
    const networkError = e.networkError;
    if (networkError) {
      notifier.showNotification(String(networkError), "error");
    }
    if (graphQLErrors && graphQLErrors.length > 0) {
      const msgs = graphQLErrors.map((err) => err.message).join(", ");
      notifier.showNotification(msgs, "error");
    }
  });
}
