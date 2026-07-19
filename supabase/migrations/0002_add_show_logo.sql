-- Migration: tambah kolom show_logo pada store_settings
-- Jalankan ini di Supabase SQL Editor pada project yang dipakai untuk sync.
-- Terkait fitur: toggle "Tampilkan Logo di Struk" pada Pengaturan > Informasi Toko.

alter table public.store_settings
  add column if not exists show_logo boolean not null default true;
