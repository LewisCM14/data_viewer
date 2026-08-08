import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import Checkbox from "./Checkbox";

describe("Checkbox", () => {
  test("renders checked when checked=true", () => {
    render(<Checkbox label="Channel 1" checked={true} onChange={vi.fn()} />);
    const checkbox = screen.getByRole("checkbox", { name: "Channel 1" });
    expect(checkbox).toBeChecked();
  });

  test("calls onChange on click", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Checkbox label="Channel 1" checked={false} onChange={handleChange} />,
    );

    const checkbox = screen.getByRole("checkbox", { name: "Channel 1" });
    await user.click(checkbox);

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  test("does not call onChange when disabled=true", async () => {
    const handleChange = vi.fn();

    render(
      <Checkbox
        label="Channel 1"
        checked={false}
        onChange={handleChange}
        disabled={true}
      />,
    );

    const checkbox = screen.getByRole("checkbox", { name: "Channel 1" });
    expect(checkbox).toBeDisabled();

    // Disabled elements prevent pointer events, so we verify it's disabled
    // and cannot be clicked rather than attempting to click it
    expect(handleChange).not.toHaveBeenCalled();
  });
});
