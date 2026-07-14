"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db, getOrCreateSettings } from "@/database/schema";
import type { Settings } from "@/types";

export function useSettings() {
  const settings = useLiveQuery(async () => {
    return getOrCreateSettings();
  }, []);

  return settings;
}

export async function updateSettings(id: number, data: Partial<Settings>) {
  return db.settings.update(id, data);
}
