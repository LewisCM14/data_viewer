/**
 * NotificationState
 *
 * Represents the shape of the notification slice used to dispatch messages
 * shown in the `NotificationSnackbar` organism.
 */
export interface NotificationState {
  open: boolean;
  message: string;
  severity: "info" | "warning" | "error" | "success";
}

export const initialNotificationState: NotificationState = {
  open: false,
  message: "",
  severity: "info",
};

/**
 * useNotificationSlice
 *
 * Small in-memory notification slice for the walking skeleton. Provides
 * `showNotification` and `dismissNotification` helpers used by tests and
 * the `NotificationSnackbar` component.
 */
export default function useNotificationSlice() {
  let state: NotificationState = { ...initialNotificationState };

  function getState() {
    return state;
  }

  function showNotification(
    message: string,
    severity: NotificationState["severity"] = "info",
  ) {
    state = { ...state, open: true, message, severity };
  }

  function dismissNotification() {
    state = { ...state, open: false, message: "", severity: "info" };
  }

  return {
    getState,
    showNotification,
    dismissNotification,
    initialNotificationState,
  };
}
