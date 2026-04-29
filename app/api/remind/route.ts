import { NextRequest, NextResponse } from "next/server";
import { generateReminder } from "@/lib/claude";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { freelancerName, clientName, invoiceNumber, amount, currency, daysOverdue, tone } = body;

    if (!clientName || !invoiceNumber || !amount || !tone) {
      return NextResponse.json(
        { error: "بيانات ناقصة" },
        { status: 400 }
      );
    }

    const message = await generateReminder({
      freelancerName: freelancerName || "المستقل",
      clientName,
      invoiceNumber,
      amount,
      currency: currency || "SAR",
      daysOverdue: daysOverdue || 0,
      tone,
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Reminder generation error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الرسالة" },
      { status: 500 }
    );
  }
}
