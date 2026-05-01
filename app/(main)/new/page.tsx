"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Clock, Globe, Maximize2, Copy, Loader2, Mic, MicOff } from "lucide-react";
import { type ExtractionResult } from "@/types";
import { ExtractionResults } from "@/components/extraction-results";

const SAMPLE_CONVERSATION = `أحمد العميل · 14:32
أهلاً، معك أحمد من شركة نواة للتسويق. نحتاج تصميم هوية بصرية كاملة للمشروع الجديد

أنت · 14:35
أهلاً وسهلاً. الهوية تشمل: شعار، نظام ألوان، خط،
وأربع تطبيقات (بطاقة، ظرف، يونيفورم، سوشيال ميديا)
السعر: 12,000 ريال، التسليم خلال 3 أسابيع

أحمد العميل · 14:41
ممتاز، نمشي. ابعث الفاتورة على هذا الإيميل ahmed@nawat.sa`;

export default function NewInvoicePage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [originalText, setOriginalText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const toggleVoice = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("المتصفح لا يدعم التسجيل الصوتي. جرّب متصفح Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ar-SA";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setText((prev) => {
        // Replace only the voice portion, keep any manually typed text
        const manualText = prev.split("\n\n[تسجيل صوتي]")[0];
        return manualText
          ? `${manualText}\n\n[تسجيل صوتي]\n${transcript}`
          : transcript;
      });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === "not-allowed") {
        setError("يرجى السماح بالوصول إلى الميكروفون من إعدادات المتصفح");
      } else if (event.error === "no-speech") {
        setError("لم يتم التقاط أي صوت. حاول مرة أخرى");
      } else {
        setError(`خطأ في التسجيل: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch {
      setError("فشل تشغيل التسجيل الصوتي");
      setIsListening(false);
    }
  }, [isListening]);

  const handleExtract = async () => {
    if (!text.trim()) return;

    setIsExtracting(true);
    setError(null);
    setOriginalText(text);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "فشل الاستخراج");
      }

      const result: ExtractionResult = await response.json();
      setExtractionResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleUseSample = () => {
    setText(SAMPLE_CONVERSATION);
  };

  const handleContinueToInvoice = () => {
    if (!extractionResult) return;
    sessionStorage.setItem("extractionData", JSON.stringify(extractionResult));
    router.push("/invoices/new/edit");
  };

  // Show extraction results if we have them
  if (extractionResult) {
    return (
      <ExtractionResults
        result={extractionResult}
        originalText={originalText}
        onContinue={handleContinueToInvoice}
        onBack={() => setExtractionResult(null)}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 text-accent text-sm font-medium mb-4">
          <Sparkles size={14} strokeWidth={1.5} />
          <span>فاتورة جديدة بالذكاء الاصطناعي</span>
        </div>
        <h1 className="text-4xl font-arabic font-semibold leading-tight mb-4">
          حوّل محادثتك مع العميل
          <br />
          إلى فاتورة احترافية
        </h1>
        <p className="text-muted text-base leading-arabic max-w-xl mx-auto">
          الصق محادثة الواتساب أو الإيميل، ويستخرج الذكاء الاصطناعي تفاصيل
          الفاتورة تلقائياً — متوافقة مع متطلبات ZATCA للفوترة الإلكترونية.
        </p>
      </div>

      {/* Textarea card */}
      <div className="bg-white rounded-card border border-border shadow-card overflow-hidden">
        {/* Textarea header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <span className="font-arabic font-semibold text-sm">الصق المحادثة هنا</span>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleVoice}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                isListening
                  ? "text-status-overdue"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {isListening ? (
                <>
                  <MicOff size={13} strokeWidth={1.5} />
                  <span>إيقاف التسجيل</span>
                  <span className="w-2 h-2 rounded-full bg-status-overdue animate-pulse" />
                </>
              ) : (
                <>
                  <Mic size={13} strokeWidth={1.5} />
                  <span>تسجيل صوتي</span>
                </>
              )}
            </button>
            <span className="text-border">|</span>
            <button
              onClick={handleUseSample}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
            >
              <Copy size={13} strokeWidth={1.5} />
              <span>تجربة نموذجية</span>
            </button>
          </div>
        </div>

        {/* Textarea */}
        <div className="px-6 pb-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="الصق محادثة الواتساب أو الإيميل هنا..."
            className="w-full h-48 resize-none text-sm leading-arabic bg-transparent outline-none placeholder:text-border font-arabic"
            dir="rtl"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-border/50">
          <span className="text-xs text-muted/60 font-inter">
            {text.length} حرف · يدعم العربية والإنجليزية
          </span>
          {text.length > 0 && (
            <button
              onClick={() => setText("")}
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              مسح
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-status-overdue-bg text-status-overdue rounded-btn text-sm text-center font-arabic">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={handleExtract}
          disabled={!text.trim() || isExtracting}
          className="flex items-center gap-2 px-8 py-3 bg-accent text-white rounded-btn font-arabic font-medium text-sm transition-all hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExtracting ? (
            <>
              <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
              <span>جاري الاستخراج...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} strokeWidth={1.5} />
              <span>إنشاء الفاتورة بالذكاء الاصطناعي</span>
            </>
          )}
        </button>
        <span className="text-muted text-sm">أو</span>
        <button
          onClick={() => router.push("/invoices/new/edit")}
          className="text-sm text-muted underline underline-offset-4 decoration-dashed hover:text-foreground transition-colors font-arabic"
        >
          املأ النموذج يدوياً
        </button>
      </div>

      {/* Bottom features */}
      <div className="flex items-center justify-center gap-8 mt-12 text-xs text-muted/60">
        <div className="flex items-center gap-1.5">
          <Maximize2 size={13} strokeWidth={1.5} />
          <span>متوافق مع زاتكا</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Globe size={13} strokeWidth={1.5} />
          <span>ثنائي اللغة — عربي/إنجليزي</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Mic size={13} strokeWidth={1.5} />
          <span>يدعم التسجيل الصوتي</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={13} strokeWidth={1.5} />
          <span>30 ثانية لإنشاء فاتورة</span>
        </div>
      </div>
    </div>
  );
}
