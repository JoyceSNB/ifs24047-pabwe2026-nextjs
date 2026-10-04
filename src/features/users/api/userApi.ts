import apiHelper from "@/helpers/apiHelper";
import { DELCOM_BASEURL } from "@/lib/config";
import type { ApiResult, User } from "@/types";

const userApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/users`;

  function _url(path: string): string {
    return BASE_URL + path;
  }

  function isSuccess(result: ApiResult): boolean {
    return result.status === "success" || Boolean(result.success);
  }

  async function getUsers(): Promise<User[]> {
    const response = await apiHelper.fetchData(_url("/"), {
      method: "GET",
    });

    const result: ApiResult<{ users?: User[] }> = await response.json();
    if (!isSuccess(result)) {
      throw new Error(result.message || "Gagal mengambil data pengguna");
    }

    return result.data?.users || [];
  }

  async function getUserById(userId: number | string): Promise<User | undefined> {
    const response = await apiHelper.fetchData(_url(`/${userId}`), {
      method: "GET",
    });

    const result: ApiResult<{ user?: User }> = await response.json();
    if (!isSuccess(result)) {
      throw new Error(result.message || "Gagal mengambil detail pengguna");
    }

    return result.data?.user;
  }

  async function getProfile(): Promise<User | undefined> {
    const response = await apiHelper.fetchData(_url("/me"), {
      method: "GET",
    });

    const result: ApiResult<{ user?: User }> = await response.json();
    if (!isSuccess(result)) {
      throw new Error(result.message || "Gagal mengambil data profil");
    }

    return result.data?.user;
  }

  async function putProfile(name: string, email: string): Promise<User | undefined> {
    const response = await apiHelper.fetchData(_url("/me"), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
      }),
    });

    const result: ApiResult<{ user?: User }> = await response.json();
    if (!isSuccess(result)) {
      throw new Error(result.message || "Gagal mengubah profil");
    }

    return result.data?.user;
  }

  async function postProfilePhoto(photo: File): Promise<string | undefined> {
    const formData = new FormData();
    formData.append("photo", photo, photo.name || "profile.png");
    const response = await apiHelper.fetchData(_url("/me/photo"), {
      method: "PUT",
      body: formData,
    });

    const result: ApiResult = await response.json();
    if (!isSuccess(result)) {
      throw new Error(result.message || "Gagal mengubah foto profil");
    }

    return result.message;
  }

  async function putProfilePassword(
    password: string,
    newPassword: string,
    newPasswordConfirmation?: string
  ): Promise<string | undefined> {
    const response = await apiHelper.fetchData(_url("/password"), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation || newPassword,
      }),
    });

    const result: ApiResult = await response.json();
    if (!isSuccess(result)) {
      throw new Error(result.message || "Gagal mengubah kata sandi");
    }

    return result.message;
  }

  return {
    getUsers,
    getUserById,
    getProfile,
    putProfile,
    postProfilePhoto,
    putProfilePassword,
  };
})();

export default userApi;