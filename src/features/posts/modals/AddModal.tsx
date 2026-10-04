"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useStore } from "react-redux";
import { IconPlus, IconLoader2 } from "@tabler/icons-react";
import useInput from "@/hooks/useInput";
import { useAppDispatch } from "@/hooks/redux";
import { showErrorDialog } from "@/helpers/toolsHelper";
import type { RootState } from "@/store";
import {
  asyncSetIsPostAdd,
  setIsPostAddActionCreator,
  setIsPostAddedActionCreator,
} from "../states/action";
import ModalShell from "./ModalShell";

interface AddModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Isi modal dibuat ulang setiap kali modal dibuka, jadi kolom otomatis kosong lagi
function AddForm({ onClose, onSuccess }: Omit<AddModalProps, "show">) {
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();

  const [description, changeDescription] = useInput("");
  const [loading, setLoading] = useState(false);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!description.trim()) {
      showErrorDialog("Deskripsi postingan wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      await dispatch(asyncSetIsPostAdd(description.trim()));
    } finally {
      setLoading(false);
    }

    const succeeded = store.getState().isPostAdded;
    dispatch(setIsPostAddActionCreator(false));
    dispatch(setIsPostAddedActionCreator(false));
    if (succeeded) {
      onSuccess();
      onClose();
    }
  }

  return (
    <ModalShell
      testId="add-post-modal"
      closeTestId="close-add-modal-btn"
      title="Buat postingan"
      onClose={onClose}
      icon={
        <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center">
          <IconPlus size={18} stroke={2.5} aria-hidden="true" />
        </span>
      }
    >
      <form onSubmit={handleSave} className="p-6 space-y-5" noValidate>
        <div>
          <label htmlFor="add-description" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Apa yang ingin kamu bagikan?
          </label>
          <textarea
            id="add-description"
            data-testid="add-description-input"
            value={description}
            onChange={changeDescription}
            rows={5}
            placeholder="Tulis ceritamu di sini..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-700 text-sm resize-none"
          />
          <p className="mt-1.5 text-xs text-slate-600">
            Foto sampul bisa ditambahkan dari halaman detail setelah postingan terbit.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            data-testid="cancel-add-modal-btn"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            data-testid="submit-add-modal-btn"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? (
              <>
                <IconLoader2 size={18} className="animate-spin" />
                Menerbitkan...
              </>
            ) : (
              "Terbitkan"
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function AddModal({ show, onClose, onSuccess }: AddModalProps) {
  if (!show) return null;
  return <AddForm onClose={onClose} onSuccess={onSuccess} />;
}

export default AddModal;