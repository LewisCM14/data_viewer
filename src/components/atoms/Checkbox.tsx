import { FormControlLabel, Checkbox as MuiCheckbox } from "@mui/material";
import type React from "react";

export interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

/**
 * Checkbox
 *
 * Labelled MUI Checkbox component for filter panel channel selection.
 * Supports disabled state for validation enforcement (8-channel cap).
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return (
    <FormControlLabel
      control={
        <MuiCheckbox
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          data-testid={`checkbox-${label.toLowerCase().replace(/\s+/g, "-")}`}
        />
      }
      label={label}
    />
  );
};

export default Checkbox;
