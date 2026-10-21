export interface VoucherResult {
    voucherLabel: string;
    voucherAmount: number;
  }
  
  export function calculateVoucher(
    totalBelanja: number,
    category: string,
    minBelanja?: number,
    discount?: number,
    expiryDate?: string
  ): VoucherResult {
    if (expiryDate && new Date() > new Date(expiryDate)) {
      return { voucherLabel: "", voucherAmount: 0 };
    }
  
    const effectiveMin = minBelanja ?? 250000;
    const effectiveDiscount = discount ?? 15000;
  
    const isElectronic = category === "Elektronik";
  
    if (isElectronic) {
      if (totalBelanja >= 100000000) return { voucherLabel: "Voucher Elektronik 100Jt+", voucherAmount: 15000000 };
      if (totalBelanja >= 60000000) return { voucherLabel: "Voucher Elektronik 60Jt", voucherAmount: 5000000 };
      if (totalBelanja >= 30000000) return { voucherLabel: "Voucher Elektronik 30Jt", voucherAmount: 5000000 };
      if (totalBelanja >= 20000000) return { voucherLabel: "Voucher Elektronik 20Jt", voucherAmount: 5000000 };
      if (totalBelanja >= 15000000) return { voucherLabel: "Voucher Elektronik 15Jt", voucherAmount: 5000000 };
      if (totalBelanja >= 10000000) return { voucherLabel: "Voucher Elektronik 10Jt", voucherAmount: 5000000 };
      if (totalBelanja >= 6000000)  return { voucherLabel: "Voucher Elektronik 6Jt", voucherAmount: 1500000 };
      if (totalBelanja >= 4000000)  return { voucherLabel: "Voucher Elektronik 4Jt", voucherAmount: 1500000 };
      if (totalBelanja >= 2000000)  return { voucherLabel: "Voucher Elektronik 2Jt", voucherAmount: 1500000 };
      return { voucherLabel: "", voucherAmount: 0 };
    }
  
    if (totalBelanja >= effectiveMin) {
      return { voucherLabel: "Voucher Diskon", voucherAmount: effectiveDiscount };
    }
    return { voucherLabel: "", voucherAmount: 0 };
  }