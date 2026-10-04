"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconHome, IconUserHeart, IconUsers, IconUserCircle } from "@tabler/icons-react";
import type { ComponentType } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; "aria-hidden"?: boolean | "true" | "false" }>;
  isActive: (pathname: string) => boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Semua Postingan",
    icon: IconHome,
    // Halaman detail postingan dibuka dari linimasa, jadi menu ini tetap ditandai aktif
    isActive: (pathname) => pathname === "/" || pathname.startsWith("/posts/"),
  },
  {
    href: "/my-posts",
    label: "Postingan Saya",
    icon: IconUserHeart,
    isActive: (pathname) => pathname === "/my-posts",
  },
  {
    href: "/users",
    label: "Daftar Pengguna",
    icon: IconUsers,
    isActive: (pathname) => pathname === "/users",
  },
  {
    href: "/profile",
    label: "Profil Saya",
    icon: IconUserCircle,
    isActive: (pathname) => pathname === "/profile",
  },
];

interface SidebarProps {
  isSidebarOpen: boolean;
  onCloseMobile: () => void;
}

function SidebarComponent({ isSidebarOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Latar gelap untuk drawer mobile */}
      {isSidebarOpen && (
        <button
          type="button"
          data-testid="sidebar-backdrop"
          aria-label="Tutup menu"
          tabIndex={-1}
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-slate-800/40 md:hidden cursor-default"
        />
      )}

      <aside
        data-testid="sidebar"
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-white border-r border-slate-200 p-4 transition-transform duration-200 ease-out md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <nav aria-label="Menu utama" className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = item.isActive(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "bg-indigo-700 text-white"
                      : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={20} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="rounded-2xl bg-amber-100 px-4 py-3 text-amber-900">
            <p className="text-sm font-semibold">Punya cerita hari ini?</p>
            <p className="text-xs mt-0.5 leading-relaxed">
              Tulis postingan baru dan tambahkan foto sampul agar lebih menarik.
            </p>
            <p className="text-[11px] mt-2">Praktikum 4 PABWE</p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default SidebarComponent;