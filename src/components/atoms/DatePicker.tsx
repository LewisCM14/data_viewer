import type React from "react";
import { TextField } from "@mui/material";

export interface DatePickerProps {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

/**
 * DatePicker
 *
 * Simple date input component that emits ISO date strings (YYYY-MM-DD).
 * For Stage 3 we use a basic TextField with type="date" to avoid adding
 * additional MUI DatePicker dependencies. Can be upgraded to MUI's DatePicker
 * in later stages if needed.
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  disabled = false,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value || null;
    onChange(newValue);
  };

  return (
    <TextField
      label={label}
      type="date"
      value={value || ""}
      onChange={handleChange}
      disabled={disabled}
      InputLabelProps={{
        shrink: true,
      }}
      fullWidth
      data-testid={`datepicker-${label.toLowerCase().replace(/\s+/g, "-")}`}
    />
  );
};

export default DatePicker;
