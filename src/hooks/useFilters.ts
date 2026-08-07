import useFilterSlice from "../store/slices/filterSlice";

/**
 * useFilters
 *
 * Thin wrapper around the filter slice used by components. In Stage 1 this
 * simply proxies to the in-memory slice; later it will wrap Zustand selectors.
 */
export default function useFilters() {
  const s = useFilterSlice();
  return {
    getState: s.getState,
    setEquipment: s.setEquipment,
    addDigitalChannel: s.addDigitalChannel,
    removeDigitalChannel: s.removeDigitalChannel,
    addAnalogueChannel: s.addAnalogueChannel,
    removeAnalogueChannel: s.removeAnalogueChannel,
    setDateRange: s.setDateRange,
    setSampleRate: s.setSampleRate,
    setChannelColour: s.setChannelColour,
    resetFilters: s.resetFilters,
  };
}
