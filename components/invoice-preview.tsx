"use client";

import { useEffect, useState } from "react";

interface PreviewItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoicePreviewProps {
  invoiceNumber: string;
  clientName: string;
  clientVatNumber: string;
  issueDate: string;
  dueDate: string;
  currencyLabel: string;
  items: PreviewItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  notes: string;
  // Optional seller info for public view
  sellerName?: string;
  sellerBusiness?: string;
  sellerAddress?: string;
  sellerPhone?: string;
  sellerEmail?: string;
  sellerVat?: string;
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function InvoicePreview({
  invoiceNumber,
  clientName,
  clientVatNumber,
  issueDate,
  dueDate,
  currencyLabel,
  items,
  subtotal,
  vatRate,
  vatAmount,
  total,
  notes,
  sellerName = "",
  sellerBusiness = "",
  sellerAddress = "",
  sellerPhone = "",
  sellerEmail = "",
  sellerVat = "",
}: InvoicePreviewProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    async function generateQR() {
      try {
        const { generateZatcaQRDataURL } = await import("@/lib/zatca/qr");
        const url = await generateZatcaQRDataURL({
          sellerName,
          vatNumber: sellerVat,
          timestamp: new Date().toISOString(),
          totalWithVat: total,
          vatTotal: vatAmount,
        });
        setQrDataUrl(url);
      } catch {
        // QR generation may fail in some environments
      }
    }
    if (total > 0) {
      generateQR();
    }
  }, [total, vatAmount, sellerName, sellerVat]);

  return (
    <div className="bg-white rounded-card border border-border shadow-card overflow-hidden">
      <div className="p-8 space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex justify-between items-start">
          {/* Seller info - right side */}
          <div className="text-end">
            <div className="flex items-center gap-3 justify-end mb-2">
              <div>
                <h2 className="text-lg font-arabic font-semibold">
                  {sellerName}
                </h2>
                <p className="text-xs text-muted font-arabic">
                  {sellerBusiness}
                </p>
              </div>
              <div className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center">
                <span className="text-white font-arabic font-bold text-sm">
                  {sellerName.charAt(0)}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted font-arabic">{sellerAddress}</p>
            <p className="text-xs text-muted font-inter">{sellerPhone}</p>
            <p className="text-xs text-muted font-inter">{sellerEmail}</p>
            <p className="text-xs text-muted mt-1">
              <span className="font-arabic">الرقم الضريبي: </span>
              <span className="font-inter">{sellerVat}</span>
            </p>
          </div>

          {/* Invoice title + number - left side */}
          <div className="text-start">
            <h1 className="text-2xl font-arabic font-semibold mb-1">
              فاتورة ضريبية
            </h1>
            <p className="text-[10px] text-muted font-inter tracking-widest uppercase mb-3">
              TAX INVOICE
            </p>
            <div className="space-y-1 text-xs">
              <div className="flex gap-3">
                <span className="font-arabic text-muted">رقم الفاتورة</span>
                <span className="font-inter font-medium">{invoiceNumber}</span>
              </div>
              <div className="flex gap-3">
                <span className="font-arabic text-muted">تاريخ الإصدار</span>
                <span className="font-inter font-medium">{issueDate}</span>
              </div>
              <div className="flex gap-3">
                <span className="font-arabic text-muted">الاستحقاق</span>
                <span className="font-inter font-medium">{dueDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Client */}
        <div className="text-end">
          <p className="text-xs text-muted font-arabic mb-1">فاتورة إلى</p>
          <p className="font-arabic font-semibold text-sm">
            {clientName || "اسم العميل"}
          </p>
          {clientVatNumber && (
            <p className="text-xs text-muted mt-1">
              <span className="font-arabic">الرقم الضريبي: </span>
              <span className="font-inter">{clientVatNumber}</span>
            </p>
          )}
        </div>

        {/* Line items table */}
        <div className="overflow-hidden rounded-btn border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-background/60">
                <th className="text-end px-4 py-2.5 font-arabic font-medium text-muted text-xs">
                  الوصف
                </th>
                <th className="text-center px-3 py-2.5 font-arabic font-medium text-muted text-xs w-16">
                  الكمية
                </th>
                <th className="text-center px-3 py-2.5 font-arabic font-medium text-muted text-xs w-24">
                  السعر
                </th>
                <th className="text-start px-4 py-2.5 font-arabic font-medium text-muted text-xs w-24">
                  المجموع
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-t border-border/50">
                  <td className="text-end px-4 py-3 font-arabic text-xs">
                    {item.description || "—"}
                  </td>
                  <td className="text-center px-3 py-3 font-inter text-xs">
                    {item.quantity}
                  </td>
                  <td className="text-center px-3 py-3 font-inter text-xs">
                    {formatNumber(item.unitPrice)}
                  </td>
                  <td className="text-start px-4 py-3 font-inter text-xs font-medium">
                    {formatNumber(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-start">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-inter">{formatNumber(subtotal)} <span className="text-xs text-muted font-arabic">{currencyLabel}</span></span>
              <span className="font-arabic text-muted">المجموع الفرعي</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-inter">{formatNumber(vatAmount)} <span className="text-xs text-muted font-arabic">{currencyLabel}</span></span>
              <span className="font-arabic text-muted">
                ضريبة القيمة المضافة ({vatRate}%)
              </span>
            </div>
            <div className="border-t border-border pt-2">
              <div className="flex justify-between items-baseline">
                <span className="text-lg font-inter font-bold">
                  {formatNumber(total)}{" "}
                  <span className="text-xs text-muted font-arabic">{currencyLabel}</span>
                </span>
                <span className="font-arabic font-semibold">
                  الإجمالي المستحق
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code + Footer */}
        <div className="border-t border-border pt-4 flex justify-between items-end">
          <div>
            {qrDataUrl && (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="ZATCA QR" className="w-24 h-24" />
                <p className="text-[10px] text-muted font-arabic mt-1">
                  رمز التحقق - زاتكا
                </p>
              </div>
            )}
          </div>
          <div className="text-end">
            <p className="text-xs font-arabic text-muted font-medium mb-1">
              شروط الدفع
            </p>
            <p className="text-xs text-muted font-arabic">
              يُرجى السداد خلال 30 يوم من تاريخ الإصدار
            </p>
            {notes && (
              <p className="text-xs text-muted font-arabic mt-2 max-w-xs">
                {notes}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
