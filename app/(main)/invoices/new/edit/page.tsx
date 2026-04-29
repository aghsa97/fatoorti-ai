"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { InvoiceEditor } from "@/components/invoice-editor";
import { type ExtractionResult } from "@/types";

function InvoiceEditorWithParams() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get("data");

  let extractionData: ExtractionResult | null = null;
  if (dataParam) {
    try {
      extractionData = JSON.parse(dataParam);
    } catch {
      // Ignore parse errors, start with empty form
    }
  }

  return <InvoiceEditor extractionData={extractionData} />;
}

export default function NewInvoiceEditPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted">جاري التحميل...</div>}>
      <InvoiceEditorWithParams />
    </Suspense>
  );
}
