import { Box, Stack, Button, CircularProgress } from "@mui/material";
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
import useLoadOptions from "../../hooks/useLoadOptions";
import useGetGraphData from "../../hooks/useGetGraphData";
import type { TimeseriesQueryParams } from "../../types";

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
  const { options } = useLoadOptions();
  const { plot, loading: plotting } = useGetGraphData();

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
    filters.setDateRange(from && to ? [from, to] : null);
  };

  const handleDateRangeError = (message: string) => {
    notification.showNotification(message, "warning");
  };

  const handleSampleRateChange = (value: number) => {
    filters.setSampleRate(value);
  };

  const handleColorChange = (channelId: string, color: string) => {
    filters.setChannelColour(channelId, color);
  };

  // Calculate combined selected channels for 8-channel cap
  const combinedSelected = [
    ...state.digitalChannels,
    ...state.analogueChannels,
  ];

  const equipmentList = options?.equipments ?? MOCK_EQUIPMENT;
  const digitalChannels = options?.digitalChannels ?? MOCK_DIGITAL_CHANNELS;
  const analogueChannels = options?.analogueChannels ?? MOCK_ANALOGUE_CHANNELS;

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={3}>
        <EquipmentSelect
          value={state.equipmentId}
          onChange={handleEquipmentChange}
          equipmentList={equipmentList}
        />
        <ChannelSelect
          type="digital"
          channels={digitalChannels}
          selected={combinedSelected}
          onToggle={handleDigitalChannelToggle}
          onColorChange={handleColorChange}
          loadOptions={digitalLoadOptions}
          debounceMs={0}
        />
        <ChannelSelect
          type="analogue"
          channels={analogueChannels}
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
        <SampleRateSlider
          value={state.sampleRate ?? 1}
          onChange={handleSampleRateChange}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, pt: 1 }}>
          {/** Disable the Plot button until required inputs are present */}
          {/** required: equipment, dateRange, channels (1-8), sampleRate */}
          {/* compute affordance for enabled state */}
          {/* eslint-disable react/jsx-no-bind */}
          <Button
            data-testid="plot-button"
            variant="contained"
            onClick={async () => {
              // keep defensive notifications for legacy behaviour
              if (!state.equipmentId) {
                notification.showNotification(
                  "Select an equipment before plotting",
                  "warning",
                );
                return;
              }
              if (!state.dateRange?.[0] || !state.dateRange?.[1]) {
                notification.showNotification(
                  "Select a valid date range before plotting",
                  "warning",
                );
                return;
              }
              if (combinedSelected.length < 1) {
                notification.showNotification(
                  "Select at least one channel to plot",
                  "warning",
                );
                return;
              }
              if (combinedSelected.length > 8) {
                notification.showNotification(
                  "A maximum of 8 channels can be plotted",
                  "warning",
                );
                return;
              }

              const params: TimeseriesQueryParams = {
                equipmentId: state.equipmentId,
                channels: combinedSelected,
                from: state.dateRange?.[0] ?? null,
                to: state.dateRange?.[1] ?? null,
                bucketSize: state.sampleRate ?? 1,
              };

              await plot(params);
            }}
            disabled={
              plotting ||
              !state.equipmentId ||
              !state.dateRange?.[0] ||
              !state.dateRange?.[1] ||
              combinedSelected.length < 1 ||
              combinedSelected.length > 8 ||
              !(state.sampleRate ?? 1)
            }
          >
            {plotting ? <CircularProgress size={18} /> : "Plot"}
          </Button>
          {/* eslint-enable react/jsx-no-bind */}
        </Box>
      </Stack>
    </Box>
  );
};

export default FilterPanel;
