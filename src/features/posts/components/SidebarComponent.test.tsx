import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SidebarComponent, { NAV_ITEMS } from "./SidebarComponent";
import { navigation } from "@/test-utils";

describe("SidebarComponent", () => {
  it("should render every navigation link with the right destination", () => {
    render(<SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />);

    expect(screen.getByRole("navigation", { name: "Menu utama" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Semua Postingan" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Postingan Saya" })).toHaveAttribute("href", "/my-posts");
    expect(screen.getByRole("link", { name: "Daftar Pengguna" })).toHaveAttribute("href", "/users");
    expect(screen.getByRole("link", { name: "Profil Saya" })).toHaveAttribute("href", "/profile");
  });

  it.each([
    ["/", "Semua Postingan"],
    ["/posts/12", "Semua Postingan"],
    ["/my-posts", "Postingan Saya"],
    ["/users", "Daftar Pengguna"],
    ["/profile", "Profil Saya"],
  ])("should mark only the matching link as current on %s", (pathname, label) => {
    navigation.state.pathname = pathname;

    render(<SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />);

    const current = screen.getAllByRole("link").filter((link) => link.hasAttribute("aria-current"));
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent(label);
  });

  it("should not mark any link as current on an unrelated path", () => {
    navigation.state.pathname = "/something-else";

    render(<SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />);

    expect(screen.getAllByRole("link").some((link) => link.hasAttribute("aria-current"))).toBe(false);
  });

  it("should slide the drawer in and show the backdrop when open", () => {
    render(<SidebarComponent isSidebarOpen onCloseMobile={vi.fn()} />);

    expect(screen.getByTestId("sidebar")).toHaveClass("translate-x-0");
    expect(screen.getByTestId("sidebar-backdrop")).toBeInTheDocument();
  });

  it("should keep the drawer hidden and without backdrop when closed", () => {
    render(<SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />);

    expect(screen.getByTestId("sidebar")).toHaveClass("-translate-x-full");
    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
  });

  it("should close the drawer when the backdrop or a link is clicked", () => {
    const onCloseMobile = vi.fn();
    render(<SidebarComponent isSidebarOpen onCloseMobile={onCloseMobile} />);

    fireEvent.click(screen.getByTestId("sidebar-backdrop"));
    fireEvent.click(screen.getByRole("link", { name: "Profil Saya" }));

    expect(onCloseMobile).toHaveBeenCalledTimes(2);
  });

  it("should export the same items that are rendered", () => {
    expect(NAV_ITEMS.map((item) => item.href)).toEqual(["/", "/my-posts", "/users", "/profile"]);
  });
});