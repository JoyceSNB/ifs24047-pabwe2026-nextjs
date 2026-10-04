"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import apiHelper from "@/helpers/apiHelper";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { asyncSetProfile, setIsProfile } from "@/features/users/states/action";
import { asyncSetIsAuthLogout, setIsAuthLogoutActionCreator } from "@/features/auth/states/action";
import NavbarComponent from "../components/NavbarComponent";
import SidebarComponent from "../components/SidebarComponent";

function PostLayout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const profile = useAppSelector((state) => state.profile);
  const isProfile = useAppSelector((state) => state.isProfile);
  const isAuthLogout = useAppSelector((state) => state.isAuthLogout);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Route guard 1: tanpa token langsung ke halaman login, dengan token muat profil
  useEffect(() => {
    const authToken = apiHelper.getAccessToken();
    if (authToken) {
      dispatch(asyncSetProfile());
    } else {
      router.replace("/auth/login");
    }
  }, [dispatch, router]);

  // Route guard 2: token tidak valid (profil gagal dimuat) -> hapus token, ke login
  useEffect(() => {
    if (isProfile) {
      dispatch(setIsProfile(false));
      if (!profile) {
        apiHelper.putAccessToken("");
        router.replace("/auth/login");
      }
    }
  }, [isProfile, profile, dispatch, router]);

  // Setelah logout kembali ke halaman login
  useEffect(() => {
    if (isAuthLogout) {
      dispatch(setIsAuthLogoutActionCreator(false));
      router.replace("/auth/login");
    }
  }, [isAuthLogout, dispatch, router]);

  function handleLogout() {
    dispatch(asyncSetIsAuthLogout());
  }

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-stone-100">
        <h1 className="sr-only">Delcom Posts</h1>
        <div className="flex flex-col items-center gap-3" role="status">
          <div className="w-10 h-10 border-4 border-indigo-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600">Memeriksa sesi masuk...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 text-slate-800">
      <NavbarComponent
        profile={profile}
        handleLogout={handleLogout}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      <SidebarComponent isSidebarOpen={isSidebarOpen} onCloseMobile={() => setIsSidebarOpen(false)} />

      <main className="pt-16 md:pl-64">
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

export default PostLayout;