/**
 * UIState
 *
 * Small UI slice used to control ephemeral UI state such as whether the
 * sidebar is open. Kept intentionally minimal for the walking skeleton.
 */
export interface UIState {
  isSidebarOpen: boolean;
}

export const initialUIState: UIState = {
  isSidebarOpen: true,
};

/**
 * useUISlice
 *
 * Provides a minimal `getState` + `toggleSidebar` API used by tests and
 * simple components during early development.
 */
export default function useUISlice() {
  let state: UIState = { ...initialUIState };

  function getState() {
    return state;
  }

  function toggleSidebar() {
    state = { ...state, isSidebarOpen: !state.isSidebarOpen };
  }

  return {
    getState,
    toggleSidebar,
    initialUIState,
  };
}
