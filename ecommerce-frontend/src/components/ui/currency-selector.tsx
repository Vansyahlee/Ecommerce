"use client";

import { currencies, type CurrencyCode } from '~/lib/currency';
import { useCurrency } from '~/features/auth/hooks/useCurrency';

export function CurrencySelector() {
  const { selectedCurrency, changeCurrency } = useCurrency();

  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(currencies) as CurrencyCode[]).map((code) => (
        <button
          key={code}
          onClick={() => changeCurrency(code)}
          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition ${
            selectedCurrency === code
              ? 'bg-rose-600 text-white'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}