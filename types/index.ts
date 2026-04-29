export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";
export type Currency = "SAR" | "AED" | "EGP" | "USD";
export type Country = "SA" | "AE" | "EG";
export type ReminderTone = "friendly" | "formal" | "firm";
export type Confidence = "high" | "medium" | "low";

export interface Profile {
  id: string;
  full_name: string;
  business_name: string;
  vat_number: string | null;
  country: Country;
  default_currency: Currency;
  bank_details: BankDetails | null;
}

export interface BankDetails {
  bank_name: string;
  iban: string;
  account_holder: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  client_name: string;
  client_email: string | null;
  client_vat_number: string | null;
  issue_date: string;
  due_date: string;
  currency: Currency;
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
  status: InvoiceStatus;
  public_share_token: string;
  pdf_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Reminder {
  id: string;
  invoice_id: string;
  message_ar: string;
  tone: ReminderTone;
  generated_at: string;
}

export interface ExtractionResult {
  client_name: string;
  client_contact: string | null;
  service_description_ar: string;
  service_description_en: string;
  amount: number;
  currency: Currency;
  due_date: string | null;
  deliverables: string[];
  notes: string | null;
  confidence: Confidence;
}

export const VAT_RATES: Record<Country, number> = {
  SA: 15,
  AE: 5,
  EG: 14,
};

export const CURRENCY_LABELS: Record<Currency, { ar: string; en: string }> = {
  SAR: { ar: "ر.س", en: "SAR" },
  AED: { ar: "د.إ", en: "AED" },
  EGP: { ar: "ج.م", en: "EGP" },
  USD: { ar: "دولار", en: "USD" },
};

export const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "مسوّدة",
  sent: "قيد الانتظار",
  paid: "مدفوعة",
  overdue: "متأخرة",
};
