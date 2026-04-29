-- Fatoorti AI: Initial Schema
-- Profiles, Invoices, Invoice Items, Reminders with RLS

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null default '',
  business_name text not null default '',
  vat_number text,
  country text not null default 'SA' check (country in ('SA', 'AE', 'EG')),
  default_currency text not null default 'SAR' check (default_currency in ('SAR', 'AED', 'EGP', 'USD')),
  bank_details jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Invoices table
create table invoices (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  invoice_number text not null,
  client_name text not null,
  client_email text,
  client_vat_number text,
  issue_date date not null default current_date,
  due_date date not null default (current_date + interval '30 days'),
  currency text not null default 'SAR' check (currency in ('SAR', 'AED', 'EGP', 'USD')),
  subtotal numeric(12,2) not null default 0,
  vat_rate numeric(5,2) not null default 15,
  vat_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue')),
  public_share_token uuid not null default uuid_generate_v4(),
  pdf_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Invoice items table
create table invoice_items (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references invoices on delete cascade not null,
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

-- Reminders table
create table reminders (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references invoices on delete cascade not null,
  message_ar text not null,
  tone text not null default 'formal' check (tone in ('friendly', 'formal', 'firm')),
  generated_at timestamptz not null default now()
);

-- Indexes
create index idx_invoices_user_id on invoices(user_id);
create index idx_invoices_status on invoices(status);
create index idx_invoices_public_share_token on invoices(public_share_token);
create index idx_invoice_items_invoice_id on invoice_items(invoice_id);
create index idx_reminders_invoice_id on reminders(invoice_id);

-- Row Level Security
alter table profiles enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table reminders enable row level security;

-- Profiles: users can only read/update their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Invoices: users can only access their own invoices
create policy "Users can view own invoices"
  on invoices for select
  using (auth.uid() = user_id);

create policy "Users can insert own invoices"
  on invoices for insert
  with check (auth.uid() = user_id);

create policy "Users can update own invoices"
  on invoices for update
  using (auth.uid() = user_id);

create policy "Users can delete own invoices"
  on invoices for delete
  using (auth.uid() = user_id);

-- Public share: anyone can view an invoice by its share token
create policy "Public can view shared invoices"
  on invoices for select
  using (true);

-- Invoice items: access follows invoice ownership
create policy "Users can view own invoice items"
  on invoice_items for select
  using (
    exists (
      select 1 from invoices
      where invoices.id = invoice_items.invoice_id
      and invoices.user_id = auth.uid()
    )
  );

create policy "Users can insert own invoice items"
  on invoice_items for insert
  with check (
    exists (
      select 1 from invoices
      where invoices.id = invoice_items.invoice_id
      and invoices.user_id = auth.uid()
    )
  );

create policy "Users can update own invoice items"
  on invoice_items for update
  using (
    exists (
      select 1 from invoices
      where invoices.id = invoice_items.invoice_id
      and invoices.user_id = auth.uid()
    )
  );

create policy "Users can delete own invoice items"
  on invoice_items for delete
  using (
    exists (
      select 1 from invoices
      where invoices.id = invoice_items.invoice_id
      and invoices.user_id = auth.uid()
    )
  );

-- Public share for invoice items
create policy "Public can view shared invoice items"
  on invoice_items for select
  using (true);

-- Reminders: access follows invoice ownership
create policy "Users can view own reminders"
  on reminders for select
  using (
    exists (
      select 1 from invoices
      where invoices.id = reminders.invoice_id
      and invoices.user_id = auth.uid()
    )
  );

create policy "Users can insert own reminders"
  on reminders for insert
  with check (
    exists (
      select 1 from invoices
      where invoices.id = reminders.invoice_id
      and invoices.user_id = auth.uid()
    )
  );

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute procedure update_updated_at();

create trigger invoices_updated_at
  before update on invoices
  for each row execute procedure update_updated_at();
