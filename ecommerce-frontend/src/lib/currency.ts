export type CurrencyCode = 'IDR' | 'USD' | 'EUR' | 'GBP' | 'RUB' | 'CNY' | 'JPY';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToIDR: number;
}

const STATIC_RATES: Record<CurrencyCode, number> = {
  IDR: 1,
  USD: 1 / 16800,
  EUR: 1 / 18200,
  GBP: 1 / 20800,
  RUB: 1 / 170,
  CNY: 1 / 2300,
  JPY: 1 / 112,
};

export const currencies: Record<CurrencyCode, CurrencyInfo> = {
  IDR:  { code: 'IDR', symbol: 'Rp', name: 'Rupiah',          rateToIDR: STATIC_RATES.IDR },
  USD:  { code: 'USD', symbol: '$',  name: 'US Dollar',       rateToIDR: STATIC_RATES.USD },
  EUR:  { code: 'EUR', symbol: '€',  name: 'Euro',            rateToIDR: STATIC_RATES.EUR },
  GBP:  { code: 'GBP', symbol: '£',  name: 'Pound Sterling',  rateToIDR: STATIC_RATES.GBP },
  RUB:  { code: 'RUB', symbol: '₽',  name: 'Ruble',           rateToIDR: STATIC_RATES.RUB },
  CNY:  { code: 'CNY', symbol: '¥',  name: 'Yuan',            rateToIDR: STATIC_RATES.CNY },
  JPY:  { code: 'JPY', symbol: '¥',  name: 'Yen',             rateToIDR: STATIC_RATES.JPY },
};

const API_URL = 'https://v6.exchangerate-api.com/v6/9a064c46c397f82bfa1a7dc7/latest/IDR';

export async function updateCurrencyRates(): Promise<void> {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    
    if (data.result === 'success') {
      const rates = data.conversion_rates;
      
      (Object.keys(currencies) as CurrencyCode[]).forEach(code => {
        if (code === 'IDR') return;
        if (rates[code]) {
          currencies[code].rateToIDR = rates[code]; // <- Perbaikan di sini, langsung pakai angkanya
        }
      });
      
      console.log('✅ Nilai tukar mata uang berhasil diperbarui');
    }
  } catch (error) {
    console.warn('⚠️ Gagal mengambil nilai tukar terbaru, menggunakan nilai tetap', error);
  }
}