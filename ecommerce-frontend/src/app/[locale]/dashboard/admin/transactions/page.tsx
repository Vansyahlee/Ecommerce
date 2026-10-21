"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getStoreTransactions,
  refundTransaction,
  blockUserForFailedPayment,
  updateTransactionStatus,
  deleteTransaction,
} from "~/features/store/actions/StoreActions";
import type { StoreTransaction } from "~/features/store/actions/StoreActions";
import { PrintTransactionInvoiceButton, PrintLabelButton } from "../products/components/PrintInvoiceButton";
import { X, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { ConfirmModal } from "~/components/ui/confirm-modal";
import { useTranslations } from "next-intl";

export default function TransactionsPage() {
  const t = useTranslations("ProductDashboard");
  const adminId = "b05aebfd-2b55-450e-b5f7-ee42e53c6250";
  const [transactions, setTransactions] = useState<StoreTransaction[]>([]);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "SUCCESS" | "FAILED">("ALL");
  const [loaded, setLoaded] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<StoreTransaction | null>(null);
  const [confirmData, setConfirmData] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const adminRef = useRef(adminId);

  useEffect(() => {
    adminRef.current = adminId;
  }, [adminId]);

  const fetchTransactions = useCallback(async () => {
    try {
      const txs = await getStoreTransactions(adminRef.current, 500);
      setTransactions(txs);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchTransactions().finally(() => setLoaded(true));
  }, [fetchTransactions]);

  const filtered = useMemo(() => {
    if (filter === "ALL") return transactions;
    return transactions.filter((t) => t.status === filter);
  }, [transactions, filter]);

  const parseDetails = (details: string | null): Record<string, string> => {
    if (!details) return {};
    try {
      const parsed = JSON.parse(details);
      const safe: Record<string, string> = {};
      for (const key of Object.keys(parsed)) {
        safe[key] = String(parsed[key] ?? "");
      }
      return safe;
    } catch {
      return { _raw: details };
    }
  };

  const handleRefund = async (txId: string) => {
    setConfirmData({
      title: t('refundTxTitle'),
      message: t('refundTxMsg'),
      onConfirm: async () => {
        await refundTransaction(adminRef.current, txId);
        await fetchTransactions();
        setConfirmData(null);
      }
    });
  };

  const handleBlockUser = async (txId: string) => {
    setConfirmData({
      title: t('blockUserTitle'),
      message: t('blockUserMsg'),
      onConfirm: async () => {
        await blockUserForFailedPayment(adminRef.current, txId);
        await fetchTransactions();
        setConfirmData(null);
      }
    });
  };

  const handleApprove = async (txId: string) => {
    setConfirmData({
      title: t('approveTitle'),
      message: t('approveMsg'),
      onConfirm: async () => {
        await updateTransactionStatus(txId, "SUCCESS");
        setSelectedTransaction(null);
        await fetchTransactions();
        setConfirmData(null);
      }
    });
  };

  const handleDelete = async (txId: string) => {
    setConfirmData({
      title: t('deleteTxTitle'),
      message: t('deleteTxMsg'),
      onConfirm: async () => {
        try {
          await deleteTransaction(txId);
          await fetchTransactions();
        } catch {
          alert(t('deleteFailed'));
        }
        setConfirmData(null);
      }
    });
  };

  if (!loaded) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">{t('loadingTx')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-rose-600">Vanz.Store Systems</p>
            <h1 className="mt-2 text-3xl lg:text-4xl font-black tracking-tight text-slate-900 italic">{t('transactionsTitle')}</h1>
            <p className="mt-2 text-slate-500 font-bold tracking-tight text-xs uppercase opacity-60">
              {t('transactionsDesc')}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Filter Desktop */}
            <div className="hidden lg:flex gap-2">
              {(["ALL", "PENDING", "SUCCESS", "FAILED"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                    filter === status
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                      : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {status === "ALL" ? t('filterAll') : status === "PENDING" ? t('filterPending') : status === "SUCCESS" ? t('filterSuccess') : t('filterFailed')}
                </button>
              ))}
            </div>

            {/* Filter Mobile (Dropdown) */}
            <div className="lg:hidden w-full">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as "ALL" | "PENDING" | "SUCCESS" | "FAILED")}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-700 outline-none focus:ring-2 focus:ring-rose-200"
              >
                <option value="ALL">{t('filterAll')}</option>
                <option value="PENDING">{t('filterPending')}</option>
                <option value="SUCCESS">{t('filterSuccess')}</option>
                <option value="FAILED">{t('filterFailed')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tampilan Mobile: Card */}
        <div className="lg:hidden space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-bold uppercase tracking-widest text-sm">
              {t('noTxFound')}
            </div>
          ) : (
            filtered.map((tx) => {
              const detail = parseDetails(tx.details);
              const buyerEmail = detail.userEmail || tx.userEmail || "N/A";
              const productName = detail.name || detail.product_name || "N/A";
              const method = detail.method || "N/A";
              const paymentStatus = detail.status_payment || "N/A";
              const amount = new Intl.NumberFormat("id-ID", { style: "currency", currency: tx.currency || "IDR" }).format(Number(tx.amount));
              const date = new Date(tx.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

              return (
                <div
                  key={tx.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-2 active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500">#{tx.id.slice(-8)}</span>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      tx.status === "SUCCESS" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : tx.status === "FAILED" ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-amber-50 text-amber-700 border-amber-100"
                    }`}>
                      {tx.status === "SUCCESS" && <CheckCircle2 size={12} className="text-emerald-500" />}
                      {tx.status === "FAILED" && <AlertCircle size={12} className="text-rose-500" />}
                      {tx.status === "PENDING" && <Clock size={12} className="text-amber-500 animate-pulse" />}
                      {tx.status === "SUCCESS" ? t('filterSuccess') : tx.status === "FAILED" ? t('filterFailed') : t('filterPending')}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-800" onClick={() => setSelectedTransaction(tx)}>{buyerEmail}</p>
                    <p className="text-xs text-slate-500 truncate">{productName}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium uppercase">{method}</span>
                      <span className={`text-[10px] font-black uppercase ${paymentStatus === "Lunas" ? "text-emerald-600" : "text-rose-600"}`}>
                        {paymentStatus}
                      </span>
                    </div>
                    <span className="font-black text-sm text-slate-900">{amount}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{date}</span>
                    <div className="flex gap-2">
                      {tx.status === "FAILED" && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRefund(tx.id); }}
                            className="text-amber-600 font-black uppercase tracking-wider hover:underline"
                          >
                            {t('refund')}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleBlockUser(tx.id); }}
                            className="text-rose-600 font-black uppercase tracking-wider hover:underline"
                          >
                            {t('block')}
                          </button>
                        </>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(tx.id); }}
                        className="text-slate-400 hover:text-red-600 font-black uppercase tracking-wider"
                        title={t('deleteTx')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Tampilan Desktop: Tabel */}
        <div className="hidden lg:block bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden w-full max-w-full">
          
          {/* HEADER REALTIME (Sama kayak Products) */}
          <div className="px-10 py-6 border-b border-slate-50 bg-slate-50/20 flex items-center justify-between rounded-t-[40px]">
            <h2 className="font-black uppercase tracking-[0.2em] text-xs text-slate-400">{t('liveTxFeed')}</h2>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{t('activeConn')}</span>
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          <div className="w-full overflow-x-auto rounded-b-[40px]">
            <table className="w-full text-left border-collapse min-w-[1800px]">
              <thead className="bg-slate-50/80 text-[11px] font-black uppercase tracking-widest text-slate-500 border-b-2 border-slate-200">
                <tr>
                  <th className="px-6 py-5 w-[120px]">🆔 {t('colId')}</th>
                  <th className="px-6 py-5 w-[180px]">👤 {t('colBuyer')}</th>
                  <th className="px-6 py-5 w-[150px]">📦 {t('colProduct')}</th>
                  <th className="px-6 py-5 w-[120px]">💳 {t('payMethod')}</th>
                  <th className="px-6 py-5 w-[100px]">💰 {t('payStatus')}</th>
                  <th className="px-6 py-5 w-[130px]">💵 {t('amount')}</th>
                  <th className="px-6 py-5 w-[130px]">📊 {t('colStatus')}</th>
                  <th className="px-6 py-5 w-[150px]">📅 {t('date')}</th>
                  <th className="px-6 py-5 text-right w-[150px]">⚡ {t('colAction')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-24 text-center text-slate-300 italic font-black uppercase tracking-widest">
                      {t('noTxData')}
                    </td>
                  </tr>
                ) : (
                  filtered.map((tx) => {
                    const detail = parseDetails(tx.details);
                    const buyerEmail = detail.userEmail || tx.userEmail || "N/A";
                    const productName = detail.name || detail.product_name || "N/A";
                    const method = detail.method || "N/A";
                    const paymentStatus = detail.status_payment || "N/A";

                    return (
                      <tr
                        key={tx.id}
                        onClick={() => setSelectedTransaction(tx)}
                        className="hover:bg-slate-50/60 transition-all group cursor-pointer"
                      >
                        <td className="px-6 py-6 font-mono text-xs text-slate-500">#{tx.id.slice(-8)}</td>
                        <td className="px-6 py-6 font-bold text-slate-800 text-xs">{buyerEmail}</td>
                        <td className="px-6 py-6 text-xs font-medium text-slate-700">{productName}</td>
                        <td className="px-6 py-6">
                          <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                            {method}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              paymentStatus === "Lunas"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-6 font-black text-slate-900 text-xs">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: tx.currency || "IDR",
                          }).format(Number(tx.amount))}
                        </td>
                        <td className="px-6 py-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              tx.status === "SUCCESS"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : tx.status === "FAILED"
                                ? "bg-rose-50 text-rose-700 border-rose-100"
                                : "bg-amber-50 text-amber-700 border-amber-100"
                            }`}
                          >
                            {/* ANIMASI ICON STATUS */}
                            {tx.status === "SUCCESS" && <CheckCircle2 size={14} className="text-emerald-500" />}
                            {tx.status === "FAILED" && <AlertCircle size={14} className="text-rose-500" />}
                            {tx.status === "PENDING" && <Clock size={14} className="text-amber-500 animate-pulse" />}
                            {tx.status === "SUCCESS" ? t('filterSuccess') : tx.status === "FAILED" ? t('filterFailed') : t('filterPending')}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-xs text-slate-500 font-medium">
                          {new Date(tx.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-6 text-right">
                          <div className="flex justify-end items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            {tx.status === "FAILED" && (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleRefund(tx.id); }}
                                  className="text-xs font-black uppercase tracking-widest bg-amber-100 text-amber-700 px-3 py-1 rounded-xl hover:bg-amber-200 transition shadow-sm"
                                >
                                  {t('refund')}
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleBlockUser(tx.id); }}
                                  className="text-xs font-black uppercase tracking-widest bg-rose-100 text-rose-700 px-3 py-1 rounded-xl hover:bg-rose-200 transition shadow-sm"
                                >
                                  {t('block')}
                                </button>
                              </>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(tx.id); }}
                              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-300 transition shadow-sm"
                              title={t('deleteTx')}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              </svg>
                            </button>
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

        {selectedTransaction && (
          <TransactionDetailModal
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
            onApprove={handleApprove}
          />
        )}
      </div>

      {confirmData && (
        <ConfirmModal
          open={true}
          title={confirmData.title}
          message={confirmData.message}
          onConfirm={confirmData.onConfirm}
          onCancel={() => setConfirmData(null)}
        />
      )}
    </>
  );
}

