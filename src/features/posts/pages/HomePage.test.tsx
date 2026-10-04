import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import HomePage from "./HomePage";
import { renderWithProviders } from "@/test-utils";
import * as toolsHelper from "@/helpers/toolsHelper";
import * as postAction from "../states/action";
import type { Post } from "@/types";

const me = { id: 1, name: "Delcom Testing", email: "testing@delcom.org", photo: null };

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 1,
    user_id: 1,
    cover: "https://example.com/c1.png",
    description: "Terus belajar apapun rintangannya!",
    created_at: "2024-10-05T03:07:11.000000Z",
    updated_at: "2024-10-05T03:07:11.000000Z",
    author: { name: "Delcom Testing", photo: null },
    likes: [2, 3],
    comments: [3],
    ...overrides,
  };
}

const posts = [
  makePost(),
  makePost({
    id: 2,
    user_id: 3,
    description: "Tolak ukur kemampuan adalah usaha",
    author: { name: "Abdullah Ubaid", photo: null },
    likes: [],
    comments: [],
  }),
];

// Render di dalam act agar pembaruan state asinkron selesai sebelum pengecekan
async function renderPage(scope: "all" | "me" | undefined, preloadedState: Parameters<typeof renderWithProviders>[1]) {
  let result!: ReturnType<typeof renderWithProviders>;
  await act(async () => {
    result = renderWithProviders(<HomePage scope={scope} />, preloadedState);
  });
  return result;
}

function confirmWith(isConfirmed: boolean) {
  return vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed } as never);
}

