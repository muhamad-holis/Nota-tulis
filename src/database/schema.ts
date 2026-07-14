import Dexie, { type Table } from "dexie";
import type { Product, Nota, Settings } from "@/types";

export interface MetaRow {
  key: string;
  value: string;
}

export interface SyncQueueItem {
  id?: number;
  table: "products" | "notas" | "settings";
  op: "upsert" | "delete";
  uuid: string;
  createdAt: number;
}

export class NotaTulisDB extends Dexie {
  products!: Table<Product, number>;
  notas!: Table<Nota, number>;
  settings!: Table<Settings, number>;
  meta!: Table<MetaRow, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super("nota-tulis-db");
    this.version(1).stores({
      products: "++id, name, category, createdAt",
      notas: "++id, number, date",
      settings: "++id",
    });
    this.version(2)
      .stores({
        products: "++id, uuid, name, category, createdAt",
        notas: "++id, uuid, number, date",
        settings: "++id",
        meta: "key",
        syncQueue: "++id, table, uuid",
      })
      .upgrade(async (tx) => {
        await tx
          .table("products")
          .toCollection()
          .modify((p: Product) => {
            if (!p.uuid) p.uuid = crypto.randomUUID();
          });
        await tx
          .table("notas")
          .toCollection()
          .modify((n: Nota) => {
            if (!n.uuid) n.uuid = crypto.randomUUID();
            if (!n.updatedAt) n.updatedAt = n.date;
          });
      });
  }
}

export const db = new NotaTulisDB();

function defaultSettingsValue(): Settings {
  return {
    storeName: "Toko Saya",
    address: "",
    phone: "",
    logo: null,
    headerText: "TERIMA KASIH\nSELAMAT DATANG",
    footerText: "Terima kasih atas kepercayaan Anda.",
    paperSize: "58",
    printer: null,
    lastNotaNumber: 0,
  };
}

// WRITE — jangan pernah dipanggil dari dalam useLiveQuery querier.
export async function ensureSettingsExist(): Promise<void> {
  const existing = await db.settings.toCollection().first();
  if (existing) return;
  await db.settings.add(defaultSettingsValue());
}

// WRITE + READ — aman dipakai di luar liveQuery (mis. saat saveNota()).
export async function getOrCreateSettings(): Promise<Settings> {
  const existing = await db.settings.toCollection().first();
  if (existing) return existing;
  const defaultSettings = defaultSettingsValue();
  const id = await db.settings.add(defaultSettings);
  return { ...defaultSettings, id };
}

export async function nextNotaNumber(): Promise<string> {
  const settings = await getOrCreateSettings();
  const next = settings.lastNotaNumber + 1;
  await db.settings.update(settings.id!, { lastNotaNumber: next });
  return `INV${String(next).padStart(6, "0")}`;
}
