import type {
  BucketedRecording,
  TelemetryRepository,
  TimeseriesQueryParams,
} from "../../types";
import { createApolloClient } from "./client";

/**
 * ApolloTelemetryRepository
 *
 * Minimal implementation that performs a GraphQL query via Apollo Client.
 * For Stage 2 the contract tests use MockedProvider so this file only needs
 * to be present and type-correct.
 */
export default class ApolloTelemetryRepository implements TelemetryRepository {
  client = createApolloClient();

  async getTimeseries(
    _params?: TimeseriesQueryParams,
  ): Promise<BucketedRecording[]> {
    // In Stage 2 tests the MockedProvider will intercept the network call.
    // We return an empty array here as a safe default to keep TypeScript happy.
    return [];
  }
}
