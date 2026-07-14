"use client";

import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, ensureSettingsExist } from "@/database/schema";
import { enqueueSync } from "@/lib/sync";
import type { Settings } from "@/types";

export function useSettings() {
  useEffect(() => {
    ensureSettingsExist();
  }, []);

  const settings = useLiveQuery(() => db.settings.toCollection().first(), []);

  return settings;
}

export async function updateSettings(id: number, data: Partial<Settings>) {
  const result = await db.settings.update(id, data);
  enqueueSync("settings", "singleton");
  return result;
}
