"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "react-redux";
import {
  IconPlus,
  IconSearch,
  IconLoader2,
  IconMoodEmpty,
  IconTrashX,
} from "@tabler/icons-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { showConfirmDialog } from "@/helpers/toolsHelper";
import type { RootState } from "@/store";
import type { Post } from "@/types";
import PostCard from "../components/PostCard";
import AddModal from "../modals/AddModal";
import ChangeModal from "../modals/ChangeModal";
import {
  asyncSetPosts,
  asyncSetIsPostDelete,
  asyncSetIsPostDeleteAll,
  setIsPostDeleteActionCreator,
  setIsPostDeletedActionCreator,
  setIsPostDeleteAllActionCreator,
  setIsPostDeletedAllActionCreator,
} from "../states/action";

type Scope = "all" | "me";

const tabBase = "px-4 py-2 text-sm font-semibold rounded-xl transition-colors";
const tabActive = "bg-indigo-700 text-white";
const tabIdle = "text-slate-700 hover:bg-slate-100";

function HomePage({ scope = "all" }: { scope?: Scope }) {
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();

  const posts = useAppSelector((state) => state.posts);
  const profile = useAppSelector((state) => state.profile);

  // Cakupan yang datanya sudah selesai dimuat; loading = cakupan aktif belum selesai dimuat
  const [loadedScope, setLoadedScope] = useState<Scope | null>(null);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const isMe = scope === "me";
  const loading = loadedScope !== scope;

  useEffect(() => {
    let isMounted = true;
    Promise.resolve(dispatch(asyncSetPosts(isMe ? { is_me: 1 } : {}))).finally(() => {
      if (isMounted) setLoadedScope(scope);
    });
    return () => {
      isMounted = false;
    };
  }, [dispatch, isMe, scope]);

  // Muat ulang daftar tanpa menampilkan layar loading penuh
  const reload = useCallback(() => {
    dispatch(asyncSetPosts(isMe ? { is_me: 1 } : {}));
  }, [dispatch, isMe]);

  const closeAddModal = useCallback(() => setShowAddModal(false), []);
  const closeEditModal = useCallback(() => setEditingPost(null), []);

  async function handleDelete(postId: number) {
    const result = await showConfirmDialog("Hapus postingan ini? Tindakan ini tidak bisa dibatalkan.");
    if (!result.isConfirmed) return;

    await dispatch(asyncSetIsPostDelete(postId));
    const succeeded = store.getState().isPostDeleted;
    dispatch(setIsPostDeleteActionCreator(false));
    dispatch(setIsPostDeletedActionCreator(false));
    if (succeeded) reload();
  }

  async function handleDeleteAll() {
    const result = await showConfirmDialog(
      "Hapus SEMUA postingan milik kamu? Foto, suka, dan komentarnya ikut terhapus permanen."
    );
    if (!result.isConfirmed) return;

    await dispatch(asyncSetIsPostDeleteAll());
    const succeeded = store.getState().isPostDeletedAll;
    dispatch(setIsPostDeleteAllActionCreator(false));
    dispatch(setIsPostDeletedAllActionCreator(false));
    if (succeeded) reload();
  }

  const query = search.trim().toLowerCase();
  const visiblePosts = posts.filter((post) => {
    if (!query) return true;
    return (
      post.description.toLowerCase().includes(query) ||
      (post.author?.name || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isMe ? "Postingan Saya" : "Linimasa"}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isMe
              ? "Semua postingan yang pernah kamu terbitkan."
              : "Postingan terbaru dari seluruh pengguna."}
          </p>
        </div>

        <button
          type="button"
          data-testid="open-add-modal-btn"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-xl shadow-md shadow-indigo-700/25 transition-colors"
        >
          <IconPlus size={18} stroke={2.5} aria-hidden="true" />
          Buat postingan
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <nav aria-label="Filter postingan" className="flex gap-1 rounded-2xl bg-white border border-slate-200 p-1 w-fit">
          <Link
            href="/"
            data-testid="tab-all-posts"
            aria-current={!isMe ? "page" : undefined}
            className={`${tabBase} ${!isMe ? tabActive : tabIdle}`}
          >
            Semua
          </Link>
          <Link
            href="/my-posts"
            data-testid="tab-my-posts"
            aria-current={isMe ? "page" : undefined}
            className={`${tabBase} ${isMe ? tabActive : tabIdle}`}
          >
            Milik saya
          </Link>
        </nav>

        <div className="relative w-full sm:max-w-xs">
          <IconSearch
            size={18}
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="search"
            data-testid="search-post-input"
            aria-label="Cari postingan"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari postingan atau penulis..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-700 transition-all"
          />
        </div>
      </div>

      {isMe && !loading && posts.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            data-testid="delete-all-posts-btn"
            onClick={handleDeleteAll}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
          >
            <IconTrashX size={18} aria-hidden="true" />
            Hapus semua postingan saya
          </button>
        </div>
      )}

      {loading ? (
        <div role="status" className="py-24 text-center text-slate-600">
          <IconLoader2 size={36} className="mx-auto text-indigo-700 animate-spin mb-2" />
          <p className="font-medium">Memuat postingan...</p>
        </div>
      ) : visiblePosts.length === 0 ? (
        <div data-testid="empty-posts" className="py-20 text-center text-slate-600">
          <IconMoodEmpty size={44} aria-hidden="true" className="mx-auto text-slate-400 mb-2" />
          <p className="font-semibold text-slate-800">
            {query ? "Tidak ada postingan yang cocok." : isMe ? "Kamu belum punya postingan." : "Belum ada postingan."}
          </p>
          <p className="text-sm mt-1">
            {query ? "Coba kata kunci lain." : "Mulai dengan menekan tombol Buat postingan."}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {visiblePosts.map((post, index) => (
            <li key={post.id}>
              <PostCard
                post={post}
                isOwner={post.user_id === profile?.id}
                priority={index === 0}
                onEdit={setEditingPost}
                onDelete={handleDelete}
              />
            </li>
          ))}
        </ul>
      )}

      <AddModal show={showAddModal} onClose={closeAddModal} onSuccess={reload} />
      <ChangeModal show={editingPost !== null} post={editingPost} onClose={closeEditModal} onSuccess={reload} />
    </div>
  );
}

export default HomePage;