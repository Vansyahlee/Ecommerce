"use client";

import React, { useState, useRef } from "react";
import { useTranslations } from "next-intl";

export interface ProductFormData {
  name: string;
  sku: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  expiryDate: string;
  image: string | null;
  unit?: string;
  garansi?: string;
  diskon?: string;
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
}

export const ProductForm = ({ initialData, onSubmit }: ProductFormProps) => {
  const t = useTranslations("ProductDashboard");
  
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    sku: initialData?.sku || "",
    description: initialData?.description || "",
    price: initialData?.price?.toString() || "",
    stock: initialData?.stock?.toString() || "",
    category: initialData?.category || "Umum",
    expiryDate: initialData?.expiryDate || "",
    image: initialData?.image || null,
    unit: initialData?.unit || "pcs",
    garansi: initialData?.garansi || "",
    diskon: initialData?.diskon || "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Kategori & Unit dibiarkan tetap bahasa Indonesia aslinya, 
  // karena ini adalah "value" yang masuk ke database dan dipakai untuk validasi kondisi di bawah.
  const categories = ["Umum", "Makanan", "Elektronik", "Pakaian", "Kesehatan"];
  const units = ["pcs", "pack", "box", "kg", "gram", "liter", "ml", "lusin", "rim", "set", "unit"];
  const categoriesWithExpiry = ["Makanan", "Kesehatan"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      image: formData.image,
      unit: formData.unit,
      garansi: formData.garansi,
      diskon: formData.diskon,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col md:col-span-2">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 mb-2 ml-1">
            {t('productVisual')}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="image"
              value={typeof formData.image === 'string' && !formData.image.startsWith('data:') ? formData.image : ""}
              onChange={handleChange}
              placeholder={t('pasteImageUrl')}
              className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 outline-none focus:border-emerald-600 text-sm font-medium transition-all"
            />
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl p-4 text-slate-500 font-bold text-sm hover:bg-slate-200 transition-all"
              >
                {formData.image?.startsWith('data:') ? t('imageSelected') : t('chooseDevice')}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 mb-2 ml-1">
            {t('productName')}
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 text-slate-900 font-bold transition-all"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 mb-2 ml-1">
            {t('skuSerial')}
          </label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 text-slate-900 font-bold transition-all"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 mb-2 ml-1">
            {t('priceIdr')}
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 text-slate-900 font-black transition-all"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 mb-2 ml-1">
            {t('discountIdr')}
          </label>
          <input
            type="number"
            name="diskon"
            value={formData.diskon}
            onChange={handleChange}
            placeholder="0"
            className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 text-slate-900 font-bold transition-all"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 mb-2 ml-1">
            {t('stockLabel')}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 text-slate-900 font-black transition-all"
              required
            />
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 outline-none focus:border-emerald-600 text-slate-900 font-bold appearance-none cursor-pointer transition-all w-28"
            >
              {units.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 mb-2 ml-1">
            {t('categoryLabel')}
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 outline-none focus:border-emerald-600 text-slate-900 font-bold appearance-none cursor-pointer transition-all"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {formData.category === "Elektronik" && (
          <div className="flex flex-col">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2 ml-1">
              {t('warrantyLabel')}
            </label>
            <input
              type="text"
              name="garansi"
              value={formData.garansi}
              onChange={handleChange}
              placeholder={t('warrantyExample')}
              className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-600 text-slate-900 font-bold transition-all"
            />
          </div>
        )}

        {categoriesWithExpiry.includes(formData.category) && (
          <div className="flex flex-col">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-2 ml-1">
              {t('expiryDateLabel')}
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="bg-emerald-50/50 border-2 border-emerald-200 rounded-2xl p-4 outline-none focus:border-emerald-600 text-emerald-600 font-black transition-all"
              required
            />
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 mb-2 ml-1">
          {t('descSpec')}
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 outline-none focus:border-emerald-600 text-slate-900 font-medium transition-all resize-none"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-black uppercase tracking-[0.4em] py-5 rounded-2xl transition-all shadow-xl active:scale-[0.98] text-xs mt-2"
      >
        {t('saveProductData')}
      </button>
    </form>
  );
};