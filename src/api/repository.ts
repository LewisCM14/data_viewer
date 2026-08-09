import type { TelemetryRepository } from "../types";
import MockTelemetryRepository from "./mock/MockTelemetryRepository";

// Lazily import Apollo adapter. Use Apollo by default in production builds
// (import.meta.env.PROD) to avoid requiring an explicit env var in deploys.

const metaEnv =
  (import.meta as unknown as { env?: Record<string, unknown> }).env ?? {};
const USE_APOLLO = Boolean(metaEnv.PROD);

let apolloInstance: TelemetryRepository | null = null;

export function getRepository(): TelemetryRepository {
  if (USE_APOLLO) {
    if (!apolloInstance) {
      // lazily require to avoid import-time side-effects in tests
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const {
        default: ApolloTelemetryRepository,
      } = require("./apollo/ApolloTelemetryRepository");
      apolloInstance = new ApolloTelemetryRepository();
    }
    return apolloInstance as TelemetryRepository;
  }

  return MockTelemetryRepository;
}

export default getRepository;
