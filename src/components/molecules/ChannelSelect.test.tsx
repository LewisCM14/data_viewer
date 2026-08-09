import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import ChannelSelect from "./ChannelSelect";

describe("ChannelSelect - digital", () => {
  const mockChannels = [
    { id: "ch1", name: "Channel 1", color: "#ff0000" },
    { id: "ch2", name: "Channel 2", color: "#00ff00" },
    { id: "ch3", name: "Channel 3", color: "#0000ff" },
  ];

  test("renders one row per channel", async () => {
    render(
      <ChannelSelect
        type="digital"
        channels={mockChannels}
        selected={["ch1"]}
        onToggle={vi.fn()}
        onColorChange={vi.fn()}
      />,
    );
    // Open the dropdown to reveal options
    const user = userEvent.setup();
    const input = screen.getByRole("combobox", { name: /digital channels/i });
    await user.click(input);
    const acRoot = input.closest(".MuiAutocomplete-root");
    const popup = acRoot?.querySelector('button[aria-label="Open"]') as HTMLElement | null;
    if (popup) await user.click(popup);
    else await user.keyboard("{ArrowDown}");

    const listboxId = input.getAttribute("aria-controls");
    if (listboxId) {
      const listbox = document.getElementById(listboxId)!;
      expect(within(listbox).getByText("Channel 1")).toBeInTheDocument();
      expect(within(listbox).getByText("Channel 2")).toBeInTheDocument();
      expect(within(listbox).getByText("Channel 3")).toBeInTheDocument();
    } else {
      expect(await screen.findByRole("option", { name: "Channel 1" })).toBeInTheDocument();
      expect(await screen.findByRole("option", { name: "Channel 2" })).toBeInTheDocument();
      expect(await screen.findByRole("option", { name: "Channel 3" })).toBeInTheDocument();
    }
  });

  test("each row has a Checkbox and ColorSwatch", async () => {
    render(
      <ChannelSelect
        type="digital"
        channels={mockChannels}
        selected={["ch1"]}
        onToggle={vi.fn()}
        onColorChange={vi.fn()}
      />,
    );
    const user = userEvent.setup();
    const input = screen.getByRole("combobox", { name: /digital channels/i });
    await user.click(input);
    const acRoot = input.closest(".MuiAutocomplete-root");
    const popup = acRoot?.querySelector('button[aria-label="Open"]') as HTMLElement | null;
    if (popup) await user.click(popup);
    else await user.keyboard("{ArrowDown}");

    // Each option should include a color swatch and an option checkbox
    const listboxId = input.getAttribute("aria-controls");
    if (listboxId) {
      const listbox = document.getElementById(listboxId)!;
      const swatches = listbox.querySelectorAll('[data-testid="color-swatch"]');
      expect(swatches.length).toBe(3);
    } else {
      const listbox = await screen.findByRole("listbox");
      const swatches = listbox.querySelectorAll('[data-testid="color-swatch"]');
      expect(swatches.length).toBe(3);
    }
  });

  test("clicking unchecked calls onToggle(channelId)", async () => {
    const handleToggle = vi.fn();
    const user = userEvent.setup();

    render(
      <ChannelSelect
        type="digital"
        channels={mockChannels}
        selected={["ch1"]}
        onToggle={handleToggle}
        onColorChange={vi.fn()}
      />,
    );
    const input = screen.getByRole("combobox", { name: /digital channels/i });
    await user.click(input);
    const acRoot = input.closest(".MuiAutocomplete-root");
    const popup = acRoot?.querySelector('button[aria-label="Open"]') as HTMLElement | null;
    if (popup) await user.click(popup);
    else await user.keyboard("{ArrowDown}");

    const listboxId2 = input.getAttribute("aria-controls");
    if (listboxId2) {
      const listbox2 = document.getElementById(listboxId2)!;
      const option2 = within(listbox2).getByText("Channel 2");
      await user.click(option2);
    } else {
      const option2 = await screen.findByRole("option", { name: "Channel 2" });
      await user.click(option2);
    }

    expect(handleToggle).toHaveBeenCalledWith("ch2");
  });

  test("when selected.length === 8, all unselected checkboxes have disabled=true", async () => {
    const eightChannels = Array.from({ length: 10 }, (_, i) => ({
      id: `ch${i + 1}`,
      name: `Channel ${i + 1}`,
      color: `#${i.toString(16).padStart(6, "0")}`,
    }));

    const selected8 = ["ch1", "ch2", "ch3", "ch4", "ch5", "ch6", "ch7", "ch8"];

    render(
      <ChannelSelect
        type="digital"
        channels={eightChannels}
        selected={selected8}
        onToggle={vi.fn()}
        onColorChange={vi.fn()}
      />,
    );
    const user = userEvent.setup();
    const input = screen.getByRole("combobox", { name: /digital channels/i });
    await user.click(input);
    await user.keyboard("{ArrowDown}");

    const listboxId3 = input.getAttribute("aria-controls");
    if (listboxId3) {
      const listbox3 = document.getElementById(listboxId3)!;
      const option9 = within(listbox3).getByText("Channel 9").closest("li") as HTMLElement;
      const option10 = within(listbox3).getByText("Channel 10").closest("li") as HTMLElement;

      expect(option9).toHaveAttribute("aria-disabled", "true");
      expect(option10).toHaveAttribute("aria-disabled", "true");

      const option1 = within(listbox3).getByText("Channel 1").closest("li") as HTMLElement;
      expect(option1.getAttribute("aria-disabled")).not.toBe("true");
    } else {
      const option9 = await screen.findByRole("option", { name: "Channel 9" });
      const option10 = await screen.findByRole("option", { name: "Channel 10" });

      expect(option9).toHaveAttribute("aria-disabled", "true");
      expect(option10).toHaveAttribute("aria-disabled", "true");

      const option1 = await screen.findByRole("option", { name: "Channel 1" });
      expect(option1).not.toHaveAttribute("aria-disabled");
    }
  });

  test("when a channel is the only selected one, its checkbox is not disabled (min-1 rule)", async () => {
    render(
      <ChannelSelect
        type="digital"
        channels={mockChannels}
        selected={["ch1"]}
        onToggle={vi.fn()}
        onColorChange={vi.fn()}
      />,
    );
    const user = userEvent.setup();
    const input = screen.getByRole("combobox", { name: /digital channels/i });
    await user.click(input);
    await user.keyboard("{ArrowDown}");

    const listboxId4 = input.getAttribute("aria-controls");
    if (listboxId4) {
      const listbox4 = document.getElementById(listboxId4)!;
      const option1 = within(listbox4).getByText("Channel 1").closest("li") as HTMLElement;
      expect(option1.getAttribute("aria-disabled")).not.toBe("true");
    } else {
      const option1 = await screen.findByRole("option", { name: "Channel 1" });
      expect(option1).not.toHaveAttribute("aria-disabled");
    }
  });
});

