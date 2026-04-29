/**
 * Seed script for Fatoorti AI demo
 * Creates 3 sample invoices with different statuses
 *
 * Usage:
 *   npx tsx seed.ts
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL
 * in .env or .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

async function seed() {
  console.log("Seeding Fatoorti AI demo data...\n");

  // Create demo profile
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: DEMO_USER_ID,
    full_name: "سارة الحارثي",
    business_name: "تصميم وهوية بصرية",
    vat_number: "310987654300003",
    country: "SA",
    default_currency: "SAR",
    bank_details: {
      bank_name: "البنك الأهلي",
      iban: "SA44 2000 0001 2345 6789 1234",
      account_holder: "سارة الحارثي",
    },
  });

  if (profileError) {
    console.warn("Profile upsert warning:", profileError.message);
  }

  // Invoice 1: Paid
  const inv1Id = randomUUID();
  await supabase.from("invoices").upsert({
    id: inv1Id,
    user_id: DEMO_USER_ID,
    invoice_number: "INV-2026-041",
    client_name: "شركة نواة للتسويق",
    client_email: "ahmed@nawat.sa",
    client_vat_number: "300123456700003",
    issue_date: "2026-04-21",
    due_date: "2026-05-21",
    currency: "SAR",
    subtotal: 8500,
    vat_rate: 15,
    vat_amount: 1275,
    total: 9775,
    status: "paid",
    public_share_token: randomUUID(),
  });

  await supabase.from("invoice_items").insert([
    {
      invoice_id: inv1Id,
      description: "تصميم شعار ونظام هوية بصرية",
      quantity: 1,
      unit_price: 5000,
      total: 5000,
    },
    {
      invoice_id: inv1Id,
      description: "تطبيقات الهوية (بطاقة عمل + ظرف)",
      quantity: 2,
      unit_price: 1750,
      total: 3500,
    },
  ]);

  console.log("  Created invoice INV-2026-041 (paid)");

  // Invoice 2: Sent/Pending
  const inv2Id = randomUUID();
  await supabase.from("invoices").upsert({
    id: inv2Id,
    user_id: DEMO_USER_ID,
    invoice_number: "INV-2026-040",
    client_name: "مؤسسة رافد",
    client_email: "info@rafid.sa",
    issue_date: "2026-04-18",
    due_date: "2026-05-18",
    currency: "SAR",
    subtotal: 12400,
    vat_rate: 15,
    vat_amount: 1860,
    total: 14260,
    status: "sent",
    public_share_token: randomUUID(),
  });

  await supabase.from("invoice_items").insert([
    {
      invoice_id: inv2Id,
      description: "تصميم موقع إلكتروني (5 صفحات)",
      quantity: 1,
      unit_price: 8000,
      total: 8000,
    },
    {
      invoice_id: inv2Id,
      description: "تصميم سوشيال ميديا (10 بوستات)",
      quantity: 10,
      unit_price: 440,
      total: 4400,
    },
  ]);

  console.log("  Created invoice INV-2026-040 (sent)");

  // Invoice 3: Overdue
  const inv3Id = randomUUID();
  await supabase.from("invoices").upsert({
    id: inv3Id,
    user_id: DEMO_USER_ID,
    invoice_number: "INV-2026-039",
    client_name: "هند العتيبي",
    client_email: "hind@email.com",
    issue_date: "2026-04-12",
    due_date: "2026-04-26",
    currency: "SAR",
    subtotal: 3200,
    vat_rate: 15,
    vat_amount: 480,
    total: 3680,
    status: "overdue",
    public_share_token: randomUUID(),
  });

  await supabase.from("invoice_items").insert([
    {
      invoice_id: inv3Id,
      description: "تصوير منتجات (20 منتج)",
      quantity: 20,
      unit_price: 160,
      total: 3200,
    },
  ]);

  console.log("  Created invoice INV-2026-039 (overdue)");

  console.log("\nSeed complete! 3 invoices created.");
}

seed().catch(console.error);
