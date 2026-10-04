"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconMessageCircle2,
  IconUser,
  IconLogout,
  IconChevronDown,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";
import Avatar from "@/components/Avatar";
import type { User } from "@/types";

interface NavbarProps {
  profile: User;
  handleLogout: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

function NavbarComponent({ profile, handleLogout, onToggleSidebar, isSidebarOpen }: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Tutup dropdown saat klik di luar area
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="w-full h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-testid="toggle-sidebar-btn"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            aria-label={isSidebarOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={isSidebarOpen}
          >
            {isSidebarOpen ? <IconX size={20} /> : <IconMenu2 size={20} />}
          </button>

          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-indigo-700 text-white flex items-center justify-center">
              <IconMessageCircle2 size={20} stroke={2.25} />
            </span>
            <span className="font-display text-base sm:text-lg font-extrabold tracking-tight text-slate-800 whitespace-nowrap">
              Delcom Posts
            </span>
          </Link>
        </div>

        {/* Dropdown profil */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            data-testid="profile-dropdown-button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-haspopup="menu"
            aria-expanded={dropdownOpen}
            className="flex items-center gap-2.5 p-1 pr-2.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Avatar name={profile.name} photo={profile.photo} size={32} />
            <span className="hidden sm:flex flex-col text-left">
              <span className="text-sm font-semibold text-slate-800 leading-tight">
                {profile.name || "Pengguna"}
              </span>
              <span className="text-xs text-slate-600 leading-tight">{profile.email}</span>
            </span>
            <IconChevronDown
              size={16}
              aria-hidden="true"
              className={`text-slate-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {dropdownOpen && (
            <div
              data-testid="profile-dropdown-menu"
              role="menu"
              className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-1.5 shadow-lg ring-1 ring-slate-900/5 z-50"
            >
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs text-slate-600">Masuk sebagai</p>
                <p className="text-sm font-semibold text-slate-800 truncate">{profile.name}</p>
              </div>
              <button
                type="button"
                role="menuitem"
                data-testid="dropdown-profile-link"
                onClick={() => {
                  setDropdownOpen(false);
                  router.push("/profile");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <IconUser size={18} aria-hidden="true" className="text-slate-600" />
                Profil saya
              </button>
              <button
                type="button"
                role="menuitem"
                data-testid="dropdown-logout-button"
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-700 rounded-xl hover:bg-rose-50 transition-colors"
              >
                <IconLogout size={18} aria-hidden="true" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default NavbarComponent;