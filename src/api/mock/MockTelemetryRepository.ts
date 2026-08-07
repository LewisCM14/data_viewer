/* istanbul ignore file */
import type { BucketedRecording, TimeseriesQueryParams } from "../../types";
import { MOCK_RECORDINGS } from "./fixtures";

/**
 * MockTelemetryRepository
 *
 * Minimal in-memory repository that implements the same interface as a real
 * `TelemetryRepository`. Used in tests and during early development when the
 * GraphQL API is not available.
 *
 * Methods:
 * - `getTimeseries()` returns a resolved Promise of `MOCK_RECORDINGS`.
 */
/**
 * MockTelemetryRepository
 *
 * Implements the `TelemetryRepository` contract for tests and local runs.
 * Accepts optional params and exposes simple simulation flags to test error
 * and timeout behaviours.
 */
type MockRepoType = {
  simulateError: boolean;
  simulateSlowResponse: boolean;
  callCount: number;
  getTimeseries(params?: TimeseriesQueryParams): Promise<BucketedRecording[]>;
};

const MockTelemetryRepository: MockRepoType = {
  simulateError: false,
  simulateSlowResponse: false,
  callCount: 0,

  async getTimeseries(
    params?: TimeseriesQueryParams,
  ): Promise<BucketedRecording[]> {
    if (MockTelemetryRepository.simulateError) {
      return Promise.reject(new Error("simulated error"));
    }

    MockTelemetryRepository.callCount = MockTelemetryRepository.callCount + 1;

    // mimic async call and honour a simple channel filter
    const result = MOCK_RECORDINGS.filter((r) => {
      if (!params?.channels || params.channels.length === 0) return true;
      // include recording if any series channel is in requested channels
      return r.series.some((s) => params.channels?.includes(s.channel));
    });

    const delay = MockTelemetryRepository.simulateSlowResponse ? 200 : 0;

    return new Promise<BucketedRecording[]>((resolve, reject) => {
      const timer = setTimeout(
        () => resolve(result as BucketedRecording[]),
        delay,
      );

      if (params?.signal) {
        if (params.signal.aborted) {
          clearTimeout(timer);
          return reject(new DOMException("Aborted", "AbortError"));
        }
        const onAbort = () => {
          clearTimeout(timer);
          reject(new DOMException("Aborted", "AbortError"));
        };
        params.signal.addEventListener("abort", onAbort, { once: true });
      }
    });
  },
};

export default MockTelemetryRepository;
