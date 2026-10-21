"use client";

import Image from "next/image";
import { useState, useMemo, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { AddProductModal } from "./AddProductModal";
import { EditProductModal } from "./EditProductModal";
import { SearchAndPrint } from "./SearchAndPrint";
import { PrintInvoiceButton } from "./PrintInvoiceButton";
import { DeleteButton } from "./DeleteButton";
import { OrderNotification } from "./OrderNotification";
import { getStoreProducts, type StoreProduct } from "~/features/store/actions/StoreActions";
import { calculateFinalPrice } from "~/lib/tax";
import { useCurrency } from "~/features/auth/hooks/useCurrency";
import { currencies, type CurrencyCode } from "~/lib/currency";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

function CurrencyDropdown() {
  const { selectedCurrency, changeCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm hover:border-rose-300 transition"
      >
        <span className="uppercase tracking-wider">{selectedCurrency}</span>
        <ChevronDown size={16} className="text-slate-400" />
      </button>
      {open && (
        <div className="absolute top-full mt-2 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 min-w-[140px] p-2">
          {(Object.keys(currencies) as CurrencyCode[]).map((code) => (
            <button
              key={code}
              onClick={() => { changeCurrency(code); setOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                selectedCurrency === code
                  ? "bg-rose-50 text-rose-600"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {code} — {currencies[code].name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductDashboard({
  products: initialProducts,
  adminId,
}: {
  products: StoreProduct[];
  adminId: string;
}) {
  const t = useTranslations("ProductDashboard");
  const params = useParams();
  const currentLocale = (params.locale as string) || "id";

  const [products, setProducts] = useState<StoreProduct[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);

  const { formatCurrency } = useCurrency();

  const fetchProducts = async () => {
    setIsRefreshing(true);
    try {
      const fresh = await getStoreProducts(adminId, 500);
      setProducts(fresh);
    } catch (error) {
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return products.filter((p) => {
      return (
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
      );
    });
  }, [products, searchTerm]);

  const getUnit = (product: StoreProduct) => {
    if (product.metadata && typeof product.metadata === "object") {
      const meta = product.metadata as Record<string, unknown>;
      if (meta.unit) return String(meta.unit);
    }
    return "pcs";
  };

  const getGaransi = (product: StoreProduct): string | null => {
    if (product.category === "Elektronik" && product.metadata && typeof product.metadata === "object") {
      const meta = product.metadata as Record<string, unknown>;
      if (meta.garansi) return String(meta.garansi);
    }
    return null;
  };

  const getDiskon = (product: StoreProduct): number | null => {
    if (product.metadata && typeof product.metadata === "object") {
      const meta = product.metadata as Record<string, unknown>;
      if (meta.diskon) return Number(meta.diskon);
    }
    return null;
  };

  const today = new Date().toLocaleDateString(currentLocale === 'en' ? "en-US" : "id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePrintAll = () => {
    const rows = filteredProducts.length === 0
      ? `<tr><td colspan="9" style="text-align: center; padding: 30px;">${t('noData')}</td></tr>`
      : filteredProducts.map((p) => {
          const isFood = p.category === "Makanan";
          const unit = getUnit(p);
          const garansi = getGaransi(p);
          const discount = getDiskon(p) ?? 0;
          const finalPrice = calculateFinalPrice(Number(p.price), p.category, discount);

          let dateInfo = `<div><small style="color:#64748b; font-weight:bold; text-transform:uppercase; font-size:8px;">${t('entryDate')}:</small><br/>${new Date(p.createdAt).toLocaleDateString(currentLocale === 'en' ? "en-US" : "id-ID", { day: "numeric", month: "short", year: "numeric" })}</div>`;
          if (isFood && p.expiryDate) {
            dateInfo = `<div style="margin-bottom:4px;"><small style="color:#e11d48; font-weight:bold; text-transform:uppercase; font-size:8px;">${t('expiryDate')}:</small><br/>${new Date(p.expiryDate).toLocaleDateString(currentLocale === 'en' ? "en-US" : "id-ID", { day: "numeric", month: "short", year: "numeric" })}</div>` + dateInfo;
          }
          if (garansi) {
            dateInfo += `<div style="margin-top:4px;"><small style="color:#2563eb; font-weight:bold; text-transform:uppercase; font-size:8px;">${t('warranty')}:</small><br/>${garansi}</div>`;
          }

          return `
            <tr>
              <td style="width: 25%;"><strong>${p.name}</strong><br/><span style="font-size: 9px; color: #64748b;">${p.description || "-"}</span></td>
              <td style="font-family: monospace; font-size: 10px; color: #0f172a;">${p.sku}</td>
              <td style="text-transform: uppercase; font-weight: bold; font-size: 9px;">${p.category}</td>
              <td style="white-space: nowrap;">${formatCurrency(Number(p.price))}</td>
              <td style="color: #e11d48; font-weight: bold;">${discount > 0 ? `- ${formatCurrency(discount)}` : "–"}</td>
              <td>${finalPrice.ppn > 0 ? `<span style="font-size:8px; color:#64748b;">${t('colTax')}:</span><br/>+ ${formatCurrency(Math.round(finalPrice.ppn))}` : "0"}</td>
              <td style="font-weight: 900; color: #0f172a;">${formatCurrency(Math.round(finalPrice.finalTotal))}</td>
              <td style="font-weight: bold;">${p.stock} <small style="color:#64748b;">${unit}</small></td>
              <td style="font-size: 10px;">${dateInfo}</td>
            </tr>
          `;
        }).join("");

    const html = `
      <!DOCTYPE html>
      <html lang="${currentLocale}">
      <head>
        <meta charset="UTF-8">
        <style>
          @page { size: landscape; margin: 10mm; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #1e293b; background: #fff; line-height: 1.4; }
          .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 4px solid #e11d48; padding-bottom: 20px; margin-bottom: 25px; }
          .header h1 { font-size: 32px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -1px; }
          .header p { font-size: 11px; color: #64748b; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin: 5px 0 0 0; }
          .meta { text-align: right; font-size: 10px; color: #64748b; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #f8fafc; font-weight: 900; text-transform: uppercase; font-size: 10px; color: #475569; padding: 12px 10px; text-align: left; border: 1px solid #cbd5e1; letter-spacing: 1px; }
          td { border: 1px solid #e2e8f0; padding: 12px 10px; vertical-align: top; font-size: 11px; }
          tr:nth-child(even) { background-color: #fcfcfc; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>VANZ.STORE</h1>
            <p>${t('printTitle')}</p>
          </div>
          <div class="meta">
            ${t('printedAt')}: ${today}<br/>
            ${t('totalItems')}: ${filteredProducts.length} ${t('productsLabel')}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>${t('colProduct')}</th>
              <th>${t('colSku')}</th>
              <th>${t('colCategory')}</th>
              <th>${t('colBasePrice')}</th>
              <th>${t('colDiscount')}</th>
              <th>${t('colTax')}</th>
              <th>${t('colTotal')}</th>
              <th>${t('colStock')}</th>
              <th>${t('colInfo')}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.bottom = '0';
    iframe.style.right = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    iframe.contentDocument?.write(html);
    iframe.contentDocument?.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 2000);
    }, 500);
  };

  const categoryColors: Record<string, string> = {
    Elektronik: "bg-purple-50 text-purple-700 border-purple-200",
    Makanan: "bg-amber-50 text-amber-700 border-amber-200",
    Kesehatan: "bg-green-50 text-green-700 border-green-200",
    Pakaian: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <>
      <div className="p-6 min-h-screen bg-slate-50/50 w-full max-w-full">
        <div className="print:hidden">
          <OrderNotification adminId={adminId} />
        </div>

        <div className="flex items-end justify-between gap-6 mb-8 text-black print:hidden flex-wrap">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-rose-600">Vanz.Store Systems</p>
            <h1 className="mt-3 text-4xl font-black tracking-tighter text-slate-900 italic">{t('dashboardTitle')}</h1>
            <p className="mt-2 text-slate-500 font-bold tracking-tight text-sm uppercase opacity-60">{t('dashboardDesc')}</p>
          </div>

          <div className="flex items-center gap-5 shrink-0 flex-wrap">
            <CurrencyDropdown />
            <AddProductModal adminId={adminId} onProductAdded={fetchProducts} />
            <div className="bg-white border-2 border-slate-100 rounded-[32px] px-8 py-4 shadow-xl shadow-slate-200/50 text-black">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('totalProducts')}</p>
              <p className="text-3xl font-black text-slate-900 leading-none">{filteredProducts.length}</p>
            </div>
          </div>
        </div>

        <div className="print:hidden mb-6">
          <SearchAndPrint searchTerm={searchTerm} onSearchChange={setSearchTerm} onPrintAll={handlePrintAll} />
        </div>

        {isRefreshing && (
          <div className="mb-4 flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-widest print:hidden">
            <div className="h-3 w-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            {t('refreshing')}
          </div>
        )}

        {/* Tabel Desktop */}
        <div className="hidden lg:block print:hidden bg-white rounded-[40px] shadow-2xl border border-slate-100 text-black font-medium w-full max-w-full">
          <div className="px-10 py-6 border-b border-slate-50 bg-slate-50/20 flex items-center justify-between rounded-t-[40px]">
            <h2 className="font-black uppercase tracking-[0.2em] text-xs text-slate-400">Live Database Feed</h2>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Connection</span>
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          <div className="w-full overflow-x-auto rounded-b-[40px]">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-linear-to-r from-slate-50 to-slate-100 text-[11px] font-black uppercase tracking-widest text-slate-500 border-b-2 border-slate-200">
                  <th className="px-6 py-5 w-[280px]">📦 {t('colProduct')}</th>
                  <th className="px-6 py-5">🔐 {t('colSku')}</th>
                  <th className="px-6 py-5">🏷️ {t('colCategory')}</th>
                  <th className="px-6 py-5">💰 {t('colPrice')}</th>
                  <th className="px-6 py-5">🔥 {t('colDiscount')}</th>
                  <th className="px-6 py-5">📈 {t('colTax')}</th>
                  <th className="px-6 py-5">🧾 {t('colTotal')}</th>
                  <th className="px-6 py-5">📊 {t('colStock')}</th>
                  <th className="px-6 py-5">📅 {t('colInfo')}</th>
                  <th className="px-6 py-5 text-right">⚡ {t('colAction')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-24 text-center text-slate-300 italic font-black uppercase tracking-widest">{t('noData')}</td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const unit = getUnit(p);
                    const garansi = getGaransi(p);
                    const discount = getDiskon(p) ?? 0;
                    const finalPrice = calculateFinalPrice(Number(p.price), p.category, discount);
                    const catColor = categoryColors[p.category] || "bg-slate-100 text-slate-700 border-slate-200";

                    return (
                      <tr key={p.id} className="hover:bg-rose-50/30 transition-all group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center border-2 border-white shadow-md overflow-hidden shrink-0">
                              {p.image ? (
                                <Image src={p.image} alt={p.name} width={64} height={64} className="w-full h-full object-cover" unoptimized />
                              ) : (
                                <svg className="w-6 h-6 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-[180px]">
                              <p className="font-black text-slate-800 text-sm tracking-tight line-clamp-1">{p.name}</p>
                              <p className="text-[11px] text-slate-500 font-medium line-clamp-2 mt-0.5">{p.description || t('noDesc')}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-mono text-[11px] bg-linear-to-r from-slate-800 to-slate-900 text-emerald-400 px-3 py-1.5 rounded-lg tracking-tight font-black border border-emerald-500/20 shadow-sm w-fit">{p.sku}</span>
                            <span className="text-[8px] text-slate-400 mt-1 uppercase font-black tracking-[0.2em] whitespace-nowrap">Secure Serial</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-block text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide border ${catColor}`}>
                            {p.category}
                          </span>
                        </td>

                        <td className="px-6 py-4 font-black text-slate-900 whitespace-nowrap">
                          {formatCurrency(Number(p.price))}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {discount > 0 ? (
                            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 font-black text-xs px-2 py-1 rounded-full">
                              <span className="text-[10px]">▼</span>
                              {formatCurrency(discount)}
                            </span>
                          ) : (
                            <span className="text-slate-400">–</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-[11px] whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-black text-slate-500 text-[10px]">{finalPrice.taxInfo.label}</span>
                            {finalPrice.ppn > 0 && (
                              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                                +{formatCurrency(Math.round(finalPrice.ppn))}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 font-black whitespace-nowrap">
                          <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-xl text-xs shadow-sm">
                            {formatCurrency(Math.round(finalPrice.finalTotal))}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-700 text-sm">{p.stock}</span>
                            <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">{unit}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1.5">
                            {p.category === "Makanan" && p.expiryDate && (
                              <div className="bg-rose-50 border border-rose-100 rounded-lg px-2 py-1">
                                <span className="text-[8px] font-black uppercase tracking-wider text-rose-600">⚠️ {t('expiryDate')}</span><br />
                                <span className="text-[11px] font-bold text-rose-700">{new Date(p.expiryDate).toLocaleDateString(currentLocale === 'en' ? "en-US" : "id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                              </div>
                            )}
                            <div className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1">
                              <span className="text-[8px] font-black uppercase tracking-wider text-slate-500">📥 {t('entryDate')}</span><br />
                              <span className="text-[11px] font-bold text-slate-700">{new Date(p.createdAt).toLocaleDateString(currentLocale === 'en' ? "en-US" : "id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                            </div>
                            {garansi && (
                              <div className="bg-blue-50 border border-blue-100 rounded-lg px-2 py-1">
                                <span className="text-[8px] font-black uppercase tracking-wider text-blue-600">🛡️ {t('warranty')}</span><br />
                                <span className="text-[11px] font-bold text-blue-700">{garansi}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingProduct(p)} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition shadow-sm" title="Edit">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                            </button>
                            <PrintInvoiceButton product={p} />
                            <DeleteButton productId={p.id} onDeleted={fetchProducts} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabel Mobile */}
        <div className="lg:hidden space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl shadow p-8 text-center text-slate-400 font-black uppercase tracking-widest">{t('noData')}</div>
          ) : (
            filteredProducts.map((p) => {
              const unit = getUnit(p);
              const garansi = getGaransi(p);
              const discount = getDiskon(p) ?? 0;
              const finalPrice = calculateFinalPrice(Number(p.price), p.category, discount);
              const catColor = categoryColors[p.category] || "bg-slate-100 text-slate-700 border-slate-200";
              return (
                <div key={p.id} className="bg-white rounded-3xl shadow-lg border border-slate-100 p-5 transition">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-slate-200 shadow overflow-hidden shrink-0">
                      {p.image ? <Image src={p.image} alt={p.name} width={80} height={80} className="object-cover w-full h-full" unoptimized /> : <svg className="w-8 h-8 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-900 text-base">{p.name}</p>
                      <p className="text-xs text-slate-400 line-clamp-2">{p.description || t('noDesc')}</p>
                      <div className="flex items-center gap-3 mt-3 text-xs font-bold">
                        <span className={`px-3 py-1 rounded-full uppercase border ${catColor}`}>{p.category}</span>
                        <span className="text-emerald-700">{finalPrice.taxInfo.label}</span>
                        {discount > 0 && <span className="text-rose-600">-{formatCurrency(discount)}</span>}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <p className="text-lg font-black text-slate-900">{formatCurrency(Number(p.price))}</p>
                          <p className="text-[10px] text-slate-400">{t('colStock')}: {p.stock} {unit} | {new Date(p.createdAt).toLocaleDateString(currentLocale === 'en' ? "en-US" : "id-ID", { day: "numeric", month: "short", year: "numeric" })}</p>
                          {garansi && <p className="text-[10px] text-blue-600 font-bold">{t('warranty')}: {garansi}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditingProduct(p)} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg></button>
                          <PrintInvoiceButton product={p} />
                          <DeleteButton productId={p.id} onDeleted={fetchProducts} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {editingProduct && (
        <EditProductModal product={editingProduct} adminId={adminId} onClose={() => setEditingProduct(null)} onProductUpdated={fetchProducts} />
      )}
    </>
  );
}