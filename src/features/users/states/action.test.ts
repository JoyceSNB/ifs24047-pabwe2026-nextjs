import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ActionType,
  setUsersActionCreator,
  setUserActionCreator,
  setProfileActionCreator,
  setIsProfile,
  setIsChangeProfileActionCreator,
  setIsChangeProfilePhotoActionCreator,
  setIsChangeProfilePasswordActionCreator,
  asyncSetUsers,
  asyncSetUserById,
  asyncSetProfile,
  asyncPutProfile,
  asyncPostProfilePhoto,
  asyncPutProfilePassword,
} from "./action";
import userApi from "../api/userApi";
import * as toolsHelper from "@/helpers/toolsHelper";

const user = { id: 1, name: "Ubaid", email: "ubaid@del.ac.id", photo: null };

describe("users action", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function silenceDialogs() {
    return {
      errorSpy: vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(async () => ({}) as never),
      successSpy: vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(async () => ({}) as never),
    };
  }

  it("should create correct action objects", () => {
    expect(setUsersActionCreator([user])).toEqual({ type: ActionType.SET_USERS, payload: [user] });
    expect(setUserActionCreator(user)).toEqual({ type: ActionType.SET_USER, payload: user });
    expect(setProfileActionCreator(user)).toEqual({ type: ActionType.SET_PROFILE, payload: user });
    expect(setIsProfile(true)).toEqual({ type: ActionType.SET_IS_PROFILE, payload: true });
    expect(setIsChangeProfileActionCreator(true)).toEqual({
      type: ActionType.SET_IS_CHANGE_PROFILE,
      payload: true,
    });
    expect(setIsChangeProfilePhotoActionCreator(true)).toEqual({
      type: ActionType.SET_IS_CHANGE_PROFILE_PHOTO,
      payload: true,
    });
    expect(setIsChangeProfilePasswordActionCreator(true)).toEqual({
      type: ActionType.SET_IS_CHANGE_PROFILE_PASSWORD,
      payload: true,
    });
  });

  describe("asyncSetUsers", () => {
    it("should dispatch users on success", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "getUsers").mockResolvedValue([user]);

      await asyncSetUsers()(dispatch);

      expect(dispatch).toHaveBeenCalledWith(setUsersActionCreator([user]));
    });

    it("should dispatch an empty list on failure", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "getUsers").mockRejectedValue(new Error("gagal"));

      await asyncSetUsers()(dispatch);

      expect(dispatch).toHaveBeenCalledWith(setUsersActionCreator([]));
    });
  });

  describe("asyncSetUserById", () => {
    it("should dispatch the user on success", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "getUserById").mockResolvedValue(user);

      await asyncSetUserById(1)(dispatch);

      expect(dispatch).toHaveBeenCalledWith(setUserActionCreator(user));
    });

    it("should dispatch null on failure", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "getUserById").mockRejectedValue(new Error("gagal"));

      await asyncSetUserById(1)(dispatch);

      expect(dispatch).toHaveBeenCalledWith(setUserActionCreator(null));
    });
  });

  describe("asyncSetProfile", () => {
    it("should dispatch profile and the finished flag on success", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "getProfile").mockResolvedValue(user);

      await asyncSetProfile()(dispatch);

      expect(dispatch).toHaveBeenCalledWith(setProfileActionCreator(user));
      expect(dispatch).toHaveBeenCalledWith(setIsProfile(true));
    });

    it("should dispatch null profile and the finished flag on failure", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "getProfile").mockRejectedValue(new Error("gagal"));

      await asyncSetProfile()(dispatch);

      expect(dispatch).toHaveBeenCalledWith(setProfileActionCreator(null));
      expect(dispatch).toHaveBeenCalledWith(setIsProfile(true));
    });
  });

  describe("asyncPutProfile", () => {
    it("should update profile and show success dialog", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "putProfile").mockResolvedValue(user);
      const { successSpy } = silenceDialogs();

      await asyncPutProfile("Ubaid", "ubaid@del.ac.id")(dispatch);

      expect(successSpy).toHaveBeenCalledWith("Profil berhasil diperbarui!");
      expect(dispatch).toHaveBeenCalledWith(setProfileActionCreator(user));
      expect(dispatch).toHaveBeenCalledWith(setIsChangeProfileActionCreator(true));
    });

    it("should show error dialog on failure", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "putProfile").mockRejectedValue(new Error("Email sudah dipakai"));
      const { errorSpy } = silenceDialogs();

      await asyncPutProfile("Ubaid", "ubaid@del.ac.id")(dispatch);

      expect(errorSpy).toHaveBeenCalledWith("Email sudah dipakai");
      expect(dispatch).toHaveBeenCalledWith(setIsChangeProfileActionCreator(false));
    });
  });

  describe("asyncPostProfilePhoto", () => {
    const file = new File(["img"], "avatar.png", { type: "image/png" });

    it("should upload photo, refresh profile and show the api message", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "postProfilePhoto").mockResolvedValue("Berhasil mengubah photo profile");
      vi.spyOn(userApi, "getProfile").mockResolvedValue(user);
      const { successSpy } = silenceDialogs();

      await asyncPostProfilePhoto(file)(dispatch);

      expect(successSpy).toHaveBeenCalledWith("Berhasil mengubah photo profile");
      expect(dispatch).toHaveBeenCalledWith(setProfileActionCreator(user));
      expect(dispatch).toHaveBeenCalledWith(setIsChangeProfilePhotoActionCreator(true));
    });

    it("should use the default message when the api returns none", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "postProfilePhoto").mockResolvedValue(undefined);
      vi.spyOn(userApi, "getProfile").mockResolvedValue(user);
      const { successSpy } = silenceDialogs();

      await asyncPostProfilePhoto(file)(dispatch);

      expect(successSpy).toHaveBeenCalledWith("Foto profil berhasil diperbarui!");
    });

    it("should show error dialog on failure", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "postProfilePhoto").mockRejectedValue(new Error("Foto terlalu besar"));
      const { errorSpy } = silenceDialogs();

      await asyncPostProfilePhoto(file)(dispatch);

      expect(errorSpy).toHaveBeenCalledWith("Foto terlalu besar");
      expect(dispatch).toHaveBeenCalledWith(setIsChangeProfilePhotoActionCreator(false));
    });
  });

  describe("asyncPutProfilePassword", () => {
    it("should show the api message on success", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "putProfilePassword").mockResolvedValue("Berhasil mengubah kata sandi");
      const { successSpy } = silenceDialogs();

      await asyncPutProfilePassword("lama", "baru123", "baru123")(dispatch);

      expect(successSpy).toHaveBeenCalledWith("Berhasil mengubah kata sandi");
      expect(dispatch).toHaveBeenCalledWith(setIsChangeProfilePasswordActionCreator(true));
    });

    it("should use the default message when the api returns none", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "putProfilePassword").mockResolvedValue(undefined);
      const { successSpy } = silenceDialogs();

      await asyncPutProfilePassword("lama", "baru123")(dispatch);

      expect(successSpy).toHaveBeenCalledWith("Kata sandi berhasil diperbarui!");
    });

    it("should show error dialog on failure", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "putProfilePassword").mockRejectedValue(new Error("Kata sandi lama salah"));
      const { errorSpy } = silenceDialogs();

      await asyncPutProfilePassword("x", "baru123")(dispatch);

      expect(errorSpy).toHaveBeenCalledWith("Kata sandi lama salah");
      expect(dispatch).toHaveBeenCalledWith(setIsChangeProfilePasswordActionCreator(false));
    });
  });
});