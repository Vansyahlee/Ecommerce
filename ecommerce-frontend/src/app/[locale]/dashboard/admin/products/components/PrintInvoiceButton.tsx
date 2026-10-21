"use client";

import { type StoreProduct, type StoreTransaction } from "~/features/store/actions/StoreActions";
import QRCode from "qrcode";
import { calculateFinalPrice } from "~/lib/tax";
import { calculateVoucher } from "~/lib/voucher";
import { getStoreMetadata } from "~/features/store/actions/StoreActions";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

function parseDetails(details: string | null): Record<string, string> {
  if (!details) return {};
  try {
    const parsed = JSON.parse(details);
    const safe: Record<string, string> = {};
    for (const key of Object.keys(parsed)) {
      safe[key] = String(parsed[key] ?? "");
    }
    return safe;
  } catch {
    return { _raw: details };
  }
}

function getWarranty(detail: Record<string, string>): string | null {
  if (detail.category !== "Elektronik") return null;
  return detail.garansi || "Sesuai Kebijakan Toko";
}

export function PrintInvoiceButton({ product }: { product: StoreProduct }) {
  const t = useTranslations("ProductDashboard");
  const locale = useLocale();
  const locStr = locale === 'en' ? 'en-US' : 'id-ID';

  const isElectronic = product.category === "Elektronik";
  const isFood = product.category === "Makanan";
  
  const metadata = product.metadata as Record<string, unknown> | null;
  
  const warranty = isElectronic
    ? (metadata?.garansi ? String(metadata.garansi) : t('warranty'))
    : null;
    
  const discount = metadata?.diskon ? Number(metadata.diskon) : 0;
  const finalPrice = calculateFinalPrice(Number(product.price), product.category, discount);

  const handlePrint = () => {
    const invoiceHTML = `
      <!DOCTYPE html>
      <html lang="${locale}">
      <head>
        <meta charset="UTF-8">
        <title>${t('invoice')} ${product.sku}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #e11d48; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { font-size: 28px; font-weight: 900; color: #0f172a; }
          .header .sub { font-size: 12px; color: #64748b; font-weight: bold; }
          .invoice-number { text-align: right; font-size: 14px; font-weight: bold; color: #e11d48; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
          .info-table { width: 100%; border-collapse: collapse; }
          .info-table td { padding: 6px 0; font-size: 14px; border-bottom: 1px dotted #cbd5e1; }
          .info-table td:first-child { font-weight: bold; width: 160px; color: #475569; }
          .total { text-align: right; font-size: 20px; font-weight: 900; margin-top: 20px; padding-top: 15px; border-top: 2px dashed #cbd5e1; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; font-weight: bold; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>VANZ.STORE</h1>
            <div class="sub">Solusi Teknologi Masa Kini</div>
            <div class="sub">Jl. Teknologi No. 99, Jakarta</div>
            <div class="sub">Telp: 021-12345678 | Email: info@vanzstore.com</div>
          </div>
          <div class="invoice-number">
            ${t('invoice')}<br>
            <span style="font-size:18px; color:#0f172a;">${product.sku}</span><br>
            <span style="font-size:11px; color:#64748b;">${t('date')}: ${new Date().toLocaleDateString(locStr, { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
        </div>
        <div class="info-grid">
          <table class="info-table">
            <tr><td>${t('colProduct')}</td><td>: ${product.name}</td></tr>
            <tr><td>${t('colCategory')}</td><td>: ${product.category}</td></tr>
            <tr><td>${t('colBasePrice')}</td><td>: IDR ${finalPrice.price.toLocaleString(locStr)}</td></tr>
            ${discount > 0 ? `<tr><td>${t('colDiscount')}</td><td>: - IDR ${discount.toLocaleString(locStr)}</td></tr>` : ""}
            <tr><td>${t('shipping')}</td><td>: IDR ${finalPrice.shippingCost.toLocaleString(locStr)}</td></tr>
            ${finalPrice.ppn > 0 ? `<tr><td>${finalPrice.taxInfo.label}</td><td>: + IDR ${Math.round(finalPrice.ppn).toLocaleString(locStr)}</td></tr>` : ""}
            ${finalPrice.ppnbm > 0 ? `<tr><td>PPnBM (${finalPrice.taxInfo.ppnbmRate * 100}%)</td><td>: + IDR ${Math.round(finalPrice.ppnbm).toLocaleString(locStr)}</td></tr>` : ""}
            ${isFood && product.expiryDate ? `<tr><td>${t('expiryDate')}</td><td>: ${new Date(product.expiryDate).toLocaleDateString(locStr, { day: "numeric", month: "long", year: "numeric" })}</td></tr>` : ""}
            ${warranty ? `<tr><td>${t('warranty')}</td><td>: ${warranty}</td></tr>` : ""}
          </table>
          <table class="info-table">
            <tr><td>${t('colStock')}</td><td>: ${product.stock}</td></tr>
            <tr><td>${t('entryDate')}</td><td>: ${new Date(product.createdAt).toLocaleDateString(locStr, { day: "numeric", month: "long", year: "numeric" })}</td></tr>
          </table>
        </div>
        <div class="total">${t('colTotal')}: IDR ${Math.round(finalPrice.finalTotal).toLocaleString(locStr)}</div>
        <div class="footer">
          ${t('thankYou')}
        </div>
      </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.bottom = '0';
    iframe.style.right = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    iframe.contentDocument?.write(invoiceHTML);
    iframe.contentDocument?.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 2000);
    }, 500);
  };

  return (
    <button
      onClick={handlePrint}
      className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition"
      title={t('printInvoice')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <path d="M6 9V3h12v6" />
        <rect x="6" y="15" width="12" height="6" rx="2" />
      </svg>
    </button>
  );
}

export function PrintTransactionInvoiceButton({ order }: { order: StoreTransaction }) {
  const t = useTranslations("ProductDashboard");
  const locale = useLocale();
  const locStr = locale === 'en' ? 'en-US' : 'id-ID';

  const detail = parseDetails(order.details);
  const warranty = getWarranty(detail);
  const isFood = detail.category === "Makanan";
  const discount = detail.diskon ? Number(detail.diskon) : 0;
  const shippingCost = detail.shippingCost ? Number(detail.shippingCost) : 5000;
  const category = detail.category || "Umum";

  const [storeMeta, setStoreMeta] = useState<Record<string, unknown>>({});

  useEffect(() => {
    (async () => {
      const meta = await getStoreMetadata("b05aebfd-2b55-450e-b5f7-ee42e53c6250");
      setStoreMeta(meta);
    })();
  }, []);

  const voucherMin = (storeMeta.voucher_min as number) || 250000;
  const voucherDiscount = (storeMeta.voucher_discount as number) || 15000;
  const voucherExpiry = (storeMeta.voucher_expiry as string) || undefined;

  const totalBelanja = Number(order.amount);
  const voucher = calculateVoucher(totalBelanja, category, voucherMin, voucherDiscount, voucherExpiry);
  const totalDiscount = discount + voucher.voucherAmount;
  const finalPrice = calculateFinalPrice(totalBelanja, category, totalDiscount, shippingCost);

  const handlePrint = () => {
    const invoiceHTML = `
      <!DOCTYPE html>
      <html lang="${locale}">
      <head>
        <meta charset="UTF-8">
        <title>${t('invoice')} ${order.id.slice(-8)}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #e11d48; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { font-size: 28px; font-weight: 900; color: #0f172a; }
          .header .sub { font-size: 12px; color: #64748b; font-weight: bold; }
          .invoice-number { text-align: right; font-size: 14px; font-weight: bold; color: #e11d48; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
          .info-table { width: 100%; border-collapse: collapse; }
          .info-table td { padding: 6px 0; font-size: 14px; border-bottom: 1px dotted #cbd5e1; }
          .info-table td:first-child { font-weight: bold; width: 160px; color: #475569; }
          .total { text-align: right; font-size: 20px; font-weight: 900; margin-top: 20px; padding-top: 15px; border-top: 2px dashed #cbd5e1; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; font-weight: bold; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>VANZ.STORE</h1>
            <div class="sub">Solusi Teknologi Masa Kini</div>
            <div class="sub">Jl. Teknologi No. 99, Jakarta</div>
            <div class="sub">Telp: 021-12345678 | Email: info@vanzstore.com</div>
          </div>
          <div class="invoice-number">
            ${t('receipt')}<br>
            <span style="font-size:18px; color:#0f172a;">#${order.id.slice(-8)}</span><br>
            <span style="font-size:11px; color:#64748b;">${t('date')}: ${new Date().toLocaleDateString(locStr, { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
        </div>
        <div class="info-grid">
          <table class="info-table">
            <tr><td>${t('customer')}</td><td>: ${detail.userEmail || order.userEmail || "Unknown"}</td></tr>
            <tr><td>${t('paymentStatus')}</td><td>: ${detail.status_payment || t('unpaid')}</td></tr>
            ${detail.method ? `<tr><td>${t('paymentMethod')}</td><td>: ${detail.method}</td></tr>` : ""}
            ${detail.name ? `<tr><td>${t('colProduct')}</td><td>: ${detail.name}</td></tr>` : ""}
            ${detail.sku ? `<tr><td>${t('colSku')}</td><td>: ${detail.sku}</td></tr>` : ""}
            ${detail.color ? `<tr><td>${t('color')}</td><td>: ${detail.color}</td></tr>` : ""}
            ${detail.size ? `<tr><td>${t('size')}</td><td>: ${detail.size}</td></tr>` : ""}
            ${detail.qty ? `<tr><td>${t('qty')}</td><td>: ${detail.qty}</td></tr>` : ""}
            <tr><td>${t('colBasePrice')}</td><td>: IDR ${finalPrice.price.toLocaleString(locStr)}</td></tr>
            ${discount > 0 ? `<tr><td>${t('colDiscount')}</td><td>: - IDR ${discount.toLocaleString(locStr)}</td></tr>` : ""}
            ${voucher.voucherAmount > 0 ? `<tr><td>${voucher.voucherLabel}</td><td>: - IDR ${voucher.voucherAmount.toLocaleString(locStr)}</td></tr>` : ""}
            <tr><td>${t('shipping')}</td><td>: IDR ${finalPrice.shippingCost.toLocaleString(locStr)}</td></tr>
            ${finalPrice.ppn > 0 ? `<tr><td>${finalPrice.taxInfo.label}</td><td>: + IDR ${Math.round(finalPrice.ppn).toLocaleString(locStr)}</td></tr>` : ""}
            ${finalPrice.ppnbm > 0 ? `<tr><td>PPnBM (${finalPrice.taxInfo.ppnbmRate * 100}%)</td><td>: + IDR ${Math.round(finalPrice.ppnbm).toLocaleString(locStr)}</td></tr>` : ""}
            ${isFood && detail.expiryDate ? `<tr><td>${t('expiryDate')}</td><td>: ${new Date(detail.expiryDate).toLocaleDateString(locStr, { day: "numeric", month: "long", year: "numeric" })}</td></tr>` : ""}
            ${warranty ? `<tr><td>${t('warranty')}</td><td>: ${warranty}</td></tr>` : ""}
            ${detail.alamat ? `<tr><td>${t('address')}</td><td>: ${detail.alamat}</td></tr>` : ""}
            ${detail.kota ? `<tr><td>${t('city')}</td><td>: ${detail.kota}</td></tr>` : ""}
            ${detail.kode_pos ? `<tr><td>${t('postalCode')}</td><td>: ${detail.kode_pos}</td></tr>` : ""}
            ${detail.telepon ? `<tr><td>${t('phone')}</td><td>: ${detail.telepon}</td></tr>` : ""}
          </table>
          <table class="info-table">
            <tr><td>${t('colTotal')}</td><td>: IDR ${Math.round(finalPrice.finalTotal).toLocaleString(locStr)}</td></tr>
          </table>
        </div>
        <div class="total">${t('colTotal')}: IDR ${Math.round(finalPrice.finalTotal).toLocaleString(locStr)}</div>
        <div class="footer">
          ${t('thankYou')}
        </div>
      </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.bottom = '0';
    iframe.style.right = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    iframe.contentDocument?.write(invoiceHTML);
    iframe.contentDocument?.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 2000);
    }, 500);
  };

  return (
    <button
      onClick={handlePrint}
      className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition"
    >
      {t('printInvoice')}
    </button>
  );
}

export function PrintLabelButton({ order }: { order: StoreTransaction }) {
  const t = useTranslations("ProductDashboard");
  
  const detail = parseDetails(order.details);
  const customerName = detail.userEmail || order.userEmail || t('customer');
  const alamat = detail.alamat || "-";
  const kota = detail.kota || "";
  const kodePos = detail.kode_pos || "";
  const telepon = detail.telepon || "";
  const productName = detail.name || t('colProduct');
  const sku = detail.sku || "";
  const color = detail.color || "";
  const size = detail.size || "";

  const handlePrintLabel = async () => {
    const qrDataUrl = await QRCode.toDataURL(order.id, { width: 120, margin: 1 });

    const labelHTML = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>${t('shippingLabel')}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; width: 10.5cm; margin: 0 auto; color: #1e293b; }
          .label { border: 2px solid #0f172a; border-radius: 12px; padding: 18px; background: #ffffff; }
          .logo { font-size: 20px; font-weight: 900; color: #e11d48; margin-bottom: 10px; }
          .divider { border-top: 1px dashed #cbd5e1; margin: 10px 0; }
          .recipient { font-size: 15px; font-weight: 700; }
          .address { font-size: 13px; margin: 6px 0; color: #334155; }
          .product-box { background: #f1f5f9; border-radius: 8px; padding: 10px; margin: 12px 0; font-size: 12px; }
          .product-box span { font-weight: 700; }
          .bottom { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 12px; }
          .note { font-size: 10px; color: #64748b; }
          .qr { text-align: right; }
          .qr img { width: 70px; height: 70px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="logo">🚀 VANZ.STORE</div>
          <div class="divider"></div>
          <div class="recipient">📦 ${customerName}</div>
          <div class="address">${alamat}</div>
          <div class="address">${kota}, ${kodePos}</div>
          ${telepon ? `<div class="address">📞 ${telepon}</div>` : ""}
          <div class="divider"></div>
          <div class="product-box">
            <span>🛍️ ${t('colProduct')}:</span> ${productName}<br>
            ${sku ? `<span>🔖 ${t('colSku')}:</span> ${sku}<br>` : ""}
            ${color ? `<span>🎨 ${t('color')}:</span> ${color}<br>` : ""}
            ${size ? `<span>📏 ${t('size')}:</span> ${size}<br>` : ""}
          </div>
          <div class="bottom">
            <div class="note">${t('orderNo')}: #${order.id.slice(-8)}<br>${t('damageNote')}</div>
            <div class="qr"><img src="${qrDataUrl}" alt="QR"></div>
          </div>
        </div>
      </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.bottom = '0';
    iframe.style.right = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    iframe.contentDocument?.write(labelHTML);
    iframe.contentDocument?.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 2000);
    }, 500);
  };

  return (
    <button
      onClick={handlePrintLabel}
      className="px-4 py-2 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs uppercase tracking-wider hover:bg-blue-200 transition"
    >
      {t('printLabel')}
    </button>
  );
}