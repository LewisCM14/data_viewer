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
  getFilterOptions?: () => Promise<{
    equipments: { id: string; name: string }[];
    digitalChannels: { id: string; name: string; color: string }[];
    analogueChannels: { id: string; name: string; color: string }[];
  }>;
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
  async getFilterOptions() {
    // provide the same mock options previously embedded in FilterPanel
    const equipments = [
      { id: "eq1", name: "Equipment 1" },
      { id: "eq2", name: "Equipment 2" },
      { id: "eq3", name: "Equipment 3" },
    ];

    const digitalChannels = [
      { id: "d1", name: "Digital 1", color: "#FF6384" },
      { id: "d2", name: "Digital 2", color: "#36A2EB" },
      { id: "d3", name: "Digital 3", color: "#FFCE56" },
      { id: "d4", name: "Digital 4", color: "#4BC0C0" },
      { id: "d5", name: "Digital 5", color: "#9966FF" },
    ];

    const analogueChannels = [
      { id: "a1", name: "Analogue 1", color: "#FF9F40" },
      { id: "a2", name: "Analogue 2", color: "#FF6384" },
      { id: "a3", name: "Analogue 3", color: "#C9CBCF" },
      { id: "a4", name: "Analogue 4", color: "#4BC0C0" },
    ];

    return Promise.resolve({ equipments, digitalChannels, analogueChannels });
  },
};

export default MockTelemetryRepository;
