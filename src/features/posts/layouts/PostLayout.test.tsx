import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import PostLayout from "./PostLayout";
import { renderWithProviders, navigation } from "@/test-utils";
import apiHelper from "@/helpers/apiHelper";
import * as userAction from "@/features/users/states/action";
import * as authAction from "@/features/auth/states/action";

const profile = {
  id: 1,
  name: "Abdullah Ubaid",
  email: "ifs18005@del.ac.id",
  photo: null,
};

describe("PostLayout", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should redirect to the login page when there is no token", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);
    const profileSpy = vi.spyOn(userAction, "asyncSetProfile");

    renderWithProviders(<PostLayout>isi</PostLayout>);

    expect(navigation.router.replace).toHaveBeenCalledWith("/auth/login");
    expect(profileSpy).not.toHaveBeenCalled();
  });

  it("should load the profile when a token exists and show a loading state meanwhile", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    const profileSpy = vi.spyOn(userAction, "asyncSetProfile").mockReturnValue(() => Promise.resolve());

    renderWithProviders(<PostLayout>isi</PostLayout>);

    expect(profileSpy).toHaveBeenCalledTimes(1);
    expect(navigation.router.replace).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("Memeriksa sesi masuk...");
    expect(screen.getByRole("heading", { level: 1, name: "Delcom Posts" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("should render the navbar, sidebar and children when the profile is available", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    vi.spyOn(userAction, "asyncSetProfile").mockReturnValue(() => Promise.resolve());

    renderWithProviders(
      <PostLayout>
        <p>Isi halaman</p>
      </PostLayout>,
      { preloadedState: { profile } }
    );

    expect(screen.getByText("Isi halaman")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("profile-dropdown-button")).toBeInTheDocument();
    expect(screen.getAllByRole("main")).toHaveLength(1);
  });

  it("should clear the token and go to login when the profile could not be loaded", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("expired-token");
    vi.spyOn(userAction, "asyncSetProfile").mockReturnValue(() => Promise.resolve());
    const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});

    const { store } = renderWithProviders(<PostLayout>isi</PostLayout>, {
      preloadedState: { profile: null, isProfile: true },
    });

    expect(putTokenSpy).toHaveBeenCalledWith("");
    expect(navigation.router.replace).toHaveBeenCalledWith("/auth/login");
    expect(store.getState().isProfile).toBe(false);
  });

  it("should stay on the page when the profile check finished with a profile", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    vi.spyOn(userAction, "asyncSetProfile").mockReturnValue(() => Promise.resolve());
    const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken");

    const { store } = renderWithProviders(<PostLayout>isi</PostLayout>, {
      preloadedState: { profile, isProfile: true },
    });

    expect(putTokenSpy).not.toHaveBeenCalled();
    expect(navigation.router.replace).not.toHaveBeenCalled();
    expect(store.getState().isProfile).toBe(false);
  });

  it("should go to the login page after logout", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    vi.spyOn(userAction, "asyncSetProfile").mockReturnValue(() => Promise.resolve());

    const { store } = renderWithProviders(<PostLayout>isi</PostLayout>, {
      preloadedState: { profile, isAuthLogout: true },
    });

    expect(navigation.router.replace).toHaveBeenCalledWith("/auth/login");
    expect(store.getState().isAuthLogout).toBe(false);
  });

  it("should dispatch the logout action from the navbar dropdown", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    vi.spyOn(userAction, "asyncSetProfile").mockReturnValue(() => Promise.resolve());
    const logoutSpy = vi.spyOn(authAction, "asyncSetIsAuthLogout").mockReturnValue(() => Promise.resolve());

    renderWithProviders(<PostLayout>isi</PostLayout>, { preloadedState: { profile } });
    fireEvent.click(screen.getByTestId("profile-dropdown-button"));
    fireEvent.click(screen.getByTestId("dropdown-logout-button"));

    expect(logoutSpy).toHaveBeenCalledTimes(1);
  });

  it("should open and close the mobile sidebar", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    vi.spyOn(userAction, "asyncSetProfile").mockReturnValue(() => Promise.resolve());

    renderWithProviders(<PostLayout>isi</PostLayout>, { preloadedState: { profile } });

    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("toggle-sidebar-btn"));
    expect(screen.getByTestId("sidebar-backdrop")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("sidebar-backdrop"));
    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
  });
});