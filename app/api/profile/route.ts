import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_USER_ID } from "@/lib/supabase/demo-user";

export const dynamic = "force-dynamic";

// GET: fetch profile
export async function GET() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", DEMO_USER_ID)
    .single();

  if (error || !data) {
    return NextResponse.json({}, { status: 200 });
  }

  return NextResponse.json(data);
}

// PUT: update profile
export async function PUT(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json();

  const updatePayload: Record<string, unknown> = {
    full_name: body.fullName || "",
    business_name: body.businessName || "",
    vat_number: body.vatNumber || null,
    country: body.country || "SA",
    default_currency: body.defaultCurrency || "SAR",
    bank_details: {
      bank_name: body.bankName || "",
      iban: body.iban || "",
      account_holder: body.accountHolder || "",
    },
  };

  if (body.address !== undefined) updatePayload.address = body.address || "";
  if (body.phone !== undefined) updatePayload.phone = body.phone || "";
  if (body.email !== undefined) updatePayload.email = body.email || "";

  const { error } = await supabase
    .from("profiles")
    .update(updatePayload)
    .eq("id", DEMO_USER_ID);

  if (error) {
    console.error("Profile update error:", error);
    if (error.message.includes("column")) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { address, phone, email, ...safePayload } = updatePayload;
      const { error: retryError } = await supabase
        .from("profiles")
        .update(safePayload)
        .eq("id", DEMO_USER_ID);

      if (retryError) {
        return NextResponse.json({ error: retryError.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
