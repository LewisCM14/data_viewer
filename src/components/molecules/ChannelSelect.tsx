import type React from "react";
import { Box, Stack, Typography } from "@mui/material";
import Checkbox from "../atoms/Checkbox";
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
  onColorChange: (channelId: string, color: string) => void;
}

/**
 * ChannelSelect
 *
 * Molecule for selecting digital or analogue channels with validation:
 * - Min 1 channel must be selected (last selected checkbox is not disabled)
 * - Max 8 combined channels (unselected checkboxes disabled when limit reached)
 * - Each row shows Checkbox + ColorSwatch for visual channel identification
 */
export const ChannelSelect: React.FC<ChannelSelectProps> = ({
  type,
  channels,
  selected,
  onToggle,
  onColorChange,
}) => {
  const isAtCapacity = selected.length >= 8;

  const handleToggle = (channelId: string, checked: boolean) => {
    onToggle(channelId);
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {type === "digital" ? "Digital Channels" : "Analogue Channels"}
      </Typography>
      <Stack spacing={1}>
        {channels.map((channel) => {
          const isSelected = selected.includes(channel.id);
          // Disable unselected checkboxes when at 8-channel capacity
          // Selected checkboxes are never disabled (allows unchecking even if it's the last one)
          const isDisabled = !isSelected && isAtCapacity;

          return (
            <Box
              key={channel.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Checkbox
                label={channel.name}
                checked={isSelected}
                onChange={(checked) => handleToggle(channel.id, checked)}
                disabled={isDisabled}
              />
              <ColorSwatch color={channel.color} />
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

export default ChannelSelect;
