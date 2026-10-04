import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import LoginPage from "./LoginPage";
import { renderWithProviders } from "@/test-utils";
import * as authAction from "../states/action";
import * as userAction from "@/features/users/states/action";
import apiHelper from "@/helpers/apiHelper";

function fillForm(email: string, password: string) {
  fireEvent.change(screen.getByTestId("login-email-input"), { target: { value: email } });
  fireEvent.change(screen.getByTestId("login-password-input"), { target: { value: password } });
}

function submit() {
  return act(async () => {
    fireEvent.click(screen.getByTestId("login-submit-button"));
  });
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render a heading and the form fields", () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Selamat datang kembali" })).toBeInTheDocument();
    expect(screen.getByLabelText("Alamat Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Kata Sandi")).toBeInTheDocument();
  });

  it("should submit the credentials and skip the profile when no token was stored", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);
    const loginSpy = vi.spyOn(authAction, "asyncSetIsAuthLogin").mockReturnValue(() => Promise.resolve());
    const profileSpy = vi.spyOn(userAction, "asyncSetProfile");

    renderWithProviders(<LoginPage />);
    fillForm("testing@delcom.org", "123456");
    await submit();

    expect(loginSpy).toHaveBeenCalledWith("testing@delcom.org", "123456");
    expect(profileSpy).not.toHaveBeenCalled();
    expect(screen.getByTestId("login-submit-button")).toBeEnabled();
  });

  it("should load the profile after a successful login", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    vi.spyOn(authAction, "asyncSetIsAuthLogin").mockReturnValue(() => Promise.resolve());
    const profileSpy = vi.spyOn(userAction, "asyncSetProfile").mockReturnValue(() => Promise.resolve());

    renderWithProviders(<LoginPage />);
    fillForm("token@delcom.org", "123456");
    await submit();

    expect(profileSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("login-submit-button")).toBeEnabled();
  });

  it("should disable the button and show progress while the login is running", async () => {
    vi.spyOn(authAction, "asyncSetIsAuthLogin").mockReturnValue(() => new Promise(() => {}));

    renderWithProviders(<LoginPage />);
    fillForm("slow@delcom.org", "123456");
    await submit();

    expect(screen.getByTestId("login-submit-button")).toBeDisabled();
    expect(screen.getByText("Sedang Masuk...")).toBeInTheDocument();
  });

  it("should stop loading when the login throws", async () => {
    vi.spyOn(authAction, "asyncSetIsAuthLogin").mockReturnValue(() =>
      Promise.reject(new Error("Login failed"))
    );

    renderWithProviders(<LoginPage />);
    fillForm("error@delcom.org", "123456");
    await submit();

    expect(screen.getByTestId("login-submit-button")).toBeEnabled();
  });

  it("should reset the login flag in the store after submitting", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);
    vi.spyOn(authAction, "asyncSetIsAuthLogin").mockReturnValue(async (dispatch) => {
      dispatch(authAction.setIsAuthLoginActionCreator(true));
    });

    const { store } = renderWithProviders(<LoginPage />);
    fillForm("a@delcom.org", "123456");
    await submit();

    expect(store.getState().isAuthLogin).toBe(false);
  });
});