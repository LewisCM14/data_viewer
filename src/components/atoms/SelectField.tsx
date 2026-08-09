import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";
import type React from "react";

export interface SelectFieldOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectFieldOption[];
  required?: boolean;
  disabled?: boolean;
}

/**
 * SelectField
 *
 * Labelled MUI Select component that wraps the base Select with a typed
 * interface for filter panel usage. Emits the selected value directly via
 * onChange callback.
 */
export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
}) => {
  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value);
  };

  const labelId = `select-${label.toLowerCase().replaceAll(/\s+/g, "-")}`;

  return (
    <FormControl fullWidth required={required} disabled={disabled}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        value={value}
        label={label}
        onChange={handleChange}
        data-testid={`select-${label.toLowerCase().replaceAll(/\s+/g, "-")}`}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectField;
