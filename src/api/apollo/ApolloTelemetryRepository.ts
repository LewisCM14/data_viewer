import { gql } from "@apollo/client";
import type {
  BucketedRecording,
  FilterOptions,
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
    params?: TimeseriesQueryParams,
  ): Promise<BucketedRecording[]> {
    const QUERY = gql`
      query GetTimeseries($equipmentId: String, $channels: [String!], $from: String, $to: String, $bucketSize: Int) {
        timeseries: getTimeseries(equipmentId: $equipmentId, channels: $channels, from: $from, to: $to, bucketSize: $bucketSize) {
          id
          name
          series { channel values timestamps }
        }
      }
    `;

    const res = await this.client.query({
      query: QUERY,
      variables: {
        equipmentId: params?.equipmentId,
        channels: params?.channels,
        from: params?.from,
        to: params?.to,
        bucketSize: params?.bucketSize,
      },
      context: {
        fetchOptions: { signal: params?.signal },
      },
    });

    const payload =
      (res.data as { timeseries?: BucketedRecording[] })?.timeseries ?? [];
    return Array.isArray(payload) ? payload : [];
  }

  async getFilterOptions(): Promise<FilterOptions> {
    try {
      const QUERY = gql`
        query GetFilterOptions {
          filterOptions {
            equipments { id name }
            digitalChannels { id name color }
            analogueChannels { id name color }
          }
        }
      `;

      const res = await this.client.query({
        query: QUERY,
      });
      const payload = (res.data as { filterOptions?: FilterOptions })
        ?.filterOptions;

      if (!payload) {
        return { equipments: [], digitalChannels: [], analogueChannels: [] };
      }

      return {
        equipments: Array.isArray(payload.equipments) ? payload.equipments : [],
        digitalChannels: Array.isArray(payload.digitalChannels)
          ? payload.digitalChannels
          : [],
        analogueChannels: Array.isArray(payload.analogueChannels)
          ? payload.analogueChannels
          : [],
      };
    } catch (error_) {
      // Log the underlying error for diagnostics and return a safe default
      // so callers don't need to handle exceptions for missing data.
      // eslint-disable-next-line no-console
      console.error("ApolloTelemetryRepository.getFilterOptions error", error_);
      return { equipments: [], digitalChannels: [], analogueChannels: [] };
    }
  }
}
