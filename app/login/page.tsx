"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-2xl mb-4">
            <span className="text-white font-arabic font-bold text-3xl">
              ف
            </span>
          </div>
          <h1 className="text-xl font-arabic font-semibold">فاتورتي AI</h1>
          <p className="text-sm text-muted font-arabic mt-1">
            فوترة ذكية للمستقلين العرب
          </p>
        </div>

        {sent ? (
          <div className="bg-white rounded-card border border-border shadow-card p-8 text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={20} strokeWidth={1.5} className="text-accent" />
            </div>
            <h2 className="font-arabic font-semibold mb-2">
              تحقق من بريدك الإلكتروني
            </h2>
            <p className="text-sm text-muted font-arabic leading-arabic">
              أرسلنا رابط تسجيل الدخول إلى
              <br />
              <span className="font-inter font-medium text-foreground">
                {email}
              </span>
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-6 text-sm text-accent hover:text-accent/80 transition-colors font-arabic"
            >
              استخدام بريد آخر
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-card border border-border shadow-card p-8"
          >
            <h2 className="font-arabic font-semibold mb-1 text-end">
              تسجيل الدخول
            </h2>
            <p className="text-sm text-muted font-arabic mb-6 text-end">
              سنرسل لك رابط دخول سحري
            </p>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              dir="ltr"
              className="w-full px-4 py-3 border border-border rounded-btn text-sm font-inter bg-white focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-colors mb-4 text-start"
            />

            {error && (
              <p className="text-xs text-status-overdue font-arabic mb-4 text-end">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-btn font-arabic font-medium text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2
                    size={16}
                    strokeWidth={1.5}
                    className="animate-spin"
                  />
                  <span>جاري الإرسال...</span>
                </>
              ) : (
                <span>إرسال رابط الدخول</span>
              )}
            </button>
          </form>
        )}

        <p className="text-center text-[10px] text-muted/40 font-arabic mt-8">
          صُنعت بالعربية، للعرب
        </p>
      </div>
    </div>
  );
}
