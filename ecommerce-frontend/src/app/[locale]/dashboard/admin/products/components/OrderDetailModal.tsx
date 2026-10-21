"use client";

import { useState } from "react";
import type { StoreTransaction } from "~/features/store/actions/StoreActions";
import { PrintTransactionInvoiceButton } from "./PrintInvoiceButton";
import { useTranslations } from "next-intl";

interface OrderDetailModalProps {
  order: StoreTransaction;
  onClose: () => void;
  onProcessSuccess: (txId: string) => Promise<void>;
}

export function OrderDetailModal({ order, onClose, onProcessSuccess }: OrderDetailModalProps) {
  const t = useTranslations("ProductDashboard");
  const [processing, setProcessing] = useState(false);

  let parsed: Record<string, unknown> = {};
  try { parsed = JSON.parse(order.details || "{}"); } catch {}

  const method = (parsed.method as string) || t('unknown');
  const paymentStatus = (parsed.status_payment as string) || t('waiting');
  const productName = (parsed.name as string) || (parsed.product_name as string) || t('none');
  const sku = (parsed.sku as string) || "-";
  const color = (parsed.color as string) || "-";
  const size = (parsed.size as string) || "-";
  const qty = (parsed.qty as string) || "1";
  const notes = (parsed.notes as string) || "";

  const handleProcess = async () => {
    setProcessing(true);
    await onProcessSuccess(order.id);
    setProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white">
        <div className="flex justify-between items-center p-6 border-b bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-900">{t('orderDetail')}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              #{order.id.slice(-8)}
            </p>
          </div>
          <button onClick={onClose} className="bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 w-10 h-10 rounded-full flex items-center justify-center transition">
            &times;
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('buyerEmail')}</span>
              <p className="font-bold text-slate-800">{order.userEmail || t('unknown')}</p>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('amount')}</span>
              <p className="font-bold text-slate-800">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: order.currency || "IDR" }).format(Number(order.amount))}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('payStatus')}</span>
              <span className={`inline-block ml-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${paymentStatus === "Lunas" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                {paymentStatus}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('payMethod')}</span>
              <span className="inline-block ml-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-700">{method}</span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('orderDate')}</span>
              <p className="font-bold text-slate-800 text-xs">
                {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('productDetail')}</span>
            <div className="mt-2 bg-slate-50 rounded-2xl p-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <p><strong>{t('colProduct')}</strong>: {productName}</p>
                <p><strong>{t('colSku')}</strong>: {sku}</p>
                <p><strong>{t('color')}</strong>: {color}</p>
                <p><strong>{t('size')}</strong>: {size}</p>
                <p><strong>{t('qty')}</strong>: {qty}</p>
                {notes && <p className="col-span-2"><strong>{t('notes')}</strong>: {notes}</p>}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <PrintTransactionInvoiceButton order={order} />
            <button
              onClick={handleProcess}
              disabled={processing}
              className="flex-1 bg-emerald-600 text-white font-black uppercase tracking-widest text-xs py-3 rounded-xl hover:bg-emerald-700 transition"
            >
              {processing ? t('processing') : t('approvePack')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}