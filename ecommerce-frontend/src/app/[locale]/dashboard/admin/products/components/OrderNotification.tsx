"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getStoreTransactions, updateTransactionStatus, reduceProductStock, type StoreTransaction } from "~/features/store/actions/StoreActions";
import { OrderDetailModal } from "./OrderDetailModal";

export function OrderNotification({ adminId }: { adminId: string }) {
  const [pendingOrders, setPendingOrders] = useState<StoreTransaction[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<StoreTransaction | null>(null);
  const adminRef = useRef(adminId);

  useEffect(() => {
    adminRef.current = adminId;
  }, [adminId]);

  const fetchOrders = useCallback(async () => {
    try {
      const txs = await getStoreTransactions(adminRef.current, 20);
      setPendingOrders(txs.filter(t => t.status === 'PENDING'));
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleApply = useCallback(async (txId: string) => {
    try {
      await updateTransactionStatus(txId, 'SUCCESS');
      const txs = await getStoreTransactions(adminRef.current, 20);
      const tx = txs.find(t => t.id === txId);
      if (tx?.details) {
        const detail = JSON.parse(tx.details);
        if (detail.sku && detail.qty) {
          await reduceProductStock(detail.sku, parseInt(detail.qty));
        }
      }
      await fetchOrders();
      setSelectedOrder(null);
    } catch {
      alert('Gagal memproses pesanan.');
    }
  }, [fetchOrders]);

  if (pendingOrders.length === 0) return null;

  return (
    <>
      <div className="bg-linear-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-2xl p-5 mb-6 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-700">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </div>
            <div>
              <p className="font-black text-amber-800 text-lg">
                {pendingOrders.length} Pesanan Baru Menunggu Dikemas
              </p>
              <p className="text-sm text-amber-600 font-medium">
                Klik email untuk lihat detail & cetak faktur
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-2 max-h-64 overflow-y-auto">
          {pendingOrders.map(order => {
            let parsed: Record<string, unknown> = {};
            try { parsed = JSON.parse(order.details || "{}"); } catch {}
            const method = (parsed.method as string) || "Transfer";
            const paymentStatus = (parsed.status_payment as string) || "Menunggu";
            const amount = new Intl.NumberFormat("id-ID", { style: "currency", currency: order.currency || "IDR" }).format(Number(order.amount));

            return (
              <div key={order.id} className="flex items-center justify-between bg-white/60 p-3 rounded-xl hover:bg-white transition">
                <button onClick={() => setSelectedOrder(order)} className="text-left flex-1 mr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-800">{order.userEmail || "Customer"}</span>
                    <span className="text-[10px] text-slate-400">#{order.id.slice(-8)}</span>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wide mt-1">
                    <span className={`${paymentStatus === "Lunas" ? "text-emerald-600" : "text-rose-600"}`}>{paymentStatus}</span>
                    <span className="mx-2 text-slate-300">|</span>
                    <span className="text-slate-500">{method}</span>
                    <span className="ml-2 text-slate-700">{amount}</span>
                  </div>
                </button>
                <button
                  onClick={() => handleApply(order.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded-lg transition shrink-0"
                >
                  Proses
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onProcessSuccess={handleApply}
        />
      )}
    </>
  );
}