import { describe, it, expect, vi } from "vitest";
import Swal from "sweetalert2";
import {
  showErrorDialog,
  showWarningDialog,
  showSuccessDialog,
  showConfirmDialog,
  formatDate,
  formatShortDate,
  toImageUrl,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn(),
    close: vi.fn(),
  },
}));

const mockedSwal = vi.mocked(Swal);

describe("toolsHelper", () => {
  it("should call Swal.fire for showErrorDialog and handle confirmation", async () => {
    mockedSwal.fire.mockResolvedValue({ isConfirmed: true } as never);
    await showErrorDialog("Error test");
    expect(mockedSwal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Terjadi Kesalahan",
        text: "Error test",
        icon: "error",
      })
    );
    expect(mockedSwal.close).toHaveBeenCalled();

    // Not confirmed branch
    mockedSwal.close.mockClear();
    mockedSwal.fire.mockResolvedValue({ isConfirmed: false } as never);
    await showErrorDialog("Error test");
    expect(mockedSwal.close).not.toHaveBeenCalled();
  });

  it("should call Swal.fire for showWarningDialog", async () => {
    mockedSwal.fire.mockResolvedValue({ isConfirmed: true } as never);
    await showWarningDialog("Warning test");
    expect(mockedSwal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Peringatan",
        text: "Warning test",
        icon: "warning",
      })
    );
  });

  it("should call Swal.fire for showSuccessDialog", async () => {
    mockedSwal.fire.mockResolvedValue({ isConfirmed: true } as never);
    await showSuccessDialog("Success test");
    expect(mockedSwal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Tindakan Berhasil",
        text: "Success test",
        icon: "success",
      })
    );
  });

  it("should call Swal.fire for showConfirmDialog", async () => {
    mockedSwal.fire.mockResolvedValue({ isConfirmed: true } as never);
    const res = await showConfirmDialog("Confirm test?");
    expect(mockedSwal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Konfirmasi",
        text: "Confirm test?",
        icon: "question",
      })
    );
    expect(res.isConfirmed).toBe(true);
  });

  it("should format date correctly or return fallback for empty date", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate(undefined)).toBe("-");
    const formatted = formatDate("2024-10-05T03:07:11.000000Z");
    expect(formatted).toBeTruthy();
    expect(formatted).toContain("2024");
  });

  it("should format short date or return fallback", () => {
    expect(formatShortDate(null)).toBe("-");
    expect(formatShortDate("2024-10-05T03:07:11.000000Z")).toContain("2024");
  });

  it("should resolve image url from relative path or keep absolute url", () => {
    expect(toImageUrl(null)).toBeNull();
    expect(toImageUrl("https://cdn.example.com/a.png")).toBe("https://cdn.example.com/a.png");
    expect(toImageUrl("blob:http://localhost/abc")).toBe("blob:http://localhost/abc");
    expect(toImageUrl("img/posts/cover/1.png")).toBe(
      "https://open-api.delcom.org/img/posts/cover/1.png"
    );
    expect(toImageUrl("/default/img/user.png")).toBe(
      "https://open-api.delcom.org/default/img/user.png"
    );
  });
});