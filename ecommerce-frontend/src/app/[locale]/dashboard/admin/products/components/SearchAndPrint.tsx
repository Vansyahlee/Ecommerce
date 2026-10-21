"use client";

import { useTranslations } from "next-intl";

interface SearchAndPrintProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onPrintAll: () => void;
}

export function SearchAndPrint({ searchTerm, onSearchChange, onPrintAll }: SearchAndPrintProps) {
  const t = useTranslations("ProductDashboard");
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="relative w-full sm:w-96">
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-white border-2 border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition-all"
        />
        <svg
          className="absolute left-4 top-3.5 w-5 h-5 text-slate-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      <button
        onClick={onPrintAll}
        className="bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold uppercase tracking-widest text-[10px] py-3 px-6 rounded-2xl transition-all shadow-sm flex items-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <path d="M6 9V3h12v6" />
          <rect x="6" y="15" width="12" height="6" rx="2" />
        </svg>
        {t('printReport')}
      </button>
    </div>
  );
}