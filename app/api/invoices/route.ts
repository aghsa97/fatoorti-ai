import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_USER_ID } from "@/lib/supabase/demo-user";

export const dynamic = "force-dynamic";

// GET: list invoices
export async function GET() {
  const supabase = createAdminClient();

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("*, invoice_items(*)")
    .eq("user_id", DEMO_USER_ID)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Invoices fetch error:", error);
    return NextResponse.json({ error: "فشل تحميل الفواتير" }, { status: 500 });
  }

  return NextResponse.json(invoices);
}

// POST: create a new invoice
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();

  try {
    const body = await request.json();

    const { data: lastInvoice } = await supabase
      .from("invoices")
      .select("invoice_number")
      .eq("user_id", DEMO_USER_ID)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let nextNum = 1;
    if (lastInvoice?.invoice_number) {
      const match = lastInvoice.invoice_number.match(/(\d+)$/);
      if (match) nextNum = parseInt(match[1], 10) + 1;
    }
    const year = new Date().getFullYear();
    const invoiceNumber = body.invoiceNumber || `INV-${year}-${String(nextNum).padStart(3, "0")}`;

    // Server-side recalculation of financial totals
    const ALLOWED_VAT_RATES = [0, 5, 14, 15];
    const vatRate = ALLOWED_VAT_RATES.includes(Number(body.vatRate)) ? Number(body.vatRate) : 15;
    const items = Array.isArray(body.items) ? body.items : [];
    const subtotal = items.reduce(
      (sum: number, item: { quantity: number; unitPrice: number }) =>
        sum + Math.max(0, Number(item.quantity) || 0) * Math.max(0, Number(item.unitPrice) || 0),
      0
    );
    const vatAmount = Math.round(subtotal * (vatRate / 100) * 100) / 100;
    const total = Math.round((subtotal + vatAmount) * 100) / 100;

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        user_id: DEMO_USER_ID,
        invoice_number: invoiceNumber,
        client_name: body.clientName,
        client_email: body.clientEmail || null,
        client_vat_number: body.clientVatNumber || null,
        issue_date: body.issueDate,
        due_date: body.dueDate,
        currency: body.currency || "SAR",
        subtotal,
        vat_rate: vatRate,
        vat_amount: vatAmount,
        total,
        status: body.status || "draft",
        notes: body.notes || null,
      })
      .select()
      .single();

    if (invoiceError) {
      console.error("Invoice insert error:", invoiceError);
      return NextResponse.json({ error: invoiceError.message }, { status: 500 });
    }

    if (items.length > 0 && items.length <= 100) {
      const dbItems = items.map((item: { description: string; quantity: number; unitPrice: number }) => ({
        invoice_id: invoice.id,
        description: String(item.description || "").slice(0, 500),
        quantity: Math.max(0, Number(item.quantity) || 0),
        unit_price: Math.max(0, Number(item.unitPrice) || 0),
        total: Math.max(0, Number(item.quantity) || 0) * Math.max(0, Number(item.unitPrice) || 0),
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(dbItems);

      if (itemsError) {
        console.error("Items insert error:", itemsError);
      }
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Create invoice error:", error);
    return NextResponse.json({ error: "فشل حفظ الفاتورة" }, { status: 500 });
  }
}
