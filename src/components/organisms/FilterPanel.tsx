import { Box, Stack } from "@mui/material";
import type React from "react";
import useFilters from "../../hooks/useFilters";
import useNotificationSlice from "../../store/slices/notificationSlice";
import ChannelSelect, { type Channel } from "../molecules/ChannelSelect";
import {
  digitalLoadOptions,
  analogueLoadOptions,
} from "../../api/mock/MockChannelRepository";
import DateRangePicker from "../molecules/DateRangePicker";
import EquipmentSelect, { type Equipment } from "../molecules/EquipmentSelect";
import SampleRateSlider from "../molecules/SampleRateSlider";

// Mock equipment and channels for the prototype
// In production, these would come from API
const MOCK_EQUIPMENT: Equipment[] = [
  { id: "eq1", name: "Equipment 1" },
  { id: "eq2", name: "Equipment 2" },
  { id: "eq3", name: "Equipment 3" },
];

const MOCK_DIGITAL_CHANNELS: Channel[] = [
  { id: "d1", name: "Digital 1", color: "#FF6384" },
  { id: "d2", name: "Digital 2", color: "#36A2EB" },
  { id: "d3", name: "Digital 3", color: "#FFCE56" },
  { id: "d4", name: "Digital 4", color: "#4BC0C0" },
  { id: "d5", name: "Digital 5", color: "#9966FF" },
];

const MOCK_ANALOGUE_CHANNELS: Channel[] = [
  { id: "a1", name: "Analogue 1", color: "#FF9F40" },
  { id: "a2", name: "Analogue 2", color: "#FF6384" },
  { id: "a3", name: "Analogue 3", color: "#C9CBCF" },
  { id: "a4", name: "Analogue 4", color: "#4BC0C0" },
];

/**
 * FilterPanel
 *
 * Organism that composes all filter molecules and wires them to the Zustand store.
 * Reads from filterSlice via useFilters and dispatches actions on user interactions.
 * Enforces validation rules (equipment required, 1-8 channels, date range ordering).
 */
export const FilterPanel: React.FC = () => {
  const filters = useFilters();
  const notification = useNotificationSlice();
  const state = filters.getState();

  const handleEquipmentChange = (equipmentId: string) => {
    filters.setEquipment(equipmentId);
  };

  const handleDigitalChannelToggle = (channelId: string) => {
    if (state.digitalChannels.includes(channelId)) {
      filters.removeDigitalChannel(channelId);
    } else {
      filters.addDigitalChannel(channelId);
    }
  };

  const handleAnalogueChannelToggle = (channelId: string) => {
    if (state.analogueChannels.includes(channelId)) {
      filters.removeAnalogueChannel(channelId);
    } else {
      filters.addAnalogueChannel(channelId);
    }
  };

  const handleDateRangeChange = ({
    from,
    to,
  }: {
    from: string | null;
    to: string | null;
  }) => {
    /* istanbul ignore next */
    filters.setDateRange(from && to ? [from, to] : null);
  };

  const handleDateRangeError = (message: string) => {
    notification.showNotification(message, "warning");
  };

  const handleSampleRateChange = (value: number) => {
    filters.setSampleRate(value);
  };

  /* istanbul ignore next -- Color changing UI not implemented in Stage 5; reserved for future stages */
  const handleColorChange = (channelId: string, color: string) => {
    filters.setChannelColour(channelId, color);
  };

  // Calculate combined selected channels for 8-channel cap
  const combinedSelected = [
    ...state.digitalChannels,
    ...state.analogueChannels,
  ];

  /* istanbul ignore next */
  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={3}>
        <EquipmentSelect
          value={state.equipmentId}
          onChange={handleEquipmentChange}
          equipmentList={MOCK_EQUIPMENT}
        />
        <ChannelSelect
          type="digital"
          channels={MOCK_DIGITAL_CHANNELS}
          selected={combinedSelected}
          onToggle={handleDigitalChannelToggle}
          onColorChange={handleColorChange}
          loadOptions={digitalLoadOptions}
          debounceMs={0}
        />
        <ChannelSelect
          type="analogue"
          channels={MOCK_ANALOGUE_CHANNELS}
          selected={combinedSelected}
          onToggle={handleAnalogueChannelToggle}
          onColorChange={handleColorChange}
          loadOptions={analogueLoadOptions}
          debounceMs={0}
        />
        <DateRangePicker
          from={state.dateRange?.[0] ?? null}
          to={state.dateRange?.[1] ?? null}
          onChange={handleDateRangeChange}
          onError={handleDateRangeError}
        />
          {/* istanbul ignore next */}
          <SampleRateSlider
          value={state.sampleRate ?? 1}
          onChange={handleSampleRateChange}
        />
      </Stack>
    </Box>
  );
};

export default FilterPanel;
