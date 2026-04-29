"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Download,
  Link2,
  Send,
  Save,
  ArrowRight,
  Plus,
  Trash2,
  Sparkles,
  Check,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { type ExtractionResult, type Currency, type InvoiceStatus, CURRENCY_LABELS, STATUS_LABELS } from "@/types";
import { calculateVat } from "@/lib/vat";
import { InvoicePreview } from "@/components/invoice-preview";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceFormData {
  clientName: string;
  clientVatNumber: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  currency: Currency;
  vatRate: number;
  items: LineItem[];
  notes: string;
}

interface InvoiceEditorProps {
  extractionData: ExtractionResult | null;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function getTodayISO() {
  return new Date().toISOString().split("T")[0];
}

function getDefaultDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split("T")[0];
}

interface SellerProfile {
  fullName: string;
  businessName: string;
  vatNumber: string;
  address: string;
  phone: string;
  email: string;
}

export function InvoiceEditor({ extractionData }: InvoiceEditorProps) {
  const [seller, setSeller] = useState<SellerProfile>({
    fullName: "",
    businessName: "",
    vatNumber: "",
    address: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/profile?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setSeller({
            fullName: data.full_name || "",
            businessName: data.business_name || "",
            vatNumber: data.vat_number || "",
            address: data.address || "",
            phone: data.phone || "",
            email: data.email || "",
          });
        }
      } catch {
        // Profile not available
      }
    }
    fetchProfile();
  }, []);
  const [form, setForm] = useState<InvoiceFormData>(() => {
    if (extractionData) {
      return {
        clientName: extractionData.client_name,
        clientVatNumber: "",
        clientEmail: extractionData.client_contact || "",
        issueDate: getTodayISO(),
        dueDate: extractionData.due_date || getDefaultDueDate(),
        currency: extractionData.currency,
        vatRate: 15,
        items: extractionData.deliverables.length > 0
          ? extractionData.deliverables.map((d) => ({
              id: generateId(),
              description: d,
              quantity: 1,
              unitPrice: extractionData.deliverables.length === 1
                ? extractionData.amount
                : Math.round(extractionData.amount / extractionData.deliverables.length),
            }))
          : [
              {
                id: generateId(),
                description: extractionData.service_description_ar,
                quantity: 1,
                unitPrice: extractionData.amount,
              },
            ],
        notes: extractionData.notes || "",
      };
    }
    return {
      clientName: "",
      clientVatNumber: "",
      clientEmail: "",
      issueDate: getTodayISO(),
      dueDate: getDefaultDueDate(),
      currency: "SAR",
      vatRate: 15,
      items: [{ id: generateId(), description: "", quantity: 1, unitPrice: 0 }],
      notes: "",
    };
  });

  const [invoiceNumber] = useState(() => {
    const year = new Date().getFullYear();
    const num = String(Math.floor(Math.random() * 900) + 100);
    return `INV-${year}-${num}`;
  });

  const subtotal = form.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const { vatAmount, total } = calculateVat(subtotal, form.vatRate);

  const updateField = useCallback(
    <K extends keyof InvoiceFormData>(field: K, value: InvoiceFormData[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const updateItem = useCallback(
    (id: string, field: keyof LineItem, value: string | number) => {
      setForm((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        ),
      }));
    },
    []
  );

  const addItem = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: generateId(), description: "", quantity: 1, unitPrice: 0 },
      ],
    }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter((i) => i.id !== id) : prev.items,
    }));
  }, []);

  const currencyLabel = CURRENCY_LABELS[form.currency]?.ar || form.currency;

  const [status, setStatus] = useState<InvoiceStatus>("draft");
  const [linkCopied, setLinkCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string>(() => crypto.randomUUID());

  const buildPayload = (overrideStatus?: InvoiceStatus) => ({
    invoiceNumber,
    clientName: form.clientName,
    clientEmail: "",
    clientVatNumber: form.clientVatNumber,
    issueDate: form.issueDate,
    dueDate: form.dueDate,
    currency: form.currency,
    subtotal,
    vatRate: form.vatRate,
    vatAmount,
    total,
    status: overrideStatus || status,
    notes: form.notes,
    items: form.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  });

  const handleSave = async (overrideStatus?: InvoiceStatus) => {
    setSaving(true);
    try {
      if (savedId) {
        // Update existing
        const res = await fetch(`/api/invoices/${savedId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload(overrideStatus)),
        });
        if (!res.ok) throw new Error("Update failed");
        const data = await res.json();
        if (data.public_share_token) setShareToken(data.public_share_token);
      } else {
        // Create new
        const res = await fetch("/api/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload(overrideStatus)),
        });
        if (!res.ok) throw new Error("Create failed");
        const data = await res.json();
        setSavedId(data.id);
        if (data.public_share_token) setShareToken(data.public_share_token);
      }
      if (overrideStatus) setStatus(overrideStatus);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = async () => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/i/${shareToken}`;
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { InvoicePDFDocument } = await import("@/components/invoice-pdf-document");
      const { generateZatcaQRDataURL } = await import("@/lib/zatca/qr");

      const sellerName = seller.fullName;
      const sellerVat = seller.vatNumber;

      // Generate ZATCA QR
      let qrDataUrl: string | undefined;
      if (total > 0) {
        qrDataUrl = await generateZatcaQRDataURL({
          sellerName,
          vatNumber: sellerVat,
          timestamp: new Date().toISOString(),
          totalWithVat: total,
          vatTotal: vatAmount,
        });
      }

      const pdfData = {
        invoiceNumber,
        clientName: form.clientName,
        clientVatNumber: form.clientVatNumber,
        issueDate: form.issueDate,
        dueDate: form.dueDate,
        currencyLabel,
        items: form.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        })),
        subtotal,
        vatRate: form.vatRate,
        vatAmount,
        total,
        notes: form.notes,
        sellerName,
        sellerBusiness: seller.businessName,
        sellerVat,
        sellerAddress: seller.address,
        sellerPhone: seller.phone,
        sellerEmail: seller.email,
        qrDataUrl,
      };

      const blob = await pdf(<InvoicePDFDocument data={pdfData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
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

  const handleSend = () => {
    handleSave("sent");
  };

  const STATUS_STYLE: Record<InvoiceStatus, { bg: string; dot: string }> = {
    draft: { bg: "bg-status-draft-bg text-status-draft", dot: "bg-status-draft" },
    sent: { bg: "bg-status-pending-bg text-status-pending", dot: "bg-status-pending" },
    paid: { bg: "bg-status-paid-bg text-status-paid", dot: "bg-status-paid" },
    overdue: { bg: "bg-status-overdue-bg text-status-overdue", dot: "bg-status-overdue" },
  };

  return (
    <div>
      {/* Action bar */}
      <div className="sticky top-14 z-40 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/new"
              className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors font-arabic"
            >
              <span>عودة</span>
              <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
            <span className="text-border">|</span>
            <span className="text-sm font-inter font-medium">
              فاتورة {invoiceNumber}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-badge text-xs font-arabic ${STATUS_STYLE[status].bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLE[status].dot}`} />
              {STATUS_LABELS[status]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-sm border border-border rounded-btn text-muted hover:text-foreground hover:border-foreground/20 transition-colors font-arabic disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> : <Save size={14} strokeWidth={1.5} />}
              {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-4 py-2 text-sm border border-border rounded-btn text-muted hover:text-foreground hover:border-foreground/20 transition-colors font-arabic"
            >
              {linkCopied ? <Check size={14} strokeWidth={1.5} className="text-status-paid" /> : <Link2 size={14} strokeWidth={1.5} />}
              {linkCopied ? "تم النسخ" : "نسخ الرابط"}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="flex items-center gap-1.5 px-4 py-2 text-sm border border-border rounded-btn text-muted hover:text-foreground hover:border-foreground/20 transition-colors font-arabic disabled:opacity-50"
            >
              {pdfLoading ? <Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> : <Download size={14} strokeWidth={1.5} />}
              {pdfLoading ? "جاري التحميل..." : "تحميل PDF"}
            </button>
            <button
              onClick={handleSend}
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-accent text-white rounded-btn hover:bg-accent/90 transition-colors font-arabic font-medium"
            >
              {status === "sent" ? <Check size={14} strokeWidth={1.5} /> : <Send size={14} strokeWidth={1.5} />}
              {status === "sent" ? "تم الإرسال" : "إرسال"}
            </button>
          </div>
        </div>
      </div>

      {/* Editor layout */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form - right side in RTL */}
          <div className="order-2 lg:order-1">
            {extractionData && (
              <div className="flex items-center gap-1.5 text-accent text-xs font-medium mb-4 justify-end">
                <Sparkles size={12} strokeWidth={1.5} />
                <span>مستخرج من المحادثة</span>
              </div>
            )}
            <h2 className="text-xl font-arabic font-semibold mb-6">
              تفاصيل الفاتورة
            </h2>

            {/* Client section */}
            <div className="mb-6">
              <h3 className="text-sm font-arabic font-semibold mb-3">العميل</h3>
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={form.clientName}
                    onChange={(e) => updateField("clientName", e.target.value)}
                    placeholder="اسم العميل أو الشركة"
                    className="w-full px-4 py-3 border border-border rounded-btn text-sm font-arabic bg-white focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted mb-1 block text-end font-arabic">
                    الرقم الضريبي للعميل
                  </label>
                  <input
                    type="text"
                    value={form.clientVatNumber}
                    onChange={(e) =>
                      updateField("clientVatNumber", e.target.value)
                    }
                    placeholder="اختياري"
                    className="w-full px-4 py-3 border border-border rounded-btn text-sm font-inter bg-white focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted mb-1 block text-end font-arabic">
                    تاريخ الاستحقاق
                  </label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => updateField("dueDate", e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-btn text-sm font-inter bg-white focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted mb-1 block text-end font-arabic">
                    تاريخ الإصدار
                  </label>
                  <input
                    type="date"
                    value={form.issueDate}
                    onChange={(e) => updateField("issueDate", e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-btn text-sm font-inter bg-white focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Line items */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={addItem}
                  className="flex items-center gap-1 text-sm text-accent hover:text-accent/80 transition-colors font-arabic"
                >
                  <Plus size={14} strokeWidth={1.5} />
                  إضافة بند
                </button>
                <h3 className="text-sm font-arabic font-semibold">البنود</h3>
              </div>
              <div className="space-y-3">
                {form.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-border rounded-btn p-4 space-y-3"
                  >
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(item.id, "description", e.target.value)
                      }
                      placeholder="وصف الخدمة أو المنتج"
                      className="w-full px-3 py-2 border border-border rounded-btn text-sm font-arabic bg-white focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-colors"
                    />
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={item.quantity || ""}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "quantity",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="1"
                        min="0"
                        className="w-20 px-3 py-2 border border-border rounded-btn text-sm font-inter text-center bg-white focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-colors"
                      />
                      <span className="text-xs text-muted font-arabic">
                        {currencyLabel}
                      </span>
                      <input
                        type="number"
                        value={item.unitPrice || ""}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "unitPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0"
                        min="0"
                        className="flex-1 px-3 py-2 border border-border rounded-btn text-sm font-inter bg-white focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-colors"
                      />
                      {form.items.length > 1 && (
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-muted hover:text-status-overdue transition-colors"
                        >
                          <Trash2 size={14} strokeWidth={1.5} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-arabic font-semibold mb-2 block text-end">
                ملاحظات
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="ملاحظات إضافية (اختياري)"
                rows={3}
                className="w-full px-4 py-3 border border-border rounded-btn text-sm font-arabic bg-white focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-colors resize-none"
              />
            </div>
          </div>

          {/* Preview - left side in RTL */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-32 lg:self-start">
            <InvoicePreview
              invoiceNumber={invoiceNumber}
              clientName={form.clientName}
              clientVatNumber={form.clientVatNumber}
              issueDate={form.issueDate}
              dueDate={form.dueDate}
              currencyLabel={currencyLabel}
              items={form.items.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.quantity * item.unitPrice,
              }))}
              subtotal={subtotal}
              vatRate={form.vatRate}
              vatAmount={vatAmount}
              total={total}
              notes={form.notes}
              sellerName={seller.fullName}
              sellerBusiness={seller.businessName}
              sellerAddress={seller.address}
              sellerPhone={seller.phone}
              sellerEmail={seller.email}
              sellerVat={seller.vatNumber}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
