"use client";

import { useEffect } from "react";
import { ensureAuthenticated } from "@/lib/auth";
import { pullAll, setupAutoSync } from "@/lib/sync";

export function SupabaseAuthProvider() {
  useEffect(() => {
    (async () => {
      try {
        await ensureAuthenticated();
        await pullAll();
        setupAutoSync();
      } catch (err) {
        console.error("Supabase auth/sync error:", err);
      }
    })();
  }, []);

  return null;
}
