"use client";

import { useMemo, useState } from "react";
import { refundTransaction } from "~/features/auth/hooks/useAdminActions";
import type { AdminProduct, AdminTransaction, AdminUser } from "~/features/auth/hooks/useAdminActions";
import { Button } from "~/components/ui/button";
import {
  Activity,
  Box,
  Store,
  UserCheck,
  UserX,
  Users,
  ShieldAlert,
  Zap
} from "lucide-react";

type ViewKey = "users" | "active_admins" | "products" | "transactions";
type Currency = "USD" | "IDR" | "EUR" | "GBP" | "RUB" | "CNY" | "JPY";

const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  IDR: 16200,
  EUR: 0.94,
  GBP: 0.81,
  RUB: 93.5,
  CNY: 7.24,
  JPY: 154.6,
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false,
  });
};

const getStockCount = (p: AdminProduct): number | undefined => {
  const raw = (p as Record<string, unknown>)["stock"];
  return typeof raw === "number" ? raw : undefined;
};

function MetricCard({
  active,
  title,
  value,
  icon,
  onClick,
}: {
  active: boolean;
  title: string;
  value: number;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "text-left bg-white border-2 p-6 rounded-[32px] shadow-sm transition-all w-full",
        active ? "border-rose-500 scale-105 shadow-xl" : "border-slate-100 hover:border-rose-100",
      ].join(" ")}
    >
      <div className={["mb-4 p-3 rounded-2xl w-fit", active ? "bg-rose-500 text-white" : "bg-slate-50 text-slate-400"].join(" ")}>
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
      <h3 className="text-3xl font-black tracking-tight">{value}</h3>
    </button>
  );
}

