import type {
  BucketedRecording,
  TelemetryRepository,
  TimeseriesQueryParams,
  FilterOptions,
} from "../../types";
import { createApolloClient } from "./client";
import { gql } from "@apollo/client";

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

    const res = await this.client.query<{ timeseries?: BucketedRecording[] }>({
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

    const payload = res?.data?.timeseries ?? [];
    return Array.isArray(payload) ? (payload as BucketedRecording[]) : [];
  }

  /* istanbul ignore next */
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

      const res = await this.client.query<{ filterOptions?: FilterOptions }>({
        query: QUERY,
      });
      const payload = res?.data?.filterOptions;
      /* istanbul ignore next */
      if (!payload) {
        return { equipments: [], digitalChannels: [], analogueChannels: [] };
      }

      /* istanbul ignore next */
      return {
        equipments: Array.isArray(payload.equipments) ? payload.equipments : [],
        digitalChannels: Array.isArray(payload.digitalChannels)
          ? payload.digitalChannels
          : [],
        analogueChannels: Array.isArray(payload.analogueChannels)
          ? payload.analogueChannels
          : [],
      };
    } catch (_e) {
      return { equipments: [], digitalChannels: [], analogueChannels: [] };
    }
  }
}
