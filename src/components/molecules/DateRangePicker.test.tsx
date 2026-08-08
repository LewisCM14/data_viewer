import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, test, vi } from "vitest";
import DateRangePicker from "./DateRangePicker";

describe("DateRangePicker", () => {
  test("renders two date inputs labelled 'From' and 'To'", () => {
    render(
      <DateRangePicker
        from={null}
        to={null}
        onChange={vi.fn()}
        onError={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("From")).toBeInTheDocument();
    expect(screen.getByLabelText("To")).toBeInTheDocument();
  });

  test("when from < to, onError not called", async () => {
    const handleError = vi.fn();
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <DateRangePicker
        from={null}
        to={null}
        onChange={handleChange}
        onError={handleError}
      />,
    );

    const fromInput = screen.getByLabelText("From");
    const toInput = screen.getByLabelText("To");

    await user.clear(fromInput);
    await user.type(fromInput, "2024-01-01");

    await user.clear(toInput);
    await user.type(toInput, "2024-01-15");

    // Valid range - onError should not be called
    expect(handleError).not.toHaveBeenCalled();
  });

  test("when from > to, onError called", async () => {
    const handleError = vi.fn();

    // Use controlled component with state-like behavior
    function TestWrapper() {
      const [from, setFrom] = React.useState<string | null>(null);
      const [to, setTo] = React.useState<string | null>(null);

      const handleChange = ({
        from: newFrom,
        to: newTo,
      }: {
        from: string | null;
        to: string | null;
      }) => {
        if (newFrom !== from) setFrom(newFrom);
        if (newTo !== to) setTo(newTo);
      };

      return (
        <DateRangePicker
          from={from}
          to={to}
          onChange={handleChange}
          onError={handleError}
        />
      );
    }

    const user = userEvent.setup();
    render(<TestWrapper />);

    const fromInput = screen.getByLabelText("From");
    const toInput = screen.getByLabelText("To");

    // Set 'to' first with an earlier date
    await user.clear(toInput);
    await user.type(toInput, "2024-01-01");

    // Then set 'from' with a later date
    await user.clear(fromInput);
    await user.type(fromInput, "2024-01-15");

    // Wait for the effect to run and onError to be called
    await waitFor(() => {
      expect(handleError).toHaveBeenCalledWith(
        "'From' date must be before 'To' date",
      );
    });
  });

  test("calls onChange with from and to values", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <DateRangePicker
        from={null}
        to={null}
        onChange={handleChange}
        onError={vi.fn()}
      />,
    );

    const fromInput = screen.getByLabelText("From");
    await user.clear(fromInput);
    await user.type(fromInput, "2024-01-01");

    // onChange should be called with the new from value
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "2024-01-01",
      }),
    );
  });
});
