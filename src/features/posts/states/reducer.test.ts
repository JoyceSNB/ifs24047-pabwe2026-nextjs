import { describe, it, expect } from "vitest";
import * as reducers from "./reducer";
import { ActionType } from "./action";

const unknown = { type: "UNKNOWN" };
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

describe("posts reducer", () => {
  it("should return the default state for unknown actions", () => {
    expect(reducers.postsReducer(undefined, unknown)).toEqual([]);
    expect(reducers.postReducer(undefined, unknown)).toBeNull();
    expect(reducers.isPostReducer(undefined, unknown)).toBe(false);
  });

  it("should keep the current state for unknown actions", () => {
    expect(reducers.postsReducer([post], unknown)).toEqual([post]);
  });

  it("should handle SET_POSTS and SET_POST", () => {
    expect(reducers.postsReducer([], { type: ActionType.SET_POSTS, payload: [post] })).toEqual([post]);
    expect(reducers.postReducer(null, { type: ActionType.SET_POST, payload: post })).toEqual(post);
    expect(reducers.isPostReducer(false, { type: ActionType.SET_IS_POST, payload: true })).toBe(true);
  });

  // Setiap penanda aksi: nama reducer -> tipe action yang dipantau
  const flagReducers: Array<[keyof typeof reducers, string]> = [
    ["isPostAddReducer", ActionType.SET_IS_POST_ADD],
    ["isPostAddedReducer", ActionType.SET_IS_POST_ADDED],
    ["isPostChangeReducer", ActionType.SET_IS_POST_CHANGE],
    ["isPostChangedReducer", ActionType.SET_IS_POST_CHANGED],
    ["isPostChangeCoverReducer", ActionType.SET_IS_POST_CHANGE_COVER],
    ["isPostChangedCoverReducer", ActionType.SET_IS_POST_CHANGED_COVER],
    ["isPostDeleteReducer", ActionType.SET_IS_POST_DELETE],
    ["isPostDeletedReducer", ActionType.SET_IS_POST_DELETED],
    ["isPostLikeReducer", ActionType.SET_IS_POST_LIKE],
    ["isPostLikedReducer", ActionType.SET_IS_POST_LIKED],
    ["isPostAddCommentReducer", ActionType.SET_IS_POST_ADD_COMMENT],
    ["isPostAddedCommentReducer", ActionType.SET_IS_POST_ADDED_COMMENT],
    ["isPostDeleteCommentReducer", ActionType.SET_IS_POST_DELETE_COMMENT],
    ["isPostDeletedCommentReducer", ActionType.SET_IS_POST_DELETED_COMMENT],
    ["isPostDeleteAllReducer", ActionType.SET_IS_POST_DELETE_ALL],
    ["isPostDeletedAllReducer", ActionType.SET_IS_POST_DELETED_ALL],
  ];

  it.each(flagReducers)("%s should start false and follow its own action", (name, type) => {
    const reducer = reducers[name] as (state: boolean | undefined, action: { type: string; payload?: boolean }) => boolean;

    expect(reducer(undefined, unknown)).toBe(false);
    expect(reducer(false, { type, payload: true })).toBe(true);
    expect(reducer(true, { type, payload: false })).toBe(false);
    expect(reducer(false, { type: ActionType.SET_POSTS, payload: true })).toBe(false);
  });
});