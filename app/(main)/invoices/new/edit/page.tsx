"use client";

import { useState, useEffect } from "react";
import { InvoiceEditor } from "@/components/invoice-editor";
import { type ExtractionResult } from "@/types";

export default function NewInvoiceEditPage() {
  const [extractionData, setExtractionData] = useState<ExtractionResult | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("extractionData");
    if (stored) {
      try {
        setExtractionData(JSON.parse(stored));
      } catch {
        // Ignore parse errors
      }
      sessionStorage.removeItem("extractionData");
    }
    setReady(true);
  }, []);

  if (!ready) {
    return <div className="p-8 text-center text-muted font-arabic">جاري التحميل...</div>;
  }

  return <InvoiceEditor extractionData={extractionData} />;
}
