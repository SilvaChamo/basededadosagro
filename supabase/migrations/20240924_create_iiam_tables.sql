-- Supabase Migration: Create tables for IIAM module
-- Save this file as supabase/migrations/20240924_create_iiam_tables.sql

create schema if not exists iiam;

-- Companies table
create table if not exists iiam.companies (
  id uuid default uuid_generate_v4() primary key,
  company_name text not null,
  nuit text not null unique,
  address text,
  email text,
  phone text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Follow‑up of new varieties
create table if not exists iiam.variety_followup (
  id uuid default uuid_generate_v4() primary key,
  variety_name text not null,
  launch_date date not null,
  status text not null,
  notes text,
  company_id uuid references iiam.companies(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security (optional)
alter table iiam.companies enable row level security;
alter table iiam.variety_followup enable row level security;

-- Example policy: allow authenticated users to insert their own company
create policy "allow insert own company"
  on iiam.companies
  for insert
  with check (true);

-- Example policy for follow‑up (authenticated users)
create policy "allow insert follow‑up"
  on iiam.variety_followup
  for insert
  with check (true);
