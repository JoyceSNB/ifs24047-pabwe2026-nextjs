// Konfigurasi terpusat aplikasi. Nilai dibaca dari berkas .env:
//   NEXT_PUBLIC_DELCOM_BASEURL=https://open-api.delcom.org/api/v1
//   APP_PORT=3000
// Variabel berawalan NEXT_PUBLIC_ ditanamkan Next.js ke kode browser saat build.
export const DELCOM_BASEURL: string =
  process.env.NEXT_PUBLIC_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1";

export const APP_PORT: number = Number(process.env.APP_PORT) || 3000;