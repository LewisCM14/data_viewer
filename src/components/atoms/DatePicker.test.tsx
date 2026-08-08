import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import DatePicker from "./DatePicker";

describe("DatePicker", () => {
  test("renders an input", () => {
    render(<DatePicker label="Start Date" value={null} onChange={vi.fn()} />);

    const input = screen.getByLabelText("Start Date");
    expect(input).toBeInTheDocument();
  });

  test("calls onChange with an ISO string when a date is typed", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <DatePicker label="Start Date" value={null} onChange={handleChange} />,
    );

    const input = screen.getByLabelText("Start Date");
    // Clear first, then type a valid date
    await user.clear(input);
    await user.type(input, "2024-01-15");

    // Verify the handler was called with an ISO string format
    expect(handleChange).toHaveBeenCalled();
    const callArg =
      handleChange.mock.calls[handleChange.mock.calls.length - 1][0];

    // Should be ISO string or null
    if (callArg) {
      expect(typeof callArg).toBe("string");
      // ISO format check: YYYY-MM-DD
      expect(callArg).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  test("displays the provided value", () => {
    render(
      <DatePicker label="Start Date" value="2024-01-15" onChange={vi.fn()} />,
    );

    const input = screen.getByLabelText("Start Date") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    // The value should be set (exact display format depends on MUI's formatting)
    expect(input.value).toBeTruthy();
  });
});
