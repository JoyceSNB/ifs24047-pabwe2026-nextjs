import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ModalShell from "./ModalShell";

function setup(onClose = vi.fn()) {
  const result = render(
    <ModalShell
      testId="demo-modal"
      closeTestId="close-demo"
      title="Judul modal"
      icon={<span data-testid="demo-icon" />}
      onClose={onClose}
    >
      <p>Isi modal</p>
    </ModalShell>
  );
  return { onClose, ...result };
}

describe("ModalShell", () => {
  it("should render an accessible dialog with title, icon and content", () => {
    setup();

    const dialog = screen.getByRole("dialog", { name: "Judul modal" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("heading", { level: 2, name: "Judul modal" })).toBeInTheDocument();
    expect(screen.getByTestId("demo-icon")).toBeInTheDocument();
    expect(screen.getByText("Isi modal")).toBeInTheDocument();
  });

  it("should move the focus into the dialog panel", () => {
    setup();

    expect(screen.getByRole("dialog").firstElementChild).toHaveFocus();
  });

  it("should close from the close button", () => {
    const { onClose } = setup();

    fireEvent.click(screen.getByTestId("close-demo"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should close with the Escape key but ignore other keys", () => {
    const { onClose } = setup();

    fireEvent.keyDown(document, { key: "Enter" });
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should close when the dark overlay is pressed but not when the panel is pressed", () => {
    const { onClose } = setup();

    fireEvent.mouseDown(screen.getByText("Isi modal"));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.mouseDown(screen.getByTestId("demo-modal"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should use the latest onClose without re-registering listeners", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = setup(first);

    rerender(
      <ModalShell testId="demo-modal" closeTestId="close-demo" title="Judul modal" icon={null} onClose={second}>
        <p>Isi modal</p>
      </ModalShell>
    );
    fireEvent.keyDown(document, { key: "Escape" });

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("should lock the page scroll while open and release it on unmount", () => {
    const { unmount } = setup();
    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("");
  });

  it("should give the focus back to the element that opened the modal", () => {
    const opener = document.createElement("button");
    document.body.appendChild(opener);
    opener.focus();

    const { unmount } = setup();
    expect(opener).not.toHaveFocus();

    unmount();

    expect(opener).toHaveFocus();
    opener.remove();
  });

  it("should not try to restore the focus to a non-HTML element", () => {
    const svgOpener = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgOpener.setAttribute("tabindex", "0");
    document.body.appendChild(svgOpener);
    svgOpener.focus();

    const { unmount } = setup();

    expect(() => unmount()).not.toThrow();
    svgOpener.remove();
  });
});