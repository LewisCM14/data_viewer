import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import Slider from "./Slider";

describe("Slider", () => {
  test("renders with aria-valuenow equal to initial value", () => {
    render(
      <Slider
        label="Sample Rate"
        value={5}
        onChange={vi.fn()}
        min={1}
        max={30}
        marks={[
          { value: 1, label: "1" },
          { value: 5, label: "5" },
          { value: 10, label: "10" },
        ]}
      />,
    );

    const slider = screen.getByRole("slider", { name: "Sample Rate" });
    expect(slider).toHaveAttribute("aria-valuenow", "5");
  });

  test("calls onChange with the new value on change", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Slider
        label="Sample Rate"
        value={5}
        onChange={handleChange}
        min={1}
        max={30}
        marks={[
          { value: 1, label: "1" },
          { value: 5, label: "5" },
          { value: 10, label: "10" },
        ]}
      />,
    );

    const slider = screen.getByRole("slider", { name: "Sample Rate" });

    // Simulate changing the slider
    await user.click(slider);
    // MUI sliders use keyboard for precise control
    await user.keyboard("{ArrowRight}");

    expect(handleChange).toHaveBeenCalled();
  });

  test("renders marks correctly", () => {
    const marks = [
      { value: 1, label: "1Hz" },
      { value: 2, label: "2Hz" },
      { value: 5, label: "5Hz" },
    ];

    render(
      <Slider
        label="Sample Rate"
        value={1}
        onChange={vi.fn()}
        min={1}
        max={5}
        marks={marks}
      />,
    );

    // Verify marks are rendered (MUI renders mark labels as text)
    expect(screen.getByText("1Hz")).toBeInTheDocument();
    expect(screen.getByText("2Hz")).toBeInTheDocument();
    expect(screen.getByText("5Hz")).toBeInTheDocument();
  });
});
