import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { errorLink } from "./links/errorLink";
import { retryLink } from "./links/retryLink";
import { timeoutLink } from "./links/timeoutLink";

export function createApolloClient(uri = "http://localhost:4000/graphql") {
  const httpLink = new HttpLink({ uri });
  const link = ApolloLink.from([
    retryLink(),
    timeoutLink(),
    errorLink(),
    httpLink,
  ]);
  const client = new ApolloClient({ link, cache: new InMemoryCache() });
  return client;
}
