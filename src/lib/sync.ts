"use client";

import { db } from "@/database/schema";
import { supabase } from "./supabaseClient";
import type { Product, Nota, Settings } from "@/types";

let flushing = false;

export function enqueueSync(
  table: "products" | "notas" | "settings",
  uuid: string,
  op: "upsert" | "delete" = "upsert"
) {
  if (!supabase) return;
  db.syncQueue.add({ table, uuid, op, createdAt: Date.now() }).catch(() => {});
  if (typeof navigator !== "undefined" && navigator.onLine) {
    flushQueue();
  }
}

export async function flushQueue() {
  if (!supabase || flushing) return;
  flushing = true;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) return;

    const items = await db.syncQueue.orderBy("id").toArray();
    for (const item of items) {
      try {
        await syncOne(item, userId);
        await db.syncQueue.delete(item.id!);
      } catch {
        break; // koneksi/gangguan lain -> coba lagi nanti, jangan buang item
      }
    }
  } finally {
    flushing = false;
  }
}

async function syncOne(
  item: { table: "products" | "notas" | "settings"; uuid: string; op: "upsert" | "delete" },
  userId: string
) {
  if (!supabase) return;

  if (item.table === "products") {
    if (item.op === "delete") {
      await supabase.from("products").delete().eq("uuid", item.uuid).eq("user_id", userId);
      return;
    }
    const p = await db.products.where("uuid").equals(item.uuid).first();
    if (!p) return;
    await supabase.from("products").upsert({
      uuid: p.uuid,
      user_id: userId,
      name: p.name,
      price: p.price,
      category: p.category ?? null,
      created_at: p.createdAt,
      updated_at: p.updatedAt,
    });
    return;
  }

  if (item.table === "notas") {
    if (item.op === "delete") {
      await supabase.from("notas").delete().eq("uuid", item.uuid).eq("user_id", userId);
      return;
    }
    const n = await db.notas.where("uuid").equals(item.uuid).first();
    if (!n) return;
    await supabase.from("notas").upsert({
      uuid: n.uuid,
      user_id: userId,
      number: n.number,
      date: n.date,
      items: n.items,
      total: n.total,
      updated_at: n.updatedAt ?? n.date,
    });
    return;
  }

  if (item.table === "settings") {
    const s = await db.settings.toCollection().first();
    if (!s) return;
    await supabase.from("store_settings").upsert({
      user_id: userId,
      store_name: s.storeName,
      address: s.address,
      phone: s.phone,
      logo: s.logo,
      show_logo: s.showLogo,
      header_text: s.headerText,
      footer_text: s.footerText,
      paper_size: s.paperSize,
      printer: s.printer,
      last_nota_number: s.lastNotaNumber,
      updated_at: Date.now(),
    });
  }
}

export async function pullAll() {
  if (!supabase) return;
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return;

  const [productsRes, notasRes, settingsRes] = await Promise.all([
    supabase.from("products").select("*").eq("user_id", userId),
    supabase.from("notas").select("*").eq("user_id", userId),
    supabase.from("store_settings").select("*").eq("user_id", userId).maybeSingle(),
  ]);

  if (productsRes.data) {
    for (const rp of productsRes.data) {
      const local = await db.products.where("uuid").equals(rp.uuid).first();
      if (!local || (local.updatedAt ?? 0) < rp.updated_at) {
        const record: Product = {
          uuid: rp.uuid,
          name: rp.name,
          price: rp.price,
          category: rp.category ?? undefined,
          createdAt: rp.created_at,
          updatedAt: rp.updated_at,
        };
        if (local?.id) await db.products.update(local.id, record);
        else await db.products.add(record);
      }
    }
  }

  if (notasRes.data) {
    for (const rn of notasRes.data) {
      const local = await db.notas.where("uuid").equals(rn.uuid).first();
      if (!local) {
        await db.notas.add({
          uuid: rn.uuid,
          number: rn.number,
          date: rn.date,
          items: rn.items,
          total: rn.total,
          updatedAt: rn.updated_at,
        } as Nota);
      }
    }
  }

  if (settingsRes.data) {
    const rs = settingsRes.data;
    const local = await db.settings.toCollection().first();
    const patch: Partial<Settings> = {
      storeName: rs.store_name,
      address: rs.address,
      phone: rs.phone,
      logo: rs.logo,
      showLogo: rs.show_logo ?? true,
      headerText: rs.header_text,
      footerText: rs.footer_text,
      paperSize: rs.paper_size,
      printer: rs.printer,
      lastNotaNumber: rs.last_nota_number,
    };
    if (local?.id) await db.settings.update(local.id, patch);
  }
}

export function setupAutoSync() {
  if (typeof window === "undefined") return;
  window.addEventListener("online", () => flushQueue());
  flushQueue();
}
