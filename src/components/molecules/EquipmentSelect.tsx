import type React from "react";
import SelectField from "../atoms/SelectField";

export interface Equipment {
  id: string;
  name: string;
}

export interface EquipmentSelectProps {
  value: string | null;
  onChange: (equipmentId: string) => void;
  equipmentList: Equipment[];
}

/**
 * EquipmentSelect
 *
 * Molecule that wraps SelectField for equipment selection.
 * Enforces required validation (indicated by MUI's required prop)
 * when no equipment is selected (value is null).
 */
export const EquipmentSelect: React.FC<EquipmentSelectProps> = ({
  value,
  onChange,
  equipmentList,
}) => {
  const options = equipmentList.map((eq) => ({
    value: eq.id,
    label: eq.name,
  }));

  const handleChange = (newValue: string) => {
    onChange(newValue);
  };

  return (
    <SelectField
      label="Equipment"
      value={value || ""}
      onChange={handleChange}
      options={options}
      required={value === null}
    />
  );
};

export default EquipmentSelect;
