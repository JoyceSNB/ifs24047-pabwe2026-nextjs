import { describe, it, expect } from "vitest";
import store, { reducers } from "./store";
import { setPostsActionCreator } from "@/features/posts/states/action";

describe("store", () => {
  it("should combine reducers from auth, users and posts", () => {
    const state = store.getState();

    Object.keys(reducers).forEach((key) => {
      expect(state).toHaveProperty(key);
    });

    expect(state.isAuthLogin).toBe(false);
    expect(state.profile).toBeNull();
    expect(state.users).toEqual([]);
    expect(state.posts).toEqual([]);
    expect(state.post).toBeNull();
    expect(state.isPostDeleted).toBe(false);
  });

  it("should update the state when an action is dispatched", () => {
    store.dispatch(setPostsActionCreator([]));
    expect(store.getState().posts).toEqual([]);
  });
});