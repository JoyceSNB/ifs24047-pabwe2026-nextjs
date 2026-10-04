import { describe, it, expect, vi, beforeEach } from "vitest";
import authApi from "./authApi";
import apiHelper from "@/helpers/apiHelper";

// Respons tiruan dari fetch: hanya method json() yang dipakai authApi.
function mockResponse(body: unknown) {
  return { json: async () => body } as unknown as Response;
}

describe("authApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("postRegister", () => {
    it("should return message on success response", async () => {
      const fetchSpy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", message: "Berhasil melakukan pendaftaran" })
      );

      const message = await authApi.postRegister("Delcom", "delcom@org.id", "123456");

      expect(message).toBe("Berhasil melakukan pendaftaran");
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://open-api.delcom.org/api/v1/auth/register",
        expect.objectContaining({ method: "POST" })
      );
    });

    it("should accept success flag as an alternative success marker", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ success: true, message: "OK" })
      );

      await expect(authApi.postRegister("Delcom", "delcom@org.id", "123456")).resolves.toBe("OK");
    });

    it("should throw error when api returns fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail", message: "Data tidak valid" })
      );

      await expect(
        authApi.postRegister("Delcom", "delcom@org.id", "123456")
      ).rejects.toThrow("Data tidak valid");
    });

    it("should use default fallback message when message is missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(mockResponse({ status: "fail" }));

      await expect(
        authApi.postRegister("Delcom", "delcom@org.id", "123456")
      ).rejects.toThrow("Gagal melakukan pendaftaran");
    });

    it("should handle when data object has no error messages", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail", message: "Data tidak valid", data: {} })
      );

      await expect(
        authApi.postRegister("Delcom", "delcom@org.id", "123")
      ).rejects.toThrow("Data tidak valid");
    });

    it("should format detailed validation errors when present", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({
          status: "fail",
          message: "Data tidak valid",
          data: { email: ["Email sudah terdaftar."] },
        })
      );

      await expect(
        authApi.postRegister("Delcom", "delcom@org.id", "123")
      ).rejects.toThrow("Data tidak valid: Email sudah terdaftar.");
    });
  });

  describe("postLogin", () => {
    it("should return data on success response", async () => {
      const mockData = { token: "fake-jwt" };
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", data: mockData })
      );

      const data = await authApi.postLogin("test@delcom.org", "123456");
      expect(data).toEqual(mockData);
    });

    it("should throw error when login fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail", message: "Kredensial akun tidak ditemukan" })
      );

      await expect(
        authApi.postLogin("wrong@delcom.org", "wrong")
      ).rejects.toThrow("Kredensial akun tidak ditemukan");
    });

    it("should use default fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(mockResponse({ status: "fail" }));

      await expect(authApi.postLogin("wrong@delcom.org", "wrong")).rejects.toThrow("Gagal login");
    });
  });

  describe("postLogout", () => {
    it("should return message on success logout", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", message: "Berhasil logout" })
      );

      const message = await authApi.postLogout();
      expect(message).toBe("Berhasil logout");
    });

    it("should throw error when logout fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail", message: "Token tidak sah" })
      );

      await expect(authApi.postLogout()).rejects.toThrow("Token tidak sah");
    });

    it("should use default fallback message when missing on logout failure", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(mockResponse({ status: "fail" }));

      await expect(authApi.postLogout()).rejects.toThrow("Gagal logout");
    });
  });
});