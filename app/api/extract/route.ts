import { NextRequest, NextResponse } from "next/server";
import { extractInvoiceDetails } from "@/lib/claude";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "يرجى إدخال نص المحادثة" },
        { status: 400 }
      );
    }

    if (text.length > 10000) {
      return NextResponse.json(
        { error: "النص طويل جداً. الحد الأقصى 10,000 حرف" },
        { status: 400 }
      );
    }

    const result = await extractInvoiceDetails(text);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء استخراج البيانات. يرجى المحاولة مرة أخرى." },
      { status: 500 }
    );
  }
}
