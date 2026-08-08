import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import ChannelSelect from "./ChannelSelect";

describe("ChannelSelect - digital", () => {
  const mockChannels = [
    { id: "ch1", name: "Channel 1", color: "#ff0000" },
    { id: "ch2", name: "Channel 2", color: "#00ff00" },
    { id: "ch3", name: "Channel 3", color: "#0000ff" },
  ];

  test("renders one row per channel", () => {
    render(
      <ChannelSelect
        type="digital"
        channels={mockChannels}
        selected={["ch1"]}
        onToggle={vi.fn()}
        onColorChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Channel 1")).toBeInTheDocument();
    expect(screen.getByText("Channel 2")).toBeInTheDocument();
    expect(screen.getByText("Channel 3")).toBeInTheDocument();
  });

  test("each row has a Checkbox and ColorSwatch", () => {
    render(
      <ChannelSelect
        type="digital"
        channels={mockChannels}
        selected={["ch1"]}
        onToggle={vi.fn()}
        onColorChange={vi.fn()}
      />,
    );

    // Each channel should have a checkbox
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(3);

    // Each channel should have a color swatch
    const swatches = screen.getAllByTestId("color-swatch");
    expect(swatches).toHaveLength(3);
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

    const checkbox2 = screen.getByRole("checkbox", { name: "Channel 2" });
    await user.click(checkbox2);

    expect(handleToggle).toHaveBeenCalledWith("ch2");
  });

  test("when selected.length === 8, all unselected checkboxes have disabled=true", () => {
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

    // ch9 and ch10 should be disabled
    const checkbox9 = screen.getByRole("checkbox", { name: "Channel 9" });
    const checkbox10 = screen.getByRole("checkbox", { name: "Channel 10" });

    expect(checkbox9).toBeDisabled();
    expect(checkbox10).toBeDisabled();

    // Selected ones should not be disabled
    const checkbox1 = screen.getByRole("checkbox", { name: "Channel 1" });
    expect(checkbox1).not.toBeDisabled();
  });

  test("when a channel is the only selected one, its checkbox is not disabled (min-1 rule)", () => {
    render(
      <ChannelSelect
        type="digital"
        channels={mockChannels}
        selected={["ch1"]}
        onToggle={vi.fn()}
        onColorChange={vi.fn()}
      />,
    );

    const checkbox1 = screen.getByRole("checkbox", { name: "Channel 1" });
    expect(checkbox1).not.toBeDisabled();
  });
});

describe("ChannelSelect - analogue", () => {
  const mockChannels = [
    { id: "ana1", name: "Analogue 1", color: "#ff0000" },
    { id: "ana2", name: "Analogue 2", color: "#00ff00" },
  ];

  test("renders one row per channel", () => {
    render(
      <ChannelSelect
        type="analogue"
        channels={mockChannels}
        selected={["ana1"]}
        onToggle={vi.fn()}
        onColorChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Analogue 1")).toBeInTheDocument();
    expect(screen.getByText("Analogue 2")).toBeInTheDocument();
  });

  test("each row has a Checkbox and ColorSwatch", () => {
    render(
      <ChannelSelect
        type="analogue"
        channels={mockChannels}
        selected={["ana1"]}
        onToggle={vi.fn()}
        onColorChange={vi.fn()}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);

    const swatches = screen.getAllByTestId("color-swatch");
    expect(swatches).toHaveLength(2);
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

    const checkbox2 = screen.getByRole("checkbox", { name: "Analogue 2" });
    await user.click(checkbox2);

    expect(handleToggle).toHaveBeenCalledWith("ana2");
  });

  test("when selected.length === 8, all unselected checkboxes have disabled=true", () => {
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

    const checkbox9 = screen.getByRole("checkbox", { name: "Analogue 9" });
    const checkbox10 = screen.getByRole("checkbox", { name: "Analogue 10" });

    expect(checkbox9).toBeDisabled();
    expect(checkbox10).toBeDisabled();
  });

  test("when a channel is the only selected one, its checkbox is not disabled (min-1 rule)", () => {
    render(
      <ChannelSelect
        type="analogue"
        channels={mockChannels}
        selected={["ana1"]}
        onToggle={vi.fn()}
        onColorChange={vi.fn()}
      />,
    );

    const checkbox1 = screen.getByRole("checkbox", { name: "Analogue 1" });
    expect(checkbox1).not.toBeDisabled();
  });
});
