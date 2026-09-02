import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type useFilterSlice from "../../store/slices/filterSlice";
import type { FilterState } from "../../store/slices/filterSlice";
import type useNotificationSlice from "../../store/slices/notificationSlice";

// Mock DateRangePicker to directly control its onChange prop
vi.mock("../molecules/DateRangePicker", () => ({
  default: ({
    onChange,
    onError,
  }: {
    onChange: (range: { from: string | null; to: string | null }) => void;
    onError: (msg: string) => void;
  }) => (
    <div>
      <button
        type="button"
        data-testid="date-range-null"
        onClick={() => onChange({ from: null, to: null })}
      >
        null range
      </button>
      <button
        type="button"
        data-testid="date-range-valid"
        onClick={() => onChange({ from: "2024-01-01", to: "2024-12-31" })}
      >
        valid range
      </button>
      <button
        type="button"
        data-testid="date-range-error"
        onClick={() => onError("date error")}
      >
        error
      </button>
    </div>
  ),
}));

vi.mock("../molecules/EquipmentSelect", () => ({
  default: ({ onChange }: { onChange: (id: string) => void }) => (
    <button
      type="button"
      data-testid="eq-select"
      onClick={() => onChange("eq1")}
    >
      select
    </button>
  ),
}));

vi.mock("../molecules/ChannelSelect", () => ({
  default: () => <div data-testid="channel-select" />,
}));

vi.mock("../molecules/SampleRateSlider", () => ({
  default: ({
    onChange,
    value,
  }: {
    onChange: (v: number) => void;
    value: number;
  }) => (
    <div>
      <span data-testid="slider-value">{value}</span>
      <button
        type="button"
        data-testid="sample-rate-btn"
        onClick={() => onChange(5)}
      >
        change
      </button>
    </div>
  ),
}));

// Mocks for FilterPanel dependencies
let mockFilterState: ReturnType<typeof useFilterSlice>;
let mockNotificationState: ReturnType<typeof useNotificationSlice>;
let currentState: FilterState;

vi.mock("../../store/slices/filterSlice", () => ({
  default: () => mockFilterState,
  initialFilterState: {
    equipmentId: null,
    digitalChannels: [],
    analogueChannels: [],
    dateRange: null,
    sampleRate: 1,
    channelColours: {},
  },
}));

vi.mock("../../store/slices/notificationSlice", () => ({
  default: () => mockNotificationState,
}));

import FilterPanel from "./FilterPanel";

describe("FilterPanel branch coverage", () => {
  beforeEach(() => {
    currentState = {
      equipmentId: null,
      digitalChannels: [],
      analogueChannels: [],
      dateRange: null,
      sampleRate: 1,
      channelColours: {},
    };

    mockFilterState = {
      getState: () => currentState,
      setState: vi.fn(),
      setEquipment: vi.fn(),
      addDigitalChannel: vi.fn(),
      removeDigitalChannel: vi.fn(),
      addAnalogueChannel: vi.fn(),
      removeAnalogueChannel: vi.fn(),
      setDateRange: vi.fn(),
      setSampleRate: vi.fn(),
      setChannelColour: vi.fn(),
      resetFilters: vi.fn(),
      initialFilterState: currentState,
    } as unknown as ReturnType<typeof useFilterSlice>;

    mockNotificationState = {
      getState: () => ({ open: false, message: "", severity: "info" as const }),
      showNotification: vi.fn(),
      dismissNotification: vi.fn(),
      initialNotificationState: {
        open: false,
        message: "",
        severity: "info" as const,
      },
    };
  });

  test("handleDateRangeChange sets null when from or to is null (line 81 null branch)", () => {
    render(<FilterPanel />);
    fireEvent.click(screen.getByTestId("date-range-null"));
    expect(mockFilterState.setDateRange).toHaveBeenCalledWith(null);
  });

  test("handleDateRangeChange sets array when both from and to are present", () => {
    render(<FilterPanel />);
    fireEvent.click(screen.getByTestId("date-range-valid"));
    expect(mockFilterState.setDateRange).toHaveBeenCalledWith([
      "2024-01-01",
      "2024-12-31",
    ]);
  });

  test("renders SampleRateSlider with fallback value 1 when sampleRate is undefined (line 164 ?? 1 branch)", () => {
    currentState.sampleRate = undefined;
    render(<FilterPanel />);
    expect(screen.getByTestId("slider-value").textContent).toBe("1");
  });
});
