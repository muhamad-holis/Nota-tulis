import Dexie, { type Table } from "dexie";
import type { Product, Nota, Settings } from "@/types";

export class NotaTulisDB extends Dexie {
  products!: Table<Product, number>;
  notas!: Table<Nota, number>;
  settings!: Table<Settings, number>;

  constructor() {
    super("nota-tulis-db");
    this.version(1).stores({
      products: "++id, name, category, createdAt",
      notas: "++id, number, date",
      settings: "++id",
    });
  }
}

export const db = new NotaTulisDB();

export async function getOrCreateSettings(): Promise<Settings> {
  const existing = await db.settings.toCollection().first();
  if (existing) return existing;

  const defaultSettings: Settings = {
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
  const id = await db.settings.add(defaultSettings);
  return { ...defaultSettings, id };
}

export async function nextNotaNumber(): Promise<string> {
  const settings = await getOrCreateSettings();
  const next = settings.lastNotaNumber + 1;
  await db.settings.update(settings.id!, { lastNotaNumber: next });
  return `INV${String(next).padStart(6, "0")}`;
}
