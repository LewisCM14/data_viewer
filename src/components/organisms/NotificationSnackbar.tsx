/* istanbul ignore file */
import type React from "react";

interface Props {
  open: boolean;
  message?: string | null;
}

/**
 * NotificationSnackbar
 *
 * Minimal organism that renders a notification message when `open` is
 * true. Kept intentionally small for the walking skeleton — replace with
 * MUI `Snackbar` and richer behaviour in later stages.
 */
export const NotificationSnackbar: React.FC<Props> = ({ open, message }) => {
  if (!open) return null;
  return <div data-testid="notification-snackbar">{message}</div>;
};

export default NotificationSnackbar;
