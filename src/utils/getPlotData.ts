import type { Data } from "plotly.js";
import type { BucketedRecording } from "../types";

const FALLBACK_COLOR = "#cccccc";

/**
 * getPlotData
 *
 * Transforms an array of BucketedRecording items into Plotly.Data traces.
 * Creates one trace per unique channel, combining data from all recordings.
 * Each trace is assigned a color from the provided colours map, with a
 * fallback color for unmapped channels.
 *
 * @param recordings - Array of bucketed recording data
 * @param colours - Map of channel IDs to hex color strings
 * @returns Array of Plotly.Data traces
 */
export function getPlotData(
  recordings: BucketedRecording[],
  colours: Record<string, string>,
): Partial<Data>[] {
  if (recordings.length === 0) {
    return [];
  }

  // Group data by channel
  const channelData: Record<string, { x: number[]; y: number[] }> = {};

  for (const recording of recordings) {
    for (const series of recording.series) {
      const { channel, values, timestamps } = series;

      if (!channelData[channel]) {
        channelData[channel] = { x: [], y: [] };
      }

      channelData[channel].x.push(...timestamps);
      channelData[channel].y.push(...values);
    }
  }

  // Convert to Plotly traces
  const traces: Partial<Data>[] = [];

  for (const [channelId, data] of Object.entries(channelData)) {
    const color = colours[channelId] || FALLBACK_COLOR;

    traces.push({
      type: "scatter",
      mode: "lines",
      name: `Channel ${channelId}`,
      x: data.x,
      y: data.y,
      marker: {
        color,
      },
    });
  }

  return traces;
}
