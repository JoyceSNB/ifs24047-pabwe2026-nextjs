import { describe, it, expect } from "vitest";
import {
  usersReducer,
  userReducer,
  profileReducer,
  isProfileReducer,
  isChangeProfileReducer,
  isChangeProfilePhotoReducer,
  isChangeProfilePasswordReducer,
} from "./reducer";
import { ActionType } from "./action";

const unknown = { type: "UNKNOWN" };
const user = { id: 1, name: "Ubaid", email: "ubaid@del.ac.id", photo: null };

describe("users reducer", () => {
  it("should return the default state for unknown actions", () => {
    expect(usersReducer(undefined, unknown)).toEqual([]);
    expect(userReducer(undefined, unknown)).toBeNull();
    expect(profileReducer(undefined, unknown)).toBeNull();
    expect(isProfileReducer(undefined, unknown)).toBe(false);
    expect(isChangeProfileReducer(undefined, unknown)).toBe(false);
    expect(isChangeProfilePhotoReducer(undefined, unknown)).toBe(false);
    expect(isChangeProfilePasswordReducer(undefined, unknown)).toBe(false);
  });

  it("should handle SET_USERS", () => {
    const action = { type: ActionType.SET_USERS, payload: [user] };
    expect(usersReducer([], action)).toEqual([user]);
  });

  it("should handle SET_USER", () => {
    const action = { type: ActionType.SET_USER, payload: user };
    expect(userReducer(null, action)).toEqual(user);
  });

  it("should handle SET_PROFILE", () => {
    const action = { type: ActionType.SET_PROFILE, payload: user };
    expect(profileReducer(null, action)).toEqual(user);
  });

  it("should handle SET_IS_PROFILE", () => {
    const action = { type: ActionType.SET_IS_PROFILE, payload: true };
    expect(isProfileReducer(false, action)).toBe(true);
  });

  it("should handle SET_IS_CHANGE_PROFILE", () => {
    const action = { type: ActionType.SET_IS_CHANGE_PROFILE, payload: true };
    expect(isChangeProfileReducer(false, action)).toBe(true);
  });

  it("should handle SET_IS_CHANGE_PROFILE_PHOTO", () => {
    const action = { type: ActionType.SET_IS_CHANGE_PROFILE_PHOTO, payload: true };
    expect(isChangeProfilePhotoReducer(false, action)).toBe(true);
  });

  it("should handle SET_IS_CHANGE_PROFILE_PASSWORD", () => {
    const action = { type: ActionType.SET_IS_CHANGE_PROFILE_PASSWORD, payload: true };
    expect(isChangeProfilePasswordReducer(false, action)).toBe(true);
  });
});