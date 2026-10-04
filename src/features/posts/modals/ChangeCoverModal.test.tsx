import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import ChangeCoverModal, { ALLOWED_TYPES, MAX_FILE_SIZE } from "./ChangeCoverModal";
import { renderWithProviders } from "@/test-utils";
import * as toolsHelper from "@/helpers/toolsHelper";
import * as postAction from "../states/action";

const post = {
  id: 9,
  user_id: 1,
  cover: "https://example.com/lama.png",
  description: "Halo",
  created_at: "2024-10-05T03:07:11.000000Z",
  updated_at: "2024-10-05T03:07:11.000000Z",
  author: { name: "Delcom", photo: null },
  likes: [],
  comments: [],
};

const goodFile = () => new File(["img"], "foto.png", { type: "image/png" });

function silenceErrorDialog() {
  return vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(async () => ({}) as never);
}

function chooseFile(file: File) {
  fireEvent.change(screen.getByTestId("cover-file-input"), { target: { files: [file] } });
}

function submitForm() {
  return act(async () => {
    fireEvent.submit(screen.getByTestId("cover-file-input").closest("form") as HTMLFormElement);
  });
}

describe("ChangeCoverModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    URL.createObjectURL = vi.fn(() => "blob:preview-1");
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should export the allowed formats and size limit", () => {
    expect(ALLOWED_TYPES).toEqual(["image/jpeg", "image/jpg", "image/png"]);
    expect(MAX_FILE_SIZE).toBe(1024 * 1024);
  });

  it("should render nothing when hidden or when there is no post", () => {
    const { rerender } = renderWithProviders(
      <ChangeCoverModal show={false} onClose={vi.fn()} post={post} onSuccess={vi.fn()} />
    );
    expect(screen.queryByTestId("change-cover-modal")).not.toBeInTheDocument();

    rerender(<ChangeCoverModal show onClose={vi.fn()} post={null} onSuccess={vi.fn()} />);
    expect(screen.queryByTestId("change-cover-modal")).not.toBeInTheDocument();
  });

  it("should show the current cover", () => {
    renderWithProviders(<ChangeCoverModal show onClose={vi.fn()} post={post} onSuccess={vi.fn()} />);

    expect(screen.getByRole("dialog", { name: "Ganti foto sampul" })).toBeInTheDocument();
    expect(screen.getByTestId("cover-preview")).toHaveAttribute("src", "https://example.com/lama.png");
    expect(screen.getByAltText("Foto saat ini")).toBeInTheDocument();
  });

  it("should show an upload hint when the post has no cover", () => {
    renderWithProviders(
      <ChangeCoverModal show onClose={vi.fn()} post={{ ...post, cover: null }} onSuccess={vi.fn()} />
    );

    expect(screen.getByText("Klik untuk memilih foto")).toBeInTheDocument();
    expect(screen.queryByTestId("cover-preview")).not.toBeInTheDocument();
  });

  it("should close from the cancel and close buttons", () => {
    const onClose = vi.fn();
    renderWithProviders(<ChangeCoverModal show onClose={onClose} post={post} onSuccess={vi.fn()} />);

    fireEvent.click(screen.getByTestId("cancel-cover-modal-btn"));
    fireEvent.click(screen.getByTestId("close-cover-modal-btn"));

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("should ignore an empty file selection", () => {
    renderWithProviders(<ChangeCoverModal show onClose={vi.fn()} post={post} onSuccess={vi.fn()} />);

    fireEvent.change(screen.getByTestId("cover-file-input"), { target: { files: [] } });

    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("should reject files that are not JPG or PNG", () => {
    const errorSpy = silenceErrorDialog();
    renderWithProviders(<ChangeCoverModal show onClose={vi.fn()} post={post} onSuccess={vi.fn()} />);

    chooseFile(new File(["x"], "foto.gif", { type: "image/gif" }));

    expect(errorSpy).toHaveBeenCalledWith("Format foto harus JPG atau PNG.");
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("should reject files larger than 1 MB", () => {
    const errorSpy = silenceErrorDialog();
    renderWithProviders(<ChangeCoverModal show onClose={vi.fn()} post={post} onSuccess={vi.fn()} />);

    chooseFile(new File([new Uint8Array(MAX_FILE_SIZE + 1)], "besar.png", { type: "image/png" }));

    expect(errorSpy).toHaveBeenCalledWith("Ukuran foto maksimal 1 MB. Kompres foto lalu coba lagi.");
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("should preview a valid file and revoke the preview on unmount", () => {
    const { unmount } = renderWithProviders(
      <ChangeCoverModal show onClose={vi.fn()} post={post} onSuccess={vi.fn()} />
    );

    chooseFile(goodFile());

    expect(screen.getByTestId("cover-preview")).toHaveAttribute("src", "blob:preview-1");
    expect(screen.getByAltText("Pratinjau foto baru")).toBeInTheDocument();
    expect(screen.getByText("Pratinjau, belum diunggah")).toBeInTheDocument();
    expect(screen.getByText("File dipilih: foto.png")).toBeInTheDocument();

    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview-1");
  });

  it("should revoke the previous preview when another file is chosen", () => {
    URL.createObjectURL = vi.fn().mockReturnValueOnce("blob:preview-1").mockReturnValueOnce("blob:preview-2");
    renderWithProviders(<ChangeCoverModal show onClose={vi.fn()} post={post} onSuccess={vi.fn()} />);

    chooseFile(goodFile());
    chooseFile(new File(["img2"], "foto2.png", { type: "image/png" }));

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview-1");
    expect(screen.getByTestId("cover-preview")).toHaveAttribute("src", "blob:preview-2");
  });

  it("should ask to choose a photo before uploading", async () => {
    const errorSpy = silenceErrorDialog();
    const coverSpy = vi.spyOn(postAction, "asyncSetIsPostChangeCover");
    renderWithProviders(<ChangeCoverModal show onClose={vi.fn()} post={post} onSuccess={vi.fn()} />);

    await submitForm();

    expect(errorSpy).toHaveBeenCalledWith("Pilih foto terlebih dahulu.");
    expect(coverSpy).not.toHaveBeenCalled();
  });

  it("should upload the chosen file, then notify and close on success", async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    const file = goodFile();
    const coverSpy = vi.spyOn(postAction, "asyncSetIsPostChangeCover").mockReturnValue(async (dispatch) => {
      dispatch(postAction.setIsPostChangedCoverActionCreator(true));
      dispatch(postAction.setIsPostChangeCoverActionCreator(true));
    });

    const { store } = renderWithProviders(
      <ChangeCoverModal show onClose={onClose} post={post} onSuccess={onSuccess} />
    );
    chooseFile(file);
    await submitForm();

    expect(coverSpy).toHaveBeenCalledWith(9, file);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(store.getState().isPostChangeCover).toBe(false);
    expect(store.getState().isPostChangedCover).toBe(false);
  });

  it("should stay open when the upload fails", async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    vi.spyOn(postAction, "asyncSetIsPostChangeCover").mockReturnValue(() => Promise.resolve());

    renderWithProviders(<ChangeCoverModal show onClose={onClose} post={post} onSuccess={onSuccess} />);
    chooseFile(goodFile());
    await submitForm();

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByTestId("submit-cover-modal-btn")).toBeEnabled();
  });

  it("should disable the buttons and show progress while uploading", async () => {
    vi.spyOn(postAction, "asyncSetIsPostChangeCover").mockReturnValue(() => new Promise(() => {}));
    renderWithProviders(<ChangeCoverModal show onClose={vi.fn()} post={post} onSuccess={vi.fn()} />);

    chooseFile(goodFile());
    await submitForm();

    expect(screen.getByTestId("submit-cover-modal-btn")).toBeDisabled();
    expect(screen.getByTestId("cancel-cover-modal-btn")).toBeDisabled();
    expect(screen.getByText("Mengunggah...")).toBeInTheDocument();
  });
});