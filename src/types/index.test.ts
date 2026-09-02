import {
  type FilterSnapshot,
  parseFiltersFromQuery,
  serializeFiltersToQuery,
} from "./index";

describe("filter query utils", () => {
  it("serialises undefined equipmentId", () => {
    const snap: FilterSnapshot = {
      digitalChannels: ["d1"],
    };
    const q = serializeFiltersToQuery(snap);
    expect(q).not.toContain("equipmentId");
  });

  it("round trips equipment and channels", () => {
    const snap: FilterSnapshot = {
      equipmentId: 7,
      digitalChannels: ["d1"],
      analogueChannels: ["a1", "a2"],
    };
    const q = serializeFiltersToQuery(snap);
    const parsed = parseFiltersFromQuery(q);
    expect(parsed.equipmentId).toBe(7);
    expect(parsed.digitalChannels).toEqual(["d1"]);
    expect(parsed.analogueChannels).toEqual(["a1", "a2"]);
  });

  it("serialises full snapshot and parses colours and dateRange", () => {
    const snap: FilterSnapshot = {
      equipmentId: 11,
      digitalChannels: ["d3"],
      analogueChannels: ["a4"],
      dateRange: { from: "2020-01-01", to: "2020-12-31" },
      sampleRate: 50,
      channelColours: { d3: "#111" },
    };
    const q = serializeFiltersToQuery(snap);
    const parsed = parseFiltersFromQuery(q);
    expect(parsed.equipmentId).toBe(11);
    expect(parsed.sampleRate).toBe(50);
    expect(parsed.channelColours).toEqual({ d3: "#111" });
    expect(parsed.dateRange).toEqual({ from: "2020-01-01", to: "2020-12-31" });
  });

  it("serialises dateRange with only from", () => {
    const snap: FilterSnapshot = {
      dateRange: { from: "2020-01-01", to: "" },
    };
    const q = serializeFiltersToQuery(snap);
    expect(q).toContain("from=2020-01-01");
    expect(q).not.toContain("to=");
  });

  it("serialises dateRange with only to", () => {
    const snap: FilterSnapshot = {
      dateRange: { from: "", to: "2020-12-31" },
    };
    const q = serializeFiltersToQuery(snap);
    expect(q).toContain("to=2020-12-31");
    expect(q).not.toContain("from=");
  });

  it("does not serialise empty dateRange", () => {
    const snap: FilterSnapshot = {
      dateRange: { from: "", to: "" },
    };
    const q = serializeFiltersToQuery(snap);
    expect(q).not.toContain("from");
    expect(q).not.toContain("to");
  });

  it("handles invalid colours and equipmentId=null edge cases", () => {
    const q = "?colours=%7Bnotjson%7D&equipmentId=null"; // colours = {notjson}
    const parsed = parseFiltersFromQuery(q);
    expect(parsed.channelColours).toBeUndefined();
    expect(parsed.equipmentId).toBeNull();
  });

  it("handles missing equipmentId", () => {
    const q = "?digital=d1&analogue=a1";
    const parsed = parseFiltersFromQuery(q);
    expect(parsed.equipmentId).toBeUndefined();
  });

  it("handles dateRange with only from date", () => {
    const q = "?from=2020-01-01";
    const parsed = parseFiltersFromQuery(q);
    expect(parsed.dateRange).toEqual({ from: "2020-01-01", to: "" });
  });

  it("handles dateRange with only to date", () => {
    const q = "?to=2020-12-31";
    const parsed = parseFiltersFromQuery(q);
    expect(parsed.dateRange).toEqual({ from: "", to: "2020-12-31" });
  });

  it("handles no dateRange", () => {
    const q = "?equipmentId=1";
    const parsed = parseFiltersFromQuery(q);
    expect(parsed.dateRange).toBeNull();
  });

  it("handles valid JSON colours", () => {
    const colours = { ch1: "#FF0000", ch2: "#00FF00" };
    const snap: FilterSnapshot = {
      equipmentId: 1,
      channelColours: colours,
    };
    const q = serializeFiltersToQuery(snap);
    const parsed = parseFiltersFromQuery(q);
    expect(parsed.channelColours).toEqual(colours);
  });

  it("handles empty digital and analogue channels", () => {
    const q = "?digital=&analogue=";
    const parsed = parseFiltersFromQuery(q);
    expect(parsed.digitalChannels).toBeUndefined();
    expect(parsed.analogueChannels).toBeUndefined();
  });

  it("handles sampleRate parameter", () => {
    const q = "?sampleRate=100";
    const parsed = parseFiltersFromQuery(q);
    expect(parsed.sampleRate).toBe(100);
  });

  it("handles no sampleRate parameter", () => {
    const q = "?equipmentId=1";
    const parsed = parseFiltersFromQuery(q);
    expect(parsed.sampleRate).toBeUndefined();
  });

  it("round trips with URLSearchParams input", () => {
    const snap: FilterSnapshot = {
      equipmentId: 5,
      digitalChannels: ["ch1", "ch2"],
    };
    const q = serializeFiltersToQuery(snap);
    const params = new URLSearchParams(q);
    const parsed = parseFiltersFromQuery(params);
    expect(parsed.equipmentId).toBe(5);
    expect(parsed.digitalChannels).toEqual(["ch1", "ch2"]);
  });

  it("serialises snapshot with null equipmentId as undefined", () => {
    const snap: FilterSnapshot = {
      equipmentId: null,
      digitalChannels: ["d1"],
    };
    const q = serializeFiltersToQuery(snap);
    expect(q).not.toContain("equipmentId");
    const parsed = parseFiltersFromQuery(q);
    expect(parsed.equipmentId).toBeUndefined();
  });

  it("does not serialise empty channelColours", () => {
    const snap: FilterSnapshot = {
      equipmentId: 1,
      channelColours: {},
    };
    const q = serializeFiltersToQuery(snap);
    expect(q).not.toContain("colours");
  });
});
