"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "react-redux";
import {
  IconArrowLeft,
  IconHeart,
  IconMessageCircle2,
  IconPhotoUp,
  IconPencil,
  IconTrash,
  IconPhotoOff,
  IconLoader2,
  IconSend,
} from "@tabler/icons-react";
import Avatar from "@/components/Avatar";
import useInput from "@/hooks/useInput";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { formatDate, showConfirmDialog, showErrorDialog, toImageUrl } from "@/helpers/toolsHelper";
import type { RootState } from "@/store";
import type { Post, PostComment } from "@/types";
import ChangeCoverModal from "../modals/ChangeCoverModal";
import ChangeModal from "../modals/ChangeModal";
import {
  asyncSetPost,
  asyncSetIsPostDelete,
  asyncSetIsPostLike,
  asyncSetIsPostAddComment,
  asyncSetIsPostDeleteComment,
  setIsPostActionCreator,
  setIsPostDeleteActionCreator,
  setIsPostDeletedActionCreator,
  setIsPostLikeActionCreator,
  setIsPostLikedActionCreator,
  setIsPostAddCommentActionCreator,
  setIsPostAddedCommentActionCreator,
  setIsPostDeleteCommentActionCreator,
  setIsPostDeletedCommentActionCreator,
} from "../states/action";

function DetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const store = useStore<RootState>();

  const profile = useAppSelector((state) => state.profile);
  const post = useAppSelector((state) => state.post);
  const isPost = useAppSelector((state) => state.isPost);

  const [comment, changeComment, setComment] = useInput("");
  const [liking, setLiking] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const loadDetail = useCallback(() => {
    dispatch(asyncSetPost(postId));
  }, [dispatch, postId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  // Postingan tidak ditemukan -> kembali ke linimasa
  useEffect(() => {
    if (isPost) {
      dispatch(setIsPostActionCreator(false));
      if (!post) {
        router.replace("/");
      }
    }
  }, [isPost, post, dispatch, router]);

  const closeCoverModal = useCallback(() => setShowCoverModal(false), []);
  const closeEditModal = useCallback(() => setShowEditModal(false), []);

  // Tampilkan loading juga ketika data di store masih milik postingan lain
  if (!profile || !post || String(post.id) !== String(postId)) {
    return (
      <div data-testid="detail-loading" role="status" className="py-24 text-center text-slate-600">
        <h1 className="sr-only">Detail postingan</h1>
        <IconLoader2 size={32} className="mx-auto mb-2 animate-spin text-indigo-700" />
        Memuat postingan...
      </div>
    );
  }

  // Dari sini postingan pasti ada; simpan di konstanta agar tipenya tidak null di dalam handler
  const current: Post = post;
  const isOwner = current.user_id === profile.id;
  const liked = current.likes.includes(profile.id);
  const authorName = current.author?.name || "Pengguna";
  const cover = toImageUrl(current.cover);
  const comments = current.comments.filter((item): item is PostComment => typeof item !== "number");

  async function handleToggleLike() {
    setLiking(true);
    try {
      await dispatch(asyncSetIsPostLike(current.id, liked ? 0 : 1));
    } finally {
      setLiking(false);
    }
    const succeeded = store.getState().isPostLiked;
    dispatch(setIsPostLikeActionCreator(false));
    dispatch(setIsPostLikedActionCreator(false));
    if (succeeded) loadDetail();
  }

  async function handleAddComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!comment.trim()) {
      showErrorDialog("Komentar tidak boleh kosong.");
      return;
    }

    setCommenting(true);
    try {
      await dispatch(asyncSetIsPostAddComment(current.id, comment.trim()));
    } finally {
      setCommenting(false);
    }
    const succeeded = store.getState().isPostAddedComment;
    dispatch(setIsPostAddCommentActionCreator(false));
    dispatch(setIsPostAddedCommentActionCreator(false));
    if (succeeded) {
      setComment("");
      loadDetail();
    }
  }

  async function handleDeleteComment() {
    const result = await showConfirmDialog("Hapus komentar kamu pada postingan ini?");
    if (!result.isConfirmed) return;

    await dispatch(asyncSetIsPostDeleteComment(current.id));
    const succeeded = store.getState().isPostDeletedComment;
    dispatch(setIsPostDeleteCommentActionCreator(false));
    dispatch(setIsPostDeletedCommentActionCreator(false));
    if (succeeded) loadDetail();
  }

  async function handleDeletePost() {
    const result = await showConfirmDialog("Hapus postingan ini? Tindakan ini tidak bisa dibatalkan.");
    if (!result.isConfirmed) return;

    await dispatch(asyncSetIsPostDelete(current.id));
    const succeeded = store.getState().isPostDeleted;
    dispatch(setIsPostDeleteActionCreator(false));
    dispatch(setIsPostDeletedActionCreator(false));
    if (succeeded) router.replace("/");
  }

  return (
    <div className="space-y-6">
      <Link
        href="/"
        data-testid="back-link"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-indigo-800"
      >
        <IconArrowLeft size={18} aria-hidden="true" />
        Kembali ke linimasa
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start">
        {/* Kotak foto punya rasio tetap supaya isi halaman tidak bergeser saat foto selesai dimuat */}
        <figure className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-800">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={`Sampul postingan oleh ${authorName}`}
              data-testid="detail-cover"
              width={800}
              height={600}
              fetchPriority="high"
              className="w-full h-full object-contain"
            />
          ) : (
            <div
              data-testid="detail-no-cover"
              className="h-full flex flex-col items-center justify-center gap-2 bg-indigo-50 text-slate-600"
            >
              <IconPhotoOff size={40} aria-hidden="true" />
              <span className="text-sm">Belum ada foto sampul</span>
            </div>
          )}
        </figure>

        <div className="space-y-6">
          <section className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 space-y-5">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-slate-900">
              Postingan oleh {authorName}
            </h1>

            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
              <Avatar name={current.author?.name} photo={current.author?.photo} size={40} />
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 truncate">
                  {authorName}
                  {isOwner && <span className="font-normal text-slate-600"> (kamu)</span>}
                </p>
                <p className="text-xs text-slate-600">{formatDate(current.created_at)}</p>
              </div>
            </div>

            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{current.description}</p>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <button
                type="button"
                data-testid="like-btn"
                onClick={handleToggleLike}
                disabled={liking}
                aria-pressed={liked}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold border transition-colors disabled:opacity-60 ${
                  liked
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <IconHeart size={18} aria-hidden="true" fill={liked ? "currentColor" : "none"} />
                {liked ? "Disukai" : "Suka"}
              </button>
              <span data-testid="likes-count" className="inline-flex items-center gap-1.5">
                <IconHeart size={16} aria-hidden="true" className="text-rose-600" />
                {current.likes.length} suka
              </span>
              <span data-testid="comments-count" className="inline-flex items-center gap-1.5">
                <IconMessageCircle2 size={16} aria-hidden="true" className="text-indigo-700" />
                {comments.length} komentar
              </span>
            </div>

            {isOwner ? (
              <div className="flex flex-wrap gap-2 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  data-testid="edit-cover-btn"
                  onClick={() => setShowCoverModal(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl text-indigo-800 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  <IconPhotoUp size={17} aria-hidden="true" />
                  Ganti sampul
                </button>
                <button
                  type="button"
                  data-testid="edit-post-btn"
                  onClick={() => setShowEditModal(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <IconPencil size={17} aria-hidden="true" />
                  Ubah postingan
                </button>
                <button
                  type="button"
                  data-testid="delete-post-btn"
                  onClick={handleDeletePost}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
                >
                  <IconTrash size={17} aria-hidden="true" />
                  Hapus
                </button>
              </div>
            ) : (
              <p data-testid="not-owner-note" className="pt-5 border-t border-slate-100 text-sm text-slate-600">
                Hanya penulis yang dapat mengubah atau menghapus postingan ini.
              </p>
            )}
          </section>

          {/* Komentar */}
          <section aria-labelledby="comments-title" className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 space-y-5">
            <h2 id="comments-title" className="font-display text-lg font-bold text-slate-900">
              Komentar ({comments.length})
            </h2>

            {comments.length === 0 ? (
              <p data-testid="no-comments" className="text-sm text-slate-600">
                Belum ada komentar. Jadilah yang pertama!
              </p>
            ) : (
              <ul className="space-y-3">
                {comments.map((item) => {
                  const mine = current.my_comment?.id === item.id;
                  return (
                    <li
                      key={item.id}
                      data-testid={`comment-${item.id}`}
                      className="rounded-2xl bg-slate-50 p-3.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-700">{mine ? "Kamu" : "Pengguna"}</p>
                        <p className="text-xs text-slate-600">{formatDate(item.created_at)}</p>
                      </div>
                      <p className="mt-1 text-sm text-slate-800 whitespace-pre-wrap">{item.comment}</p>
                      {mine && (
                        <button
                          type="button"
                          data-testid="delete-comment-btn"
                          onClick={handleDeleteComment}
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:underline"
                        >
                          <IconTrash size={14} aria-hidden="true" />
                          Hapus komentar saya
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            <form onSubmit={handleAddComment} className="space-y-3" noValidate>
              <label htmlFor="comment-input" className="block text-sm font-semibold text-slate-700">
                Tulis komentar
              </label>
              <textarea
                id="comment-input"
                data-testid="comment-input"
                value={comment}
                onChange={changeComment}
                rows={3}
                placeholder="Bagikan pendapatmu..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-700 text-sm resize-none"
              />
              <button
                type="submit"
                data-testid="submit-comment-btn"
                disabled={commenting}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-xl transition-colors disabled:opacity-60"
              >
                {commenting ? (
                  <>
                    <IconLoader2 size={18} className="animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <IconSend size={18} aria-hidden="true" />
                    Kirim komentar
                  </>
                )}
              </button>
            </form>
          </section>
        </div>
      </div>

      <ChangeCoverModal show={showCoverModal} onClose={closeCoverModal} post={current} onSuccess={loadDetail} />
      <ChangeModal show={showEditModal} onClose={closeEditModal} post={current} onSuccess={loadDetail} />
    </div>
  );
}

export default DetailPage;