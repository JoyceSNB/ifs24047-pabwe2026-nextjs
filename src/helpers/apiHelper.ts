import type { QueryParams } from "@/types/action";

const apiHelper = (() => {
  async function fetchData(url: string, options: RequestInit = {}): Promise<Response> {
    const urlQuery = url.includes("?") ? url.split("?")[1] : "";
    const urlWithoutQuery = url.replace(`?${urlQuery}`, "");
    const fixUrl = urlWithoutQuery.endsWith("/")
      ? urlWithoutQuery.slice(0, -1)
      : urlWithoutQuery;
    const fullUrl = fixUrl + (urlQuery ? `?${urlQuery}` : "");

    const token = getAccessToken();
    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(fullUrl, {
      ...options,
      mode: "cors",
      headers,
    });
  }

  // Ubah objek parameter menjadi query string, nilai kosong diabaikan.
  // Contoh: buildQuery({ is_me: 1, q: "" }) => "?is_me=1"
  function buildQuery(params: QueryParams = {}): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const query = searchParams.toString();
    return query ? `?${query}` : "";
  }

  function putAccessToken(token: string | null | undefined): void {
    if (!token) {
      localStorage.removeItem("accessToken");
    } else {
      localStorage.setItem("accessToken", token);
    }
  }

  function getAccessToken(): string | null {
    return localStorage.getItem("accessToken");
  }

  return {
    fetchData,
    buildQuery,
    putAccessToken,
    getAccessToken,
  };
})();

export default apiHelper;