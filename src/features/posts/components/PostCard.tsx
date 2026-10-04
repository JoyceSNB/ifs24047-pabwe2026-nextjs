"use client";

import Link from "next/link";
import {
  IconHeart,
  IconMessageCircle2,
  IconPencil,
  IconTrash,
  IconPhotoOff,
  IconArrowRight,
} from "@tabler/icons-react";
import Avatar from "@/components/Avatar";
import { formatShortDate, toImageUrl } from "@/helpers/toolsHelper";
import type { Post } from "@/types";

interface PostCardProps {
  post: Post;
  isOwner: boolean;
  onEdit: (post: Post) => void;
  onDelete: (postId: number) => void;
  // true untuk kartu pertama agar fotonya langsung diunduh (bukan lazy)
  priority?: boolean;
}

function PostCard({ post, isOwner, onEdit, onDelete, priority = false }: PostCardProps) {
  const authorName = post.author?.name || "Pengguna";
  const cover = toImageUrl(post.cover);
  const detailHref = `/posts/${post.id}`;

  return (
    <article
      data-testid={`post-card-${post.id}`}
      className="group flex h-full flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-md transition-shadow"
    >
      <h2 className="sr-only">Postingan oleh {authorName}</h2>

      <Link
        href={detailHref}
        aria-label={`${cover ? "" : "Belum ada foto sampul. "}Buka postingan oleh ${authorName}`}
        className="relative block aspect-[4/3] bg-slate-100"
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={`Sampul postingan oleh ${authorName}`}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            width={400}
            height={300}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-600 bg-indigo-50">
            <IconPhotoOff size={28} aria-hidden="true" />
            <span className="text-xs">Belum ada foto sampul</span>
          </span>
        )}
      </Link>

      <div className="flex-1 flex flex-col p-4 gap-3">
        <div className="flex items-center gap-2.5">
          <Avatar name={post.author?.name} photo={post.author?.photo} size={32} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{authorName}</p>
            <p className="text-xs text-slate-600">{formatShortDate(post.created_at)}</p>
          </div>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed line-clamp-3 whitespace-pre-wrap">
          {post.description}
        </p>

        <div className="mt-auto flex items-center gap-4 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <IconHeart size={18} aria-hidden="true" className="text-rose-600" />
            <span data-testid={`post-likes-${post.id}`}>{post.likes.length}</span>
            <span className="sr-only">suka</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconMessageCircle2 size={18} aria-hidden="true" className="text-indigo-700" />
            <span data-testid={`post-comments-${post.id}`}>{post.comments.length}</span>
            <span className="sr-only">komentar</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100">
          <Link
            href={detailHref}
            data-testid={`open-post-${post.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl text-indigo-800 hover:bg-indigo-50 transition-colors"
          >
            Lihat detail
            <IconArrowRight size={16} aria-hidden="true" />
          </Link>
          {isOwner && (
            <>
              <button
                type="button"
                data-testid={`edit-post-${post.id}`}
                onClick={() => onEdit(post)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Ubah postingan"
                title="Ubah postingan"
              >
                <IconPencil size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                data-testid={`delete-post-${post.id}`}
                onClick={() => onDelete(post.id)}
                className="p-2 rounded-xl text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                aria-label="Hapus postingan"
                title="Hapus postingan"
              >
                <IconTrash size={18} aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export default PostCard;