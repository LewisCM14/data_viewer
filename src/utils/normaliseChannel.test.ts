import { describe, expect, test } from "vitest";
import normaliseChannel from "./normaliseChannel";

describe("normaliseChannel", () => {
  test("returns channel when present", () => {
    expect(normaliseChannel({ channel: "1" })).toBe("1");
  });

  test("falls back to chanel when channel is missing", () => {
    expect(normaliseChannel({ chanel: "2" })).toBe("2");
  });

  test("returns unknown when neither present", () => {
    expect(normaliseChannel({})).toBe("unknown");
    expect(normaliseChannel(null as unknown)).toBe("unknown");
  });
});
