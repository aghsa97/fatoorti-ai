import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_USER_ID } from "@/lib/supabase/demo-user";
import { SettingsForm } from "./settings-form";
import { type Country, type Currency } from "@/types";

export default async function SettingsPage() {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", DEMO_USER_ID)
    .single();

  const defaults = {
    fullName: (data?.full_name as string) || "",
    businessName: (data?.business_name as string) || "",
    vatNumber: (data?.vat_number as string) || "",
    country: ((data?.country as Country) || "SA") as Country,
    defaultCurrency: ((data?.default_currency as Currency) || "SAR") as Currency,
    address: (data?.address as string) || "",
    phone: (data?.phone as string) || "",
    email: (data?.email as string) || "",
    bankName: (data?.bank_details as Record<string, string>)?.bank_name || "",
    iban: (data?.bank_details as Record<string, string>)?.iban || "",
    accountHolder: (data?.bank_details as Record<string, string>)?.account_holder || "",
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <SettingsForm defaults={defaults} />
    </div>
  );
}
