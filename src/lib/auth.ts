"use client";

import { supabase } from "./supabaseClient";
import { db } from "@/database/schema";

const EMAIL_DOMAIN = "nota-tulis.local";
const SALT = "ntx-v1-";

function codeToCredentials(rawCode: string) {
  const code = rawCode.trim().toUpperCase();
  return {
    email: `${code.toLowerCase()}@${EMAIL_DOMAIN}`,
    password: `${SALT}${code}`,
  };
}

function generateRecoveryCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${part()}-${part()}-${part()}`;
}

export async function getCurrentRecoveryCode(): Promise<string | null> {
  const row = await db.meta.get("recoveryCode");
  return row?.value ?? null;
}

export async function ensureAuthenticated(): Promise<void> {
  if (!supabase) return; // Supabase belum dikonfigurasi, skip diam-diam

  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session) return;

  const existing = await db.meta.get("recoveryCode");
  if (existing?.value) {
    const { email, password } = codeToCredentials(existing.value);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) return;
  }

  const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
  if (anonError || !anonData.session) {
    throw new Error("Gagal terhubung ke server cadangan (cek koneksi internet).");
  }

  const code = generateRecoveryCode();
  const { email, password } = codeToCredentials(code);
  const { error: linkError } = await supabase.auth.updateUser({ email, password });
  if (linkError) {
    throw new Error("Gagal membuat kode pemulihan: " + linkError.message);
  }

  await db.meta.put({ key: "recoveryCode", value: code });
}

export async function restoreWithCode(rawCode: string): Promise<void> {
  if (!supabase) throw new Error("Cadangan cloud belum diaktifkan di app ini.");
  const code = rawCode.trim().toUpperCase();
  const { email, password } = codeToCredentials(code);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    throw new Error("Kode tidak ditemukan atau salah.");
  }
  await db.meta.put({ key: "recoveryCode", value: code });
}
