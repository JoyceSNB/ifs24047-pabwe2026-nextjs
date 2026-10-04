"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useStore } from "react-redux";
import {
  IconUser,
  IconCamera,
  IconCheck,
  IconLoader2,
  IconShieldLock,
} from "@tabler/icons-react";
import Avatar from "@/components/Avatar";
import useInput from "@/hooks/useInput";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { showErrorDialog } from "@/helpers/toolsHelper";
import type { RootState } from "@/store";
import type { User } from "@/types";
import {
  asyncPutProfile,
  asyncPostProfilePhoto,
  asyncPutProfilePassword,
  setIsChangeProfilePasswordActionCreator,
} from "../states/action";

const MAX_PHOTO_SIZE = 3 * 1024 * 1024;

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-700 transition-all";
const labelClass = "block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5";
const cardClass =
  "bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5";

// Kartu ringkasan profil + unggah foto
function ProfileSummary({ profile }: { profile: User }) {
  const dispatch = useAppDispatch();
  const [loadingPhoto, setLoadingPhoto] = useState(false);

  async function handlePhotoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showErrorDialog("Pilih file gambar yang valid!");
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      showErrorDialog("Ukuran file foto maksimal 3MB!");
      return;
    }

    setLoadingPhoto(true);
    try {
      await dispatch(asyncPostProfilePhoto(file));
    } finally {
      setLoadingPhoto(false);
    }
  }

  return (
    <section
      aria-label="Ringkasan profil"
      className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-6"
    >
      <div className="relative">
        <Avatar name={profile.name} photo={profile.photo} size={96} className="ring-4 ring-indigo-100" />

        <label
          data-testid="upload-profile-photo-btn"
          className="absolute bottom-0 right-0 p-2 rounded-full bg-indigo-700 hover:bg-indigo-800 text-white shadow-md cursor-pointer transition-transform hover:scale-105 focus-within:ring-2 focus-within:ring-indigo-700 focus-within:ring-offset-2"
        >
          {loadingPhoto ? (
            <IconLoader2 size={16} aria-hidden="true" className="animate-spin" />
          ) : (
            <IconCamera size={16} aria-hidden="true" />
          )}
          <span className="sr-only">Ubah foto profil</span>
          <input
            type="file"
            id="profile-photo-file-input"
            name="photo"
            data-testid="profile-photo-file-input"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="sr-only"
          />
        </label>
      </div>

      <div className="text-center sm:text-left space-y-1">
        <h2 className="text-xl font-bold text-slate-800">{profile.name}</h2>
        <p className="text-sm text-slate-600">{profile.email}</p>
        <div className="pt-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200/60">
            <IconCheck size={14} aria-hidden="true" /> Terverifikasi
          </span>
        </div>
      </div>
    </section>
  );
}

// Formulir ubah nama dan email. Nilai awal diambil dari profil saat formulir dibuat.
function BiodataForm({ profile }: { profile: User }) {
  const dispatch = useAppDispatch();
  const [name, onNameChange] = useInput(profile.name || "");
  const [email, onEmailChange] = useInput(profile.email || "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      showErrorDialog("Nama tidak boleh kosong!");
      return;
    }
    if (!email.trim()) {
      showErrorDialog("Email tidak boleh kosong!");
      return;
    }

    setLoading(true);
    try {
      await dispatch(asyncPutProfile(name.trim(), email.trim()));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section aria-labelledby="profile-form-title" className={cardClass}>
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
          <IconUser size={18} aria-hidden="true" />
        </div>
        <h2 id="profile-form-title" className="font-bold text-slate-800">
          Ubah Biodata
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="profile-name-input" className={labelClass}>
            Nama Lengkap
          </label>
          <input
            id="profile-name-input"
            type="text"
            data-testid="profile-name-input"
            autoComplete="name"
            value={name}
            onChange={onNameChange}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="profile-email-input" className={labelClass}>
            Alamat Email
          </label>
          <input
            id="profile-email-input"
            type="email"
            data-testid="profile-email-input"
            autoComplete="email"
            value={email}
            onChange={onEmailChange}
            className={inputClass}
            required
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            data-testid="submit-profile-btn"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-900 rounded-xl shadow-md shadow-indigo-700/25 transition-all disabled:opacity-60"
          >
            {loading ? (
              <>
                <IconLoader2 size={18} className="animate-spin" />
                <span>Menyimpan Perubahan...</span>
              </>
            ) : (
              <span>Simpan Perubahan</span>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}

// Formulir ganti kata sandi. Kolom dikosongkan hanya jika penggantian berhasil.
function PasswordForm() {
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();
  const [oldPassword, onOldPasswordChange, setOldPassword] = useInput("");
  const [newPassword, onNewPasswordChange, setNewPassword] = useInput("");
  const [confirmation, onConfirmationChange, setConfirmation] = useInput("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!oldPassword) {
      showErrorDialog("Kata sandi lama wajib diisi!");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showErrorDialog("Kata sandi baru minimal 6 karakter!");
      return;
    }
    if (newPassword !== confirmation) {
      showErrorDialog("Konfirmasi kata sandi tidak cocok!");
      return;
    }

    setLoading(true);
    try {
      await dispatch(asyncPutProfilePassword(oldPassword, newPassword, confirmation));
      if (store.getState().isChangeProfilePassword) {
        dispatch(setIsChangeProfilePasswordActionCreator(false));
        setOldPassword("");
        setNewPassword("");
        setConfirmation("");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section aria-labelledby="password-form-title" className={cardClass}>
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
          <IconShieldLock size={18} aria-hidden="true" />
        </div>
        <h2 id="password-form-title" className="font-bold text-slate-800">
          Keamanan &amp; Kata Sandi
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="current-password-input" className={labelClass}>
            Kata Sandi Saat Ini
          </label>
          <input
            id="current-password-input"
            type="password"
            data-testid="current-password-input"
            autoComplete="current-password"
            value={oldPassword}
            onChange={onOldPasswordChange}
            placeholder="••••••"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="new-password-input" className={labelClass}>
            Kata Sandi Baru
          </label>
          <input
            id="new-password-input"
            type="password"
            data-testid="new-password-input"
            autoComplete="new-password"
            value={newPassword}
            onChange={onNewPasswordChange}
            placeholder="Minimal 6 karakter"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="confirm-password-input" className={labelClass}>
            Ulangi Kata Sandi Baru
          </label>
          <input
            id="confirm-password-input"
            type="password"
            data-testid="confirm-password-input"
            autoComplete="new-password"
            value={confirmation}
            onChange={onConfirmationChange}
            placeholder="Konfirmasi kata sandi"
            className={inputClass}
            required
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            data-testid="submit-password-btn"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl shadow-md transition-all disabled:opacity-60"
          >
            {loading ? (
              <>
                <IconLoader2 size={18} className="animate-spin" />
                <span>Memperbarui Kata Sandi...</span>
              </>
            ) : (
              <span>Perbarui Kata Sandi</span>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}

function ProfilePage() {
  const profile = useAppSelector((state) => state.profile);

  if (!profile) {
    return (
      <div role="status" className="flex flex-col items-center justify-center py-24">
        <h1 className="sr-only">Profil Akun</h1>
        <IconLoader2 size={36} className="text-indigo-700 animate-spin mb-2" />
        <p className="text-sm font-medium text-slate-600">Memuat data profil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Profil Akun
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Kelola informasi identitas, foto profil, dan keamanan akun Anda.
        </p>
      </div>

      <ProfileSummary profile={profile} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BiodataForm key={profile.id} profile={profile} />
        <PasswordForm />
      </div>
    </div>
  );
}

export default ProfilePage;