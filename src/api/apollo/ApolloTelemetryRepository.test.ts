import { describe, expect, test } from "vitest";
import ApolloTelemetryRepository from "./ApolloTelemetryRepository";

describe("ApolloTelemetryRepository", () => {
  test("getTimeseries returns empty array by default", async () => {
    const repo = new ApolloTelemetryRepository();
    const res = await repo.getTimeseries();
    expect(res).toEqual([]);
  });
});