describe("HomePage", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    fetchSpy = vi.spyOn(postAction, "asyncSetPosts").mockReturnValue(() => Promise.resolve());
  });

  it("should load all posts and render the timeline with tabs", async () => {
    await renderPage(undefined, { preloadedState: { posts, profile: me } });

    expect(fetchSpy).toHaveBeenCalledWith({});
    expect(screen.getByRole("heading", { level: 1, name: "Linimasa" })).toBeInTheDocument();
    expect(screen.getByTestId("post-card-1")).toBeInTheDocument();
    expect(screen.getByTestId("post-card-2")).toBeInTheDocument();
    expect(screen.getByTestId("tab-all-posts")).toHaveAttribute("aria-current", "page");
    expect(screen.getByTestId("tab-my-posts")).not.toHaveAttribute("aria-current");
    expect(screen.getByTestId("tab-my-posts")).toHaveAttribute("href", "/my-posts");
    expect(screen.queryByTestId("delete-all-posts-btn")).not.toBeInTheDocument();
  });

  it("should prioritise the first cover and only show owner actions on my posts", async () => {
    await renderPage("all", { preloadedState: { posts, profile: me } });

    expect(screen.getAllByRole("img")[0]).toHaveAttribute("loading", "eager");
    expect(screen.getByTestId("edit-post-1")).toBeInTheDocument();
    expect(screen.queryByTestId("edit-post-2")).not.toBeInTheDocument();
  });

  it("should load only my posts on the my-posts scope", async () => {
    await renderPage("me", { preloadedState: { posts, profile: me } });

    expect(fetchSpy).toHaveBeenCalledWith({ is_me: 1 });
    expect(screen.getByRole("heading", { level: 1, name: "Postingan Saya" })).toBeInTheDocument();
    expect(screen.getByTestId("tab-my-posts")).toHaveAttribute("aria-current", "page");
    expect(screen.getByTestId("delete-all-posts-btn")).toBeInTheDocument();
  });

  it("should treat a missing profile as no ownership", async () => {
    await renderPage("all", { preloadedState: { posts, profile: null } });

    expect(screen.queryByTestId("edit-post-1")).not.toBeInTheDocument();
  });

  it("should show a loading state while the posts are being fetched", async () => {
    fetchSpy.mockReturnValue(() => new Promise(() => {}));

    await renderPage("all", { preloadedState: { posts: [], profile: me } });

    expect(screen.getByRole("status")).toHaveTextContent("Memuat postingan...");
  });

  it("should show the empty state for each scope", async () => {
    const { unmount } = await renderPage("all", { preloadedState: { posts: [], profile: me } });
    expect(screen.getByText("Belum ada postingan.")).toBeInTheDocument();
    unmount();

    await renderPage("me", { preloadedState: { posts: [], profile: me } });
    expect(screen.getByText("Kamu belum punya postingan.")).toBeInTheDocument();
    expect(screen.queryByTestId("delete-all-posts-btn")).not.toBeInTheDocument();
  });

  it("should filter posts by description and by author name", async () => {
    await renderPage("all", { preloadedState: { posts, profile: me } });
    const search = screen.getByTestId("search-post-input");

    fireEvent.change(search, { target: { value: "tolak ukur" } });
    expect(screen.queryByTestId("post-card-1")).not.toBeInTheDocument();
    expect(screen.getByTestId("post-card-2")).toBeInTheDocument();

    fireEvent.change(search, { target: { value: "delcom testing" } });
    expect(screen.getByTestId("post-card-1")).toBeInTheDocument();
    expect(screen.queryByTestId("post-card-2")).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: "   " } });
    expect(screen.getByTestId("post-card-2")).toBeInTheDocument();
  });

  it("should show a no-match message when the search finds nothing", async () => {
    await renderPage("all", { preloadedState: { posts, profile: me } });

    fireEvent.change(screen.getByTestId("search-post-input"), { target: { value: "tidak ada" } });

    expect(screen.getByText("Tidak ada postingan yang cocok.")).toBeInTheDocument();
  });

  it("should search posts whose author is missing", async () => {
    const noAuthor = makePost({ id: 5, author: undefined as unknown as Post["author"] });
    await renderPage("all", { preloadedState: { posts: [noAuthor], profile: me } });

    fireEvent.change(screen.getByTestId("search-post-input"), { target: { value: "zzz" } });

    expect(screen.getByTestId("empty-posts")).toBeInTheDocument();
  });

  it("should open the add modal and reload the list after a post is published", async () => {
    vi.spyOn(postAction, "asyncSetIsPostAdd").mockReturnValue(async (dispatch) => {
      dispatch(postAction.setIsPostAddedActionCreator(true));
      dispatch(postAction.setIsPostAddActionCreator(true));
    });
    await renderPage("all", { preloadedState: { posts, profile: me } });
    fetchSpy.mockClear();

    fireEvent.click(screen.getByTestId("open-add-modal-btn"));
    expect(screen.getByTestId("add-post-modal")).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("add-description-input"), { target: { value: "Postingan baru" } });
    await act(async () => {
      fireEvent.submit(screen.getByTestId("add-description-input").closest("form") as HTMLFormElement);
    });

    expect(fetchSpy).toHaveBeenCalledWith({});
    expect(screen.queryByTestId("add-post-modal")).not.toBeInTheDocument();
  });

  it("should close the add modal without reloading when cancelled", async () => {
    await renderPage("all", { preloadedState: { posts, profile: me } });
    fetchSpy.mockClear();

    fireEvent.click(screen.getByTestId("open-add-modal-btn"));
    fireEvent.click(screen.getByTestId("cancel-add-modal-btn"));

    expect(screen.queryByTestId("add-post-modal")).not.toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("should edit a post from its card and reload my posts afterwards", async () => {
    vi.spyOn(postAction, "asyncSetIsPostChange").mockReturnValue(async (dispatch) => {
      dispatch(postAction.setIsPostChangedActionCreator(true));
      dispatch(postAction.setIsPostChangeActionCreator(true));
    });
    await renderPage("me", { preloadedState: { posts, profile: me } });
    fetchSpy.mockClear();

    fireEvent.click(screen.getByTestId("edit-post-1"));
    expect(screen.getByTestId("edit-description-input")).toHaveValue("Terus belajar apapun rintangannya!");

    await act(async () => {
      fireEvent.submit(screen.getByTestId("edit-description-input").closest("form") as HTMLFormElement);
    });

    expect(fetchSpy).toHaveBeenCalledWith({ is_me: 1 });
    expect(screen.queryByTestId("edit-post-modal")).not.toBeInTheDocument();
  });

  it("should close the edit modal from its close button", async () => {
    await renderPage("all", { preloadedState: { posts, profile: me } });

    fireEvent.click(screen.getByTestId("edit-post-1"));
    fireEvent.click(screen.getByTestId("close-edit-modal-btn"));

    expect(screen.queryByTestId("edit-post-modal")).not.toBeInTheDocument();
  });

  it("should not delete a post when the confirmation is cancelled", async () => {
    confirmWith(false);
    const deleteSpy = vi.spyOn(postAction, "asyncSetIsPostDelete");
    await renderPage("all", { preloadedState: { posts, profile: me } });

    await act(async () => {
      fireEvent.click(screen.getByTestId("delete-post-1"));
    });

    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("should delete a post after confirmation and reload the list", async () => {
    confirmWith(true);
    const deleteSpy = vi.spyOn(postAction, "asyncSetIsPostDelete").mockReturnValue(async (dispatch) => {
      dispatch(postAction.setIsPostDeletedActionCreator(true));
      dispatch(postAction.setIsPostDeleteActionCreator(true));
    });
    const { store } = await renderPage("all", { preloadedState: { posts, profile: me } });
    fetchSpy.mockClear();

    await act(async () => {
      fireEvent.click(screen.getByTestId("delete-post-1"));
    });

    expect(deleteSpy).toHaveBeenCalledWith(1);
    expect(fetchSpy).toHaveBeenCalledWith({});
    expect(store.getState().isPostDelete).toBe(false);
    expect(store.getState().isPostDeleted).toBe(false);
  });

  it("should not reload the list when deleting a post fails", async () => {
    confirmWith(true);
    vi.spyOn(postAction, "asyncSetIsPostDelete").mockReturnValue(() => Promise.resolve());
    await renderPage("all", { preloadedState: { posts, profile: me } });
    fetchSpy.mockClear();

    await act(async () => {
      fireEvent.click(screen.getByTestId("delete-post-1"));
    });

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("should not delete everything when the confirmation is cancelled", async () => {
    confirmWith(false);
    const deleteAllSpy = vi.spyOn(postAction, "asyncSetIsPostDeleteAll");
    await renderPage("me", { preloadedState: { posts, profile: me } });

    await act(async () => {
      fireEvent.click(screen.getByTestId("delete-all-posts-btn"));
    });

    expect(deleteAllSpy).not.toHaveBeenCalled();
  });

  it("should delete all of my posts after confirmation and reload the list", async () => {
    confirmWith(true);
    const deleteAllSpy = vi.spyOn(postAction, "asyncSetIsPostDeleteAll").mockReturnValue(async (dispatch) => {
      dispatch(postAction.setIsPostDeletedAllActionCreator(true));
      dispatch(postAction.setIsPostDeleteAllActionCreator(true));
    });
    const { store } = await renderPage("me", { preloadedState: { posts, profile: me } });
    fetchSpy.mockClear();

    await act(async () => {
      fireEvent.click(screen.getByTestId("delete-all-posts-btn"));
    });

    expect(deleteAllSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith({ is_me: 1 });
    expect(store.getState().isPostDeleteAll).toBe(false);
    expect(store.getState().isPostDeletedAll).toBe(false);
  });

  it("should not reload when deleting all posts fails", async () => {
    confirmWith(true);
    vi.spyOn(postAction, "asyncSetIsPostDeleteAll").mockReturnValue(() => Promise.resolve());
    await renderPage("me", { preloadedState: { posts, profile: me } });
    fetchSpy.mockClear();

    await act(async () => {
      fireEvent.click(screen.getByTestId("delete-all-posts-btn"));
    });

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("should not update the loading state after unmount", async () => {
    let resolveLoad: () => void = () => {};
    const pending = new Promise<void>((resolve) => {
      resolveLoad = resolve;
    });
    fetchSpy.mockReturnValue(() => pending);

    const { unmount } = renderWithProviders(<HomePage />, { preloadedState: { posts: [], profile: me } });
    unmount();
    resolveLoad();
    await pending;
    // Tidak ada error berarti penjaga isMounted mencegah setState setelah unmount
  });
});