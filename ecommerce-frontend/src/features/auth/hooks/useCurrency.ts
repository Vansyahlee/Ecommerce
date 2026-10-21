"use client";

import { useState, useEffect, useCallback } from 'react';
import { currencies, type CurrencyCode, updateCurrencyRates } from '~/lib/currency';
import { getLocalStorage, setLocalStorage } from '~/features/auth/constants/localStorage';

export function useCurrency() {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(() => {
    if (typeof window !== 'undefined') {
      const saved = getLocalStorage<string>('vanz-currency');
      const validCodes = ['IDR', 'USD', 'EUR', 'GBP', 'RUB', 'CNY', 'JPY'];
      if (saved && validCodes.includes(saved)) {
        return saved as CurrencyCode;
      }
    }
    return 'IDR';
  });

  const [ratesReady, setRatesReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function updateRates() {
      await updateCurrencyRates();
      if (!cancelled) setRatesReady(true);
    }
    updateRates();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const handleChange = () => {
      const saved = getLocalStorage<string>('vanz-currency');
      const validCodes = ['IDR', 'USD', 'EUR', 'GBP', 'RUB', 'CNY', 'JPY'];
      
      if (saved && validCodes.includes(saved)) {
        setSelectedCurrency(saved as CurrencyCode);
      }
    };
    
    window.addEventListener('storage', handleChange);
    window.addEventListener('vanz-currency-changed', handleChange);
    
    return () => {
      window.removeEventListener('storage', handleChange);
      window.removeEventListener('vanz-currency-changed', handleChange);
    };
  }, []);

  const changeCurrency = useCallback((code: CurrencyCode) => {
    setLocalStorage('vanz-currency', code);
    setSelectedCurrency(code);
    window.dispatchEvent(new Event('vanz-currency-changed'));
  }, []);

  const formatCurrency = useCallback((amountInIDR: number, options?: { compact?: boolean }) => {
    const info = currencies[selectedCurrency];
    const converted = amountInIDR * info.rateToIDR;
    const compact = options?.compact ?? false;

    if (compact) {
      if (converted >= 1_000_000) return `${(converted / 1_000_000).toFixed(1)}M`;
      if (converted >= 1_000) return `${(converted / 1_000).toFixed(0)}rb`;
      return Math.round(converted).toString();
    }

    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: selectedCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(converted);
  }, [selectedCurrency]);

  return {
    selectedCurrency,
    currencyInfo: currencies[selectedCurrency],
    changeCurrency,
    formatCurrency,
    ratesReady,
  };
}