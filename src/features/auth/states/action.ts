import apiHelper from "@/helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "@/helpers/toolsHelper";
import authApi from "../api/authApi";
import type { AppAction, AppThunk } from "@/types/action";

export const ActionType = {
  SET_IS_AUTH_LOGIN: "SET_IS_AUTH_LOGIN",
  SET_IS_AUTH_REGISTER: "SET_IS_AUTH_REGISTER",
  SET_IS_AUTH_LOGOUT: "SET_IS_AUTH_LOGOUT",
} as const;

// Login
export function setIsAuthLoginActionCreator(isAuthLogin: boolean): AppAction<boolean> {
  return {
    type: ActionType.SET_IS_AUTH_LOGIN,
    payload: isAuthLogin,
  };
}

export function asyncSetIsAuthLogin(email: string, password: string): AppThunk {
  return async (dispatch) => {
    try {
      const data = await authApi.postLogin(email, password);
      apiHelper.putAccessToken(data.token);
      dispatch(setIsAuthLoginActionCreator(true));
    } catch (error) {
      dispatch(setIsAuthLoginActionCreator(false));
      showErrorDialog(error.message);
    }
  };
}

// Register
export function setIsAuthRegisterActionCreator(isAuthRegister: boolean): AppAction<boolean> {
  return {
    type: ActionType.SET_IS_AUTH_REGISTER,
    payload: isAuthRegister,
  };
}

export function asyncSetIsAuthRegister(name: string, email: string, password: string): AppThunk {
  return async (dispatch) => {
    try {
      const message = await authApi.postRegister(name, email, password);
      dispatch(setIsAuthRegisterActionCreator(true));
      showSuccessDialog(message as string);
    } catch (error) {
      dispatch(setIsAuthRegisterActionCreator(false));
      showErrorDialog(error.message);
    }
  };
}

// Logout
export function setIsAuthLogoutActionCreator(isAuthLogout: boolean): AppAction<boolean> {
  return {
    type: ActionType.SET_IS_AUTH_LOGOUT,
    payload: isAuthLogout,
  };
}

export function asyncSetIsAuthLogout(): AppThunk {
  return async (dispatch) => {
    try {
      await authApi.postLogout();
    } catch {
      // Tetap hapus token di perangkat walaupun server gagal merespons
    } finally {
      apiHelper.putAccessToken("");
      dispatch(setIsAuthLogoutActionCreator(true));
    }
  };
}