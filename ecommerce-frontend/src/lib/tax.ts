export interface TaxInfo {
    ppnRate: number;
    ppnbmRate: number;
    isLuxury: boolean;
    dppMultiplier: number;
    label: string;
  }
  
  const luxuryCategories = [
    "Mobil", "Motor", "Apartemen", "Rumah Mewah",
    "Pesawat", "Helikopter", "Kapal Pesiar", "Perhiasan",
    "Lukisan", "Barang Antik"
  ];
  
  const exemptCategories = [
    "Makanan Pokok", "Beras", "Daging", "Ikan", "Telur",
    "Sayur", "Susu Segar", "Gula Konsumsi",
    "Kesehatan", "Obat-obatan", "Alat Kesehatan",
    "Jasa Kesehatan", "Pendidikan"
  ];
  
  export function getTaxInfo(category: string): TaxInfo {
    const isLuxury = luxuryCategories.includes(category);
    const isExempt = exemptCategories.includes(category);
  
    if (isLuxury) {
      return {
        ppnRate: 0.12,
        ppnbmRate: 0.2,
        isLuxury: true,
        dppMultiplier: 1,
        label: "PPN 12% + PPnBM"
      };
    }
  
    if (isExempt) {
      return {
        ppnRate: 0,
        ppnbmRate: 0,
        isLuxury: false,
        dppMultiplier: 0,
        label: "Bebas PPN"
      };
    }
  
    return {
      ppnRate: 0.12,
      ppnbmRate: 0,
      isLuxury: false,
      dppMultiplier: 11 / 12,
      label: "PPN 11% (Efektif)"
    };
  }
  
  export function calculateTaxes(price: number, category: string) {
    const taxInfo = getTaxInfo(category);
    const dpp = price * taxInfo.dppMultiplier;
    const ppn = dpp * taxInfo.ppnRate;
    const ppnbm = taxInfo.ppnbmRate > 0 ? price * taxInfo.ppnbmRate : 0;
    const totalBeforeDiscount = price + ppn + ppnbm;
    return { price, dpp, ppn, ppnbm, totalBeforeDiscount, taxInfo };
  }
  
  export function calculateFinalPrice(
    price: number,
    category: string,
    discount: number = 0,
    shippingCost: number = 5000
  ) {
    const taxCalc = calculateTaxes(price, category);
    const discountAmount = discount > 0 ? discount : 0;
    const finalTotal = taxCalc.totalBeforeDiscount - discountAmount + shippingCost;
    return { ...taxCalc, discountAmount, shippingCost, finalTotal };
  }