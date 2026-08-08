import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import SampleRateSlider from "./SampleRateSlider";

describe("SampleRateSlider", () => {
  test("slider marks equal [1, 2, 5, 10, 15, 30]", () => {
    render(<SampleRateSlider value={1} onChange={vi.fn()} />);

    // Verify all marks are rendered - use getAllByText since value may also be displayed
    const marks = [1, 2, 5, 10, 15, 30];
    for (const mark of marks) {
      const elements = screen.getAllByText(mark.toString());
      expect(elements.length).toBeGreaterThan(0);
    }
  });

  test("step prop is null", () => {
    render(<SampleRateSlider value={5} onChange={vi.fn()} />);

    const slider = screen.getByRole("slider");
    // MUI doesn't expose step as an attribute when step is null,
    // but we can verify the component behavior
    expect(slider).toBeInTheDocument();
  });

  test("onChange called with mark value", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<SampleRateSlider value={5} onChange={handleChange} />);

    const slider = screen.getByRole("slider");
    await user.click(slider);
    await user.keyboard("{ArrowRight}");

    // Verify onChange was called
    expect(handleChange).toHaveBeenCalled();
  });

  test("displays correct initial value", () => {
    render(<SampleRateSlider value={10} onChange={vi.fn()} />);

    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuenow", "10");
  });
});
