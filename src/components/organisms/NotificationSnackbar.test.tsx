import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type useNotificationSlice from "../../store/slices/notificationSlice";
import NotificationSnackbar from "./NotificationSnackbar";

// Mock the notification slice
let mockNotificationState: ReturnType<typeof useNotificationSlice>;

vi.mock("../../store/slices/notificationSlice", () => ({
  default: () => mockNotificationState,
}));

describe("NotificationSnackbar", () => {
  beforeEach(() => {
    mockNotificationState = {
      getState: () => ({
        open: false,
        message: "",
        severity: "info",
      }),
      showNotification: vi.fn(),
      dismissNotification: vi.fn(),
      initialNotificationState: {
        open: false,
        message: "",
        severity: "info",
      },
    };
  });

  test("renders closed when open: false", () => {
    render(<NotificationSnackbar />);

    // MUI Snackbar with open={false} doesn't render its content in the document
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("renders open with correct message when showNotification is dispatched", () => {
    mockNotificationState.getState = () => ({
      open: true,
      message: "Test notification message",
      severity: "success",
    });

    render(<NotificationSnackbar />);

    // MUI Snackbar renders an alert role when open
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Test notification message")).toBeInTheDocument();
  });

  test("clicking the close button dispatches dismissNotification", async () => {
    const user = userEvent.setup();
    mockNotificationState.getState = () => ({
      open: true,
      message: "Test message",
      severity: "info",
    });

    render(<NotificationSnackbar />);

    // Find and click the close button
    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    expect(mockNotificationState.dismissNotification).toHaveBeenCalled();
  });

  test("anchorOrigin is { vertical: 'bottom', horizontal: 'right' }", () => {
    mockNotificationState.getState = () => ({
      open: true,
      message: "Test message",
      severity: "info",
    });

    const { container } = render(<NotificationSnackbar />);

    // MUI Snackbar with bottom-right anchor has specific CSS classes
    // We can check for the presence of the snackbar element
    const snackbar = container.querySelector(".MuiSnackbar-root");
    expect(snackbar).toBeInTheDocument();

    // The anchorOrigin prop affects CSS classes applied by MUI
    expect(snackbar).toHaveClass("MuiSnackbar-anchorOriginBottomRight");
  });

  test("auto-hides after 6000ms", async () => {
    vi.useFakeTimers();

    mockNotificationState.getState = () => ({
      open: true,
      message: "Auto-hide test",
      severity: "info",
    });

    render(<NotificationSnackbar />);

    expect(screen.getByText("Auto-hide test")).toBeInTheDocument();

    // Fast-forward time by 6000ms
    await vi.advanceTimersByTimeAsync(6000);

    // Check that dismissNotification was called
    expect(mockNotificationState.dismissNotification).toHaveBeenCalled();

    vi.useRealTimers();
  });
});
