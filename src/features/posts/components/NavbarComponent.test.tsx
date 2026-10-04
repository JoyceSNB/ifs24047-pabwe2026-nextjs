import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NavbarComponent from "./NavbarComponent";
import { navigation } from "@/test-utils";

const profile = {
  id: 1,
  name: "Abdullah Ubaid",
  email: "ifs18005@del.ac.id",
  photo: "https://example.com/photo.jpg",
};

function setup(props: Partial<React.ComponentProps<typeof NavbarComponent>> = {}) {
  const handlers = { handleLogout: vi.fn(), onToggleSidebar: vi.fn() };
  render(<NavbarComponent profile={profile} isSidebarOpen={false} {...handlers} {...props} />);
  return handlers;
}

describe("NavbarComponent", () => {
  it("should render the brand link and the profile identity", () => {
    setup();

    expect(screen.getByRole("link", { name: /Delcom Posts/ })).toHaveAttribute("href", "/");
    expect(screen.getByText("Abdullah Ubaid")).toBeInTheDocument();
    expect(screen.getByText("ifs18005@del.ac.id")).toBeInTheDocument();
    expect(screen.getByAltText("Abdullah Ubaid")).toHaveAttribute("src", "https://example.com/photo.jpg");
  });

  it("should fall back to a generic name and initial when the profile is incomplete", () => {
    setup({ profile: { id: 2, name: "", email: "x@del.ac.id", photo: null } });

    expect(screen.getByText("Pengguna")).toBeInTheDocument();
    expect(screen.getByText("U")).toBeInTheDocument();
  });

  it("should call the sidebar toggle and reflect the sidebar state in its label", () => {
    const { onToggleSidebar } = setup();

    fireEvent.click(screen.getByTestId("toggle-sidebar-btn"));

    expect(onToggleSidebar).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("Buka menu")).toHaveAttribute("aria-expanded", "false");
  });

  it("should show the close label when the sidebar is open", () => {
    setup({ isSidebarOpen: true });

    expect(screen.getByLabelText("Tutup menu")).toHaveAttribute("aria-expanded", "true");
  });

  it("should open and close the dropdown from its button", () => {
    setup();

    expect(screen.queryByTestId("profile-dropdown-menu")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("profile-dropdown-button"));
    expect(screen.getByTestId("profile-dropdown-menu")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("profile-dropdown-button"));
    expect(screen.queryByTestId("profile-dropdown-menu")).not.toBeInTheDocument();
  });

  it("should close the dropdown when clicking outside but not when clicking inside", () => {
    setup();
    fireEvent.click(screen.getByTestId("profile-dropdown-button"));

    fireEvent.mouseDown(screen.getByTestId("profile-dropdown-menu"));
    expect(screen.getByTestId("profile-dropdown-menu")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByTestId("profile-dropdown-menu")).not.toBeInTheDocument();
  });

  it("should navigate to the profile page from the dropdown", () => {
    setup();
    fireEvent.click(screen.getByTestId("profile-dropdown-button"));

    fireEvent.click(screen.getByTestId("dropdown-profile-link"));

    expect(navigation.router.push).toHaveBeenCalledWith("/profile");
    expect(screen.queryByTestId("profile-dropdown-menu")).not.toBeInTheDocument();
  });

  it("should call the logout handler from the dropdown", () => {
    const { handleLogout } = setup();
    fireEvent.click(screen.getByTestId("profile-dropdown-button"));

    fireEvent.click(screen.getByTestId("dropdown-logout-button"));

    expect(handleLogout).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("profile-dropdown-menu")).not.toBeInTheDocument();
  });
});