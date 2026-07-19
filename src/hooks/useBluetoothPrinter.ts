"use client";

import { useCallback, useEffect, useState } from "react";
import { printerService, type PrinterStatus } from "@/services/printerService";
import type { Nota, Settings } from "@/types";

export function useBluetoothPrinter() {
  const [connecting, setConnecting] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<PrinterStatus>(printerService.getStatus());

  useEffect(() => {
    return printerService.onStatusChange(setStatus);
  }, []);

  useEffect(() => {
    // Kalau sebelumnya pernah tersambung ke printer (mis. buka ulang app), coba sambung
    // ulang diam-diam di latar belakang tanpa memunculkan dialog pilih perangkat.
    // Kalau gagal, biarkan saja — user tinggal tekan "Cari Printer" seperti biasa.
    if (printerService.isSupported() && !printerService.isConnected()) {
      printerService.ensureConnected().catch(() => undefined);
    }
  }, []);

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

  const disconnect = useCallback(async () => {
    await printerService.disconnect();
  }, []);

  const print = useCallback(async (nota: Nota, settings: Settings) => {
    setError(null);
    setPrinting(true);
    try {
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
      await printerService.testPrint(settings);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal melakukan test print.");
      return false;
    } finally {
      setPrinting(false);
    }
  }, []);

  return {
    connect,
    disconnect,
    print,
    testPrint,
    connecting,
    printing,
    error,
    status,
    isSupported: printerService.isSupported(),
  };
}