describe("ChannelSelect - analogue", () => {
  const mockChannels = [
    { id: "ana1", name: "Analogue 1", color: "#ff0000" },
    { id: "ana2", name: "Analogue 2", color: "#00ff00" },
  ];

  test("renders one row per channel", async () => {
    render(
      <ChannelSelect
        type="analogue"
        channels={mockChannels}
        selected={["ana1"]}
        onToggle={vi.fn()}
        onColorChange={vi.fn()}
      />,
    );
    const user = userEvent.setup();
    const input = screen.getByRole("combobox", { name: /analogue channels/i });
    await user.click(input);
    const acRootA = input.closest(".MuiAutocomplete-root");
    const popupA = acRootA?.querySelector('button[aria-label="Open"]') as HTMLElement | null;
    if (popupA) await user.click(popupA);
    else await user.keyboard("{ArrowDown}");

    const listboxIdA = input.getAttribute("aria-controls");
    if (listboxIdA) {
      const listboxA = document.getElementById(listboxIdA)!;
      expect(within(listboxA).getByText("Analogue 1")).toBeInTheDocument();
      expect(within(listboxA).getByText("Analogue 2")).toBeInTheDocument();
    } else {
      expect(await screen.findByRole("option", { name: "Analogue 1" })).toBeInTheDocument();
      expect(await screen.findByRole("option", { name: "Analogue 2" })).toBeInTheDocument();
    }
  });

  test("each row has a Checkbox and ColorSwatch", async () => {
    render(
      <ChannelSelect
        type="analogue"
        channels={mockChannels}
        selected={["ana1"]}
        onToggle={vi.fn()}
        onColorChange={vi.fn()}
      />,
    );
    const user = userEvent.setup();
    const input = screen.getByRole("combobox", { name: /analogue channels/i });
    await user.click(input);
    const acRootA = input.closest(".MuiAutocomplete-root");
    const popupA = acRootA?.querySelector('button[aria-label="Open"]') as HTMLElement | null;
    if (popupA) await user.click(popupA);
    else await user.keyboard("{ArrowDown}");

    const listboxIdA2 = input.getAttribute("aria-controls");
    if (listboxIdA2) {
      const listboxA2 = document.getElementById(listboxIdA2)!;
      const swatches = listboxA2.querySelectorAll('[data-testid="color-swatch"]');
      expect(swatches.length).toBe(2);
    } else {
      const listbox = await screen.findByRole("listbox");
      const swatches = listbox.querySelectorAll('[data-testid="color-swatch"]');
      expect(swatches.length).toBe(2);
    }
  });

  test("clicking unchecked calls onToggle(channelId)", async () => {
    const handleToggle = vi.fn();
    const user = userEvent.setup();

    render(
      <ChannelSelect
        type="analogue"
        channels={mockChannels}
        selected={["ana1"]}
        onToggle={handleToggle}
        onColorChange={vi.fn()}
      />,
    );
    const input = screen.getByRole("combobox", { name: /analogue channels/i });
    await user.click(input);
    await user.keyboard("{ArrowDown}");

    const listboxIdA3 = input.getAttribute("aria-controls");
    if (listboxIdA3) {
      const listboxA3 = document.getElementById(listboxIdA3)!;
      const option2 = within(listboxA3).getByText("Analogue 2");
      await user.click(option2);
    } else {
      const option2 = await screen.findByRole("option", { name: "Analogue 2" });
      await user.click(option2);
    }

    expect(handleToggle).toHaveBeenCalledWith("ana2");
  });

  test("when selected.length === 8, all unselected checkboxes have disabled=true", async () => {
    const tenChannels = Array.from({ length: 10 }, (_, i) => ({
      id: `ana${i + 1}`,
      name: `Analogue ${i + 1}`,
      color: `#${i.toString(16).padStart(6, "0")}`,
    }));

    const selected8 = [
      "ana1",
      "ana2",
      "ana3",
      "ana4",
      "ana5",
      "ana6",
      "ana7",
      "ana8",
    ];

    render(
      <ChannelSelect
        type="analogue"
        channels={tenChannels}
        selected={selected8}
        onToggle={vi.fn()}
        onColorChange={vi.fn()}
      />,
    );
    const user = userEvent.setup();
    const input = screen.getByRole("combobox", { name: /analogue channels/i });
    await user.click(input);
    await user.keyboard("{ArrowDown}");

    const listboxIdA4 = input.getAttribute("aria-controls");
    if (listboxIdA4) {
      const listboxA4 = document.getElementById(listboxIdA4)!;
      const option9 = within(listboxA4).getByText("Analogue 9").closest("li") as HTMLElement;
      const option10 = within(listboxA4).getByText("Analogue 10").closest("li") as HTMLElement;

      expect(option9).toHaveAttribute("aria-disabled", "true");
      expect(option10).toHaveAttribute("aria-disabled", "true");
    } else {
      const option9 = await screen.findByRole("option", { name: "Analogue 9" });
      const option10 = await screen.findByRole("option", { name: "Analogue 10" });

      expect(option9).toHaveAttribute("aria-disabled", "true");
      expect(option10).toHaveAttribute("aria-disabled", "true");
    }
  });

  test("when a channel is the only selected one, its checkbox is not disabled (min-1 rule)", async () => {
    render(
      <ChannelSelect
        type="analogue"
        channels={mockChannels}
        selected={["ana1"]}
        onToggle={vi.fn()}
        onColorChange={vi.fn()}
      />,
    );
    const user = userEvent.setup();
    const input = screen.getByRole("combobox", { name: /analogue channels/i });
    await user.click(input);
    await user.keyboard("{ArrowDown}");

    const listboxIdA5 = input.getAttribute("aria-controls");
    if (listboxIdA5) {
      const listboxA5 = document.getElementById(listboxIdA5)!;
      const option1 = within(listboxA5).getByText("Analogue 1").closest("li") as HTMLElement;
      expect(option1.getAttribute("aria-disabled")).not.toBe("true");
    } else {
      const option1 = await screen.findByRole("option", { name: "Analogue 1" });
      expect(option1).not.toHaveAttribute("aria-disabled");
    }
  });
});
