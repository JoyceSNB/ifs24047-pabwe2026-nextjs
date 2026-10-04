import apiHelper from "@/helpers/apiHelper";
import { DELCOM_BASEURL } from "@/lib/config";
import type { ApiResult } from "@/types";

interface LoginData {
  token: string;
}

const authApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/auth`;

  function _url(path: string): string {
    return BASE_URL + path;
  }

  function isSuccess(result: ApiResult): boolean {
    return result.status === "success" || Boolean(result.success);
  }

  async function postRegister(name: string, email: string, password: string): Promise<string | undefined> {
    const response = await apiHelper.fetchData(_url("/register"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const result: ApiResult = await response.json();
    if (!isSuccess(result)) {
      const errorDetails =
        result.data && typeof result.data === "object"
          ? Object.values(result.data).flat().join(", ")
          : "";
      const baseMsg = result.message || "Gagal melakukan pendaftaran";
      throw new Error(errorDetails ? `${baseMsg}: ${errorDetails}` : baseMsg);
    }

    return result.message;
  }

  async function postLogin(email: string, password: string): Promise<LoginData> {
    const response = await apiHelper.fetchData(_url("/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const result: ApiResult<LoginData> = await response.json();
    if (!isSuccess(result)) {
      throw new Error(result.message || "Gagal login");
    }

    return result.data as LoginData;
  }

  async function postLogout(): Promise<string | undefined> {
    const response = await apiHelper.fetchData(_url("/logout"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result: ApiResult = await response.json();
    if (!isSuccess(result)) {
      throw new Error(result.message || "Gagal logout");
    }

    return result.message;
  }

  return {
    postRegister,
    postLogin,
    postLogout,
  };
})();

export default authApi;