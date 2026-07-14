-- Migration: Nota Tulis cloud sync (Supabase)
-- Jalankan ini di Supabase SQL Editor pada project yang dipakai untuk sync.

create extension if not exists "pgcrypto";

create table if not exists public.products (
  uuid uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  price numeric not null default 0,
  category text,
  created_at bigint not null,
  updated_at bigint not null
);

create table if not exists public.notas (
  uuid uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  number text not null,
  date bigint not null,
  items jsonb not null,
  total numeric not null default 0,
  updated_at bigint not null
);

create table if not exists public.store_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  store_name text,
  address text,
  phone text,
  logo text,
  header_text text,
  footer_text text,
  paper_size text,
  printer jsonb,
  last_nota_number integer default 0,
  updated_at bigint not null
);

alter table public.products enable row level security;
alter table public.notas enable row level security;
alter table public.store_settings enable row level security;

drop policy if exists "own products" on public.products;
create policy "own products" on public.products
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own notas" on public.notas;
create policy "own notas" on public.notas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own settings" on public.store_settings;
create policy "own settings" on public.store_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
