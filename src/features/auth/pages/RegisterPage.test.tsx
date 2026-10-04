import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import RegisterPage from "./RegisterPage";
import { renderWithProviders, navigation } from "@/test-utils";
import * as authAction from "../states/action";

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render a heading and the form fields", () => {
    renderWithProviders(<RegisterPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Buat akun baru" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nama Lengkap")).toBeInTheDocument();
    expect(screen.getByLabelText("Alamat Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Kata Sandi")).toBeInTheDocument();
  });

  it("should dispatch registration with the entered values", async () => {
    const registerSpy = vi
      .spyOn(authAction, "asyncSetIsAuthRegister")
      .mockReturnValue(() => Promise.resolve());

    renderWithProviders(<RegisterPage />);

    fireEvent.change(screen.getByTestId("register-name-input"), { target: { value: "Delcom User" } });
    fireEvent.change(screen.getByTestId("register-email-input"), { target: { value: "user@delcom.org" } });
    fireEvent.change(screen.getByTestId("register-password-input"), { target: { value: "password123" } });
    await act(async () => {
      fireEvent.click(screen.getByTestId("register-submit-button"));
    });

    expect(registerSpy).toHaveBeenCalledWith("Delcom User", "user@delcom.org", "password123");
    expect(screen.getByTestId("register-submit-button")).toBeEnabled();
  });

  it("should go to the login page after a successful registration", () => {
    const { store } = renderWithProviders(<RegisterPage />, {
      preloadedState: { isAuthRegister: true },
    });

    expect(navigation.router.push).toHaveBeenCalledWith("/auth/login");
    expect(store.getState().isAuthRegister).toBe(false);
  });

  it("should not navigate while the registration has not succeeded", () => {
    renderWithProviders(<RegisterPage />, { preloadedState: { isAuthRegister: false } });

    expect(navigation.router.push).not.toHaveBeenCalled();
  });

  it("should stop loading when the submit throws", async () => {
    vi.spyOn(authAction, "asyncSetIsAuthRegister").mockReturnValue(() =>
      Promise.reject(new Error("gagal"))
    );
    const form = renderWithProviders(<RegisterPage />);

    fireEvent.change(screen.getByTestId("register-name-input"), { target: { value: "A" } });
    fireEvent.change(screen.getByTestId("register-email-input"), { target: { value: "a@del.org" } });
    fireEvent.change(screen.getByTestId("register-password-input"), { target: { value: "123456" } });

    await act(async () => {
      fireEvent.submit(form.container.querySelector("form") as HTMLFormElement);
    });

    expect(screen.getByTestId("register-submit-button")).toBeEnabled();
  });
});