import { showErrorDialog, showSuccessDialog } from "@/helpers/toolsHelper";
import postApi from "../api/postApi";
import type { PostFilters } from "../api/postApi";
import type { Post } from "@/types";
import type { AppAction, AppThunk } from "@/types/action";

export const ActionType = {
  SET_POSTS: "SET_POSTS",
  SET_POST: "SET_POST",
  SET_IS_POST: "SET_IS_POST",
  SET_IS_POST_ADD: "SET_IS_POST_ADD",
  SET_IS_POST_ADDED: "SET_IS_POST_ADDED",
  SET_IS_POST_CHANGE: "SET_IS_POST_CHANGE",
  SET_IS_POST_CHANGED: "SET_IS_POST_CHANGED",
  SET_IS_POST_CHANGE_COVER: "SET_IS_POST_CHANGE_COVER",
  SET_IS_POST_CHANGED_COVER: "SET_IS_POST_CHANGED_COVER",
  SET_IS_POST_DELETE: "SET_IS_POST_DELETE",
  SET_IS_POST_DELETED: "SET_IS_POST_DELETED",
  SET_IS_POST_LIKE: "SET_IS_POST_LIKE",
  SET_IS_POST_LIKED: "SET_IS_POST_LIKED",
  SET_IS_POST_ADD_COMMENT: "SET_IS_POST_ADD_COMMENT",
  SET_IS_POST_ADDED_COMMENT: "SET_IS_POST_ADDED_COMMENT",
  SET_IS_POST_DELETE_COMMENT: "SET_IS_POST_DELETE_COMMENT",
  SET_IS_POST_DELETED_COMMENT: "SET_IS_POST_DELETED_COMMENT",
  SET_IS_POST_DELETE_ALL: "SET_IS_POST_DELETE_ALL",
  SET_IS_POST_DELETED_ALL: "SET_IS_POST_DELETED_ALL",
} as const;

type FlagCreator = (value: boolean) => AppAction<boolean>;

function flag(type: string): FlagCreator {
  return (value) => ({ type, payload: value });
}

/* ---------- Daftar postingan ---------- */

export function setPostsActionCreator(posts: Post[]): AppAction<Post[]> {
  return {
    type: ActionType.SET_POSTS,
    payload: posts,
  };
}

export function asyncSetPosts(filters: PostFilters = {}): AppThunk {
  return async (dispatch) => {
    try {
      const posts = await postApi.getPosts(filters);
      dispatch(setPostsActionCreator(posts));
    } catch {
      dispatch(setPostsActionCreator([]));
    }
  };
}

/* ---------- Detail postingan ---------- */

export function setPostActionCreator(post: Post | null | undefined): AppAction<Post | null | undefined> {
  return {
    type: ActionType.SET_POST,
    payload: post,
  };
}

export const setIsPostActionCreator = flag(ActionType.SET_IS_POST);

export function asyncSetPost(postId: number | string): AppThunk {
  return async (dispatch) => {
    try {
      const post = await postApi.getPostById(postId);
      dispatch(setPostActionCreator(post));
    } catch {
      dispatch(setPostActionCreator(null));
    } finally {
      dispatch(setIsPostActionCreator(true));
    }
  };
}

/* ---------- Aksi ubah data ----------
 * Setiap aksi memakai dua penanda: "selesai diproses" (setDone, selalu true di akhir)
 * dan "berhasil" (setResult, true jika sukses dan false jika gagal).
 */

interface Mutation {
  run: () => Promise<string | undefined>;
  fallbackMessage: string;
  setDone: FlagCreator;
  setResult: FlagCreator;
  silent?: boolean;
}

function runMutation({ run, fallbackMessage, setDone, setResult, silent }: Mutation): AppThunk {
  return async (dispatch) => {
    try {
      const message = await run();
      if (!silent) {
        showSuccessDialog(message || fallbackMessage);
      }
      dispatch(setResult(true));
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setResult(false));
    } finally {
      dispatch(setDone(true));
    }
  };
}

// Tambah postingan
export const setIsPostAddActionCreator = flag(ActionType.SET_IS_POST_ADD);
export const setIsPostAddedActionCreator = flag(ActionType.SET_IS_POST_ADDED);

