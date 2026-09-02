import type { TelemetryRepository } from "../types";
import ApolloTelemetryRepository from "./apollo/ApolloTelemetryRepository";
import MockTelemetryRepository from "./mock/MockTelemetryRepository";

// Use Apollo in production builds; Mock everywhere else.
const metaEnv = (import.meta as unknown as { env: Record<string, unknown> })
  .env;

let apolloInstance: TelemetryRepository | null = null;

/** @param useApollo - override for testing; defaults to import.meta.env.PROD */
export function getRepository(
  useApollo = Boolean(metaEnv.PROD),
): TelemetryRepository {
  if (useApollo) {
    if (!apolloInstance) {
      apolloInstance = new ApolloTelemetryRepository();
    }
    return apolloInstance as TelemetryRepository;
  }

  return MockTelemetryRepository;
}

export default getRepository;
