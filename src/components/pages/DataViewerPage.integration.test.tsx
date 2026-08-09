import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type useFilterSlice from "../../store/slices/filterSlice";
import type { FilterState } from "../../store/slices/filterSlice";
import DataViewerPage from "./DataViewerPage";

// Mock the filter slice
let mockFilterState: ReturnType<typeof useFilterSlice>;
let initialState: FilterState;

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

// Mock useGetGraphData
vi.mock("../../hooks/useGetGraphData", () => ({
  default: () => ({
    data: [
      {
        id: "rec1",
        name: "Recording 1",
        series: [
          {
            channel: "d1",
            values: [10, 20, 30],
            timestamps: [1000, 2000, 3000],
          },
        ],
      },
    ],
    loading: false,
    error: null,
  }),
}));

// Mock Plot component (plotly)
vi.mock("../../components/atoms/Plot", () => ({
  default: ({ data }: { data: unknown[] }) => (
    <div data-testid="plot-canvas" data-trace-count={data.length}>
      Plot with {data.length} traces
    </div>
  ),
}));

describe("DataViewerPage Integration", () => {
  beforeEach(() => {
    initialState = {
      equipmentId: null,
      digitalChannels: [],
      analogueChannels: [],
      dateRange: null,
      sampleRate: 1,
      channelColours: {},
    };

    mockFilterState = {
      getState: () => initialState,
      setState: vi.fn(),
      setEquipment: vi.fn((equipmentId: string | null) => {
        initialState.equipmentId = equipmentId;
      }),
      addDigitalChannel: vi.fn((channelId: string) => {
        if (!initialState.digitalChannels.includes(channelId)) {
          initialState.digitalChannels.push(channelId);
        }
      }),
      removeDigitalChannel: vi.fn(),
      addAnalogueChannel: vi.fn(),
      removeAnalogueChannel: vi.fn(),
      setDateRange: vi.fn(),
      setSampleRate: vi.fn(),
      setChannelColour: vi.fn(),
      resetFilters: vi.fn(),
      initialFilterState: initialState,
    };
  });

  test("mount DataViewerPage; simulate selecting equipment; simulate toggling one digital channel; assert plot-canvas renders with one trace", async () => {
    const user = userEvent.setup();

    render(<DataViewerPage />);

    // Verify page renders
    expect(screen.getByTestId("app-header")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /digital channels/i })).toBeInTheDocument();

    // Select equipment
    const equipmentSelect = screen.getByRole("combobox", { name: /equipment/i });
    await user.click(equipmentSelect);

    const equipmentOption = screen.getByRole("option", {
      name: /equipment 1/i,
    });
    await user.click(equipmentOption);

    // Verify equipment was selected
    expect(mockFilterState.setEquipment).toHaveBeenCalledWith("eq1");

    // Toggle a digital channel via the searchable dropdown
    const digitalInput = screen.getByRole("combobox", { name: /digital channels/i });
    await user.click(digitalInput);
    await user.keyboard("{ArrowDown}");

    const digitalOption = await screen.findByRole("option", { name: /digital 1/i });
    await user.click(digitalOption);

    // Verify channel was toggled
    expect(mockFilterState.addDigitalChannel).toHaveBeenCalledWith("d1");

    // Verify plot renders
    await waitFor(() => {
      const plot = screen.getByTestId("plot-canvas");
      expect(plot).toBeInTheDocument();
      // The mock returns 1 trace for the mock data
      expect(plot).toHaveTextContent("Plot with 1 traces");
    });
  });

  test("all major organisms are present in the composed page", () => {
    render(<DataViewerPage />);

    // Header
    expect(screen.getByTestId("app-header")).toBeInTheDocument();

    // Filter panel (aside)
    expect(screen.getByTestId("aside")).toBeInTheDocument();

    // Graph canvas (main)
    expect(screen.getByTestId("graph-canvas")).toBeInTheDocument();

    // Footer
    expect(screen.getByTestId("app-footer")).toBeInTheDocument();
  });
});
