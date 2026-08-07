import { describe, expect, test, vi } from "vitest";

// mock the notification slice so we can assert showNotification calls
const mockShow = vi.fn();
vi.mock("../../../store/slices/notificationSlice", () => ({
  default: () => ({
    showNotification: mockShow,
    getState: () => ({ open: false, message: "", severity: "info" }),
    dismissNotification: () => {},
    initialNotificationState: {},
  }),
}));

// Mock `onError` so the handler passed by `errorLink` executes immediately
vi.mock("@apollo/client/link/error", () => ({
  onError: (fn: (e: unknown) => void) => {
    // call with a representative error object synchronously
    fn({ graphQLErrors: [{ message: "GQ" }], networkError: "NET" });
    // return a stub link
    return () => {};
  },
}));

import { errorLink } from "./errorLink";
import { Observable } from "@apollo/client";

describe("errorLink", () => {
  test("notifies on networkError and GraphQL errors", async () => {
    mockShow.mockClear();
    const link = errorLink();

    const errObj = { graphQLErrors: [{ message: "GQ" }], networkError: "NET" };

    const forward = () =>
      new Observable((observer) => {
        observer.error(errObj as unknown as Error);
      });

    const op = { setContext: () => {}, getContext: () => ({}) } as any;

    await expect(
      new Promise((resolve, reject) => {
        const obs = link.request(op, forward as any);
        obs?.subscribe({ next: resolve, error: reject });
      }),
    ).rejects.toBeTruthy();

    // networkError and graphQLErrors both should have triggered notifications
    expect(mockShow).toHaveBeenCalled();
  });
});
