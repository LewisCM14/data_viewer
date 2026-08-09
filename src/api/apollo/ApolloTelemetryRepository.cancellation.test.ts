import { describe, test, expect, vi } from "vitest";

// Mock the createApolloClient to return a client whose query supports abort
vi.mock("./client", () => ({
  createApolloClient: () => ({
    query: ({
      context,
    }: {
      context?: { fetchOptions?: { signal?: AbortSignal } };
    }) => {
      const signal = context?.fetchOptions?.signal;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          resolve({
            data: { timeseries: [{ id: "r", name: "r", series: [] }] },
          });
        }, 200);

        if (signal) {
          if (signal.aborted) {
            clearTimeout(timer);
            return reject(new DOMException("Aborted", "AbortError"));
          }
          signal.addEventListener(
            "abort",
            () => {
              clearTimeout(timer);
              reject(new DOMException("Aborted", "AbortError"));
            },
            { once: true },
          );
        }
      });
    },
  }),
}));

import ApolloTelemetryRepository from "./ApolloTelemetryRepository";

describe("ApolloTelemetryRepository cancellation", () => {
  test("getTimeseries rejects with AbortError when signal aborted", async () => {
    const repo = new ApolloTelemetryRepository();
    const controller = new AbortController();
    const p = repo.getTimeseries({ signal: controller.signal });
    controller.abort();
    await expect(p).rejects.toHaveProperty("name", "AbortError");
  });
});
