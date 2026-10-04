"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IconMessageCircle2, IconHeart } from "@tabler/icons-react";
import apiHelper from "@/helpers/apiHelper";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { asyncSetProfile, setIsProfile } from "@/features/users/states/action";

const tabBase = "flex-1 py-2 text-center text-sm font-semibold rounded-xl transition-all";
const tabActive = "bg-white text-indigo-800 shadow-xs";
const tabIdle = "text-slate-600 hover:text-slate-900";

function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const profile = useAppSelector((state) => state.profile);
  const isProfile = useAppSelector((state) => state.isProfile);

  // Jika token tersimpan, coba muat profil untuk mengecek sesi
  useEffect(() => {
    const authToken = apiHelper.getAccessToken();
    if (authToken) {
      dispatch(asyncSetProfile());
    }
  }, [dispatch]);

  // Pengguna yang sudah login dialihkan ke dashboard
  useEffect(() => {
    if (isProfile) {
      dispatch(setIsProfile(false));
      if (profile) {
        router.replace("/");
      }
    }
  }, [isProfile, profile, dispatch, router]);

  const isLoginActive = pathname === "/auth/login";

  return (
    <div className="min-h-screen bg-stone-100 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Banner visual (desktop) */}
      <aside
        data-testid="auth-banner"
        className="hidden lg:flex relative overflow-hidden bg-indigo-900 text-indigo-50 flex-col justify-between p-12"
      >
        <div className="relative z-10 max-w-sm">
          <p className="text-indigo-200 text-sm font-semibold">Delcom Posts</p>
          <p className="mt-4 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-white">
            Bagikan cerita singkatmu.
          </p>
          <p className="mt-5 text-indigo-100/90 leading-relaxed">
            Tulis postingan, tambahkan foto sampul, lalu dapatkan suka dan komentar dari
            teman-temanmu.
          </p>
        </div>

        {/* Ilustrasi kartu postingan */}
        <div aria-hidden="true" className="relative h-64">
          <div className="absolute left-6 bottom-6 w-60 rotate-[-6deg] rounded-2xl bg-white text-slate-800 p-5 shadow-2xl shadow-black/30">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-indigo-700" />
              <span className="h-2 w-20 rounded-full bg-slate-200" />
            </div>
            <div className="mt-4 h-2 w-full rounded-full bg-slate-200" />
            <div className="mt-2 h-2 w-3/4 rounded-full bg-slate-200" />
            <div className="mt-5 flex items-center gap-1.5 text-rose-600 text-sm font-bold">
              <IconHeart size={18} fill="currentColor" /> 128
            </div>
          </div>
          <div className="absolute left-64 bottom-24 w-52 rotate-[7deg] rounded-2xl bg-amber-300 text-indigo-950 p-5 shadow-2xl shadow-black/30">
            <p className="font-display text-xl font-extrabold">Halo, dunia!</p>
            <div className="mt-3 h-2 w-24 rounded-full bg-indigo-950/25" />
            <div className="mt-5 flex items-center gap-1.5 text-sm font-bold">
              <IconMessageCircle2 size={18} /> 24 komentar
            </div>
          </div>
        </div>
      </aside>

      {/* Kontainer form */}
      <main className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-16">
        <div className="w-full max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-700 text-white flex items-center justify-center">
              <IconMessageCircle2 size={24} stroke={2.25} />
            </div>
            <div>
              <p className="font-display text-2xl font-extrabold text-slate-800 tracking-tight">
                Delcom Posts
              </p>
              <p className="text-sm text-slate-600">Berbagi cerita dan foto</p>
            </div>
          </div>

          <div className="mt-8 bg-white py-8 px-6 sm:px-8 rounded-3xl border border-slate-200/80 shadow-sm">
            {/* Tab */}
            <nav aria-label="Autentikasi" className="flex rounded-2xl bg-slate-100 p-1 mb-6">
              <Link
                href="/auth/login"
                aria-current={isLoginActive ? "page" : undefined}
                className={`${tabBase} ${isLoginActive ? tabActive : tabIdle}`}
              >
                Masuk Akun
              </Link>
              <Link
                href="/auth/register"
                aria-current={!isLoginActive ? "page" : undefined}
                className={`${tabBase} ${!isLoginActive ? tabActive : tabIdle}`}
              >
                Daftar Baru
              </Link>
            </nav>

            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;