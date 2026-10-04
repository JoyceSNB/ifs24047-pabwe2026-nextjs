import { describe, it, expect, vi, beforeEach } from "vitest";
import userApi from "./userApi";
import apiHelper from "@/helpers/apiHelper";

// Respons tiruan dari fetch: hanya method json() yang dipakai userApi.
function mockResponse(body: unknown) {
  return { json: async () => body } as unknown as Response;
}

describe("userApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getUsers", () => {
    it("should return users array on success", async () => {
      const mockUsers = [{ id: 1, name: "Ubaid" }];
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", data: { users: mockUsers } })
      );

      await expect(userApi.getUsers()).resolves.toEqual(mockUsers);
    });

    it("should return empty array if data.users is empty", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", data: {} })
      );

      await expect(userApi.getUsers()).resolves.toEqual([]);
    });

    it("should accept success flag as an alternative success marker", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ success: true, data: { users: [] } })
      );

      await expect(userApi.getUsers()).resolves.toEqual([]);
    });

    it("should throw error when api status is fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail", message: "Data tidak valid" })
      );

      await expect(userApi.getUsers()).rejects.toThrow("Data tidak valid");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(mockResponse({ status: "fail" }));

      await expect(userApi.getUsers()).rejects.toThrow("Gagal mengambil data pengguna");
    });
  });

  describe("getUserById", () => {
    it("should return user object on success", async () => {
      const mockUser = { id: 2, name: "Abdullah" };
      const fetchSpy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", data: { user: mockUser } })
      );

      await expect(userApi.getUserById(2)).resolves.toEqual(mockUser);
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://open-api.delcom.org/api/v1/users/2",
        expect.objectContaining({ method: "GET" })
      );
    });

    it("should throw error on fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail", message: "User tidak ditemukan" })
      );

      await expect(userApi.getUserById(99)).rejects.toThrow("User tidak ditemukan");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(mockResponse({ status: "fail" }));

      await expect(userApi.getUserById(99)).rejects.toThrow("Gagal mengambil detail pengguna");
    });
  });

  describe("getProfile", () => {
    it("should return profile user object on success", async () => {
      const mockUser = { id: 3, name: "Profile" };
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", data: { user: mockUser } })
      );

      await expect(userApi.getProfile()).resolves.toEqual(mockUser);
    });

    it("should throw error on fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail", message: "Akses ditolak" })
      );

      await expect(userApi.getProfile()).rejects.toThrow("Akses ditolak");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(mockResponse({ status: "fail" }));

      await expect(userApi.getProfile()).rejects.toThrow("Gagal mengambil data profil");
    });
  });

  describe("putProfile", () => {
    it("should return updated user on success", async () => {
      const mockUser = { id: 1, name: "Baru", email: "baru@del.ac.id" };
      const fetchSpy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", data: { user: mockUser } })
      );

      await expect(userApi.putProfile("Baru", "baru@del.ac.id")).resolves.toEqual(mockUser);
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://open-api.delcom.org/api/v1/users/me",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ name: "Baru", email: "baru@del.ac.id" }),
        })
      );
    });

    it("should throw error on fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail", message: "Email sudah dipakai" })
      );

      await expect(userApi.putProfile("A", "a@del.ac.id")).rejects.toThrow("Email sudah dipakai");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(mockResponse({ status: "fail" }));

      await expect(userApi.putProfile("A", "a@del.ac.id")).rejects.toThrow("Gagal mengubah profil");
    });
  });

  describe("postProfilePhoto", () => {
    it("should upload the photo and return message", async () => {
      const fetchSpy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", message: "Berhasil mengubah photo profile" })
      );
      const file = new File(["img"], "avatar.png", { type: "image/png" });

      await expect(userApi.postProfilePhoto(file)).resolves.toBe("Berhasil mengubah photo profile");

      const options = fetchSpy.mock.calls[0][1] as RequestInit;
      expect(options.method).toBe("PUT");
      expect((options.body as FormData).get("photo")).toBeInstanceOf(File);
    });

    it("should use a default file name when the file has no name", async () => {
      const fetchSpy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", message: "OK" })
      );
      const file = new File(["img"], "", { type: "image/png" });

      await userApi.postProfilePhoto(file);

      const options = fetchSpy.mock.calls[0][1] as RequestInit;
      expect(((options.body as FormData).get("photo") as File).name).toBe("profile.png");
    });

    it("should throw error on fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail", message: "Foto terlalu besar" })
      );
      const file = new File(["img"], "avatar.png", { type: "image/png" });

      await expect(userApi.postProfilePhoto(file)).rejects.toThrow("Foto terlalu besar");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(mockResponse({ status: "fail" }));
      const file = new File(["img"], "avatar.png", { type: "image/png" });

      await expect(userApi.postProfilePhoto(file)).rejects.toThrow("Gagal mengubah foto profil");
    });
  });

  describe("putProfilePassword", () => {
    it("should send the confirmation as given and return message", async () => {
      const fetchSpy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", message: "Berhasil mengubah kata sandi" })
      );

      await expect(userApi.putProfilePassword("lama", "baru123", "baru123")).resolves.toBe(
        "Berhasil mengubah kata sandi"
      );
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://open-api.delcom.org/api/v1/users/password",
        expect.objectContaining({
          body: JSON.stringify({
            password: "lama",
            new_password: "baru123",
            new_password_confirmation: "baru123",
          }),
        })
      );
    });

    it("should reuse the new password as confirmation when it is not given", async () => {
      const fetchSpy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", message: "OK" })
      );

      await userApi.putProfilePassword("lama", "baru123");

      const options = fetchSpy.mock.calls[0][1] as RequestInit;
      expect(JSON.parse(options.body as string).new_password_confirmation).toBe("baru123");
    });

    it("should throw error on fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail", message: "Kata sandi lama salah" })
      );

      await expect(userApi.putProfilePassword("x", "baru123")).rejects.toThrow(
        "Kata sandi lama salah"
      );
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(mockResponse({ status: "fail" }));

      await expect(userApi.putProfilePassword("x", "baru123")).rejects.toThrow(
        "Gagal mengubah kata sandi"
      );
    });
  });
});