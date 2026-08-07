import type React from "react";

interface Props {
  open: boolean;
  message?: string | null;
}

export const NotificationSnackbar: React.FC<Props> = ({ open, message }) => {
  if (!open) return null;
  return <div data-testid="notification-snackbar">{message}</div>;
};

export default NotificationSnackbar;