function TransactionDetailModal({
  transaction,
  onClose,
  onApprove,
}: {
  transaction: StoreTransaction;
  onClose: () => void;
  onApprove: (txId: string) => Promise<void>;
}) {
  const t = useTranslations("ProductDashboard");
  const [approving, setApproving] = useState(false);
  const detail = parseTransactionDetails(transaction.details);
  const buyerEmail = detail.userEmail || transaction.userEmail || t('unknown');
  const productName = detail.name || detail.product_name || t('unknown');
  const sku = detail.sku || "-";
  const color = detail.color || "-";
  const size = detail.size || "-";
  const qty = detail.qty || "1";
  const method = detail.method || t('unknown');
  const paymentStatus = detail.status_payment || t('waiting');
  const kota = detail.kota || t('unknown');
  const alamat = detail.alamat || t('unknown');
  const kodePos = detail.kode_pos || "-";
  const telepon = detail.telepon || "-";

  const handleApprove = async () => {
    setApproving(true);
    await onApprove(transaction.id);
    setApproving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white">
        <div className="flex justify-between items-center p-6 border-b bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-900">{t('txDetail')}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              #{transaction.id.slice(-8)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 w-10 h-10 rounded-full flex items-center justify-center transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('buyerEmail')}</span>
              <p className="font-bold text-slate-800">{buyerEmail}</p>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('amount')}</span>
              <p className="font-bold text-slate-800">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: transaction.currency || "IDR" }).format(Number(transaction.amount))}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('payStatus')}</span>
              <span
                className={`inline-flex items-center ml-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  paymentStatus === "Lunas" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                }`}
              >
                {paymentStatus}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('payMethod')}</span>
              <span className="inline-block ml-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-700">{method}</span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('colStatus')}</span>
              <span
                className={`inline-flex items-center gap-1 ml-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  transaction.status === "SUCCESS"
                    ? "bg-emerald-100 text-emerald-700"
                    : transaction.status === "FAILED"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {transaction.status === "SUCCESS" && <CheckCircle2 size={12} />}
                {transaction.status === "FAILED" && <AlertCircle size={12} />}
                {transaction.status === "PENDING" && <Clock size={12} />}
                {transaction.status === "SUCCESS" ? t('filterSuccess') : transaction.status === "FAILED" ? t('filterFailed') : t('filterPending')}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('date')}</span>
              <p className="font-bold text-slate-800 text-xs">
                {new Date(transaction.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('city')}</span>
              <p className="font-bold text-slate-800">{kota}</p>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('address')}</span>
              <p className="font-bold text-slate-800">{alamat}</p>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('postalCode')}</span>
              <p className="font-bold text-slate-800">{kodePos}</p>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('phone')}</span>
              <p className="font-bold text-slate-800">{telepon}</p>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('productDetail')}</span>
            <div className="mt-2 bg-slate-50 rounded-2xl p-4 text-sm border border-slate-100">
              <div className="grid grid-cols-2 gap-3">
                <p><strong>{t('colProduct')}</strong>: {productName}</p>
                <p><strong>{t('colSku')}</strong>: <span className="font-mono text-xs">{sku}</span></p>
                <p><strong>{t('color')}</strong>: {color}</p>
                <p><strong>{t('size')}</strong>: {size}</p>
                <p><strong>{t('qty')}</strong>: {qty}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <PrintTransactionInvoiceButton order={transaction} />
            <PrintLabelButton order={transaction} />
            {transaction.status === "PENDING" && (
              <button
                onClick={handleApprove}
                disabled={approving}
                className="flex-1 bg-emerald-600 text-white font-black uppercase tracking-widest text-xs py-3 rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20"
              >
                {approving ? t('processing') : t('approvePack')}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition"
            >
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function parseTransactionDetails(details: string | null): Record<string, string> {
  if (!details) return {};
  try {
    const parsed = JSON.parse(details);
    const safe: Record<string, string> = {};
    for (const key of Object.keys(parsed)) {
      safe[key] = String(parsed[key] ?? "");
    }
    return safe;
  } catch {
    return { _raw: details };
  }
}