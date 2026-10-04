import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import AddModal from "./AddModal";
import { renderWithProviders } from "@/test-utils";
import * as toolsHelper from "@/helpers/toolsHelper";
import * as postAction from "../states/action";

function silenceErrorDialog() {
  return vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(async () => ({}) as never);
}

function submitForm() {
  return act(async () => {
    fireEvent.submit(screen.getByTestId("add-description-input").closest("form") as HTMLFormElement);
  });
}

describe("AddModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render nothing when hidden", () => {
    renderWithProviders(<AddModal show={false} onClose={vi.fn()} onSuccess={vi.fn()} />);

    expect(screen.queryByTestId("add-post-modal")).not.toBeInTheDocument();
  });

  it("should render the form when shown", () => {
    renderWithProviders(<AddModal show onClose={vi.fn()} onSuccess={vi.fn()} />);

    expect(screen.getByRole("dialog", { name: "Buat postingan" })).toBeInTheDocument();
    expect(screen.getByLabelText("Apa yang ingin kamu bagikan?")).toBeInTheDocument();
  });

  it("should close from the cancel and close buttons", () => {
    const onClose = vi.fn();
    renderWithProviders(<AddModal show onClose={onClose} onSuccess={vi.fn()} />);

    fireEvent.click(screen.getByTestId("cancel-add-modal-btn"));
    fireEvent.click(screen.getByTestId("close-add-modal-btn"));

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("should reject a blank description", async () => {
    const errorSpy = silenceErrorDialog();
    const addSpy = vi.spyOn(postAction, "asyncSetIsPostAdd");
    renderWithProviders(<AddModal show onClose={vi.fn()} onSuccess={vi.fn()} />);

    fireEvent.change(screen.getByTestId("add-description-input"), { target: { value: "   " } });
    await submitForm();

    expect(errorSpy).toHaveBeenCalledWith("Deskripsi postingan wajib diisi.");
    expect(addSpy).not.toHaveBeenCalled();
  });

  it("should publish the trimmed description, then notify and close on success", async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    const addSpy = vi.spyOn(postAction, "asyncSetIsPostAdd").mockReturnValue(async (dispatch) => {
      dispatch(postAction.setIsPostAddedActionCreator(true));
      dispatch(postAction.setIsPostAddActionCreator(true));
    });

    const { store } = renderWithProviders(<AddModal show onClose={onClose} onSuccess={onSuccess} />);
    fireEvent.change(screen.getByTestId("add-description-input"), { target: { value: "  Halo dunia  " } });
    await submitForm();

    expect(addSpy).toHaveBeenCalledWith("Halo dunia");
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(store.getState().isPostAdd).toBe(false);
    expect(store.getState().isPostAdded).toBe(false);
  });

  it("should stay open and keep the text when publishing fails", async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    vi.spyOn(postAction, "asyncSetIsPostAdd").mockReturnValue(async (dispatch) => {
      dispatch(postAction.setIsPostAddedActionCreator(false));
      dispatch(postAction.setIsPostAddActionCreator(true));
    });

    const { store } = renderWithProviders(<AddModal show onClose={onClose} onSuccess={onSuccess} />);
    fireEvent.change(screen.getByTestId("add-description-input"), { target: { value: "Halo" } });
    await submitForm();

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByTestId("add-description-input")).toHaveValue("Halo");
    expect(screen.getByTestId("submit-add-modal-btn")).toBeEnabled();
    expect(store.getState().isPostAdd).toBe(false);
  });

  it("should disable the buttons and show progress while publishing", async () => {
    vi.spyOn(postAction, "asyncSetIsPostAdd").mockReturnValue(() => new Promise(() => {}));
    renderWithProviders(<AddModal show onClose={vi.fn()} onSuccess={vi.fn()} />);

    fireEvent.change(screen.getByTestId("add-description-input"), { target: { value: "Halo" } });
    await submitForm();

    expect(screen.getByTestId("submit-add-modal-btn")).toBeDisabled();
    expect(screen.getByTestId("cancel-add-modal-btn")).toBeDisabled();
    expect(screen.getByText("Menerbitkan...")).toBeInTheDocument();
  });

  it("should start with an empty field every time it is opened", () => {
    const { rerender } = renderWithProviders(<AddModal show onClose={vi.fn()} onSuccess={vi.fn()} />);
    fireEvent.change(screen.getByTestId("add-description-input"), { target: { value: "Sisa teks" } });

    rerender(<AddModal show={false} onClose={vi.fn()} onSuccess={vi.fn()} />);
    rerender(<AddModal show onClose={vi.fn()} onSuccess={vi.fn()} />);

    expect(screen.getByTestId("add-description-input")).toHaveValue("");
  });
});