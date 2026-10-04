import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import ChangeModal from "./ChangeModal";
import { renderWithProviders } from "@/test-utils";
import * as toolsHelper from "@/helpers/toolsHelper";
import * as postAction from "../states/action";

const post = {
  id: 7,
  user_id: 1,
  cover: null,
  description: "Deskripsi lama",
  created_at: "2024-10-05T03:07:11.000000Z",
  updated_at: "2024-10-05T03:07:11.000000Z",
  author: { name: "Delcom", photo: null },
  likes: [],
  comments: [],
};

function silenceErrorDialog() {
  return vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(async () => ({}) as never);
}

function submitForm() {
  return act(async () => {
    fireEvent.submit(screen.getByTestId("edit-description-input").closest("form") as HTMLFormElement);
  });
}

describe("ChangeModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render nothing when hidden or when there is no post", () => {
    const { rerender } = renderWithProviders(
      <ChangeModal show={false} onClose={vi.fn()} post={post} onSuccess={vi.fn()} />
    );
    expect(screen.queryByTestId("edit-post-modal")).not.toBeInTheDocument();

    rerender(<ChangeModal show onClose={vi.fn()} post={null} onSuccess={vi.fn()} />);
    expect(screen.queryByTestId("edit-post-modal")).not.toBeInTheDocument();
  });

  it("should show the current description", () => {
    renderWithProviders(<ChangeModal show onClose={vi.fn()} post={post} onSuccess={vi.fn()} />);

    expect(screen.getByRole("dialog", { name: "Ubah postingan" })).toBeInTheDocument();
    expect(screen.getByTestId("edit-description-input")).toHaveValue("Deskripsi lama");
  });

  it("should fall back to an empty field when the post has no description", () => {
    renderWithProviders(
      <ChangeModal show onClose={vi.fn()} post={{ ...post, description: "" }} onSuccess={vi.fn()} />
    );

    expect(screen.getByTestId("edit-description-input")).toHaveValue("");
  });

  it("should close from the cancel and close buttons", () => {
    const onClose = vi.fn();
    renderWithProviders(<ChangeModal show onClose={onClose} post={post} onSuccess={vi.fn()} />);

    fireEvent.click(screen.getByTestId("cancel-edit-modal-btn"));
    fireEvent.click(screen.getByTestId("close-edit-modal-btn"));

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("should reject a blank description", async () => {
    const errorSpy = silenceErrorDialog();
    const changeSpy = vi.spyOn(postAction, "asyncSetIsPostChange");
    renderWithProviders(<ChangeModal show onClose={vi.fn()} post={post} onSuccess={vi.fn()} />);

    fireEvent.change(screen.getByTestId("edit-description-input"), { target: { value: "  " } });
    await submitForm();

    expect(errorSpy).toHaveBeenCalledWith("Deskripsi postingan wajib diisi.");
    expect(changeSpy).not.toHaveBeenCalled();
  });

  it("should save the trimmed description, then notify and close on success", async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    const changeSpy = vi.spyOn(postAction, "asyncSetIsPostChange").mockReturnValue(async (dispatch) => {
      dispatch(postAction.setIsPostChangedActionCreator(true));
      dispatch(postAction.setIsPostChangeActionCreator(true));
    });

    const { store } = renderWithProviders(
      <ChangeModal show onClose={onClose} post={post} onSuccess={onSuccess} />
    );
    fireEvent.change(screen.getByTestId("edit-description-input"), { target: { value: " Deskripsi baru " } });
    await submitForm();

    expect(changeSpy).toHaveBeenCalledWith(7, "Deskripsi baru");
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(store.getState().isPostChange).toBe(false);
    expect(store.getState().isPostChanged).toBe(false);
  });

  it("should stay open when saving fails", async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    vi.spyOn(postAction, "asyncSetIsPostChange").mockReturnValue(() => Promise.resolve());

    renderWithProviders(<ChangeModal show onClose={onClose} post={post} onSuccess={onSuccess} />);
    await submitForm();

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByTestId("submit-edit-modal-btn")).toBeEnabled();
  });

  it("should disable the buttons and show progress while saving", async () => {
    vi.spyOn(postAction, "asyncSetIsPostChange").mockReturnValue(() => new Promise(() => {}));
    renderWithProviders(<ChangeModal show onClose={vi.fn()} post={post} onSuccess={vi.fn()} />);

    await submitForm();

    expect(screen.getByTestId("submit-edit-modal-btn")).toBeDisabled();
    expect(screen.getByTestId("cancel-edit-modal-btn")).toBeDisabled();
    expect(screen.getByText("Menyimpan...")).toBeInTheDocument();
  });
});