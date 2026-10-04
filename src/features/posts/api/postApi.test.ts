import { describe, it, expect, vi, beforeEach } from "vitest";
import postApi from "./postApi";
import apiHelper from "@/helpers/apiHelper";

const BASE = "https://open-api.delcom.org/api/v1/posts";

// Respons tiruan dari fetch: hanya method json() yang dipakai postApi.
function mockResponse(body: unknown) {
  return { json: async () => body } as unknown as Response;
}

function mockFetch(body: unknown) {
  return vi.spyOn(apiHelper, "fetchData").mockResolvedValue(mockResponse(body));
}

describe("postApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("postPost", () => {
    it("should send description and return the new post id", async () => {
      const fetchSpy = mockFetch({ status: "success", data: { post_id: 6 } });

      await expect(postApi.postPost("Halo")).resolves.toBe(6);

      expect(fetchSpy).toHaveBeenCalledWith(
        `${BASE}/`,
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: "Halo" }),
        })
      );
    });

    it("should return undefined when the response has no data", async () => {
      mockFetch({ status: "success" });
      await expect(postApi.postPost("Halo")).resolves.toBeUndefined();
    });
  });

  describe("postPostCover", () => {
    it("should upload the cover as multipart form data", async () => {
      const fetchSpy = mockFetch({ status: "success", message: "Berhasil mengubah cover" });
      const file = new File(["img"], "foto.png", { type: "image/png" });

      await expect(postApi.postPostCover(3, file)).resolves.toBe("Berhasil mengubah cover");

      const [url, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(`${BASE}/3/cover`);
      expect(options.method).toBe("POST");
      expect((options.body as FormData).get("cover")).toBeInstanceOf(File);
    });

    it("should use a default file name when the file has no name", async () => {
      const fetchSpy = mockFetch({ status: "success", message: "OK" });
      const file = new File(["img"], "", { type: "image/png" });

      await postApi.postPostCover(3, file);

      const options = fetchSpy.mock.calls[0][1] as RequestInit;
      expect(((options.body as FormData).get("cover") as File).name).toBe("cover.jpg");
    });
  });

  describe("putPost", () => {
    it("should update the description", async () => {
      const fetchSpy = mockFetch({ status: "success", message: "Berhasil mengubah data" });

      await expect(postApi.putPost(4, "Baru")).resolves.toBe("Berhasil mengubah data");

      expect(fetchSpy).toHaveBeenCalledWith(
        `${BASE}/4`,
        expect.objectContaining({ method: "PUT", body: JSON.stringify({ description: "Baru" }) })
      );
    });
  });

  describe("getPosts", () => {
    it("should return all posts without a query", async () => {
      const fetchSpy = mockFetch({ status: "success", data: { posts: [{ id: 1 }] } });

      await expect(postApi.getPosts()).resolves.toEqual([{ id: 1 }]);

      expect(fetchSpy).toHaveBeenCalledWith(`${BASE}/`, expect.objectContaining({ method: "GET" }));
    });

    it("should request only my posts with is_me=1", async () => {
      const fetchSpy = mockFetch({ status: "success", data: { posts: [] } });

      await postApi.getPosts({ is_me: 1 });

      expect(fetchSpy).toHaveBeenCalledWith(`${BASE}/?is_me=1`, expect.any(Object));
    });

    it("should return an empty list when data.posts is missing", async () => {
      mockFetch({ status: "success", data: {} });
      await expect(postApi.getPosts()).resolves.toEqual([]);
    });
  });

  describe("getPostById", () => {
    it("should return the post detail", async () => {
      const fetchSpy = mockFetch({ status: "success", data: { post: { id: 5 } } });

      await expect(postApi.getPostById(5)).resolves.toEqual({ id: 5 });

      expect(fetchSpy).toHaveBeenCalledWith(`${BASE}/5`, expect.objectContaining({ method: "GET" }));
    });
  });

  describe("deletePost", () => {
    it("should delete a post", async () => {
      const fetchSpy = mockFetch({ status: "success", message: "Berhasil menghapus data" });

      await expect(postApi.deletePost(5)).resolves.toBe("Berhasil menghapus data");

      expect(fetchSpy).toHaveBeenCalledWith(`${BASE}/5`, expect.objectContaining({ method: "DELETE" }));
    });
  });

  describe("postPostLike", () => {
    it("should send like and unlike values", async () => {
      const fetchSpy = mockFetch({ status: "success", message: "OK" });

      await postApi.postPostLike(2, 1);
      await postApi.postPostLike(2, 0);

      expect(fetchSpy).toHaveBeenNthCalledWith(
        1,
        `${BASE}/2/likes`,
        expect.objectContaining({ method: "POST", body: JSON.stringify({ like: 1 }) })
      );
      expect(fetchSpy).toHaveBeenNthCalledWith(
        2,
        `${BASE}/2/likes`,
        expect.objectContaining({ body: JSON.stringify({ like: 0 }) })
      );
    });
  });

  describe("postPostComment", () => {
    it("should send the comment text", async () => {
      const fetchSpy = mockFetch({ status: "success", message: "OK" });

      await postApi.postPostComment(2, "Keren!");

      expect(fetchSpy).toHaveBeenCalledWith(
        `${BASE}/2/comments`,
        expect.objectContaining({ method: "POST", body: JSON.stringify({ comment: "Keren!" }) })
      );
    });
  });

  describe("deletePostComment", () => {
    it("should delete my comment on a post", async () => {
      const fetchSpy = mockFetch({ status: "success", message: "OK" });

      await postApi.deletePostComment(2);

      expect(fetchSpy).toHaveBeenCalledWith(
        `${BASE}/2/comments`,
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  describe("deletePosts", () => {
    it("should delete all my posts", async () => {
      const fetchSpy = mockFetch({ status: "success", message: "Berhasil menghapus semua data postingan" });

      await expect(postApi.deletePosts()).resolves.toBe("Berhasil menghapus semua data postingan");

      expect(fetchSpy).toHaveBeenCalledWith(`${BASE}/`, expect.objectContaining({ method: "DELETE" }));
    });
  });

  describe("error handling", () => {
    const cases: Array<[string, () => Promise<unknown>, string]> = [
      ["postPost", () => postApi.postPost("x"), "Gagal menambahkan postingan"],
      ["postPostCover", () => postApi.postPostCover(1, new File(["a"], "a.png")), "Gagal mengubah cover"],
      ["putPost", () => postApi.putPost(1, "x"), "Gagal mengubah postingan"],
      ["getPosts", () => postApi.getPosts(), "Gagal mengambil data postingan"],
      ["getPostById", () => postApi.getPostById(1), "Gagal mengambil detail postingan"],
      ["deletePost", () => postApi.deletePost(1), "Gagal menghapus postingan"],
      ["postPostLike", () => postApi.postPostLike(1, 1), "Gagal mengubah status suka"],
      ["postPostComment", () => postApi.postPostComment(1, "x"), "Gagal menambahkan komentar"],
      ["deletePostComment", () => postApi.deletePostComment(1), "Gagal menghapus komentar"],
      ["deletePosts", () => postApi.deletePosts(), "Gagal menghapus semua postingan"],
    ];

    it.each(cases)("%s should throw the api message when it fails", async (_name, call) => {
      mockFetch({ status: "fail", message: "Pesan dari server" });
      await expect(call()).rejects.toThrow("Pesan dari server");
    });

    it.each(cases)("%s should throw a fallback message when the api gives none", async (_name, call, fallback) => {
      mockFetch({ status: "fail" });
      await expect(call()).rejects.toThrow(fallback);
    });

    it("should accept the success flag as an alternative success marker", async () => {
      mockFetch({ success: true, message: "OK" });
      await expect(postApi.deletePost(1)).resolves.toBe("OK");
    });
  });
});