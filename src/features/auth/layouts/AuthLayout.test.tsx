import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import AuthLayout from "./AuthLayout";
import { renderWithProviders, navigation } from "@/test-utils";
import apiHelper from "@/helpers/apiHelper";
import * as userAction from "@/features/users/states/action";

const profile = { id: 1, name: "Logged In User", email: "user@del.ac.id", photo: null };

describe("AuthLayout", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render branding, tabs and the page content", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);
    const profileSpy = vi.spyOn(userAction, "asyncSetProfile");
    navigation.state.pathname = "/auth/login";

    renderWithProviders(
      <AuthLayout>
        <p>Isi halaman</p>
      </AuthLayout>
    );

    expect(screen.getByText("Isi halaman")).toBeInTheDocument();
    expect(screen.getByTestId("auth-banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Masuk Akun" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Daftar Baru" })).not.toHaveAttribute("aria-current");
    expect(profileSpy).not.toHaveBeenCalled();
  });

  it("should mark the register tab as active on the register route", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);
    navigation.state.pathname = "/auth/register";

    renderWithProviders(<AuthLayout>isi</AuthLayout>);

    expect(screen.getByRole("link", { name: "Daftar Baru" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Masuk Akun" })).not.toHaveAttribute("aria-current");
  });

  it("should check the session when a token is stored", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    const profileSpy = vi.spyOn(userAction, "asyncSetProfile").mockReturnValue(() => Promise.resolve());

    renderWithProviders(<AuthLayout>isi</AuthLayout>);

    expect(profileSpy).toHaveBeenCalledTimes(1);
  });

  it("should redirect to the dashboard if the user is already logged in", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);

    const { store } = renderWithProviders(<AuthLayout>isi</AuthLayout>, {
      preloadedState: { profile, isProfile: true },
    });

    expect(navigation.router.replace).toHaveBeenCalledWith("/");
    expect(store.getState().isProfile).toBe(false);
  });

  it("should stay on the auth page if the profile check finished without a profile", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);

    const { store } = renderWithProviders(<AuthLayout>isi</AuthLayout>, {
      preloadedState: { profile: null, isProfile: true },
    });

    expect(navigation.router.replace).not.toHaveBeenCalled();
    expect(store.getState().isProfile).toBe(false);
    expect(screen.getByText("Masuk Akun")).toBeInTheDocument();
  });
});