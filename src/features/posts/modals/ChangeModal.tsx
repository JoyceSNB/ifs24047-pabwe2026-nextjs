"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useStore } from "react-redux";
import { IconPencil, IconLoader2 } from "@tabler/icons-react";
import useInput from "@/hooks/useInput";
import { useAppDispatch } from "@/hooks/redux";
import { showErrorDialog } from "@/helpers/toolsHelper";
import type { RootState } from "@/store";
import type { Post } from "@/types";
import {
  asyncSetIsPostChange,
  setIsPostChangeActionCreator,
  setIsPostChangedActionCreator,
} from "../states/action";
import ModalShell from "./ModalShell";

interface ChangeModalProps {
  show: boolean;
  onClose: () => void;
  post: Post | null;
  onSuccess: () => void;
}

// Formulir dibuat ulang setiap kali modal dibuka, jadi selalu terisi deskripsi terbaru
function ChangeForm({ post, onClose, onSuccess }: Omit<ChangeModalProps, "show"> & { post: Post }) {
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();

  const [description, changeDescription] = useInput(post.description || "");
  const [loading, setLoading] = useState(false);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!description.trim()) {
      showErrorDialog("Deskripsi postingan wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      await dispatch(asyncSetIsPostChange(post.id, description.trim()));
    } finally {
      setLoading(false);
    }

    const succeeded = store.getState().isPostChanged;
    dispatch(setIsPostChangeActionCreator(false));
    dispatch(setIsPostChangedActionCreator(false));
    if (succeeded) {
      onSuccess();
      onClose();
    }
  }

  return (
    <ModalShell
      testId="edit-post-modal"
      closeTestId="close-edit-modal-btn"
      title="Ubah postingan"
      onClose={onClose}
      icon={
        <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center">
          <IconPencil size={18} stroke={2.5} aria-hidden="true" />
        </span>
      }
    >
      <form onSubmit={handleSave} className="p-6 space-y-5" noValidate>
        <div>
          <label htmlFor="edit-description" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Deskripsi
          </label>
          <textarea
            id="edit-description"
            data-testid="edit-description-input"
            value={description}
            onChange={changeDescription}
            rows={5}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-700 text-sm resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            data-testid="cancel-edit-modal-btn"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            data-testid="submit-edit-modal-btn"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? (
              <>
                <IconLoader2 size={18} className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan perubahan"
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function ChangeModal({ show, onClose, post, onSuccess }: ChangeModalProps) {
  if (!show || !post) return null;
  return <ChangeForm key={post.id} post={post} onClose={onClose} onSuccess={onSuccess} />;
}

export default ChangeModal;