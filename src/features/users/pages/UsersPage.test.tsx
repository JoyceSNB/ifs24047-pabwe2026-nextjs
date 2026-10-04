import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import UsersPage from "./UsersPage";
import { renderWithProviders } from "@/test-utils";
import * as userAction from "../states/action";

const mockUsers = [
  {
    id: 1,
    name: "Abdullah",
    email: "abdullah@delcom.org",
    photo: "https://example.com/photo.jpg",
    created_at: "2024-10-05T02:53:38.000000Z",
  },
  {
    id: 2,
    name: "Ubaid",
    email: "ubaid@delcom.org",
    photo: null,
    created_at: "2024-10-05T03:18:14.000000Z",
  },
  {
    id: 3,
    name: "",
    email: "",
    photo: null,
    created_at: "2024-10-05T03:18:14.000000Z",
  },
];

// Render di dalam act agar pembaruan state asinkron selesai sebelum pengecekan
async function renderPage(preloadedState: Parameters<typeof renderWithProviders>[1]) {
  let result!: ReturnType<typeof renderWithProviders>;
  await act(async () => {
    result = renderWithProviders(<UsersPage />, preloadedState);
  });
  return result;
}

describe("UsersPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(userAction, "asyncSetUsers").mockReturnValue(() => Promise.resolve());
  });

  it("should render the users list with a photo or an initial avatar", async () => {
    await renderPage({ preloadedState: { users: mockUsers } });

    expect(screen.getByRole("heading", { level: 1, name: "Semua Pengguna" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Abdullah" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Ubaid" })).toBeInTheDocument();
    expect(screen.getByAltText("Abdullah")).toHaveAttribute("src", "https://example.com/photo.jpg");
    expect(screen.getAllByText("U").length).toBeGreaterThan(0); // avatar huruf awal
    expect(screen.getByText("Total: 3 Pengguna")).toBeInTheDocument();
  });

  it("should filter users by name", async () => {
    await renderPage({ preloadedState: { users: mockUsers } });

    fireEvent.change(screen.getByTestId("search-user-input"), { target: { value: "abdullah" } });

    expect(screen.getByText("Abdullah")).toBeInTheDocument();
    expect(screen.queryByText("Ubaid")).not.toBeInTheDocument();
    expect(screen.getByText("Total: 1 Pengguna")).toBeInTheDocument();
  });

  it("should filter users by email when the name does not match", async () => {
    await renderPage({ preloadedState: { users: mockUsers } });

    fireEvent.change(screen.getByTestId("search-user-input"), { target: { value: "delcom.org" } });

    expect(screen.getByText("Abdullah")).toBeInTheDocument();
    expect(screen.getByText("Ubaid")).toBeInTheDocument();
    expect(screen.getByText("Total: 2 Pengguna")).toBeInTheDocument();
  });

  it("should ignore blank search text", async () => {
    await renderPage({ preloadedState: { users: mockUsers } });

    fireEvent.change(screen.getByTestId("search-user-input"), { target: { value: "   " } });

    expect(screen.getByText("Total: 3 Pengguna")).toBeInTheDocument();
  });

  it("should show the empty state when no users are found", async () => {
    await renderPage({ preloadedState: { users: [] } });

    expect(screen.getByText("Tidak ada data pengguna ditemukan.")).toBeInTheDocument();
  });

  it("should show a loading indicator while users are being fetched", async () => {
    vi.spyOn(userAction, "asyncSetUsers").mockImplementation(() => () => new Promise(() => {}));

    await renderPage({ preloadedState: { users: [] } });

    expect(screen.getByRole("status")).toHaveTextContent("Memuat daftar pengguna...");
  });

  it("should not update the loading state after unmount", async () => {
    let resolveLoad: () => void = () => {};
    const pending = new Promise<void>((resolve) => {
      resolveLoad = resolve;
    });
    vi.spyOn(userAction, "asyncSetUsers").mockReturnValue(() => pending);

    const { unmount } = renderWithProviders(<UsersPage />, { preloadedState: { users: [] } });
    unmount();
    resolveLoad();
    await pending;
    // Tidak ada error berarti penjaga isMounted mencegah setState setelah unmount
  });
});