import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function extractInvoiceDetails(conversationText: string) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are an invoice extraction assistant for Arab freelancers. The user will paste a conversation (WhatsApp, email, or chat) between them (the freelancer) and their client. Extract the following fields and return ONLY valid JSON, no other text:
{
  "client_name": string,
  "client_contact": string | null,
  "service_description_ar": string,
  "service_description_en": string,
  "amount": number,
  "currency": "SAR" | "AED" | "EGP" | "USD",
  "due_date": string (ISO date) | null,
  "deliverables": string[],
  "notes": string | null,
  "confidence": "high" | "medium" | "low"
}
Rules:
- If a field cannot be confidently extracted, use null.
- Service descriptions: provide both Arabic and English versions. If conversation is in Arabic, the Arabic version is the original and translate to English. Vice versa for English conversations.
- Amount: extract the agreed final price, not negotiation steps.
- Confidence: "high" if all key fields are clear, "medium" if some inference required, "low" if conversation is ambiguous.
- Return only the JSON object. No markdown fencing, no explanation.

Conversation:
${conversationText}`,
      },
    ],
  });

  const textContent = message.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Strip markdown fencing if Claude wraps the JSON
  const raw = textContent.text.trim();
  const cleaned = raw.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/,"");

  return JSON.parse(cleaned);
}

export async function generateReminder(params: {
  freelancerName: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  daysOverdue: number;
  tone: "friendly" | "formal" | "firm";
}) {
  const toneMap = {
    friendly: "ودود",
    formal: "رسمي",
    firm: "حازم",
  };

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `You are writing a payment reminder message in Arabic for an Arab freelancer to send to their client about an overdue invoice. Use the ${toneMap[params.tone]} tone:

"ودود" (friendly): warm, understanding, gently reminds
"رسمي" (formal): professional, polite, business-appropriate
"حازم" (firm): direct, clear about consequences, still respectful

Context:
Freelancer name: ${params.freelancerName}
Client name: ${params.clientName}
Invoice number: ${params.invoiceNumber}
Amount: ${params.amount} ${params.currency}
Days overdue: ${params.daysOverdue}

Write a message of 3-5 sentences in Arabic only. The message should be ready to copy-paste into WhatsApp. Do not include any preamble or explanation. Output only the Arabic message.`,
      },
    ],
  });

  const textContent = message.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return textContent.text;
}
