import { describe, it, expect, vi, beforeEach } from "vitest";
import * as actions from "./action";
import postApi from "../api/postApi";
import * as toolsHelper from "@/helpers/toolsHelper";
import type { AppAction, AppThunk } from "@/types/action";

const post = {
  id: 1,
  user_id: 1,
  cover: null,
  description: "Halo",
  created_at: "2024-10-05T03:07:11.000000Z",
  updated_at: "2024-10-05T03:07:11.000000Z",
  author: { name: "Delcom", photo: null },
  likes: [],
  comments: [],
};

function silenceDialogs() {
  return {
    errorSpy: vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(async () => ({}) as never),
    successSpy: vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(async () => ({}) as never),
  };
}

describe("posts action", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should create correct action objects", () => {
    expect(actions.setPostsActionCreator([post])).toEqual({ type: actions.ActionType.SET_POSTS, payload: [post] });
    expect(actions.setPostActionCreator(post)).toEqual({ type: actions.ActionType.SET_POST, payload: post });
    expect(actions.setIsPostActionCreator(true)).toEqual({ type: actions.ActionType.SET_IS_POST, payload: true });
  });

  describe("asyncSetPosts", () => {
    it("should dispatch the posts and pass the filters on success", async () => {
      const dispatch = vi.fn();
      const getPosts = vi.spyOn(postApi, "getPosts").mockResolvedValue([post]);

      await actions.asyncSetPosts({ is_me: 1 })(dispatch);

      expect(getPosts).toHaveBeenCalledWith({ is_me: 1 });
      expect(dispatch).toHaveBeenCalledWith(actions.setPostsActionCreator([post]));
    });

    it("should use empty filters by default", async () => {
      const dispatch = vi.fn();
      const getPosts = vi.spyOn(postApi, "getPosts").mockResolvedValue([]);

      await actions.asyncSetPosts()(dispatch);

      expect(getPosts).toHaveBeenCalledWith({});
    });

    it("should dispatch an empty list on failure", async () => {
      const dispatch = vi.fn();
      vi.spyOn(postApi, "getPosts").mockRejectedValue(new Error("gagal"));

      await actions.asyncSetPosts()(dispatch);

      expect(dispatch).toHaveBeenCalledWith(actions.setPostsActionCreator([]));
    });
  });

  describe("asyncSetPost", () => {
    it("should dispatch the post and the finished flag on success", async () => {
      const dispatch = vi.fn();
      vi.spyOn(postApi, "getPostById").mockResolvedValue(post);

      await actions.asyncSetPost(1)(dispatch);

      expect(dispatch).toHaveBeenCalledWith(actions.setPostActionCreator(post));
      expect(dispatch).toHaveBeenCalledWith(actions.setIsPostActionCreator(true));
    });

    it("should dispatch null and the finished flag on failure", async () => {
      const dispatch = vi.fn();
      vi.spyOn(postApi, "getPostById").mockRejectedValue(new Error("gagal"));

      await actions.asyncSetPost(1)(dispatch);

      expect(dispatch).toHaveBeenCalledWith(actions.setPostActionCreator(null));
      expect(dispatch).toHaveBeenCalledWith(actions.setIsPostActionCreator(true));
    });
  });

  // Semua aksi ubah data: pembuat thunk, metode API yang dipanggil, dan penanda yang dikirim
  interface MutationCase {
    name: string;
    thunk: () => AppThunk;
    apiMethod: keyof typeof postApi;
    done: (v: boolean) => AppAction<boolean>;
    result: (v: boolean) => AppAction<boolean>;
    fallback: string;
    silent?: boolean;
  }

  const mutations: MutationCase[] = [
    {
      name: "asyncSetIsPostAdd",
      thunk: () => actions.asyncSetIsPostAdd("Halo"),
      apiMethod: "postPost",
      done: actions.setIsPostAddActionCreator,
      result: actions.setIsPostAddedActionCreator,
      fallback: "Postingan berhasil dipublikasikan.",
    },
    {
      name: "asyncSetIsPostChange",
      thunk: () => actions.asyncSetIsPostChange(1, "Baru"),
      apiMethod: "putPost",
      done: actions.setIsPostChangeActionCreator,
      result: actions.setIsPostChangedActionCreator,
      fallback: "Postingan berhasil diperbarui.",
    },
    {
      name: "asyncSetIsPostChangeCover",
      thunk: () => actions.asyncSetIsPostChangeCover(1, new File(["a"], "a.png")),
      apiMethod: "postPostCover",
      done: actions.setIsPostChangeCoverActionCreator,
      result: actions.setIsPostChangedCoverActionCreator,
      fallback: "Cover berhasil diperbarui.",
    },
    {
      name: "asyncSetIsPostDelete",
      thunk: () => actions.asyncSetIsPostDelete(1),
      apiMethod: "deletePost",
      done: actions.setIsPostDeleteActionCreator,
      result: actions.setIsPostDeletedActionCreator,
      fallback: "Postingan berhasil dihapus.",
    },
    {
      name: "asyncSetIsPostLike",
      thunk: () => actions.asyncSetIsPostLike(1, 1),
      apiMethod: "postPostLike",
      done: actions.setIsPostLikeActionCreator,
      result: actions.setIsPostLikedActionCreator,
      fallback: "",
      silent: true,
    },
    {
      name: "asyncSetIsPostAddComment",
      thunk: () => actions.asyncSetIsPostAddComment(1, "Keren"),
      apiMethod: "postPostComment",
      done: actions.setIsPostAddCommentActionCreator,
      result: actions.setIsPostAddedCommentActionCreator,
      fallback: "Komentar berhasil ditambahkan.",
    },
    {
      name: "asyncSetIsPostDeleteComment",
      thunk: () => actions.asyncSetIsPostDeleteComment(1),
      apiMethod: "deletePostComment",
      done: actions.setIsPostDeleteCommentActionCreator,
      result: actions.setIsPostDeletedCommentActionCreator,
      fallback: "Komentar berhasil dihapus.",
    },
    {
      name: "asyncSetIsPostDeleteAll",
      thunk: () => actions.asyncSetIsPostDeleteAll(),
      apiMethod: "deletePosts",
      done: actions.setIsPostDeleteAllActionCreator,
      result: actions.setIsPostDeletedAllActionCreator,
      fallback: "Semua postingan berhasil dihapus.",
    },
  ];

  describe.each(mutations)("$name", ({ thunk, apiMethod, done, result, fallback, silent }) => {
    function mockApi(): ReturnType<typeof vi.fn> {
      return vi.spyOn(postApi, apiMethod as "deletePosts") as unknown as ReturnType<typeof vi.fn>;
    }

    it("should send both flags as true after a successful call", async () => {
      const dispatch = vi.fn();
      mockApi().mockResolvedValue("Pesan dari server");
      const { successSpy } = silenceDialogs();

      await thunk()(dispatch);

      expect(dispatch).toHaveBeenCalledWith(result(true));
      expect(dispatch).toHaveBeenCalledWith(done(true));
      if (silent) {
        expect(successSpy).not.toHaveBeenCalled();
      } else {
        expect(successSpy).toHaveBeenCalledWith(
          apiMethod === "postPost" ? fallback : "Pesan dari server"
        );
      }
    });

    it("should fall back to the default success message when the api returns none", async () => {
      const dispatch = vi.fn();
      mockApi().mockResolvedValue(undefined);
      const { successSpy } = silenceDialogs();

      await thunk()(dispatch);

      if (!silent) {
        expect(successSpy).toHaveBeenCalledWith(fallback);
      }
      expect(dispatch).toHaveBeenCalledWith(result(true));
    });

    it("should show the error and send result=false, done=true on failure", async () => {
      const dispatch = vi.fn();
      mockApi().mockRejectedValue(new Error("Gagal dari server"));
      const { errorSpy } = silenceDialogs();

      await thunk()(dispatch);

      expect(errorSpy).toHaveBeenCalledWith("Gagal dari server");
      expect(dispatch).toHaveBeenCalledWith(result(false));
      expect(dispatch).toHaveBeenCalledWith(done(true));
    });
  });
});