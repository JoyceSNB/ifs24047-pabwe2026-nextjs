import type { UnknownAction } from "@reduxjs/toolkit";
import type { Post } from "@/types";
import { ActionType } from "./action";

// Membuat reducer sederhana: menyimpan payload saat tipe action cocok.
function createReducer<T>(type: string, initialState: T) {
  return function reducer(state: T = initialState, action: UnknownAction): T {
    switch (action.type) {
      case type:
        return action.payload as T;
      default:
        return state;
    }
  };
}

export const postsReducer = createReducer<Post[]>(ActionType.SET_POSTS, []);
export const postReducer = createReducer<Post | null>(ActionType.SET_POST, null);
export const isPostReducer = createReducer(ActionType.SET_IS_POST, false);

export const isPostAddReducer = createReducer(ActionType.SET_IS_POST_ADD, false);
export const isPostAddedReducer = createReducer(ActionType.SET_IS_POST_ADDED, false);

export const isPostChangeReducer = createReducer(ActionType.SET_IS_POST_CHANGE, false);
export const isPostChangedReducer = createReducer(ActionType.SET_IS_POST_CHANGED, false);

export const isPostChangeCoverReducer = createReducer(ActionType.SET_IS_POST_CHANGE_COVER, false);
export const isPostChangedCoverReducer = createReducer(ActionType.SET_IS_POST_CHANGED_COVER, false);

export const isPostDeleteReducer = createReducer(ActionType.SET_IS_POST_DELETE, false);
export const isPostDeletedReducer = createReducer(ActionType.SET_IS_POST_DELETED, false);

export const isPostLikeReducer = createReducer(ActionType.SET_IS_POST_LIKE, false);
export const isPostLikedReducer = createReducer(ActionType.SET_IS_POST_LIKED, false);

export const isPostAddCommentReducer = createReducer(ActionType.SET_IS_POST_ADD_COMMENT, false);
export const isPostAddedCommentReducer = createReducer(ActionType.SET_IS_POST_ADDED_COMMENT, false);

export const isPostDeleteCommentReducer = createReducer(ActionType.SET_IS_POST_DELETE_COMMENT, false);
export const isPostDeletedCommentReducer = createReducer(ActionType.SET_IS_POST_DELETED_COMMENT, false);

export const isPostDeleteAllReducer = createReducer(ActionType.SET_IS_POST_DELETE_ALL, false);
export const isPostDeletedAllReducer = createReducer(ActionType.SET_IS_POST_DELETED_ALL, false);