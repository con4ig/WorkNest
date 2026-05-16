import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

import ConfirmationModal from "./ConfirmationModal";

const baseProps = {
  isOpen: true,
  onClose: () => {},
  onConfirm: () => {},
  title: "Delete project?",
  message: "This action cannot be undone.",
  confirmText: "Delete",
  cancelText: "Cancel",
};

describe("<ConfirmationModal />", () => {
  it("returns null when isOpen is false", () => {
    const { container } = render(
      <ConfirmationModal {...baseProps} isOpen={false} />,
    );
    // No dialog content rendered
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText("Delete project?")).not.toBeInTheDocument();
  });

  it("renders title and message when open", () => {
    render(<ConfirmationModal {...baseProps} />);
    expect(screen.getByText("Delete project?")).toBeInTheDocument();
    expect(
      screen.getByText("This action cannot be undone."),
    ).toBeInTheDocument();
  });

  it("invokes onConfirm THEN onClose when the confirm button is clicked", async () => {
    const calls = [];
    const onConfirm = vi.fn(() => calls.push("confirm"));
    const onClose = vi.fn(() => calls.push("close"));
    render(
      <ConfirmationModal
        {...baseProps}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(calls).toEqual(["confirm", "close"]);
  });

  it("invokes onClose only when the cancel button is clicked", async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <ConfirmationModal
        {...baseProps}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("invokes onClose when the X close button is clicked", async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <ConfirmationModal
        {...baseProps}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );

    // The X button uses aria-label="common.close" (key passthrough from mock)
    await userEvent.click(screen.getByRole("button", { name: "common.close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("applies destructive styles when confirmVariant='danger'", () => {
    render(<ConfirmationModal {...baseProps} confirmVariant="danger" />);
    const confirmBtn = screen.getByRole("button", { name: "Delete" });
    expect(confirmBtn.className).toContain("destructive");
  });

  it("applies primary styles when confirmVariant='primary'", () => {
    render(
      <ConfirmationModal
        {...baseProps}
        confirmVariant="primary"
        confirmText="Confirm"
      />,
    );
    const confirmBtn = screen.getByRole("button", { name: "Confirm" });
    expect(confirmBtn.className).toContain("bg-primary");
    expect(confirmBtn.className).not.toContain("bg-destructive");
  });
});
