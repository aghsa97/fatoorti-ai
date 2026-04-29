# Fatoorti AI

**Arabic-first AI invoicing for freelancers** | SalamHack 2026

> From a casual conversation to a professional invoice in 30 seconds.

Fatoorti AI lets Arab freelancers paste a WhatsApp or email conversation with a client, and uses AI (Claude) to extract invoice details automatically. It generates professional bilingual (Arabic/English) invoices that comply with ZATCA e-invoicing requirements.

## Features

- **Conversation to Invoice** — Paste a chat, get a professional invoice
- **AI Extraction** — Claude extracts client name, service, amount, and due date
- **Live Invoice Editor** — Real-time preview with bilingual RTL/LTR support
- **ZATCA Compliance** — QR code and XML generation per Saudi e-invoicing specs
- **AI Payment Reminders** — Generate WhatsApp-ready Arabic reminders in 3 tones
- **Public Share Links** — Share invoices via unique URLs
- **PDF Export** — Download professional invoices as PDF

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS (RTL) |
| UI Components | shadcn/ui |
| Database | Supabase (PostgreSQL + Auth) |
| AI | Anthropic Claude API |
| PDF | @react-pdf/renderer |
| Typography | IBM Plex Sans Arabic + Inter |
| Deploy | Vercel |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- Supabase project
- Anthropic API key

### Setup

```bash
# Clone and install
pnpm install

# Copy environment variables
cp .env.example .env.local

# Fill in your keys in .env.local:
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=
# ANTHROPIC_API_KEY=
# NEXT_PUBLIC_APP_URL=http://localhost:3000

# Run Supabase migration
# (apply supabase/migrations/20260429000000_initial_schema.sql to your project)

# Seed demo data (optional)
npx tsx seed.ts

# Start dev server
pnpm dev
```

### Project Structure

```
app/
  (main)/
    new/          — AI extraction flow (hero feature)
    dashboard/    — Invoice list + stats
    invoices/
      new/edit/   — Invoice editor with live preview
      [id]/remind — AI reminder generation
  i/[token]/      — Public invoice share page
  login/          — Magic link auth
  api/
    extract/      — Claude extraction endpoint
    remind/       — Claude reminder endpoint
components/
  navbar.tsx              — App navigation
  invoice-editor.tsx      — Form + live preview
  invoice-preview.tsx     — Invoice document renderer
  extraction-results.tsx  — AI extraction results display
lib/
  claude.ts        — Anthropic API client
  vat.ts           — VAT calculation utilities
  supabase/        — Supabase client (browser + server)
  zatca/
    qr.ts          — ZATCA QR code (TLV encoding)
    xml.ts         — UBL 2.1 XML generation
types/
  index.ts         — TypeScript types + constants
supabase/
  migrations/      — Database schema + RLS policies
```

## Architecture

```
User pastes conversation
        |
   /api/extract (Claude)
        |
  Extraction results (highlighted)
        |
   Invoice editor (live preview)
        |
  Save / PDF / Share / Send
```

## Design System

- **Background**: #FAFAF7 (warm off-white)
- **Accent**: #0E7C7B (sophisticated teal)
- **Typography**: IBM Plex Sans Arabic (body) + Inter (numbers)
- **Direction**: RTL-first with Tailwind logical properties
- **Shadows**: Single subtle layer — `0 1px 3px rgba(0,0,0,0.04)`

## Screenshots

<!-- TODO: Add screenshots -->

## Team

Built at SalamHack 2026.

## License

MIT