export function asyncSetIsPostAdd(description: string): AppThunk {
  return runMutation({
    run: async () => {
      await postApi.postPost(description);
      return "Postingan berhasil dipublikasikan.";
    },
    fallbackMessage: "Postingan berhasil dipublikasikan.",
    setDone: setIsPostAddActionCreator,
    setResult: setIsPostAddedActionCreator,
  });
}

// Ubah deskripsi postingan
export const setIsPostChangeActionCreator = flag(ActionType.SET_IS_POST_CHANGE);
export const setIsPostChangedActionCreator = flag(ActionType.SET_IS_POST_CHANGED);

export function asyncSetIsPostChange(postId: number | string, description: string): AppThunk {
  return runMutation({
    run: () => postApi.putPost(postId, description),
    fallbackMessage: "Postingan berhasil diperbarui.",
    setDone: setIsPostChangeActionCreator,
    setResult: setIsPostChangedActionCreator,
  });
}

// Ganti cover postingan
export const setIsPostChangeCoverActionCreator = flag(ActionType.SET_IS_POST_CHANGE_COVER);
export const setIsPostChangedCoverActionCreator = flag(ActionType.SET_IS_POST_CHANGED_COVER);

export function asyncSetIsPostChangeCover(postId: number | string, cover: File): AppThunk {
  return runMutation({
    run: () => postApi.postPostCover(postId, cover),
    fallbackMessage: "Cover berhasil diperbarui.",
    setDone: setIsPostChangeCoverActionCreator,
    setResult: setIsPostChangedCoverActionCreator,
  });
}

// Hapus postingan
export const setIsPostDeleteActionCreator = flag(ActionType.SET_IS_POST_DELETE);
export const setIsPostDeletedActionCreator = flag(ActionType.SET_IS_POST_DELETED);

export function asyncSetIsPostDelete(postId: number | string): AppThunk {
  return runMutation({
    run: () => postApi.deletePost(postId),
    fallbackMessage: "Postingan berhasil dihapus.",
    setDone: setIsPostDeleteActionCreator,
    setResult: setIsPostDeletedActionCreator,
  });
}

// Suka / batal suka (tanpa dialog agar interaksi terasa ringan)
export const setIsPostLikeActionCreator = flag(ActionType.SET_IS_POST_LIKE);
export const setIsPostLikedActionCreator = flag(ActionType.SET_IS_POST_LIKED);

export function asyncSetIsPostLike(postId: number | string, like: 0 | 1): AppThunk {
  return runMutation({
    run: () => postApi.postPostLike(postId, like),
    fallbackMessage: "",
    setDone: setIsPostLikeActionCreator,
    setResult: setIsPostLikedActionCreator,
    silent: true,
  });
}

// Tambah komentar
export const setIsPostAddCommentActionCreator = flag(ActionType.SET_IS_POST_ADD_COMMENT);
export const setIsPostAddedCommentActionCreator = flag(ActionType.SET_IS_POST_ADDED_COMMENT);

export function asyncSetIsPostAddComment(postId: number | string, comment: string): AppThunk {
  return runMutation({
    run: () => postApi.postPostComment(postId, comment),
    fallbackMessage: "Komentar berhasil ditambahkan.",
    setDone: setIsPostAddCommentActionCreator,
    setResult: setIsPostAddedCommentActionCreator,
  });
}

// Hapus komentar
export const setIsPostDeleteCommentActionCreator = flag(ActionType.SET_IS_POST_DELETE_COMMENT);
export const setIsPostDeletedCommentActionCreator = flag(ActionType.SET_IS_POST_DELETED_COMMENT);

export function asyncSetIsPostDeleteComment(postId: number | string): AppThunk {
  return runMutation({
    run: () => postApi.deletePostComment(postId),
    fallbackMessage: "Komentar berhasil dihapus.",
    setDone: setIsPostDeleteCommentActionCreator,
    setResult: setIsPostDeletedCommentActionCreator,
  });
}

// Hapus semua postingan milik sendiri
export const setIsPostDeleteAllActionCreator = flag(ActionType.SET_IS_POST_DELETE_ALL);
export const setIsPostDeletedAllActionCreator = flag(ActionType.SET_IS_POST_DELETED_ALL);

export function asyncSetIsPostDeleteAll(): AppThunk {
  return runMutation({
    run: () => postApi.deletePosts(),
    fallbackMessage: "Semua postingan berhasil dihapus.",
    setDone: setIsPostDeleteAllActionCreator,
    setResult: setIsPostDeletedAllActionCreator,
  });
}