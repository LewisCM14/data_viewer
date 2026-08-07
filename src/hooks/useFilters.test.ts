import { describe, expect, test } from "vitest";
import useFilters from "./useFilters";
import { getLastFilterSlice } from "../store/slices/filterSlice";

describe("useFilters", () => {
  test("proxies to filter slice actions", () => {
    const hooks = useFilters();
    hooks.setEquipment("eqX");
    const inst = getLastFilterSlice();
    expect(inst?.getState().equipmentId).toBe("eqX");

    hooks.addDigitalChannel("d1");
    expect(inst?.getState().digitalChannels).toContain("d1");

    hooks.setSampleRate(10);
    expect(inst?.getState().sampleRate).toBe(10);
  });
});
