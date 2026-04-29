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
    return NextResponse.json({ error: error.message }, { status: 500 });
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
        subtotal: body.subtotal,
        vat_rate: body.vatRate,
        vat_amount: body.vatAmount,
        total: body.total,
        status: body.status || "draft",
        notes: body.notes || null,
      })
      .select()
      .single();

    if (invoiceError) {
      console.error("Invoice insert error:", invoiceError);
      return NextResponse.json({ error: invoiceError.message }, { status: 500 });
    }

    if (body.items && body.items.length > 0) {
      const items = body.items.map((item: { description: string; quantity: number; unitPrice: number }) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total: item.quantity * item.unitPrice,
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(items);

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
