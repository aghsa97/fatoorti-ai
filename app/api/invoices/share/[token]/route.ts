import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET: fetch invoice by public share token (no auth required)
export async function GET(
  _request: NextRequest,
  { params }: { params: { token: string } }
) {
  const supabase = createAdminClient();

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*, invoice_items(*)")
    .eq("public_share_token", params.token)
    .single();

  if (error || !invoice) {
    return NextResponse.json(
      { error: "الفاتورة غير موجودة" },
      { status: 404 }
    );
  }

  // Also fetch the seller profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, business_name, vat_number, address, phone, email")
    .eq("id", invoice.user_id)
    .single();

  return NextResponse.json({ invoice, profile });
}
