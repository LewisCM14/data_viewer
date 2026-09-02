import {
  Autocomplete,
  Box,
  Checkbox,
  TextField,
  Typography,
} from "@mui/material";
import type React from "react";
import type { SyntheticEvent } from "react";
import ColorSwatch from "../atoms/ColorSwatch";

export interface Channel {
  id: string;
  name: string;
  color: string;
}

export interface ChannelSelectProps {
  type: "digital" | "analogue";
  channels: Channel[];
  selected: string[];
  onToggle: (channelId: string) => void;
  onColorChange?: (channelId: string, color: string) => void;
  loadOptions?: (
    query: string,
    page: number,
  ) => Promise<{ options: Channel[]; hasMore: boolean }>;
  debounceMs?: number;
}

/**
 * Searchable multi-select for digital or analogue channels.
 * Disables unselected options once 8 channels are combined across both groups.
 */
export const ChannelSelect: React.FC<ChannelSelectProps> = ({
  type,
  channels,
  selected,
  onToggle,
  onColorChange: _onColorChange,
  // optional props reserved for future async loading UI
  loadOptions: _loadOptions,
  debounceMs: _debounceMs,
}) => {
  const handleChange = (_event: SyntheticEvent, newValue: Channel[]) => {
    const newIds = newValue.map((v) => v.id);

    newIds.forEach((id) => {
      if (!selected.includes(id)) onToggle(id);
    });
    selected.forEach((id) => {
      if (!newIds.includes(id)) onToggle(id);
    });
  };

  const getOptionDisabled = (option: Channel) =>
    !selected.includes(option.id) && selected.length >= 8;

  return (
    <Box>
      <Autocomplete
        multiple
        disableCloseOnSelect
        options={channels}
        getOptionLabel={(opt) => opt.name}
        isOptionEqualToValue={(o, v) => o.id === v.id}
        value={channels.filter((o) => selected.includes(o.id))}
        onChange={handleChange}
        getOptionDisabled={getOptionDisabled}
        renderInput={(params) => (
          <TextField
            {...params}
            label={
              type === "digital" ? "Digital Channels" : "Analogue Channels"
            }
            placeholder="Search channels..."
            variant="outlined"
          />
        )}
        renderOption={(props, option, { selected: optionSelected }) => (
          <li {...props} key={option.id}>
            <Checkbox
              tabIndex={-1}
              checked={optionSelected}
              disabled={getOptionDisabled(option)}
              inputProps={{ "aria-label": option.name }}
            />
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
              <ColorSwatch color={option.color} />
              <Typography>{option.name}</Typography>
            </Box>
          </li>
        )}
      />
    </Box>
  );
};

export default ChannelSelect;
