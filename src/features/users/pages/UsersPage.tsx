"use client";

import { useEffect, useState } from "react";
import { IconUsers, IconSearch, IconMail, IconCalendar, IconLoader2 } from "@tabler/icons-react";
import Avatar from "@/components/Avatar";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { formatDate } from "@/helpers/toolsHelper";
import { asyncSetUsers } from "../states/action";

function UsersPage() {
  const dispatch = useAppDispatch();
  const users = useAppSelector((state) => state.users);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isMounted = true;
    Promise.resolve(dispatch(asyncSetUsers())).finally(() => {
      if (isMounted) setLoadingUsers(false);
    });
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const query = search.trim().toLowerCase();
  const filteredUsers = users.filter((user) => {
    if (!query) return true;
    return (
      (user.name && user.name.toLowerCase().includes(query)) ||
      (user.email && user.email.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Semua Pengguna
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Daftar seluruh akun pengguna yang terdaftar di dalam sistem.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <IconSearch
              size={18}
              aria-hidden="true"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="search"
              id="search-user-input"
              name="search"
              data-testid="search-user-input"
              aria-label="Cari pengguna"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari berdasarkan nama atau email..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-700 transition-all"
            />
          </div>
          <span className="text-xs font-semibold text-slate-700 px-3 py-1 bg-slate-100 rounded-lg whitespace-nowrap">
            Total: {filteredUsers.length} Pengguna
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadingUsers && filteredUsers.length === 0 ? (
            <div role="status" className="col-span-full py-16 text-center text-slate-600">
              <IconLoader2 size={36} className="mx-auto text-indigo-700 animate-spin mb-2" />
              <p className="font-medium">Memuat daftar pengguna...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-600">
              <IconUsers size={40} aria-hidden="true" className="mx-auto text-slate-400 mb-2" />
              <p className="font-medium">Tidak ada data pengguna ditemukan.</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <article
                key={`user-${user.id}`}
                data-testid={`user-card-${user.id}`}
                className="p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all bg-white flex flex-col justify-between"
              >
                <div className="flex items-start gap-3.5">
                  <Avatar name={user.name} photo={user.photo} size={48} />

                  <div className="min-w-0 flex-1">
                    <h2 className="font-bold text-slate-900 truncate">{user.name}</h2>
                    <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5 truncate">
                      <IconMail size={14} aria-hidden="true" className="shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="font-mono font-semibold">ID: #{user.id}</span>
                  <span className="flex items-center gap-1">
                    <IconCalendar size={13} aria-hidden="true" />
                    {formatDate(user.created_at)}
                  </span>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default UsersPage;