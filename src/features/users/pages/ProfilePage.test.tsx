import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import ProfilePage from "./ProfilePage";
import { renderWithProviders } from "@/test-utils";
import * as toolsHelper from "@/helpers/toolsHelper";
import * as userAction from "../states/action";

const mockProfile = {
  id: 1,
  name: "Joyce Stephanie Naibaho",
  email: "ifs24047@del.ac.id",
  photo: "https://example.com/photo.jpg",
};

function silenceErrorDialog() {
  return vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(async () => ({}) as never);
}

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should show a loading indicator with a heading when the profile is null", () => {
    renderWithProviders(<ProfilePage />, { preloadedState: { profile: null } });

    expect(screen.getByText("Memuat data profil...")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Profil Akun" })).toBeInTheDocument();
  });

  it("should display profile information and an initial avatar fallback", () => {
    renderWithProviders(<ProfilePage />, {
      preloadedState: { profile: { id: 2, name: "Budi", email: "budi@del.ac.id", photo: null } },
    });

    expect(screen.getByRole("heading", { level: 2, name: "Budi" })).toBeInTheDocument();
    expect(screen.getByText("budi@del.ac.id")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByTestId("profile-name-input")).toHaveValue("Budi");
    expect(screen.getByTestId("profile-email-input")).toHaveValue("budi@del.ac.id");
  });

  it("should handle a profile with empty name and email", () => {
    renderWithProviders(<ProfilePage />, {
      preloadedState: { profile: { id: 3, name: "", email: "", photo: null } },
    });

    expect(screen.getByText("U")).toBeInTheDocument();
    expect(screen.getByTestId("profile-name-input")).toHaveValue("");
    expect(screen.getByTestId("profile-email-input")).toHaveValue("");
  });

  it("should validate the profile form before submitting", async () => {
    const errorSpy = silenceErrorDialog();
    const putProfileSpy = vi.spyOn(userAction, "asyncPutProfile");

    renderWithProviders(<ProfilePage />, { preloadedState: { profile: mockProfile } });

    const nameInput = screen.getByTestId("profile-name-input");
    const emailInput = screen.getByTestId("profile-email-input");
    const form = nameInput.closest("form") as HTMLFormElement;

    fireEvent.change(nameInput, { target: { value: "   " } });
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(errorSpy).toHaveBeenCalledWith("Nama tidak boleh kosong!");

    fireEvent.change(nameInput, { target: { value: "Abdullah Baru" } });
    fireEvent.change(emailInput, { target: { value: "   " } });
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(errorSpy).toHaveBeenCalledWith("Email tidak boleh kosong!");
    expect(putProfileSpy).not.toHaveBeenCalled();
  });

  it("should submit the profile update with trimmed values", async () => {
    const putProfileSpy = vi.spyOn(userAction, "asyncPutProfile").mockReturnValue(() => Promise.resolve());

    renderWithProviders(<ProfilePage />, { preloadedState: { profile: mockProfile } });

    fireEvent.change(screen.getByTestId("profile-name-input"), { target: { value: " Abdullah Baru " } });
    fireEvent.change(screen.getByTestId("profile-email-input"), { target: { value: "baru@del.ac.id" } });
    await act(async () => {
      fireEvent.submit(screen.getByTestId("profile-name-input").closest("form") as HTMLFormElement);
    });

    expect(putProfileSpy).toHaveBeenCalledWith("Abdullah Baru", "baru@del.ac.id");
    expect(screen.getByTestId("submit-profile-btn")).toBeEnabled();
  });

  it("should show progress while the profile update is running", async () => {
    vi.spyOn(userAction, "asyncPutProfile").mockReturnValue(() => new Promise(() => {}));

    renderWithProviders(<ProfilePage />, { preloadedState: { profile: mockProfile } });
    await act(async () => {
      fireEvent.submit(screen.getByTestId("profile-name-input").closest("form") as HTMLFormElement);
    });

    expect(screen.getByTestId("submit-profile-btn")).toBeDisabled();
    expect(screen.getByText("Menyimpan Perubahan...")).toBeInTheDocument();
  });

  it("should validate and upload a profile photo", async () => {
    const errorSpy = silenceErrorDialog();
    const photoSpy = vi.spyOn(userAction, "asyncPostProfilePhoto").mockReturnValue(() => Promise.resolve());

    renderWithProviders(<ProfilePage />, { preloadedState: { profile: mockProfile } });

    const fileInput = screen.getByTestId("profile-photo-file-input");

    // Tidak ada file dipilih
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [] } });
    });
    expect(photoSpy).not.toHaveBeenCalled();

    // Bukan gambar
    const textFile = new File(["dummy"], "file.txt", { type: "text/plain" });
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [textFile] } });
    });
    expect(errorSpy).toHaveBeenCalledWith("Pilih file gambar yang valid!");

    // Lebih dari 3MB
    const largeFile = new File([new Uint8Array(4 * 1024 * 1024)], "large.png", { type: "image/png" });
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [largeFile] } });
    });
    expect(errorSpy).toHaveBeenCalledWith("Ukuran file foto maksimal 3MB!");
    expect(photoSpy).not.toHaveBeenCalled();

    // Valid
    const validFile = new File(["img"], "profile.png", { type: "image/png" });
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [validFile] } });
    });
    expect(photoSpy).toHaveBeenCalledWith(validFile);
  });

  it("should show progress on the camera button while the photo is uploading", async () => {
    vi.spyOn(userAction, "asyncPostProfilePhoto").mockReturnValue(() => new Promise(() => {}));

    renderWithProviders(<ProfilePage />, { preloadedState: { profile: mockProfile } });
    await act(async () => {
      fireEvent.change(screen.getByTestId("profile-photo-file-input"), {
        target: { files: [new File(["img"], "profile.png", { type: "image/png" })] },
      });
    });

    expect(screen.getByTestId("upload-profile-photo-btn").querySelector("svg")).toHaveClass("animate-spin");
  });

  it("should validate the password form before submitting", async () => {
    const errorSpy = silenceErrorDialog();
    const putPasswordSpy = vi.spyOn(userAction, "asyncPutProfilePassword");

    renderWithProviders(<ProfilePage />, { preloadedState: { profile: mockProfile } });

    const oldInput = screen.getByTestId("current-password-input");
    const newInput = screen.getByTestId("new-password-input");
    const confirmInput = screen.getByTestId("confirm-password-input");
    const form = oldInput.closest("form") as HTMLFormElement;
    const submitForm = () =>
      act(async () => {
        fireEvent.submit(form);
      });

    await submitForm();
    expect(errorSpy).toHaveBeenLastCalledWith("Kata sandi lama wajib diisi!");

    fireEvent.change(oldInput, { target: { value: "old123" } });
    await submitForm();
    expect(errorSpy).toHaveBeenLastCalledWith("Kata sandi baru minimal 6 karakter!");

    fireEvent.change(newInput, { target: { value: "123" } });
    await submitForm();
    expect(errorSpy).toHaveBeenLastCalledWith("Kata sandi baru minimal 6 karakter!");

    fireEvent.change(newInput, { target: { value: "password123" } });
    fireEvent.change(confirmInput, { target: { value: "mismatch123" } });
    await submitForm();
    expect(errorSpy).toHaveBeenLastCalledWith("Konfirmasi kata sandi tidak cocok!");
    expect(putPasswordSpy).not.toHaveBeenCalled();
  });

  it("should submit the password update and clear the fields after it succeeds", async () => {
    const putPasswordSpy = vi.spyOn(userAction, "asyncPutProfilePassword").mockReturnValue(async (dispatch) => {
      dispatch(userAction.setIsChangeProfilePasswordActionCreator(true));
    });

    const { store } = renderWithProviders(<ProfilePage />, { preloadedState: { profile: mockProfile } });

    fireEvent.change(screen.getByTestId("current-password-input"), { target: { value: "old123" } });
    fireEvent.change(screen.getByTestId("new-password-input"), { target: { value: "password123" } });
    fireEvent.change(screen.getByTestId("confirm-password-input"), { target: { value: "password123" } });
    await act(async () => {
      fireEvent.submit(screen.getByTestId("current-password-input").closest("form") as HTMLFormElement);
    });

    expect(putPasswordSpy).toHaveBeenCalledWith("old123", "password123", "password123");
    expect(screen.getByTestId("current-password-input")).toHaveValue("");
    expect(screen.getByTestId("new-password-input")).toHaveValue("");
    expect(screen.getByTestId("confirm-password-input")).toHaveValue("");
    expect(store.getState().isChangeProfilePassword).toBe(false);
  });

  it("should keep the typed passwords when the update fails", async () => {
    vi.spyOn(userAction, "asyncPutProfilePassword").mockReturnValue(() => Promise.resolve());

    renderWithProviders(<ProfilePage />, { preloadedState: { profile: mockProfile } });

    fireEvent.change(screen.getByTestId("current-password-input"), { target: { value: "salah1" } });
    fireEvent.change(screen.getByTestId("new-password-input"), { target: { value: "password123" } });
    fireEvent.change(screen.getByTestId("confirm-password-input"), { target: { value: "password123" } });
    await act(async () => {
      fireEvent.submit(screen.getByTestId("current-password-input").closest("form") as HTMLFormElement);
    });

    expect(screen.getByTestId("current-password-input")).toHaveValue("salah1");
    expect(screen.getByTestId("submit-password-btn")).toBeEnabled();
  });

  it("should show progress while the password update is running", async () => {
    vi.spyOn(userAction, "asyncPutProfilePassword").mockReturnValue(() => new Promise(() => {}));

    renderWithProviders(<ProfilePage />, { preloadedState: { profile: mockProfile } });
    fireEvent.change(screen.getByTestId("current-password-input"), { target: { value: "old123" } });
    fireEvent.change(screen.getByTestId("new-password-input"), { target: { value: "password123" } });
    fireEvent.change(screen.getByTestId("confirm-password-input"), { target: { value: "password123" } });
    await act(async () => {
      fireEvent.submit(screen.getByTestId("current-password-input").closest("form") as HTMLFormElement);
    });

    expect(screen.getByTestId("submit-password-btn")).toBeDisabled();
    expect(screen.getByText("Memperbarui Kata Sandi...")).toBeInTheDocument();
  });

   it("should resolve a relative profile photo path to the Delcom server", () => {
    renderWithProviders(<ProfilePage />, {
      preloadedState: { profile: { ...mockProfile, photo: "default/img/user.png" } },
    });

    expect(screen.getByAltText(mockProfile.name)).toHaveAttribute(
      "src",
      "https://open-api.delcom.org/default/img/user.png"
    );
  });

  it("should expose the photo input to keyboard and screen reader users", () => {
    renderWithProviders(<ProfilePage />, { preloadedState: { profile: mockProfile } });

    expect(screen.getByLabelText("Ubah foto profil")).toBe(screen.getByTestId("profile-photo-file-input"));
  });
});