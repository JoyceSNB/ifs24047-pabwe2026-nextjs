import apiHelper from "@/helpers/apiHelper";
import { DELCOM_BASEURL } from "@/lib/config";
import type { ApiResult, Post } from "@/types";

export interface PostFilters {
  is_me?: 1;
}

const postApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/posts`;

  function _url(path: string): string {
    return BASE_URL + path;
  }

  // Kirim request lalu validasi format respons Delcom ({ status, message, data })
  async function _request<T = unknown>(
    path: string,
    options: RequestInit,
    errorMessage: string
  ): Promise<ApiResult<T>> {
    const response = await apiHelper.fetchData(_url(path), options);
    const result: ApiResult<T> = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || errorMessage);
    }
    return result;
  }

  function _jsonOptions(method: string, body?: unknown): RequestInit {
    return {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    };
  }

  // POST /posts -> mengembalikan id postingan yang baru dibuat
  async function postPost(description: string): Promise<number | undefined> {
    const result = await _request<{ post_id?: number }>(
      "/",
      _jsonOptions("POST", { description }),
      "Gagal menambahkan postingan"
    );
    return result.data?.post_id;
  }

  // POST /posts/:id/cover (multipart/form-data)
  async function postPostCover(postId: number | string, cover: File): Promise<string | undefined> {
    const formData = new FormData();
    formData.append("cover", cover, cover.name || "cover.jpg");
    const result = await _request(
      `/${postId}/cover`,
      { method: "POST", body: formData },
      "Gagal mengubah cover"
    );
    return result.message;
  }

  // PUT /posts/:id
  async function putPost(postId: number | string, description: string): Promise<string | undefined> {
    const result = await _request(
      `/${postId}`,
      _jsonOptions("PUT", { description }),
      "Gagal mengubah postingan"
    );
    return result.message;
  }

  // GET /posts, filter postingan milik sendiri dengan { is_me: 1 }
  async function getPosts(filters: PostFilters = {}): Promise<Post[]> {
    const query = apiHelper.buildQuery({ is_me: filters.is_me });
    const result = await _request<{ posts?: Post[] }>(
      `/${query}`,
      { method: "GET" },
      "Gagal mengambil data postingan"
    );
    return result.data?.posts || [];
  }

  // GET /posts/:id
  async function getPostById(postId: number | string): Promise<Post | undefined> {
    const result = await _request<{ post?: Post }>(
      `/${postId}`,
      { method: "GET" },
      "Gagal mengambil detail postingan"
    );
    return result.data?.post;
  }

  // DELETE /posts/:id
  async function deletePost(postId: number | string): Promise<string | undefined> {
    const result = await _request(
      `/${postId}`,
      { method: "DELETE" },
      "Gagal menghapus postingan"
    );
    return result.message;
  }

  // POST /posts/:id/likes, like = 1 (suka) atau 0 (batal suka)
  async function postPostLike(postId: number | string, like: 0 | 1): Promise<string | undefined> {
    const result = await _request(
      `/${postId}/likes`,
      _jsonOptions("POST", { like }),
      "Gagal mengubah status suka"
    );
    return result.message;
  }

  // POST /posts/:id/comments
  async function postPostComment(postId: number | string, comment: string): Promise<string | undefined> {
    const result = await _request(
      `/${postId}/comments`,
      _jsonOptions("POST", { comment }),
      "Gagal menambahkan komentar"
    );
    return result.message;
  }

  // DELETE /posts/:id/comments (menghapus komentar milik pengguna pada postingan tersebut)
  async function deletePostComment(postId: number | string): Promise<string | undefined> {
    const result = await _request(
      `/${postId}/comments`,
      { method: "DELETE" },
      "Gagal menghapus komentar"
    );
    return result.message;
  }

  // DELETE /posts (menghapus seluruh postingan milik pengguna)
  async function deletePosts(): Promise<string | undefined> {
    const result = await _request("/", { method: "DELETE" }, "Gagal menghapus semua postingan");
    return result.message;
  }

  return {
    postPost,
    postPostCover,
    putPost,
    getPosts,
    getPostById,
    deletePost,
    postPostLike,
    postPostComment,
    deletePostComment,
    deletePosts,
  };
})();

export default postApi;