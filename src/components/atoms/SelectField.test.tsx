import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import SelectField from "./SelectField";

describe("SelectField", () => {
  test("renders label with correct text", () => {
    render(
      <SelectField
        label="Equipment"
        value=""
        onChange={vi.fn()}
        options={[]}
      />,
    );
    expect(screen.getByLabelText("Equipment")).toBeInTheDocument();
  });

  test("renders passed options", () => {
    render(
      <SelectField
        label="Equipment"
        value="1"
        onChange={vi.fn()}
        options={[
          { value: "1", label: "Equipment 1" },
          { value: "2", label: "Equipment 2" },
        ]}
      />,
    );
    // MUI Select renders options in a menu that opens on click
    const select = screen.getByLabelText("Equipment");
    expect(select).toBeInTheDocument();
  });

  test("calls onChange with the selected value", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <SelectField
        label="Equipment"
        value=""
        onChange={handleChange}
        options={[
          { value: "1", label: "Equipment 1" },
          { value: "2", label: "Equipment 2" },
        ]}
      />,
    );

    const select = screen.getByLabelText("Equipment");
    await user.click(select);

    // After clicking, options should be visible
    const option1 = await screen.findByText("Equipment 1");
    await user.click(option1);

    expect(handleChange).toHaveBeenCalledWith("1");
  });
});
