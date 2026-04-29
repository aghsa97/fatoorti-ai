"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Copy, ExternalLink, Loader2, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { type ReminderTone, CURRENCY_LABELS, type Currency } from "@/types";

const TONE_OPTIONS: { key: ReminderTone; label: string }[] = [
  { key: "friendly", label: "ودود" },
  { key: "formal", label: "رسمي" },
  { key: "firm", label: "حازم" },
];

interface InvoiceContext {
  freelancerName: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  currencyLabel: string;
  daysOverdue: number;
}

export default function ReminderPage() {
  const params = useParams();
  const invoiceId = params.id as string;

  const [context, setContext] = useState<InvoiceContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTone, setSelectedTone] = useState<ReminderTone>("formal");
  const [message, setMessage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const res = await fetch(`/api/invoices/${invoiceId}`);
        if (res.ok) {
          const invoice = await res.json();
          const dueDate = new Date(invoice.due_date);
          const today = new Date();
          const diffMs = today.getTime() - dueDate.getTime();
          const daysOverdue = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
          const currency = (invoice.currency as Currency) || "SAR";

          setContext({
            freelancerName: "سارة الحارثي",
            clientName: invoice.client_name,
            invoiceNumber: invoice.invoice_number,
            amount: Number(invoice.total),
            currency,
            currencyLabel: CURRENCY_LABELS[currency]?.ar || currency,
            daysOverdue,
          });
        } else {
          setContext(null);
        }
      } catch {
        setContext(null);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoice();
  }, [invoiceId]);

  const handleGenerate = async (tone: ReminderTone) => {
    if (!context) return;
    setSelectedTone(tone);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/remind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          freelancerName: context.freelancerName,
          clientName: context.clientName,
          invoiceNumber: context.invoiceNumber,
          amount: context.amount,
          currency: context.currency,
          daysOverdue: context.daysOverdue,
          tone,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate");

      const data = await response.json();
      setMessage(data.message);
    } catch {
      setMessage(
        "عذراً، حدث خطأ أثناء إنشاء الرسالة. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappUrl = message
    ? `https://wa.me/?text=${encodeURIComponent(message)}`
    : "";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-muted" />
      </div>
    );
  }

  if (!context) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <p className="text-lg font-arabic font-semibold mb-2">الفاتورة غير موجودة</p>
        <p className="text-sm text-muted font-arabic mb-6">لم يتم العثور على بيانات الفاتورة</p>
        <Link href="/dashboard" className="text-sm text-accent hover:text-accent/80 transition-colors font-arabic">
          العودة للفواتير
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Back nav */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors font-arabic mb-8"
      >
        <span>عودة للفواتير</span>
        <ArrowRight size={14} strokeWidth={1.5} />
      </Link>

      {/* Header */}
      <div className="text-end mb-8">
        <h1 className="text-2xl font-arabic font-semibold mb-2">
          تذكير بالدفع
        </h1>
        <p className="text-sm text-muted font-arabic">
          فاتورة {context.invoiceNumber} · {context.clientName} ·{" "}
          <span className="font-inter">
            {context.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>{" "}
          {context.currencyLabel}
          {context.daysOverdue > 0 && (
            <>
              {" "}· متأخرة{" "}
              <span className="font-inter">{context.daysOverdue}</span> يوم
            </>
          )}
        </p>
      </div>

      {/* Tone selection */}
      <div className="mb-6">
        <label className="text-sm font-arabic font-semibold mb-3 block text-end">
          اختر نبرة الرسالة
        </label>
        <div className="flex gap-2 justify-end">
          {TONE_OPTIONS.map((tone) => (
            <button
              key={tone.key}
              onClick={() => handleGenerate(tone.key)}
              disabled={isGenerating}
              className={cn(
                "px-5 py-2.5 rounded-btn text-sm font-arabic transition-all",
                selectedTone === tone.key && message
                  ? "bg-accent text-white"
                  : "bg-white border border-border text-muted hover:text-foreground hover:border-foreground/20"
              )}
            >
              {tone.label}
            </button>
          ))}
        </div>
      </div>

      {/* Message area */}
      <div className="bg-white rounded-card border border-border shadow-card p-6 min-h-[200px]">
        {isGenerating ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <Loader2
                size={24}
                strokeWidth={1.5}
                className="animate-spin text-accent mx-auto mb-3"
              />
              <p className="text-sm text-muted font-arabic">
                جاري إنشاء الرسالة...
              </p>
            </div>
          </div>
        ) : message ? (
          <div>
            <div className="flex items-center gap-1.5 text-accent text-xs font-medium mb-3 justify-end">
              <Sparkles size={12} strokeWidth={1.5} />
              <span>رسالة تذكير</span>
            </div>
            <p className="text-sm leading-arabic font-arabic whitespace-pre-wrap">
              {message}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center h-40">
            <p className="text-sm text-muted/50 font-arabic">
              اختر نبرة الرسالة لإنشاء تذكير
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      {message && !isGenerating && (
        <div className="flex items-center gap-3 mt-4 justify-end">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 text-sm border border-border rounded-btn text-muted hover:text-foreground hover:border-foreground/20 transition-colors font-arabic"
          >
            <ExternalLink size={14} strokeWidth={1.5} />
            فتح في واتساب
          </a>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-5 py-2 bg-accent text-white rounded-btn text-sm font-arabic font-medium hover:bg-accent/90 transition-colors"
          >
            <Copy size={14} strokeWidth={1.5} />
            {copied ? "تم النسخ" : "نسخ الرسالة"}
          </button>
        </div>
      )}
    </div>
  );
}
