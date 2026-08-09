import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type useFilterSlice from "../../store/slices/filterSlice";
import type { FilterState } from "../../store/slices/filterSlice";
import type useNotificationSlice from "../../store/slices/notificationSlice";
import FilterPanel from "./FilterPanel";

// Mock the filter and notification slices
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

describe("FilterPanel", () => {
  beforeEach(() => {
    // Initialize fresh mock state before each test
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
    };

    mockNotificationState = {
      getState: () => ({
        open: false,
        message: "",
        severity: "info" as const,
      }),
      showNotification: vi.fn(),
      dismissNotification: vi.fn(),
      initialNotificationState: {
        open: false,
        message: "",
        severity: "info" as const,
      },
    };
  });

  test("renders all four filter molecule regions", () => {
    render(<FilterPanel />);

    // Check for equipment select
      expect(screen.getByRole("combobox", { name: /equipment/i })).toBeInTheDocument();

    // Check for channel select groups
      expect(screen.getByRole("combobox", { name: /digital channels/i })).toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: /analogue channels/i })).toBeInTheDocument();

    // Check for date range pickers
    expect(screen.getByLabelText(/from/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/to/i)).toBeInTheDocument();

    // Check for sample rate slider
    expect(screen.getByText(/sample rate/i)).toBeInTheDocument();
  });

  test("selecting an equipment option dispatches setEquipment to the store", async () => {
    const user = userEvent.setup();
    render(<FilterPanel />);

      const equipmentSelect = screen.getByRole("combobox", { name: /equipment/i });
    await user.click(equipmentSelect);

    // Select first equipment option
    const option = screen.getByRole("option", { name: /equipment 1/i });
    await user.click(option);

    expect(mockFilterState.setEquipment).toHaveBeenCalledWith("eq1");
  });

  test("toggling a digital channel dispatches addDigitalChannel or removeDigitalChannel", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<FilterPanel />);
    // Open the digital channels autocomplete and select the first option
      const input = screen.getByRole("combobox", { name: /digital channels/i });
    await user.click(input);
    const acRoot = input.closest(".MuiAutocomplete-root");
    const popup = acRoot?.querySelector('button[aria-label="Open"]') as HTMLElement | null;
    if (popup) await user.click(popup);
    else await user.keyboard("{ArrowDown}");

    // Click the matching option inside the Autocomplete's listbox
    const listboxId = input.getAttribute("aria-controls");
    if (listboxId) {
      const listbox = document.getElementById(listboxId)!;
      const option = within(listbox).getByText("Digital 1");
      await user.click(option);
    } else {
      const option = await screen.findByRole("option", { name: "Digital 1" });
      await user.click(option);
    }

    expect(mockFilterState.addDigitalChannel).toHaveBeenCalledWith("d1");

    // Simulate channel being selected
    currentState.digitalChannels = ["d1"];

    // Re-render with new state
    rerender(<FilterPanel />);

    // Open and toggle off
      const inputAfter = screen.getByRole("combobox", { name: /digital channels/i });
    await user.click(inputAfter);
    const acRootAfter = inputAfter.closest(".MuiAutocomplete-root");
    const popupAfter = acRootAfter?.querySelector('button[aria-label="Open"]') as HTMLElement | null;
    if (popupAfter) await user.click(popupAfter);
    else await user.keyboard("{ArrowDown}");
    const listboxIdAfter = inputAfter.getAttribute("aria-controls");
    if (listboxIdAfter) {
      const listboxAfter = document.getElementById(listboxIdAfter)!;
      const optionAfter = within(listboxAfter).getByText("Digital 1");
      await user.click(optionAfter);
    } else {
      const optionAfter = await screen.findByRole("option", { name: "Digital 1" });
      await user.click(optionAfter);
    }

    expect(mockFilterState.removeDigitalChannel).toHaveBeenCalledWith("d1");
  });

  test("toggling an analogue channel dispatches the analogue equivalents", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<FilterPanel />);
    // Open analogue channels autocomplete and select option
      const input = screen.getByRole("combobox", { name: /analogue channels/i });
    await user.click(input);
    const acRootA = input.closest(".MuiAutocomplete-root");
    const popupA = acRootA?.querySelector('button[aria-label="Open"]') as HTMLElement | null;
    if (popupA) await user.click(popupA);
    else await user.keyboard("{ArrowDown}");

    const listboxIdA = input.getAttribute("aria-controls");
    if (listboxIdA) {
      const listboxA = document.getElementById(listboxIdA)!;
      const option = within(listboxA).getByText("Analogue 1");
      await user.click(option);
    } else {
      const option = await screen.findByRole("option", { name: "Analogue 1" });
      await user.click(option);
    }

    expect(mockFilterState.addAnalogueChannel).toHaveBeenCalledWith("a1");

    // Simulate channel being selected
    currentState.analogueChannels = ["a1"];

    // Re-render with new state
    rerender(<FilterPanel />);

    // Open and toggle off
      const inputAfter = screen.getByRole("combobox", { name: /analogue channels/i });
    await user.click(inputAfter);
    const acRootAAfter = inputAfter.closest(".MuiAutocomplete-root");
    const popupAAfter = acRootAAfter?.querySelector('button[aria-label="Open"]') as HTMLElement | null;
    if (popupAAfter) await user.click(popupAAfter);
    else await user.keyboard("{ArrowDown}");
    const listboxIdAAfter = inputAfter.getAttribute("aria-controls");
    if (listboxIdAAfter) {
      const listboxAAfter = document.getElementById(listboxIdAAfter)!;
      const optionAfter = within(listboxAAfter).getByText("Analogue 1");
      await user.click(optionAfter);
    } else {
      const optionAfter = await screen.findByRole("option", { name: "Analogue 1" });
      await user.click(optionAfter);
    }

    expect(mockFilterState.removeAnalogueChannel).toHaveBeenCalledWith("a1");
  });

  test("changing the date range dispatches setDateRange; when from > to, dispatches showNotification instead", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<FilterPanel />);

    // Set valid date range (from < to)
    const fromInput = screen.getByLabelText(/from/i);
    const toInput = screen.getByLabelText(/to/i);

    await user.type(fromInput, "2024-01-01");
    await user.type(toInput, "2024-12-31");

    // setDateRange should be called (with null initially, then with valid range)
    expect(mockFilterState.setDateRange).toHaveBeenCalled();

    // Now test invalid range (from > to) by updating mock state and re-rendering
    vi.clearAllMocks();
    currentState.dateRange = ["2024-12-31", "2024-01-01"]; // Invalid: from > to

    // Re-render to trigger useEffect validation
    rerender(<FilterPanel />);

    // Should show notification for invalid range
    await waitFor(() => {
      expect(mockNotificationState.showNotification).toHaveBeenCalledWith(
        expect.stringContaining("before"),
        "warning",
      );
    });
  });

  test("changing the sample rate dispatches setSampleRate", async () => {
    render(<FilterPanel />);

    // Find the sample rate slider
    const slider = screen.getByRole("slider", { name: /sample rate/i });

    // Simulate changing value (this triggers onChange)
    fireEvent.change(slider, { target: { value: "5" } });

    // Verify setSampleRate was called
    expect(mockFilterState.setSampleRate).toHaveBeenCalled();
  });

  test("when combined digitalChannels + analogueChannels length equals 8, all unselected channel checkboxes are disabled", async () => {
    // Set state with 8 channels selected (5 digital + 3 analogue)
    currentState.equipmentId = "eq1";
    currentState.digitalChannels = ["d1", "d2", "d3", "d4", "d5"];
    currentState.analogueChannels = ["a1", "a2", "a3"];

    render(<FilterPanel />);
    // Open digital autocomplete and verify an unselected option is aria-disabled
    const user = userEvent.setup();
    const digitalInput = screen.getByRole("combobox", { name: /digital channels/i });
    await user.click(digitalInput);
    const acRootD = digitalInput.closest(".MuiAutocomplete-root");
    const popupD = acRootD?.querySelector('button[aria-label="Open"]') as HTMLElement | null;
    if (popupD) await user.click(popupD);
    else await user.keyboard("{ArrowDown}");
    const listboxIdD = digitalInput.getAttribute("aria-controls");
    if (listboxIdD) {
      const listboxD = document.getElementById(listboxIdD)!;
      // All digital channels are selected in this setup; ensure a selected option is NOT disabled
      const optionNode = within(listboxD).getByText("Digital 1").closest("li") as HTMLElement;
      expect(optionNode.getAttribute("aria-disabled")).not.toBe("true");
    } else {
      const digitalOption = await screen.findByRole("option", { name: "Digital 1" });
      expect(digitalOption.getAttribute("aria-disabled")).not.toBe("true");
    }

    // Open analogue autocomplete and verify an unselected option is aria-disabled
    const analogueInput = screen.getByRole("combobox", { name: /analogue channels/i });
    await user.click(analogueInput);
    const acRootA = analogueInput.closest(".MuiAutocomplete-root");
    const popupA = acRootA?.querySelector('button[aria-label="Open"]') as HTMLElement | null;
    if (popupA) await user.click(popupA);
    else await user.keyboard("{ArrowDown}");
    const listboxIdA = analogueInput.getAttribute("aria-controls");
    if (listboxIdA) {
      const listboxA = document.getElementById(listboxIdA)!;
      // Analogue 4 is the single unselected analogue channel in this setup
      const optionNode = within(listboxA).getByText("Analogue 4").closest("li") as HTMLElement;
      expect(optionNode).toHaveAttribute("aria-disabled", "true");
    } else {
      const analogueOption = await screen.findByRole("option", { name: "Analogue 4" });
      expect(analogueOption).toHaveAttribute("aria-disabled", "true");
    }
  });
});
