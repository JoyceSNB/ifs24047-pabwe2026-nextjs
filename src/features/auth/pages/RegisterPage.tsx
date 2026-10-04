"use client";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { IconUser, IconMail, IconLock, IconLoader2, IconUserPlus } from "@tabler/icons-react";
import useInput from "@/hooks/useInput";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { asyncSetIsAuthRegister, setIsAuthRegisterActionCreator } from "../states/action";

const inputClass =
  "w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-700 transition-all";
const labelClass = "block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5";
const iconClass = "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500";

function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const isAuthRegister = useAppSelector((state) => state.isAuthRegister);

  const [loading, setLoading] = useState(false);
  const [name, onChangeName] = useInput("");
  const [email, onChangeEmail] = useInput("");
  const [password, onChangePassword] = useInput("");

  // Setelah pendaftaran berhasil, pindah ke halaman login (formulir ikut dibersihkan
  // karena halaman ini dilepas).
  useEffect(() => {
    if (isAuthRegister === true) {
      dispatch(setIsAuthRegisterActionCreator(false));
      router.push("/auth/login");
    }
  }, [isAuthRegister, dispatch, router]);

  async function onSubmitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      await dispatch(asyncSetIsAuthRegister(name, email, password));
    } catch {
      // Kesalahan sudah ditampilkan oleh action; di sini cukup menghentikan loading
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-slate-800 tracking-tight">
        Buat akun baru
      </h1>
      <p className="mt-1 mb-6 text-sm text-slate-600">Daftar gratis dan mulai berbagi postingan.</p>

      <form onSubmit={onSubmitHandler} className="space-y-4">
        <div>
          <label htmlFor="register-name-input" className={labelClass}>
            Nama Lengkap
          </label>
          <div className="relative">
            <IconUser size={18} aria-hidden="true" className={iconClass} />
            <input
              id="register-name-input"
              type="text"
              data-testid="register-name-input"
              autoComplete="name"
              value={name}
              onChange={onChangeName}
              placeholder="Nama lengkap Anda"
              className={inputClass}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="register-email-input" className={labelClass}>
            Alamat Email
          </label>
          <div className="relative">
            <IconMail size={18} aria-hidden="true" className={iconClass} />
            <input
              id="register-email-input"
              type="email"
              data-testid="register-email-input"
              autoComplete="email"
              value={email}
              onChange={onChangeEmail}
              placeholder="nama@email.com"
              className={inputClass}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="register-password-input" className={labelClass}>
            Kata Sandi
          </label>
          <div className="relative">
            <IconLock size={18} aria-hidden="true" className={iconClass} />
            <input
              id="register-password-input"
              type="password"
              data-testid="register-password-input"
              autoComplete="new-password"
              value={password}
              onChange={onChangePassword}
              placeholder="Minimal 6 karakter"
              className={inputClass}
              required
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            data-testid="register-submit-button"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-900 rounded-xl shadow-md shadow-indigo-700/25 transition-all disabled:opacity-60"
          >
            {loading ? (
              <>
                <IconLoader2 size={18} className="animate-spin" />
                <span>Mendaftarkan Akun...</span>
              </>
            ) : (
              <>
                <IconUserPlus size={18} stroke={2.5} />
                <span>Daftar Akun</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage;