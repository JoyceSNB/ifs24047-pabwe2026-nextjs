import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-100 p-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-bold text-indigo-700">Kesalahan 404</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-slate-900">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-3 text-slate-600">
          Alamat yang kamu buka tidak ada atau sudah dipindahkan.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-xl transition-colors"
        >
          Kembali ke beranda
        </Link>
      </div>
    </main>
  );
}