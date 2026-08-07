import { describe, test, expect } from "vitest";
import useNotificationSlice, {
  initialNotificationState,
} from "./notificationSlice";

describe("notificationSlice initial state", () => {
  test("defaults to closed with empty message and info severity", () => {
    expect(initialNotificationState).toEqual({
      open: false,
      message: "",
      severity: "info",
    });
  });

  test("showNotification and dismissNotification update state", () => {
    const s = useNotificationSlice();
    expect(s.getState().open).toBe(false);
    s.showNotification("hello", "error");
    expect(s.getState()).toEqual({
      open: true,
      message: "hello",
      severity: "error",
    });
    s.dismissNotification();
    expect(s.getState()).toEqual({
      open: false,
      message: "",
      severity: "info",
    });
  });
});
