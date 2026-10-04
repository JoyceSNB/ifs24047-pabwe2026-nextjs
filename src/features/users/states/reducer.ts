import type { UnknownAction } from "@reduxjs/toolkit";
import type { User } from "@/types";
import { ActionType } from "./action";

export const usersReducer = (state: User[] = [], action: UnknownAction): User[] => {
  switch (action.type) {
    case ActionType.SET_USERS:
      return action.payload as User[];
    default:
      return state;
  }
};

export const userReducer = (state: User | null = null, action: UnknownAction): User | null => {
  switch (action.type) {
    case ActionType.SET_USER:
      return action.payload as User | null;
    default:
      return state;
  }
};

export const profileReducer = (state: User | null = null, action: UnknownAction): User | null => {
  switch (action.type) {
    case ActionType.SET_PROFILE:
      return action.payload as User | null;
    default:
      return state;
  }
};

export const isProfileReducer = (state = false, action: UnknownAction): boolean => {
  switch (action.type) {
    case ActionType.SET_IS_PROFILE:
      return action.payload as boolean;
    default:
      return state;
  }
};

export const isChangeProfileReducer = (state = false, action: UnknownAction): boolean => {
  switch (action.type) {
    case ActionType.SET_IS_CHANGE_PROFILE:
      return action.payload as boolean;
    default:
      return state;
  }
};

export const isChangeProfilePhotoReducer = (state = false, action: UnknownAction): boolean => {
  switch (action.type) {
    case ActionType.SET_IS_CHANGE_PROFILE_PHOTO:
      return action.payload as boolean;
    default:
      return state;
  }
};

export const isChangeProfilePasswordReducer = (state = false, action: UnknownAction): boolean => {
  switch (action.type) {
    case ActionType.SET_IS_CHANGE_PROFILE_PASSWORD:
      return action.payload as boolean;
    default:
      return state;
  }
};