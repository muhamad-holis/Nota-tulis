export interface Product {
  id?: number;
  uuid?: string;
  name: string;
  price: number;
  category?: string;
  createdAt: number;
  updatedAt: number;
}

export interface NotaItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  totalOverride?: number;
}

export interface Nota {
  id?: number;
  uuid?: string;
  number: string;
  customerName?: string;
  date: number;
  items: NotaItem[];
  total: number;
  updatedAt?: number;
}

export type PaperSize = "58" | "80";

export interface PrinterDevice {
  id: string;
  name: string;
}

export interface Settings {
  id?: number;
  storeName: string;
  address: string;
  phone: string;
  logo: string | null;
  headerText: string;
  footerText: string;
  paperSize: "58" | "80";
  printer: PrinterDevice | null;
  lastNotaNumber: number;
}

export type ImportMode = "add" | "replace";
