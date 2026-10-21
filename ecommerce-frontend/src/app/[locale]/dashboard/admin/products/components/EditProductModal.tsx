"use client";

import { useState } from "react";
import { ProductForm, type ProductFormData } from "~/features/store/components/ProductForm";
import { updateProduct } from "~/features/store/actions/StoreActions";
import type { StoreProduct } from "~/features/store/actions/StoreActions";
import { useTranslations } from "next-intl";

interface EditProductModalProps {
  product: StoreProduct;
  adminId: string;
  onClose: () => void;
  onProductUpdated: () => void;
}

export function EditProductModal({ product, onClose, onProductUpdated }: EditProductModalProps) {
  const t = useTranslations("ProductDashboard");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      await updateProduct(product.id, data);
      onProductUpdated();
      onClose();
    } catch (error) {
      console.error(error);
      alert(t('updateError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const initialData: Partial<ProductFormData> = {
    name: product.name,
    sku: product.sku,
    description: product.description,
    price: Number(product.price),
    stock: product.stock,
    category: product.category,
    expiryDate: product.expiryDate ?? "",
    image: product.image,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-white">
        <div className="flex justify-between items-center p-8 border-b bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">{t('editProductTitle')}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{t('editProductDesc')}</p>
          </div>
          <button onClick={onClose} className="bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 w-10 h-10 rounded-full flex items-center justify-center transition-all text-2xl">
            &times;
          </button>
        </div>
        <div className="p-8 overflow-y-auto">
          <ProductForm initialData={initialData} onSubmit={handleSubmit} />
          {isSubmitting && (
            <div className="mt-6 flex items-center justify-center gap-3 text-emerald-600 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
              <div className="h-2 w-2 rounded-full bg-emerald-600" />
              {t('savingChanges')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}