"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Save, Loader2, Check } from "lucide-react";
import { type Country, type Currency } from "@/types";
import { updateProfile } from "./actions";

interface ProfileData {
  fullName: string;
  businessName: string;
  vatNumber: string;
  country: Country;
  defaultCurrency: Currency;
  address: string;
  phone: string;
  email: string;
  bankName: string;
  iban: string;
  accountHolder: string;
}

const COUNTRY_OPTIONS: { value: Country; label: string }[] = [
  { value: "SA", label: "المملكة العربية السعودية" },
  { value: "AE", label: "الإمارات العربية المتحدة" },
  { value: "EG", label: "مصر" },
];

const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: "SAR", label: "ريال سعودي (ر.س)" },
  { value: "AED", label: "درهم إماراتي (د.إ)" },
  { value: "EGP", label: "جنيه مصري (ج.م)" },
  { value: "USD", label: "دولار أمريكي ($)" },
];

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-1.5 px-5 py-2.5 bg-accent text-white rounded-btn font-arabic font-medium text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
          جاري الحفظ...
        </>
      ) : (
        <>
          <Save size={16} strokeWidth={1.5} />
          حفظ
        </>
      )}
    </button>
  );
}

export function SettingsForm({ defaults }: { defaults: ProfileData }) {
  const [state, formAction] = useFormState(updateProfile, null);
  return (
    <form action={formAction}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <SubmitButton />
          {state?.success && (
            <span className="flex items-center gap-1 text-sm text-status-paid font-arabic">
              <Check size={14} strokeWidth={1.5} />
              {state.message}
            </span>
          )}
          {state && !state.success && (
            <span className="text-sm text-status-overdue font-arabic">
              {state.message}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-arabic font-semibold">الإعدادات</h1>
      </div>

      {/* Business Info */}
      <section className="bg-white rounded-card border border-border shadow-card p-6 mb-6">
        <h2 className="text-sm font-arabic font-semibold mb-4 text-end">
          بيانات النشاط
        </h2>
        <div className="space-y-4">
          <Field
            name="fullName"
            label="الاسم الكامل"
            defaultValue={defaults.fullName}
            placeholder="اسمك كما يظهر في الفاتورة"
          />
          <Field
            name="businessName"
            label="اسم النشاط التجاري"
            defaultValue={defaults.businessName}
            placeholder="اسم شركتك أو نشاطك"
          />
          <Field
            name="vatNumber"
            label="الرقم الضريبي"
            defaultValue={defaults.vatNumber}
            placeholder="رقم التسجيل في ضريبة القيمة المضافة"
            dir="ltr"
            font="font-inter"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted mb-1 block text-end font-arabic">
                العملة الافتراضية
              </label>
              <select
                name="defaultCurrency"
                defaultValue={defaults.defaultCurrency}
                className="w-full px-4 py-3 border border-border rounded-btn text-sm font-arabic bg-white focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-colors"
              >
                {CURRENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block text-end font-arabic">
                الدولة
              </label>
              <select
                name="country"
                defaultValue={defaults.country}
                className="w-full px-4 py-3 border border-border rounded-btn text-sm font-arabic bg-white focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-colors"
              >
                {COUNTRY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="bg-white rounded-card border border-border shadow-card p-6 mb-6">
        <h2 className="text-sm font-arabic font-semibold mb-4 text-end">
          بيانات التواصل
        </h2>
        <div className="space-y-4">
          <Field
            name="address"
            label="العنوان"
            defaultValue={defaults.address}
            placeholder="المدينة، الدولة"
          />
          <Field
            name="phone"
            label="رقم الهاتف"
            defaultValue={defaults.phone}
            placeholder="+966 50 000 0000"
            dir="ltr"
            font="font-inter"
          />
          <Field
            name="email"
            label="البريد الإلكتروني"
            defaultValue={defaults.email}
            placeholder="you@example.com"
            dir="ltr"
            font="font-inter"
          />
        </div>
      </section>

      {/* Bank Details */}
      <section className="bg-white rounded-card border border-border shadow-card p-6">
        <h2 className="text-sm font-arabic font-semibold mb-4 text-end">
          البيانات البنكية
        </h2>
        <div className="space-y-4">
          <Field
            name="bankName"
            label="اسم البنك"
            defaultValue={defaults.bankName}
            placeholder="مثال: البنك الأهلي"
          />
          <Field
            name="iban"
            label="رقم الآيبان (IBAN)"
            defaultValue={defaults.iban}
            placeholder="SA00 0000 0000 0000 0000 0000"
            dir="ltr"
            font="font-inter"
          />
          <Field
            name="accountHolder"
            label="اسم صاحب الحساب"
            defaultValue={defaults.accountHolder}
            placeholder="الاسم كما في الحساب البنكي"
          />
        </div>
      </section>
    </form>
  );
}

function Field({
  name,
  label,
  defaultValue,
  placeholder,
  dir,
  font,
}: {
  name: string;
  label: string;
  defaultValue: string;
  placeholder: string;
  dir?: string;
  font?: string;
}) {
  return (
    <div>
      <label className="text-xs text-muted mb-1 block text-end font-arabic">
        {label}
      </label>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        dir={dir}
        className={`w-full px-4 py-3 border border-border rounded-btn text-sm bg-white focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-colors ${font || "font-arabic"}`}
      />
    </div>
  );
}
