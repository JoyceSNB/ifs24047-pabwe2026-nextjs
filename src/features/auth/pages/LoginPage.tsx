"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { IconMail, IconLock, IconLoader2, IconLogin } from "@tabler/icons-react";
import useInput from "@/hooks/useInput";
import { useAppDispatch } from "@/hooks/redux";
import apiHelper from "@/helpers/apiHelper";
import { asyncSetProfile } from "@/features/users/states/action";
import { asyncSetIsAuthLogin, setIsAuthLoginActionCreator } from "../states/action";

const inputClass =
  "w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-700 transition-all";
const labelClass = "block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5";

function LoginPage() {
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [email, onEmailChange] = useInput("");
  const [password, onPasswordChange] = useInput("");

  // Alur login: kirim kredensial, jika token tersimpan muat profil pengguna.
  // Pengalihan ke dashboard dilakukan oleh AuthLayout begitu profil tersedia.
  async function onSubmitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      await dispatch(asyncSetIsAuthLogin(email, password));
      if (apiHelper.getAccessToken()) {
        await dispatch(asyncSetProfile());
      }
    } catch {
      // Kesalahan login sudah ditampilkan oleh action
    } finally {
      dispatch(setIsAuthLoginActionCreator(false));
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-slate-800 tracking-tight">
        Selamat datang kembali
      </h1>
      <p className="mt-1 mb-6 text-sm text-slate-600">Masuk untuk melihat linimasa postingan.</p>

      <form onSubmit={onSubmitHandler} className="space-y-4">
        <div>
          <label htmlFor="login-email-input" className={labelClass}>
            Alamat Email
          </label>
          <div className="relative">
            <IconMail
              size={18}
              aria-hidden="true"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="email"
              id="login-email-input"
              data-testid="login-email-input"
              autoComplete="email"
              value={email}
              onChange={onEmailChange}
              placeholder="nama@email.com"
              className={inputClass}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="login-password-input" className={labelClass}>
            Kata Sandi
          </label>
          <div className="relative">
            <IconLock
              size={18}
              aria-hidden="true"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="password"
              id="login-password-input"
              data-testid="login-password-input"
              autoComplete="current-password"
              value={password}
              onChange={onPasswordChange}
              placeholder="••••••••"
              className={inputClass}
              required
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            id="login-submit-button"
            data-testid="login-submit-button"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-900 rounded-xl shadow-md shadow-indigo-700/25 transition-all disabled:opacity-60"
          >
            {loading ? (
              <>
                <IconLoader2 size={18} className="animate-spin" />
                <span>Sedang Masuk...</span>
              </>
            ) : (
              <>
                <IconLogin size={18} stroke={2.5} />
                <span>Masuk Sekarang</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;