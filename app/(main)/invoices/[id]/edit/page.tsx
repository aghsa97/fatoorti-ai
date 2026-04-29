"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { InvoiceEditor } from "@/components/invoice-editor";
import { type ExtractionResult, type Currency } from "@/types";

export default function EditInvoicePage() {
  const params = useParams();
  const invoiceId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [extractionData, setExtractionData] = useState<ExtractionResult | null>(null);
  const [existingInvoice, setExistingInvoice] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const res = await fetch(`/api/invoices/${invoiceId}`);
        if (res.ok) {
          const invoice = await res.json();
          setExistingInvoice(invoice);

          // Map to ExtractionResult shape so InvoiceEditor can consume it
          const items = (invoice.invoice_items || []) as Array<Record<string, unknown>>;
          setExtractionData({
            client_name: invoice.client_name || "",
            client_contact: invoice.client_email || null,
            service_description_ar: items.length > 0 ? (items[0].description as string) : "",
            service_description_en: "",
            amount: Number(invoice.subtotal),
            currency: (invoice.currency as Currency) || "SAR",
            due_date: invoice.due_date || null,
            deliverables: items.map((i) => i.description as string),
            notes: invoice.notes || null,
            confidence: "high",
          });
        }
      } catch {
        // Failed to load
      } finally {
        setLoading(false);
      }
    }
    fetchInvoice();
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-muted" />
      </div>
    );
  }

  return (
    <InvoiceEditor
      extractionData={extractionData}
      existingInvoiceId={invoiceId}
      existingInvoice={existingInvoice}
    />
  );
}
