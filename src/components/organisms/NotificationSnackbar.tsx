import { Alert, Snackbar } from "@mui/material";
import type React from "react";
import useNotificationSlice from "../../store/slices/notificationSlice";

/**
 * NotificationSnackbar
 *
 * Organism that displays user notifications via MUI Snackbar.
 * Reads from notificationSlice and auto-dismisses after 6000ms.
 * Anchored to bottom-right corner of the viewport.
 */
export const NotificationSnackbar: React.FC = () => {
  const notification = useNotificationSlice();
  const state = notification.getState();

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    notification.dismissNotification();
  };

  return (
    <Snackbar
      open={state.open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert
        onClose={handleClose}
        severity={state.severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {state.message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationSnackbar;
