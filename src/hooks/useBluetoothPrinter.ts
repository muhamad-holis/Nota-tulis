"use client";

import { useCallback, useState } from "react";
import { printerService } from "@/services/printerService";
import type { Nota, Settings } from "@/types";

export function useBluetoothPrinter() {
  const [connecting, setConnecting] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async (): Promise<{ id: string; name: string } | null> => {
    setError(null);
    setConnecting(true);
    try {
      const info = await printerService.scanAndConnect();
      return info;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal terhubung ke printer.");
      return null;
    } finally {
      setConnecting(false);
    }
  }, []);

  const print = useCallback(async (nota: Nota, settings: Settings) => {
    setError(null);
    setPrinting(true);
    try {
      if (!printerService.isConnected()) {
        await printerService.scanAndConnect();
      }
      await printerService.printReceipt(nota, settings);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mencetak nota.");
      return false;
    } finally {
      setPrinting(false);
    }
  }, []);

  const testPrint = useCallback(async (settings: Settings) => {
    setError(null);
    setPrinting(true);
    try {
      if (!printerService.isConnected()) {
        await printerService.scanAndConnect();
      }
      await printerService.testPrint(settings);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal melakukan test print.");
      return false;
    } finally {
      setPrinting(false);
    }
  }, []);

  return { connect, print, testPrint, connecting, printing, error, isSupported: printerService.isSupported() };
}
