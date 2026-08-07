import { describe, expect, test } from "vitest";
import { createApolloClient } from "./client";

describe("createApolloClient", () => {
  test("creates a client with cache and query API", () => {
    const client = createApolloClient();
    expect(client).toHaveProperty("cache");
    expect(typeof (client as any).query).toBe("function");
  });
});
