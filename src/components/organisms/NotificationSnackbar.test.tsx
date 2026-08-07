import { render } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import NotificationSnackbar from "./NotificationSnackbar";

describe("NotificationSnackbar", () => {
  test("does not render when closed", () => {
    const { queryByTestId } = render(<NotificationSnackbar open={false} />);
    expect(queryByTestId("notification-snackbar")).toBeNull();
  });

  test("renders message when open", () => {
    const { getByTestId } = render(
      <NotificationSnackbar open={true} message="hi" />,
    );
    const el = getByTestId("notification-snackbar");
    expect(el.textContent).toBe("hi");
  });
});
