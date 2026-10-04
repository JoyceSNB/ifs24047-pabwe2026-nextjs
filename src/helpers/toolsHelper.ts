import type { SweetAlertOptions, SweetAlertResult } from "sweetalert2";
import { DELCOM_BASEURL } from "@/lib/config";

// SweetAlert2 dimuat saat dialog pertama kali dibutuhkan (lazy load),
// supaya tidak memperbesar JavaScript awal halaman.
let swalPromise: Promise<typeof import("sweetalert2").default> | null = null;

function loadSwal() {
  if (!swalPromise) {
    swalPromise = import("sweetalert2").then((module) => module.default);
  }
  return swalPromise;
}

async function showInfoDialog(options: SweetAlertOptions): Promise<SweetAlertResult> {
  const Swal = await loadSwal();
  const result = await Swal.fire({ confirmButtonText: "Tutup", ...options });
  if (result.isConfirmed) {
    Swal.close();
  }
  return result;
}

export function showErrorDialog(message: string) {
  return showInfoDialog({
    title: "Terjadi Kesalahan",
    text: message,
    icon: "error",
    confirmButtonColor: "#ef4444",
  });
}

export function showWarningDialog(message: string) {
  return showInfoDialog({
    title: "Peringatan",
    text: message,
    icon: "warning",
    confirmButtonColor: "#f59e0b",
  });
}

export function showSuccessDialog(message: string) {
  return showInfoDialog({
    title: "Tindakan Berhasil",
    text: message,
    icon: "success",
    confirmButtonColor: "#10b981",
  });
}

export async function showConfirmDialog(message: string): Promise<SweetAlertResult> {
  const Swal = await loadSwal();
  return Swal.fire({
    title: "Konfirmasi",
    text: message,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Tidak",
    confirmButtonColor: "#0f766e",
    cancelButtonColor: "#64748b",
  });
}

export function formatDate(date?: string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Format tanggal pendek untuk kartu, contoh: "5 Okt 2024"
export function formatShortDate(date?: string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// API bisa mengembalikan path relatif (img/posts/cover/..., default/img/user.png)
// atau URL penuh. Path relatif diarahkan ke server Delcom: alamat dasarnya diambil dari
// NEXT_PUBLIC_DELCOM_BASEURL (berkas .env) tanpa bagian "/api/v1".
export function toImageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^(https?:|blob:|data:)/i.test(path)) return path;
  const origin = DELCOM_BASEURL.replace(/\/api\/v\d+\/?$/, "");
  return `${origin}/${path.replace(/^\/+/, "")}`;
}