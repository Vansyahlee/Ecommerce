"use client";

import React, { useState } from "react";
import { ProductForm, type ProductFormData } from "~/features/store/components/ProductForm";
import { createProduct } from "~/features/store/actions/StoreActions";
import { useTranslations } from "next-intl";

export const AddProductModal = ({ adminId, onProductAdded }: { adminId: string; onProductAdded: () => void }) => {
  const t = useTranslations("ProductDashboard");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      await createProduct(adminId, data);
      handleClose();
      onProductAdded();
    } catch (error) {
      console.error(error);
      alert(t('syncError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest py-3 px-8 rounded-2xl transition-all shadow-lg shadow-emerald-200 active:scale-95 text-[10px]"
      >
        + {t('registerProduct')}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-white">
            <div className="flex justify-between items-center p-8 border-b bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">{t('inventoryEntry')}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Vanz.Store Global Registry</p>
              </div>
              <button
                onClick={handleClose}
                className="bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 w-10 h-10 rounded-full flex items-center justify-center transition-all text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="p-8 overflow-y-auto scrollbar-hide">
              <ProductForm onSubmit={handleSubmit} />
              {isSubmitting && (
                <div className="mt-6 flex items-center justify-center gap-3 text-emerald-600 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
                  <div className="h-2 w-2 rounded-full bg-emerald-600" />
                  {t('updatingData')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};