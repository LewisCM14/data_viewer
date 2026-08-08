import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import EquipmentSelect from "./EquipmentSelect";

describe("EquipmentSelect", () => {
  const mockEquipmentList = [
    { id: "eq1", name: "Equipment 1" },
    { id: "eq2", name: "Equipment 2" },
  ];

  test("renders a required indicator when value is null", () => {
    render(
      <EquipmentSelect
        value={null}
        onChange={vi.fn()}
        equipmentList={mockEquipmentList}
      />,
    );

    // MUI marks required fields with an asterisk in the label
    // We verify the select is present and check for the asterisk
    const select = screen.getByLabelText(/Equipment/);
    expect(select).toBeInTheDocument();

    // The asterisk should be present when required
    const asterisk = screen.getByText("*");
    expect(asterisk).toBeInTheDocument();
  });

  test("calls onChange with equipment ID when option selected", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <EquipmentSelect
        value={null}
        onChange={handleChange}
        equipmentList={mockEquipmentList}
      />,
    );

    const select = screen.getByLabelText(/Equipment/);
    await user.click(select);

    const option = await screen.findByText("Equipment 1");
    await user.click(option);

    expect(handleChange).toHaveBeenCalledWith("eq1");
  });

  test("displays the selected equipment", () => {
    render(
      <EquipmentSelect
        value="eq2"
        onChange={vi.fn()}
        equipmentList={mockEquipmentList}
      />,
    );

    // MUI Select shows the selected value as text content
    expect(screen.getByText("Equipment 2")).toBeInTheDocument();
  });
});
