"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_USER_ID } from "@/lib/supabase/demo-user";

export async function updateProfile(prevState: { message: string; success: boolean } | null, formData: FormData) {
  const supabase = createAdminClient();

  const country = (formData.get("country") as string) || "SA";
  const currencyMap: Record<string, string> = { SA: "SAR", AE: "AED", EG: "EGP" };
  const defaultCurrency = currencyMap[country] || "SAR";

  const updatePayload: Record<string, unknown> = {
    full_name: formData.get("fullName") || "",
    business_name: formData.get("businessName") || "",
    vat_number: formData.get("vatNumber") || null,
    country,
    default_currency: defaultCurrency,
    address: formData.get("address") || "",
    phone: formData.get("phone") || "",
    email: formData.get("email") || "",
    bank_details: {
      bank_name: formData.get("bankName") || "",
      iban: formData.get("iban") || "",
      account_holder: formData.get("accountHolder") || "",
    },
  };

  const { error } = await supabase
    .from("profiles")
    .update(updatePayload)
    .eq("id", DEMO_USER_ID);

  if (error) {
    // Retry without contact fields if columns don't exist
    if (error.message.includes("column")) {
      const { address: _a, phone: _p, email: _e, ...safePayload } = updatePayload;
      const { error: retryError } = await supabase
        .from("profiles")
        .update(safePayload)
        .eq("id", DEMO_USER_ID);

      if (retryError) {
        return { message: retryError.message, success: false };
      }
    } else {
      return { message: error.message, success: false };
    }
  }

  revalidatePath("/settings");
  revalidatePath("/invoices");
  revalidatePath("/new");
  revalidatePath("/dashboard");

  return { message: "تم حفظ الإعدادات بنجاح", success: true };
}
