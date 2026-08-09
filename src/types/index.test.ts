import {
  serializeFiltersToQuery,
  parseFiltersFromQuery,
  type FilterSnapshot,
} from "./index";

describe("filter query utils", () => {
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

  it("handles invalid colours and equipmentId=null edge cases", () => {
    const q = "?colours=%7Bnotjson%7D&equipmentId=null"; // colours = {notjson}
    const parsed = parseFiltersFromQuery(q);
    expect(parsed.channelColours).toBeUndefined();
    expect(parsed.equipmentId).toBeNull();
  });
});
