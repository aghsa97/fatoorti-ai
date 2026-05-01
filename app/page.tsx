"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, FileText, Zap, Shield, Globe, Mic } from "lucide-react";

const DEMO_LINES = [
  { sender: "العميل", text: "أهلاً، نحتاج تصميم هوية بصرية كاملة", delay: 0 },
  { sender: "أنت", text: "الهوية تشمل: شعار، نظام ألوان، خط، وأربع تطبيقات", delay: 1200 },
  { sender: "أنت", text: "السعر: 12,000 ريال، التسليم خلال 3 أسابيع", delay: 2200 },
  { sender: "العميل", text: "ممتاز، نمشي. ابعث الفاتورة", delay: 3400 },
];

const EXTRACTED_FIELDS = [
  { label: "العميل", value: "شركة نواة للتسويق", delay: 4800 },
  { label: "الخدمة", value: "تصميم هوية بصرية كاملة", delay: 5200 },
  { label: "المبلغ", value: "12,000.00 ر.س", delay: 5600 },
  { label: "التسليم", value: "3 أسابيع", delay: 6000 },
];

const FEATURES = [
  { icon: Sparkles, title: "استخراج ذكي", desc: "الذكاء الاصطناعي يستخرج تفاصيل الفاتورة من المحادثة تلقائياً" },
  { icon: Shield, title: "متوافق مع زاتكا", desc: "فواتير إلكترونية متوافقة مع متطلبات هيئة الزكاة والضريبة" },
  { icon: Globe, title: "ثنائي اللغة", desc: "فواتير احترافية بالعربية والإنجليزية مع دعم RTL كامل" },
  { icon: Mic, title: "تسجيل صوتي", desc: "تحدث عن خدماتك والذكاء الاصطناعي يحولها إلى فاتورة" },
  { icon: FileText, title: "PDF احترافي", desc: "حمّل الفاتورة كملف PDF جاهز للإرسال بتصميم احترافي" },
  { icon: Zap, title: "30 ثانية فقط", desc: "من محادثة عابرة إلى فاتورة احترافية في نصف دقيقة" },
];

export default function LandingPage() {
  const router = useRouter();
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [visibleFields, setVisibleFields] = useState<number[]>([]);
  const [animationStarted, setAnimationStarted] = useState(false);

  useEffect(() => {
    // Start animation after a brief pause
    const startTimer = setTimeout(() => setAnimationStarted(true), 500);

    return () => clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    if (!animationStarted) return;

    const timers: NodeJS.Timeout[] = [];

    DEMO_LINES.forEach((line, i) => {
      timers.push(
        setTimeout(() => setVisibleMessages((prev) => [...prev, i]), line.delay)
      );
    });

    EXTRACTED_FIELDS.forEach((field, i) => {
      timers.push(
        setTimeout(() => setVisibleFields((prev) => [...prev, i]), field.delay)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [animationStarted]);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-20">
        {/* Nav */}
        <div className="flex items-center justify-between mb-20">
          <button
            onClick={() => router.push("/new")}
            className="px-6 py-2.5 bg-accent text-white rounded-btn font-arabic font-medium text-sm hover:bg-accent/90 transition-colors"
          >
            ابدأ الآن
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-arabic font-bold text-base">ف</span>
            </div>
            <span className="font-arabic font-semibold text-lg">فاتورتي</span>
            <span className="text-[10px] font-inter font-medium text-accent border border-accent/30 rounded px-1.5 py-0.5 leading-none">
              AI
            </span>
          </div>
        </div>

        {/* Hero text */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-arabic font-bold leading-tight mb-6">
            من محادثة عابرة
            <br />
            <span className="text-accent">إلى فاتورة احترافية</span>
          </h1>
          <p className="text-lg text-muted font-arabic leading-arabic max-w-2xl mx-auto mb-8">
            الصق محادثة الواتساب أو الإيميل مع عميلك، والذكاء الاصطناعي يستخرج
            تفاصيل الفاتورة تلقائياً — متوافقة مع متطلبات زاتكا للفوترة الإلكترونية
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => router.push("/new")}
              className="flex items-center gap-2 px-8 py-3.5 bg-accent text-white rounded-btn font-arabic font-semibold text-base hover:bg-accent/90 transition-colors"
            >
              <Sparkles size={18} strokeWidth={1.5} />
              أنشئ فاتورتك الأولى
            </button>
          </div>
        </div>

        {/* Animated demo */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-card border border-border shadow-card overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Chat side */}
              <div className="p-6 border-b md:border-b-0 md:border-l border-border">
                <div className="flex items-center gap-1.5 text-muted text-xs mb-4 justify-end">
                  <span className="w-2 h-2 rounded-full bg-status-paid animate-pulse" />
                  <span className="font-arabic">المحادثة</span>
                </div>
                <div className="space-y-3 min-h-[200px]">
                  {DEMO_LINES.map((line, i) => (
                    <div
                      key={i}
                      className={`transition-all duration-500 ${
                        visibleMessages.includes(i)
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-3"
                      } flex ${line.sender === "أنت" ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[85%] px-3.5 py-2 text-xs font-arabic leading-arabic ${
                          line.sender === "أنت"
                            ? "bg-accent/5 border border-accent/10 rounded-[10px] rounded-bl-[3px]"
                            : "bg-[#F0F0EB] rounded-[10px] rounded-br-[3px]"
                        }`}
                      >
                        <span className={`text-[10px] font-semibold block mb-0.5 ${
                          line.sender === "أنت" ? "text-accent" : "text-foreground/60"
                        }`}>
                          {line.sender}
                        </span>
                        {line.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extracted fields side */}
              <div className="p-6">
                <div className="flex items-center gap-1.5 text-accent text-xs mb-4 justify-end">
                  <Sparkles size={12} strokeWidth={1.5} />
                  <span className="font-arabic font-medium">الحقول المستخرجة</span>
                </div>
                <div className="space-y-3 min-h-[200px]">
                  {EXTRACTED_FIELDS.map((field, i) => (
                    <div
                      key={i}
                      className={`transition-all duration-500 ${
                        visibleFields.includes(i)
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 -translate-x-4"
                      } flex items-center gap-3 py-2.5 border-b border-border/30 last:border-0`}
                    >
                      <div className="flex-1 text-end">
                        <span className="text-[10px] text-muted block">
                          {field.label}
                        </span>
                        <span className="text-sm font-semibold font-arabic">
                          {field.value}
                        </span>
                      </div>
                      <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white border-t border-border py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-arabic font-semibold text-center mb-12">
            كل ما يحتاجه المستقل العربي
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="p-6 rounded-card border border-border/50 hover:border-accent/20 hover:bg-accent/[0.02] transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-accent/5 flex items-center justify-center mb-3">
                    <Icon size={18} strokeWidth={1.5} className="text-accent" />
                  </div>
                  <h3 className="font-arabic font-semibold text-sm mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted font-arabic leading-arabic">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 text-center border-t border-border">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 bg-accent rounded flex items-center justify-center">
            <span className="text-white font-arabic font-bold text-[10px]">ف</span>
          </div>
          <span className="font-arabic font-semibold text-sm">فاتورتي AI</span>
        </div>
        <p className="text-[11px] text-muted/40 font-arabic">
          صُنعت بالعربية، للعرب · SalamHack 2026
        </p>
      </div>
    </div>
  );
}
