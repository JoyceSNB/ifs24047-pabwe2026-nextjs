import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import DetailPage from "./DetailPage";
import { renderWithProviders, navigation } from "@/test-utils";
import * as toolsHelper from "@/helpers/toolsHelper";
import * as postAction from "../states/action";
import type { Post } from "@/types";

const me = { id: 1, name: "Delcom Testing", email: "testing@delcom.org", photo: null };

const myComment = {
  id: 2,
  comment: "Wah keren yah!",
  created_at: "2024-10-05T03:49:59.000000Z",
  updated_at: "2024-10-05T03:49:59.000000Z",
};
const otherComment = { ...myComment, id: 3, comment: "Mantap" };

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 5,
    user_id: 1,
    cover: "https://example.com/cover.png",
    description: "Tolak ukur kemampuan adalah usaha...",
    created_at: "2024-10-05T03:07:45.000000Z",
    updated_at: "2024-10-05T03:07:45.000000Z",
    author: { name: "Delcom Testing", photo: null },
    likes: [2, 3],
    comments: [myComment, otherComment],
    my_comment: myComment,
    ...overrides,
  };
}

// Render di dalam act agar pembaruan state asinkron selesai sebelum pengecekan
async function renderPage(preloadedState: Parameters<typeof renderWithProviders>[1]) {
  let result!: ReturnType<typeof renderWithProviders>;
  await act(async () => {
    result = renderWithProviders(<DetailPage />, preloadedState);
  });
  return result;
}

function confirmWith(isConfirmed: boolean) {
  return vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed } as never);
}

function silenceErrorDialog() {
  return vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(async () => ({}) as never);
}