export function AdminDashboardClient({
  users,
  products,
  transactions,
  initialView = "users",
  toggleBlockUser,
}: {
  users?: AdminUser[];
  products?: AdminProduct[];
  transactions?: AdminTransaction[];
  initialView?: ViewKey;
  toggleBlockUser: (userId: string) => Promise<void>;
}) {
  const [view, setView] = useState<ViewKey>(initialView);
  const [currency, setCurrency] = useState<Currency>("USD");

  const safeUsers = useMemo(() => users ?? [], [users]);
  const safeProducts = useMemo(() => products ?? [], [products]);
  const safeTransactions = useMemo(() => transactions ?? [], [transactions]);

  const activeAdmins = useMemo(
    () => safeUsers.filter((u) => u.role === "ADMIN" && Boolean(u.hasActiveSession)),
    [safeUsers]
  );

  const userRows = useMemo(() => {
    if (view === "active_admins") return activeAdmins;
    return safeUsers;
  }, [view, safeUsers, activeAdmins]);

  const formatPrice = (priceInUsd: string) => {
    const numericPrice = parseFloat(priceInUsd) || 0;
    const converted = numericPrice * EXCHANGE_RATES[currency];
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency,
    }).format(converted);
  };

  return (
    <>
      <div className="flex justify-end mb-6">
        <div className="bg-slate-900 p-1.5 rounded-2xl flex gap-1 border border-slate-800 shadow-2xl">
          {(Object.keys(EXCHANGE_RATES) as Currency[]).map((cur) => (
            <button
              key={cur}
              onClick={() => setCurrency(cur)}
              className={[
                "px-4 py-1.5 rounded-xl text-[10px] font-black transition-all",
                currency === cur ? "bg-rose-600 text-white shadow-lg scale-110" : "text-slate-500 hover:text-slate-300",
              ].join(" ")}
            >
              {cur}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <MetricCard active={view === "users"} title="Total Users" value={safeUsers.length} onClick={() => setView("users")} icon={<Users size={24} />} />
        <MetricCard active={view === "active_admins"} title="Active Admins" value={activeAdmins.length} onClick={() => setView("active_admins")} icon={<Store size={24} />} />
        <MetricCard active={view === "products"} title="Products" value={safeProducts.length} onClick={() => setView("products")} icon={<Box size={24} />} />
        <MetricCard active={view === "transactions"} title="Transactions" value={safeTransactions.length} onClick={() => setView("transactions")} icon={<Activity size={24} />} />
      </div>

      <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <h2 className="font-black uppercase tracking-widest text-xs text-slate-500">
            {view === "products" ? "Inventory — Global Prices" : "Global Access Management"}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-tighter">Live Monitor</span>
            <div className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
          </div>
        </div>

        <div className="overflow-x-auto">
          {view === "products" ? (
            <table className="w-full text-left">
              <thead className="bg-slate-50/30 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-8 py-4">Product Name</th>
                  <th className="px-8 py-4">Price ({currency})</th>
                  <th className="px-8 py-4">Created</th>
                  <th className="px-8 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-sm text-slate-700">
                {safeProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/30 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{p.name}</span>
                        <span className="text-[11px] text-slate-400 line-clamp-1">{p.description}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-black text-rose-600 text-base">{formatPrice(p.price)}</td>
                    <td className="px-8 py-6 text-[11px] text-slate-400" suppressHydrationWarning>{formatDate(p.createdAt)}</td>
                    <td className="px-8 py-6 text-right">
                      {getStockCount(p) === 0 ? (
                        <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-[9px] font-black uppercase border border-rose-200">
                          Stok Habis
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase border border-emerald-100">
                          In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : view === "transactions" ? (
            <table className="w-full text-left">
              <thead className="bg-slate-50/30 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-8 py-4">Action & Log</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Security Analysis</th>
                  <th className="px-8 py-4">Timestamp</th>
                  <th className="px-8 py-4 text-right">Emergency Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-sm text-slate-700">
                {safeTransactions.map((t) => (
                  <tr key={t.id} className={["hover:bg-slate-50/30 transition-all", t.details?.toLowerCase().includes("failed") ? "bg-rose-50/30" : ""].join(" ")}>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{t.action}</span>
                        <span className="text-[11px] text-slate-400">{t.adminEmail || "Anonymous System"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={[
                        "px-3 py-1 rounded-lg text-[9px] font-black uppercase border",
                        t.status === "FAILED" ? "bg-rose-100 text-rose-700 border-rose-200" : "bg-emerald-100 text-emerald-700 border-emerald-200"
                      ].join(" ")}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {t.details?.toLowerCase().includes("suspicious") || t.details?.toLowerCase().includes("failed") ? (
                        <div className="flex items-center gap-2 text-rose-600 font-black animate-pulse">
                          <ShieldAlert size={14} />
                          <span className="text-[10px] uppercase">Mencurigakan</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[10px] font-bold">NORMAL ACTIVITY</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-[11px] text-slate-500" suppressHydrationWarning>{formatDate(t.createdAt)}</td>
                    <td className="px-8 py-6 text-right">
                      {t.status === "FAILED" ? (
                        <div className="inline-flex items-center gap-2">
                          <form action={toggleBlockUser.bind(null, t.adminId)}>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="rounded-xl font-black text-[10px] h-8 px-4 shadow-lg shadow-rose-200 hover:scale-105 transition-transform"
                            >
                              BLOCK USER
                            </Button>
                          </form>
                          <form action={refundTransaction.bind(null, t.id)}>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="rounded-xl font-black text-[10px] h-8 px-4 shadow-lg shadow-rose-200 hover:scale-105 transition-transform"
                            >
                              REFUND
                            </Button>
                          </form>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50/30 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-8 py-4">User Profile</th>
                  <th className="px-8 py-4">Auth Role</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Operation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-sm text-slate-700">
                {userRows.map((user) => (
                  <tr key={user.id} className="group hover:bg-slate-50/30 transition-all">
                    <td className="px-8 py-6 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 uppercase">
                        {user.name?.[0] || user.email?.[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 group-hover:text-rose-600 transition-colors">{user.name || "User"}</span>
                        <span className="text-[11px] text-slate-400 font-medium">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={["px-3 py-1 rounded-lg text-[9px] font-black border uppercase tracking-widest", user.role === "SUPER_ADMIN" ? "bg-rose-50 text-rose-600 border-rose-100" : user.role === "ADMIN" ? "bg-cyan-50 text-cyan-600 border-cyan-100" : "bg-slate-50 text-slate-600 border-slate-100"].join(" ")}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`flex items-center gap-2 ${user.isBlocked ? "text-rose-500" : "text-emerald-500"}`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${user.isBlocked ? "bg-rose-500" : "bg-emerald-500 animate-pulse"}`} />
                        <span className="text-[10px] font-black uppercase">{user.isBlocked ? "Blocked" : "Active"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {user.role !== "SUPER_ADMIN" && (
                        <form action={toggleBlockUser.bind(null, user.id)}>
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all">
                            {user.isBlocked ? <UserCheck size={16} /> : <UserX size={16} />}
                          </Button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="mt-8 bg-slate-900 rounded-[32px] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-rose-600 rounded-2xl shadow-lg shadow-rose-500/20">
            <Zap size={32} className="fill-current" />
          </div>
          <div>
            <h4 className="text-xl font-black tracking-tight">Security Protocol Active</h4>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Real-time threat detection & currency sync enabled</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-center px-6 py-2 bg-slate-800 rounded-2xl border border-slate-700">
            <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Global Rate</p>
            <p className="font-black text-rose-500">{currency} 1 : {EXCHANGE_RATES[currency].toLocaleString()}</p>
          </div>
        </div>
      </div>
    </>
  );
}