"use client";

import { Sparkles, Check, ArrowLeft, MessageCircle } from "lucide-react";
import { type ExtractionResult, CURRENCY_LABELS } from "@/types";
import { ChatBubbles } from "@/components/chat-bubbles";

interface ExtractionResultsProps {
  result: ExtractionResult;
  originalText: string;
  onContinue: () => void;
  onBack: () => void;
}

interface ExtractedFieldProps {
  label: string;
  value: string;
}

function ExtractedField({ label, value }: ExtractedFieldProps) {
  return (
    <div className="flex items-start gap-3 py-4 border-b border-border/50 last:border-0 flex-row-reverse">
      <div className="flex-1 text-start">
        <span className="text-xs text-muted block mb-1">{label}</span>
        <span className="text-sm font-semibold font-arabic">{value}</span>
      </div>
      <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-1">
        <Check size={14} strokeWidth={2} className="text-white" />
      </div>
    </div>
  );
}

export function ExtractionResults({
  result,
  originalText,
  onContinue,
  onBack,
}: ExtractionResultsProps) {
  const currencyLabel = CURRENCY_LABELS[result.currency]?.ar || result.currency;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 text-accent text-sm font-medium mb-3">
          <Sparkles size={14} strokeWidth={1.5} />
          <span>اكتمل الاستخراج</span>
        </div>
        <h1 className="text-3xl font-arabic font-semibold">
          تم استخراج تفاصيل الفاتورة
        </h1>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Extracted fields */}
        <div className="bg-white rounded-card border border-border shadow-card p-6 order-1 lg:order-2">
          <div className="flex items-center gap-1.5 text-accent text-sm font-medium mb-4 justify-start flex-row-reverse">
            <Sparkles size={14} strokeWidth={1.5} />
            <span>الحقول المستخرجة</span>
          </div>

          <ExtractedField label="اسم العميل" value={result.client_name} />
          <ExtractedField
            label="الخدمة المقدّمة"
            value={result.service_description_ar}
          />
          <ExtractedField
            label="المبلغ"
            value={`${currencyLabel} ${result.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          />
          {result.due_date && (
            <ExtractedField label="تاريخ الاستحقاق" value={result.due_date} />
          )}
          {result.client_contact && (
            <ExtractedField
              label="بيانات التواصل"
              value={result.client_contact}
            />
          )}

          {/* CTA */}
          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm text-muted font-arabic">
              جاهزة للمراجعة. هل تبدو صحيحة؟
            </span>
            <button
              onClick={onContinue}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-btn font-arabic font-medium text-sm hover:bg-accent/90 transition-colors"
            >
              <span>متابعة إلى الفاتورة</span>
              <ArrowLeft size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Original conversation — WhatsApp style */}
        <div className="bg-white rounded-card border border-border shadow-card p-6 order-2 lg:order-1">
          <div className="flex items-center gap-1.5 text-muted text-sm mb-4 justify-end">
            <MessageCircle size={14} strokeWidth={1.5} />
            <span>المحادثة الأصلية</span>
          </div>

          <ChatBubbles text={originalText} extractionResult={result} />
        </div>
      </div>

      {/* Back button */}
      <div className="text-center mt-6">
        <button
          onClick={onBack}
          className="text-sm text-muted hover:text-foreground transition-colors font-arabic"
        >
          العودة لتعديل المحادثة
        </button>
      </div>
    </div>
  );
}

