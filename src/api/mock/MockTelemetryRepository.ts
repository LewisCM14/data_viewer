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
const MockTelemetryRepository = {
  async getTimeseries() {
    // mimic async call
    return Promise.resolve(MOCK_RECORDINGS);
  },
};

export default MockTelemetryRepository;
