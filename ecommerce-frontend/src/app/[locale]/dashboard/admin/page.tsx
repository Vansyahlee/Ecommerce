"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  getSalesAnalytics,
  getStoreProducts,
  getStoreTransactions,
} from "~/features/store/actions/StoreActions";
import type { SalesPoint, StoreProduct, StoreTransaction } from "~/features/store/actions/StoreActions";
import { BarChart3, DollarSign, PackageX, ShoppingCart, TrendingUp, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

const DynamicRevenueChart = dynamic(() => import("./RevenueChart"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-[11px] font-black uppercase tracking-widest text-slate-500">
      Loading chart…
    </div>
  ),
});

function shortIdr(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} M`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)} jt`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)} rb`;
  return n.toString();
}

function fullIdr(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function AdminCommandCenterPage() {
  const adminId = "b05aebfd-2b55-450e-b5f7-ee42e53c6250";
  const t = useTranslations("Dashboard");

  const [series, setSeries] = useState<SalesPoint[]>([]);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [transactions, setTransactions] = useState<StoreTransaction[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [lastUpdate, setLastUpdate] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [s, p, t] = await Promise.all([
          getSalesAnalytics(adminId, 14),
          getStoreProducts(adminId, 500),
          getStoreTransactions(adminId, 500),
        ]);
        if (!cancelled) {
          setSeries(s);
          setProducts(p);
          setTransactions(t);
          setLastUpdate(new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", hour12: false }));
        }
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [adminId]);

  const totalRevenue = useMemo(() => series.reduce((sum, p) => sum + p.revenue, 0), [series]);
  const activeOrders = useMemo(() => transactions.filter((t) => t.status === "PENDING").length, [transactions]);
  const outOfStock = useMemo(() => products.filter((p) => p.stock === 0).length, [products]);
  const successTransactions = useMemo(() => transactions.filter((t) => t.status === "SUCCESS").length, [transactions]);
  const failedTransactions = useMemo(() => transactions.filter((t) => t.status === "FAILED").length, [transactions]);
  const avgRevenuePerDay = useMemo(() => (series.length > 0 ? totalRevenue / series.length : 0), [series, totalRevenue]);

  const chartData = useMemo(() => series.map((p) => ({ ts: p.ts, revenue: p.revenue })), [series]);
  const recentTransactions = useMemo(() => transactions.slice(0, 10), [transactions]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen" suppressHydrationWarning>
      <div className="flex items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest">
            <BarChart3 size={12} />
            {t('badge')}
          </div>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">{t('title')}</h1>
          <p className="mt-2 text-slate-500 font-bold tracking-tight text-sm">{t('subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white border-2 border-slate-100 p-5 rounded-[32px] shadow-sm col-span-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><DollarSign size={22} /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('totalRevenue')}</p>
              <h3 className="text-2xl font-black tracking-tight text-slate-900">{loaded ? fullIdr(totalRevenue) : "—"}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-slate-100 p-5 rounded-[32px] shadow-sm col-span-1">
          <div className="flex flex-col gap-2">
            <div className="p-3 bg-cyan-50 rounded-2xl w-fit text-cyan-600"><ShoppingCart size={22} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('activeOrders')}</p>
            <h3 className="text-2xl font-black tracking-tight text-slate-900">{loaded ? activeOrders : "—"}</h3>
          </div>
        </div>

        <div className="bg-white border-2 border-slate-100 p-5 rounded-[32px] shadow-sm col-span-1">
          <div className="flex flex-col gap-2">
            <div className="p-3 bg-rose-50 rounded-2xl w-fit text-rose-600"><PackageX size={22} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('outOfStock')}</p>
            <h3 className="text-2xl font-black tracking-tight text-slate-900">{loaded ? outOfStock : "—"}</h3>
          </div>
        </div>

        <div className="bg-white border-2 border-slate-100 p-5 rounded-[32px] shadow-sm col-span-1">
          <div className="flex flex-col gap-2">
            <div className="p-3 bg-emerald-50 rounded-2xl w-fit text-emerald-600"><TrendingUp size={22} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('avgRevenue')}</p>
            <h3 className="text-2xl font-black tracking-tight text-slate-900">{loaded ? shortIdr(avgRevenuePerDay) : "—"}</h3>
          </div>
        </div>

        <div className="bg-white border-2 border-slate-100 p-5 rounded-[32px] shadow-sm col-span-1">
          <div className="flex flex-col gap-2">
            <div className="p-3 bg-red-50 rounded-2xl w-fit text-red-600"><XCircle size={22} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('failedTx')}</p>
            <h3 className="text-2xl font-black tracking-tight text-slate-900">{loaded ? failedTransactions : "—"}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-slate-900 rounded-[32px] p-6 shadow-2xl border border-slate-800">
          <div className="flex items-center justify-between gap-4 px-2">
            <div className="text-white">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-rose-400">{t('marketView')}</p>
              <h2 className="text-xl font-black tracking-tight">{t('chartTitle')}</h2>
              <p className="mt-1 text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                {t('lastUpdate')}: {loaded ? lastUpdate : "..."}
              </p>
            </div>
            <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <div className="mt-6 h-[340px]">
            <DynamicRevenueChart data={chartData} />
          </div>
        </div>

        <div className="bg-white border-2 border-slate-100 rounded-[32px] p-6 shadow-sm flex flex-col">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-4">{t('recentTransactions')}</h2>
          <div className="space-y-3 max-h-[340px] overflow-y-auto flex-1">
            {recentTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 font-bold uppercase">{t('noTransactions')}</p>
            ) : (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{tx.userEmail || "Unknown"}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest" suppressHydrationWarning>
                      {loaded ? new Date(tx.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "..."}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-900">{shortIdr(Number(tx.amount))}</p>
                    <span className={`text-[9px] font-black uppercase tracking-wider ${tx.status === 'SUCCESS' ? 'text-emerald-600' : tx.status === 'FAILED' ? 'text-rose-600' : 'text-amber-600'}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-700">
            <span>{t('success')}: {successTransactions}</span>
            <span>{t('failed')}: {failedTransactions}</span>
          </div>
        </div>
      </div>
    </div>
  );
}