describe("DetailPage", () => {
  let loadSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    navigation.state.params = { postId: "5" };
    loadSpy = vi.spyOn(postAction, "asyncSetPost").mockReturnValue(() => Promise.resolve());
  });

  it("should show a loading state with a heading while the data is not ready", async () => {
    await renderPage({ preloadedState: { post: null, profile: me } });

    expect(screen.getByTestId("detail-loading")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Detail postingan" })).toBeInTheDocument();
    expect(loadSpy).toHaveBeenCalledWith("5");
  });

  it("should keep loading when the profile is missing", async () => {
    await renderPage({ preloadedState: { post: makePost(), profile: null } });

    expect(screen.getByTestId("detail-loading")).toBeInTheDocument();
  });

  it("should keep loading when the store still holds another post", async () => {
    await renderPage({ preloadedState: { post: makePost({ id: 99 }), profile: me } });

    expect(screen.getByTestId("detail-loading")).toBeInTheDocument();
  });

  it("should go back to the timeline when the post does not exist", async () => {
    const { store } = await renderPage({ preloadedState: { post: null, profile: me, isPost: true } });

    expect(navigation.router.replace).toHaveBeenCalledWith("/");
    expect(store.getState().isPost).toBe(false);
  });

  it("should stay on the page when the post was found", async () => {
    const { store } = await renderPage({ preloadedState: { post: makePost(), profile: me, isPost: true } });

    expect(navigation.router.replace).not.toHaveBeenCalled();
    expect(store.getState().isPost).toBe(false);
  });

  it("should render the post details, counts and the back link", async () => {
    await renderPage({ preloadedState: { post: makePost(), profile: me } });

    expect(screen.getByRole("heading", { level: 1, name: "Postingan oleh Delcom Testing" })).toBeInTheDocument();
    expect(screen.getByText("Tolak ukur kemampuan adalah usaha...")).toBeInTheDocument();
    expect(screen.getByText(/\(kamu\)/)).toBeInTheDocument();
    expect(screen.getByTestId("detail-cover")).toHaveAttribute("src", "https://example.com/cover.png");
    expect(screen.getByTestId("likes-count")).toHaveTextContent("2 suka");
    expect(screen.getByTestId("comments-count")).toHaveTextContent("2 komentar");
    expect(screen.getByTestId("back-link")).toHaveAttribute("href", "/");
  });

  it("should show a placeholder when there is no cover", async () => {
    await renderPage({ preloadedState: { post: makePost({ cover: null }), profile: me } });

    expect(screen.getByTestId("detail-no-cover")).toBeInTheDocument();
    expect(screen.queryByTestId("detail-cover")).not.toBeInTheDocument();
  });

  it("should show another user's post without owner actions", async () => {
    await renderPage({
      preloadedState: {
        post: makePost({ user_id: 9, author: { name: "Abdullah Ubaid", photo: null } }),
        profile: me,
      },
    });

    expect(screen.getByTestId("not-owner-note")).toBeInTheDocument();
    expect(screen.queryByTestId("delete-post-btn")).not.toBeInTheDocument();
    expect(screen.queryByText(/\(kamu\)/)).not.toBeInTheDocument();
  });

  it("should fall back to a generic author name", async () => {
    await renderPage({
      preloadedState: {
        post: makePost({ author: undefined as unknown as Post["author"] }),
        profile: me,
      },
    });

    expect(screen.getByRole("heading", { level: 1, name: "Postingan oleh Pengguna" })).toBeInTheDocument();
  });

  it("should list only full comments and mark my own comment", async () => {
    await renderPage({
      preloadedState: { post: makePost({ comments: [7, myComment, otherComment] }), profile: me },
    });

    expect(screen.getByRole("heading", { level: 2, name: "Komentar (2)" })).toBeInTheDocument();
    expect(screen.getByTestId("comment-2")).toHaveTextContent("Kamu");
    expect(screen.getByTestId("comment-3")).toHaveTextContent("Pengguna");
    expect(screen.getAllByTestId("delete-comment-btn")).toHaveLength(1);
  });

  it("should show an empty message when there are no comments", async () => {
    await renderPage({
      preloadedState: { post: makePost({ comments: [], my_comment: null }), profile: me },
    });

    expect(screen.getByTestId("no-comments")).toBeInTheDocument();
  });

  it("should like a post that is not liked yet and reload the detail", async () => {
    const likeSpy = vi.spyOn(postAction, "asyncSetIsPostLike").mockReturnValue(async (dispatch) => {
      dispatch(postAction.setIsPostLikedActionCreator(true));
      dispatch(postAction.setIsPostLikeActionCreator(true));
    });
    const { store } = await renderPage({ preloadedState: { post: makePost(), profile: me } });
    loadSpy.mockClear();

    expect(screen.getByTestId("like-btn")).toHaveAttribute("aria-pressed", "false");
    await act(async () => {
      fireEvent.click(screen.getByTestId("like-btn"));
    });

    expect(likeSpy).toHaveBeenCalledWith(5, 1);
    expect(loadSpy).toHaveBeenCalledWith("5");
    expect(store.getState().isPostLike).toBe(false);
    expect(store.getState().isPostLiked).toBe(false);
  });

  it("should unlike a post that is already liked", async () => {
    const likeSpy = vi.spyOn(postAction, "asyncSetIsPostLike").mockReturnValue(() => Promise.resolve());
    await renderPage({ preloadedState: { post: makePost({ likes: [1, 2] }), profile: me } });

    expect(screen.getByTestId("like-btn")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Disukai")).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByTestId("like-btn"));
    });

    expect(likeSpy).toHaveBeenCalledWith(5, 0);
  });

  it("should not reload the detail when the like request fails", async () => {
    vi.spyOn(postAction, "asyncSetIsPostLike").mockReturnValue(() => Promise.resolve());
    await renderPage({ preloadedState: { post: makePost(), profile: me } });
    loadSpy.mockClear();

    await act(async () => {
      fireEvent.click(screen.getByTestId("like-btn"));
    });

    expect(loadSpy).not.toHaveBeenCalled();
    expect(screen.getByTestId("like-btn")).toBeEnabled();
  });

  it("should disable the like button while the request is running", async () => {
    vi.spyOn(postAction, "asyncSetIsPostLike").mockReturnValue(() => new Promise(() => {}));
    await renderPage({ preloadedState: { post: makePost(), profile: me } });

    await act(async () => {
      fireEvent.click(screen.getByTestId("like-btn"));
    });

    expect(screen.getByTestId("like-btn")).toBeDisabled();
  });

  it("should reject a blank comment", async () => {
    const errorSpy = silenceErrorDialog();
    const commentSpy = vi.spyOn(postAction, "asyncSetIsPostAddComment");
    await renderPage({ preloadedState: { post: makePost(), profile: me } });

    fireEvent.change(screen.getByTestId("comment-input"), { target: { value: "   " } });
    await act(async () => {
      fireEvent.submit(screen.getByTestId("comment-input").closest("form") as HTMLFormElement);
    });

    expect(errorSpy).toHaveBeenCalledWith("Komentar tidak boleh kosong.");
    expect(commentSpy).not.toHaveBeenCalled();
  });

  it("should send a trimmed comment, clear the field and reload the detail", async () => {
    const commentSpy = vi.spyOn(postAction, "asyncSetIsPostAddComment").mockReturnValue(async (dispatch) => {
      dispatch(postAction.setIsPostAddedCommentActionCreator(true));
      dispatch(postAction.setIsPostAddCommentActionCreator(true));
    });
    const { store } = await renderPage({ preloadedState: { post: makePost(), profile: me } });
    loadSpy.mockClear();

    fireEvent.change(screen.getByTestId("comment-input"), { target: { value: "  Keren banget  " } });
    await act(async () => {
      fireEvent.submit(screen.getByTestId("comment-input").closest("form") as HTMLFormElement);
    });

    expect(commentSpy).toHaveBeenCalledWith(5, "Keren banget");
    expect(screen.getByTestId("comment-input")).toHaveValue("");
    expect(loadSpy).toHaveBeenCalledWith("5");
    expect(store.getState().isPostAddComment).toBe(false);
    expect(store.getState().isPostAddedComment).toBe(false);
  });

  it("should keep the comment text when sending fails", async () => {
    vi.spyOn(postAction, "asyncSetIsPostAddComment").mockReturnValue(() => Promise.resolve());
    await renderPage({ preloadedState: { post: makePost(), profile: me } });
    loadSpy.mockClear();

    fireEvent.change(screen.getByTestId("comment-input"), { target: { value: "Halo" } });
    await act(async () => {
      fireEvent.submit(screen.getByTestId("comment-input").closest("form") as HTMLFormElement);
    });

    expect(screen.getByTestId("comment-input")).toHaveValue("Halo");
    expect(loadSpy).not.toHaveBeenCalled();
    expect(screen.getByTestId("submit-comment-btn")).toBeEnabled();
  });

  it("should show progress while the comment is being sent", async () => {
    vi.spyOn(postAction, "asyncSetIsPostAddComment").mockReturnValue(() => new Promise(() => {}));
    await renderPage({ preloadedState: { post: makePost(), profile: me } });

    fireEvent.change(screen.getByTestId("comment-input"), { target: { value: "Halo" } });
    await act(async () => {
      fireEvent.submit(screen.getByTestId("comment-input").closest("form") as HTMLFormElement);
    });

    expect(screen.getByTestId("submit-comment-btn")).toBeDisabled();
    expect(screen.getByText("Mengirim...")).toBeInTheDocument();
  });

  it("should not delete my comment when the confirmation is cancelled", async () => {
    confirmWith(false);
    const deleteSpy = vi.spyOn(postAction, "asyncSetIsPostDeleteComment");
    await renderPage({ preloadedState: { post: makePost(), profile: me } });

    await act(async () => {
      fireEvent.click(screen.getByTestId("delete-comment-btn"));
    });

    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("should delete my comment after confirmation and reload the detail", async () => {
    confirmWith(true);
    const deleteSpy = vi.spyOn(postAction, "asyncSetIsPostDeleteComment").mockReturnValue(async (dispatch) => {
      dispatch(postAction.setIsPostDeletedCommentActionCreator(true));
      dispatch(postAction.setIsPostDeleteCommentActionCreator(true));
    });
    const { store } = await renderPage({ preloadedState: { post: makePost(), profile: me } });
    loadSpy.mockClear();

    await act(async () => {
      fireEvent.click(screen.getByTestId("delete-comment-btn"));
    });

    expect(deleteSpy).toHaveBeenCalledWith(5);
    expect(loadSpy).toHaveBeenCalledWith("5");
    expect(store.getState().isPostDeleteComment).toBe(false);
    expect(store.getState().isPostDeletedComment).toBe(false);
  });

  it("should not reload when deleting my comment fails", async () => {
    confirmWith(true);
    vi.spyOn(postAction, "asyncSetIsPostDeleteComment").mockReturnValue(() => Promise.resolve());
    await renderPage({ preloadedState: { post: makePost(), profile: me } });
    loadSpy.mockClear();

    await act(async () => {
      fireEvent.click(screen.getByTestId("delete-comment-btn"));
    });

    expect(loadSpy).not.toHaveBeenCalled();
  });

  it("should not delete the post when the confirmation is cancelled", async () => {
    confirmWith(false);
    const deleteSpy = vi.spyOn(postAction, "asyncSetIsPostDelete");
    await renderPage({ preloadedState: { post: makePost(), profile: me } });

    await act(async () => {
      fireEvent.click(screen.getByTestId("delete-post-btn"));
    });

    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("should delete the post after confirmation and go back to the timeline", async () => {
    confirmWith(true);
    const deleteSpy = vi.spyOn(postAction, "asyncSetIsPostDelete").mockReturnValue(async (dispatch) => {
      dispatch(postAction.setIsPostDeletedActionCreator(true));
      dispatch(postAction.setIsPostDeleteActionCreator(true));
    });
    const { store } = await renderPage({ preloadedState: { post: makePost(), profile: me } });

    await act(async () => {
      fireEvent.click(screen.getByTestId("delete-post-btn"));
    });

    expect(deleteSpy).toHaveBeenCalledWith(5);
    expect(navigation.router.replace).toHaveBeenCalledWith("/");
    expect(store.getState().isPostDelete).toBe(false);
    expect(store.getState().isPostDeleted).toBe(false);
  });

  it("should stay on the page when deleting the post fails", async () => {
    confirmWith(true);
    vi.spyOn(postAction, "asyncSetIsPostDelete").mockReturnValue(() => Promise.resolve());
    await renderPage({ preloadedState: { post: makePost(), profile: me } });

    await act(async () => {
      fireEvent.click(screen.getByTestId("delete-post-btn"));
    });

    expect(navigation.router.replace).not.toHaveBeenCalled();
  });

  it("should open the cover modal and reload the detail after a new cover is uploaded", async () => {
    vi.spyOn(postAction, "asyncSetIsPostChangeCover").mockReturnValue(async (dispatch) => {
      dispatch(postAction.setIsPostChangedCoverActionCreator(true));
      dispatch(postAction.setIsPostChangeCoverActionCreator(true));
    });
    URL.createObjectURL = vi.fn(() => "blob:preview");
    URL.revokeObjectURL = vi.fn();
    await renderPage({ preloadedState: { post: makePost(), profile: me } });
    loadSpy.mockClear();

    fireEvent.click(screen.getByTestId("edit-cover-btn"));
    expect(screen.getByTestId("change-cover-modal")).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("cover-file-input"), {
      target: { files: [new File(["img"], "foto.png", { type: "image/png" })] },
    });
    await act(async () => {
      fireEvent.submit(screen.getByTestId("cover-file-input").closest("form") as HTMLFormElement);
    });

    expect(loadSpy).toHaveBeenCalledWith("5");
    expect(screen.queryByTestId("change-cover-modal")).not.toBeInTheDocument();
  });

  it("should close the cover modal from its close button", async () => {
    await renderPage({ preloadedState: { post: makePost(), profile: me } });

    fireEvent.click(screen.getByTestId("edit-cover-btn"));
    fireEvent.click(screen.getByTestId("close-cover-modal-btn"));

    expect(screen.queryByTestId("change-cover-modal")).not.toBeInTheDocument();
  });

  it("should open the edit modal and reload the detail after saving", async () => {
    vi.spyOn(postAction, "asyncSetIsPostChange").mockReturnValue(async (dispatch) => {
      dispatch(postAction.setIsPostChangedActionCreator(true));
      dispatch(postAction.setIsPostChangeActionCreator(true));
    });
    await renderPage({ preloadedState: { post: makePost(), profile: me } });
    loadSpy.mockClear();

    fireEvent.click(screen.getByTestId("edit-post-btn"));
    expect(screen.getByTestId("edit-description-input")).toHaveValue("Tolak ukur kemampuan adalah usaha...");

    await act(async () => {
      fireEvent.submit(screen.getByTestId("edit-description-input").closest("form") as HTMLFormElement);
    });

    expect(loadSpy).toHaveBeenCalledWith("5");
    expect(screen.queryByTestId("edit-post-modal")).not.toBeInTheDocument();
  });

  it("should close the edit modal from its close button", async () => {
    await renderPage({ preloadedState: { post: makePost(), profile: me } });

    fireEvent.click(screen.getByTestId("edit-post-btn"));
    fireEvent.click(screen.getByTestId("close-edit-modal-btn"));

    expect(screen.queryByTestId("edit-post-modal")).not.toBeInTheDocument();
  });
});