# Supabase Setup — Nota Tulis

## 1. Jalankan migration
Copy isi `migrations/0001_init_sync_tables.sql` ke **SQL Editor** di dashboard Supabase, lalu Run.

## 2. Aktifkan setting Auth (wajib, tidak bisa via SQL)
Buka **Authentication → Providers**:
- **Anonymous Sign-Ins** → ON
- **Email** provider → matikan **"Confirm email"**

## 3. Ambil kredensial
**Project Settings → API**:
- `Project URL` → isi ke `NEXT_PUBLIC_SUPABASE_URL`
- `anon public key` → isi ke `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Isi keduanya di `.env.local` (lokal) dan di Vercel → Settings → Environment Variables (production).
