"use client";

import { type ExtractionResult } from "@/types";

interface ChatMessage {
  sender: string;
  time: string;
  text: string;
  isMe: boolean;
}

function parseConversation(text: string): ChatMessage[] {
  const lines = text.split("\n");
  const messages: ChatMessage[] = [];
  let currentMessage: ChatMessage | null = null;

  for (const line of lines) {
    // Match patterns like "أحمد العميل · 14:32" or "أنت · 14:35" or "From: email"
    const senderTimeMatch = line.match(/^(.+?)\s*[·:]\s*(\d{1,2}:\d{2})\s*$/);
    const fromMatch = line.match(/^From:\s*(.+)$/i);
    const toMatch = line.match(/^To:\s*(.+)$/i);
    const subjectMatch = line.match(/^Subject:\s*(.+)$/i);
    const dashSeparator = line.match(/^-{3,}$/);

    if (senderTimeMatch) {
      if (currentMessage) messages.push(currentMessage);
      const sender = senderTimeMatch[1].trim();
      const isMe = sender === "أنت" || sender === "انت" || sender.toLowerCase() === "me" || sender.toLowerCase() === "you";
      currentMessage = {
        sender,
        time: senderTimeMatch[2],
        text: "",
        isMe,
      };
    } else if (fromMatch) {
      if (currentMessage) messages.push(currentMessage);
      const sender = fromMatch[1].trim();
      currentMessage = {
        sender,
        time: "",
        text: "",
        isMe: !sender.includes("@"),
      };
    } else if (toMatch || subjectMatch) {
      // Skip To: and Subject: lines, append to current if exists
      if (currentMessage && subjectMatch) {
        currentMessage.text += (currentMessage.text ? "\n" : "") + subjectMatch[1].trim();
      }
    } else if (dashSeparator) {
      // Dash separator = new message from the other party
      if (currentMessage) messages.push(currentMessage);
      currentMessage = {
        sender: "",
        time: "",
        text: "",
        isMe: currentMessage ? !currentMessage.isMe : false,
      };
    } else if (line.trim()) {
      if (currentMessage) {
        currentMessage.text += (currentMessage.text ? "\n" : "") + line.trim();
      } else {
        // First line without a sender header
        currentMessage = {
          sender: "العميل",
          time: "",
          text: line.trim(),
          isMe: false,
        };
      }
    }
  }

  if (currentMessage && currentMessage.text.trim()) {
    messages.push(currentMessage);
  }

  // Clean up empty senders
  return messages
    .filter((m) => m.text.trim())
    .map((m) => ({
      ...m,
      sender: m.sender || (m.isMe ? "أنت" : "العميل"),
    }));
}

function highlightInText(
  text: string,
  highlights: string[]
): React.ReactNode {
  if (highlights.length === 0) return text;

  const escapedHighlights = highlights.map((h) =>
    h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  const regex = new RegExp(`(${escapedHighlights.join("|")})`, "g");
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (highlights.some((h) => h === part)) {
      return (
        <span
          key={i}
          className="bg-accent/15 text-accent font-medium px-0.5 rounded"
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

export function ChatBubbles({
  text,
  extractionResult,
}: {
  text: string;
  extractionResult: ExtractionResult;
}) {
  const messages = parseConversation(text);

  const highlights = [
    extractionResult.client_name,
    extractionResult.service_description_ar,
    extractionResult.amount.toString(),
    extractionResult.amount.toLocaleString(),
    extractionResult.client_contact,
    extractionResult.due_date,
  ].filter(Boolean) as string[];

  if (messages.length === 0) {
    return (
      <div className="text-sm leading-arabic font-arabic whitespace-pre-wrap text-foreground/80">
        {text}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`flex ${msg.isMe ? "justify-start" : "justify-end"}`}
        >
          <div
            className={`max-w-[85%] ${
              msg.isMe
                ? "bg-accent/5 border border-accent/10 rounded-[12px] rounded-bl-[4px]"
                : "bg-[#F0F0EB] rounded-[12px] rounded-br-[4px]"
            } px-4 py-2.5`}
          >
            {/* Sender + time */}
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[11px] font-semibold ${
                  msg.isMe ? "text-accent" : "text-foreground/70"
                }`}
              >
                {msg.sender}
              </span>
              {msg.time && (
                <span className="text-[10px] text-muted/50 font-inter">
                  {msg.time}
                </span>
              )}
            </div>
            {/* Message text */}
            <p className="text-sm leading-arabic font-arabic whitespace-pre-wrap text-foreground/90">
              {highlightInText(msg.text, highlights)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
