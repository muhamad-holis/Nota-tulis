"use client";

import Papa from "papaparse";
import * as XLSX from "xlsx";

export interface ParsedProductRow {
  name: string;
  price: number;
  category?: string;
}

function normalizeRow(row: Record<string, unknown>): ParsedProductRow | null {
  const entries = Object.entries(row).reduce<Record<string, unknown>>((acc, [k, v]) => {
    acc[k.trim().toLowerCase()] = v;
    return acc;
  }, {});

  const name = String(
    entries["nama"] ?? entries["nama barang"] ?? entries["name"] ?? ""
  ).trim();

  const rawPrice =
    entries["harga"] ?? entries["harga jual"] ?? entries["price"] ?? entries["harga_jual"];

  const price =
    typeof rawPrice === "number"
      ? rawPrice
      : parseInt(String(rawPrice ?? "0").replace(/[^0-9]/g, ""), 10) || 0;

  const category = entries["kategori"] ?? entries["category"];

  if (!name) return null;

  return {
    name,
    price,
    category: category ? String(category).trim() : undefined,
  };
}

export async function parseCsvFile(file: File): Promise<ParsedProductRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data
          .map((row) => normalizeRow(row))
          .filter((r): r is ParsedProductRow => r !== null);
        resolve(rows);
      },
      error: (err: Error) => reject(err),
    });
  });
}

export async function parseXlsxFile(file: File): Promise<ParsedProductRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  return json
    .map((row) => normalizeRow(row))
    .filter((r): r is ParsedProductRow => r !== null);
}

export async function parseProductFile(file: File): Promise<ParsedProductRow[]> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "csv") return parseCsvFile(file);
  if (ext === "xlsx" || ext === "xls") return parseXlsxFile(file);
  throw new Error("Format file tidak didukung. Gunakan CSV atau XLSX.");
}
