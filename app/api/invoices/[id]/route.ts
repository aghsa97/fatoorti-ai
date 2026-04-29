import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_USER_ID } from "@/lib/supabase/demo-user";

// PATCH: update an invoice
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();

  try {
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.clientName !== undefined) updateData.client_name = body.clientName;
    if (body.clientEmail !== undefined) updateData.client_email = body.clientEmail;
    if (body.clientVatNumber !== undefined) updateData.client_vat_number = body.clientVatNumber;
    if (body.issueDate !== undefined) updateData.issue_date = body.issueDate;
    if (body.dueDate !== undefined) updateData.due_date = body.dueDate;
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.subtotal !== undefined) updateData.subtotal = body.subtotal;
    if (body.vatRate !== undefined) updateData.vat_rate = body.vatRate;
    if (body.vatAmount !== undefined) updateData.vat_amount = body.vatAmount;
    if (body.total !== undefined) updateData.total = body.total;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const { data: invoice, error } = await supabase
      .from("invoices")
      .update(updateData)
      .eq("id", params.id)
      .eq("user_id", DEMO_USER_ID)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (body.items) {
      await supabase.from("invoice_items").delete().eq("invoice_id", params.id);

      const items = body.items.map((item: { description: string; quantity: number; unitPrice: number }) => ({
        invoice_id: params.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total: item.quantity * item.unitPrice,
      }));

      await supabase.from("invoice_items").insert(items);
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Update invoice error:", error);
    return NextResponse.json({ error: "فشل تحديث الفاتورة" }, { status: 500 });
  }
}

// GET: get single invoice by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*, invoice_items(*)")
    .eq("id", params.id)
    .single();

  if (error || !invoice) {
    return NextResponse.json({ error: "الفاتورة غير موجودة" }, { status: 404 });
  }

  return NextResponse.json(invoice);
}

// DELETE: delete an invoice
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", params.id)
    .eq("user_id", DEMO_USER_ID);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
