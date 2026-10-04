import type { UnknownAction } from "@reduxjs/toolkit";
import { ActionType } from "./action";

export const isAuthLoginReducer = (state = false, action: UnknownAction): boolean => {
  switch (action.type) {
    case ActionType.SET_IS_AUTH_LOGIN:
      return action.payload as boolean;
    default:
      return state;
  }
};

export const isAuthRegisterReducer = (state = false, action: UnknownAction): boolean => {
  switch (action.type) {
    case ActionType.SET_IS_AUTH_REGISTER:
      return action.payload as boolean;
    default:
      return state;
  }
};

export const isAuthLogoutReducer = (state = false, action: UnknownAction): boolean => {
  switch (action.type) {
    case ActionType.SET_IS_AUTH_LOGOUT:
      return action.payload as boolean;
    default:
      return state;
  }
};