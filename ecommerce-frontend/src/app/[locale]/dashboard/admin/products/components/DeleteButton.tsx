"use client";

import { deleteProduct } from "~/features/store/actions/StoreActions";

interface DeleteButtonProps {
  productId: string;
  onDeleted: () => void;
}

export function DeleteButton({ productId, onDeleted }: DeleteButtonProps) {
  const handleDelete = async () => {
    if (!confirm("Yakin hapus produk ini?")) return;
    try {
      await deleteProduct(productId);
      onDeleted();
    } catch {
      alert("Gagal menghapus produk.");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-90 border-2 border-transparent hover:border-rose-100 shadow-sm"
      title="Hapus produk"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </svg>
    </button>
  );
}