"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { BarChart3, Package, Receipt, Settings, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { useState, useEffect } from "react";

const nav = [
  { href: "/dashboard/admin", label: "Command Center", icon: BarChart3 },
  { href: "/dashboard/admin/products", label: "Products", icon: Package },
  { href: "/dashboard/admin/transactions", label: "Transactions", icon: Receipt },
  { href: "/dashboard/admin/profile", label: "Profile", icon: Settings },
] as const;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const nowMobile = window.innerWidth < 768;
      setIsMobile(nowMobile);
      setIsSidebarOpen(!nowMobile);
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex" suppressHydrationWarning>
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`${
          isMobile
            ? `fixed top-0 left-0 h-full z-50 transition-transform duration-300 ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              } w-72`
            : `sticky top-0 h-screen transition-all duration-300 ${
                isSidebarOpen ? "w-80" : "w-20"
              }`
        } bg-slate-900 border-r border-slate-800 flex flex-col print:hidden`}
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && !isMobile && "justify-center w-full"}`}>
            <div className="h-8 w-8 rounded-full bg-rose-600 shadow-[0_0_12px_rgba(225,29,72,0.5)] flex items-center justify-center shrink-0">
              <span className="text-white font-black text-sm">V</span>
            </div>
            {(isSidebarOpen || isMobile) && (
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-rose-500">
                  Vanz.Store
                </span>
                <span className="text-2xl font-black tracking-tight text-white">Store Admin</span>
              </div>
            )}
          </div>
          {isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-slate-400 hover:text-white transition"
            >
              {isMobile ? <X size={20} /> : <PanelLeftClose size={20} />}
            </button>
          )}
        </div>

        {isSidebarOpen && (
          <p className="px-5 pt-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Enterprise Inventory Control
          </p>
        )}

        <nav className="flex-1 p-4">
          <div className="grid gap-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobile && setIsSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 border border-slate-800 bg-slate-900 hover:bg-slate-800/60 transition-colors ${
                  !isSidebarOpen && !isMobile && "justify-center px-2"
                }`}
              >
                <item.icon className="h-5 w-5 text-rose-500" />
                {(isSidebarOpen || isMobile) && (
                  <span className="text-sm font-black uppercase tracking-widest text-slate-200">
                    {item.label}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {!isSidebarOpen && !isMobile && (
          <div className="p-4 border-t border-slate-800 flex justify-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-slate-400 hover:text-white transition"
            >
              <PanelLeftOpen size={20} />
            </button>
          </div>
        )}
      </aside>

      {isMobile && (
        <header className="fixed top-0 left-0 right-0 h-14 bg-slate-900 border-b border-slate-800 flex items-center px-4 z-30 gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-slate-300 hover:text-white transition"
          >
            <PanelLeftOpen size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.4)] flex items-center justify-center shrink-0">
              <span className="text-white font-black text-xs">V</span>
            </div>
            <span className="text-sm font-black tracking-tight text-white">Vanz.Store</span>
          </div>
        </header>
      )}

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {isMobile && <div className="h-14" />}
        <main className="flex-1 overflow-y-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}