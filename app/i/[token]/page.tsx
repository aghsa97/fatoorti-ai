"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Download } from "lucide-react";
import { InvoicePreview } from "@/components/invoice-preview";
import { CURRENCY_LABELS, type Currency } from "@/types";

interface InvoiceData {
  invoiceNumber: string;
  clientName: string;
  clientVatNumber: string;
  issueDate: string;
  dueDate: string;
  currencyLabel: string;
  items: { description: string; quantity: number; unitPrice: number; total: number }[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  notes: string;
  sellerName?: string;
  sellerBusiness?: string;
  sellerVat?: string;
  sellerAddress?: string;
  sellerEmail?: string;
  sellerPhone?: string;
}

export default function PublicInvoicePage() {
  const params = useParams();
  const token = params.token as string;
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!invoiceData) return;
    setPdfLoading(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { InvoicePDFDocument } = await import("@/components/invoice-pdf-document");
      const { generateZatcaQRDataURL } = await import("@/lib/zatca/qr");

      let qrDataUrl: string | undefined;
      if (invoiceData.total > 0) {
        qrDataUrl = await generateZatcaQRDataURL({
          sellerName: invoiceData.sellerName || "",
          vatNumber: invoiceData.sellerVat || "",
          timestamp: new Date().toISOString(),
          totalWithVat: invoiceData.total,
          vatTotal: invoiceData.vatAmount,
        });
      }

      const blob = await pdf(
        <InvoicePDFDocument
          data={{
            ...invoiceData,
            sellerName: invoiceData.sellerName || "",
            sellerBusiness: invoiceData.sellerBusiness || "",
            sellerVat: invoiceData.sellerVat || "",
            qrDataUrl,
          }}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoiceData.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download error:", err);
    } finally {
      setPdfLoading(false);
    }
  };

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const res = await fetch(`/api/invoices/share/${token}`);
        if (res.ok) {
          const { invoice, profile } = await res.json();
          const currency = (invoice.currency as Currency) || "SAR";
          const items = (invoice.invoice_items || []).map((item: Record<string, unknown>) => ({
            description: item.description as string,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unit_price),
            total: Number(item.total),
          }));

          setInvoiceData({
            invoiceNumber: invoice.invoice_number,
            clientName: invoice.client_name,
            clientVatNumber: invoice.client_vat_number || "",
            issueDate: invoice.issue_date,
            dueDate: invoice.due_date,
            currencyLabel: CURRENCY_LABELS[currency]?.ar || currency,
            items,
            subtotal: Number(invoice.subtotal),
            vatRate: Number(invoice.vat_rate),
            vatAmount: Number(invoice.vat_amount),
            total: Number(invoice.total),
            notes: invoice.notes || "",
            sellerName: profile?.full_name,
            sellerBusiness: profile?.business_name,
            sellerVat: profile?.vat_number,
            sellerAddress: profile?.address,
            sellerPhone: profile?.phone,
            sellerEmail: profile?.email,
          });
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoice();
  }, [token]);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-arabic font-bold text-xs">ف</span>
            </div>
            <span className="font-arabic font-semibold text-foreground text-sm">
              فاتورتي
            </span>
            <span className="text-[9px] font-inter font-medium text-accent border border-accent/30 rounded px-1 py-0.5 leading-none">
              AI
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-muted" />
          </div>
        ) : notFound ? (
          <div className="text-center py-24">
            <p className="text-lg font-arabic font-semibold mb-2">الفاتورة غير موجودة</p>
            <p className="text-sm text-muted font-arabic">
              الرابط غير صحيح أو تم حذف الفاتورة
            </p>
          </div>
        ) : invoiceData ? (
          <>
            <div className="flex justify-center mb-4">
              <button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-accent text-white rounded-btn font-arabic font-medium text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {pdfLoading ? (
                  <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
                ) : (
                  <Download size={14} strokeWidth={1.5} />
                )}
                {pdfLoading ? "جاري التحميل..." : "تحميل PDF"}
              </button>
            </div>
            <InvoicePreview {...invoiceData} />
          </>
        ) : null}

        {/* Footer */}
        <p className="text-center text-xs text-muted/40 font-arabic mt-8">
          أُنشئت بواسطة{" "}
          <a href="/new" className="text-accent hover:text-accent/80 transition-colors underline underline-offset-2">
            فاتورتي AI
          </a>{" "}
          · فوترة ذكية للمستقلين العرب
        </p>
      </div>
    </div>
  );
}
