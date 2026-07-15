"use client";

import type { Nota, Settings } from "@/types";
import { imageToMonoRaster } from "@/lib/image";
import { buildReceiptLines } from "@/lib/receiptText";

// ESC/POS command bytes
const ESC = 0x1b;
const GS = 0x1d;

const CMD = {
  INIT: [ESC, 0x40],
  ALIGN_LEFT: [ESC, 0x61, 0x00],
  ALIGN_CENTER: [ESC, 0x61, 0x01],
  BOLD_ON: [ESC, 0x45, 0x01],
  BOLD_OFF: [ESC, 0x45, 0x00],
  DOUBLE_ON: [GS, 0x21, 0x11],
  DOUBLE_OFF: [GS, 0x21, 0x00],
  FEED_LINE: [0x0a],
  CUT: [GS, 0x56, 0x42, 0x00],
};

const PRINTER_SERVICE_UUID = "000018f0-0000-1000-8000-00805f9b34fb";
const PRINTER_CHARACTERISTIC_UUID = "00002af1-0000-1000-8000-00805f9b34fb";

class PrinterService {
  private device: BluetoothDevice | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;

  isSupported(): boolean {
    return typeof navigator !== "undefined" && !!navigator.bluetooth;
  }

  async scanAndConnect(): Promise<{ id: string; name: string }> {
    if (typeof navigator === "undefined" || !navigator.bluetooth) {
      throw new Error("Web Bluetooth tidak didukung di perangkat/browser ini.");
    }
    const bluetooth = navigator.bluetooth;

    const device = await bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [PRINTER_SERVICE_UUID],
    });

    const server = await device.gatt?.connect();
    if (!server) throw new Error("Gagal terhubung ke printer.");

    let characteristic: BluetoothRemoteGATTCharacteristic | null = null;
    try {
      const service = await server.getPrimaryService(PRINTER_SERVICE_UUID);
      characteristic = await service.getCharacteristic(PRINTER_CHARACTERISTIC_UUID);
    } catch {
      const services = await server.getPrimaryServices();
      for (const service of services) {
        const chars = await service.getCharacteristics();
        const writable = chars.find(
          (c) => c.properties.write || c.properties.writeWithoutResponse
        );
        if (writable) {
          characteristic = writable;
          break;
        }
      }
    }

    if (!characteristic) {
      throw new Error("Tidak ditemukan layanan cetak pada printer ini.");
    }

    this.device = device;
    this.characteristic = characteristic;

    return { id: device.id, name: device.name || "Printer Bluetooth" };
  }

  async disconnect() {
    this.device?.gatt?.disconnect();
    this.device = null;
    this.characteristic = null;
  }

  isConnected(): boolean {
    return !!this.device?.gatt?.connected && !!this.characteristic;
  }

  private async write(bytes: number[]) {
    if (!this.characteristic) {
      throw new Error("Printer belum terhubung.");
    }
    const chunkSize = 180;
    const data = new Uint8Array(bytes);
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      await this.characteristic.writeValue(chunk);
    }
  }

  private textToBytes(text: string): number[] {
    return Array.from(new TextEncoder().encode(text));
  }

  private rasterImageCommand(widthPx: number, heightPx: number, data: number[]): number[] {
    const bytesPerRow = widthPx / 8;
    const xL = bytesPerRow & 0xff;
    const xH = (bytesPerRow >> 8) & 0xff;
    const yL = heightPx & 0xff;
    const yH = (heightPx >> 8) & 0xff;
    return [GS, 0x76, 0x30, 0x00, xL, xH, yL, yH, ...data];
  }

  async buildReceiptBytes(nota: Nota, settings: Settings): Promise<number[]> {
    const bytes: number[] = [];
    const push = (arr: number[]) => bytes.push(...arr);
    const line = (text = "") => push(this.textToBytes(text + "\n"));
    const isWide = settings.paperSize === "80";

    push(CMD.INIT);

    if (settings.logo) {
      try {
        push(CMD.ALIGN_CENTER);
        const maxWidthPx = isWide ? 384 : 300;
        const raster = await imageToMonoRaster(settings.logo, maxWidthPx);
        push(this.rasterImageCommand(raster.widthPx, raster.heightPx, raster.data));
        line();
      } catch {
        // Kalau gagal konversi logo, lanjutkan cetak nota tanpa logo.
      }
    }

    // Baris-baris di bawah ini persis sama dengan yang ditampilkan di preview layar,
    // karena keduanya memakai buildReceiptLines() dari src/lib/receiptText.ts
    const receiptLines = buildReceiptLines(nota, settings);
    let currentAlign: "left" | "center" | null = null;
    let currentBold = false;
    for (const rl of receiptLines) {
      if (rl.align !== currentAlign) {
        push(rl.align === "center" ? CMD.ALIGN_CENTER : CMD.ALIGN_LEFT);
        currentAlign = rl.align;
      }
      if (!!rl.bold !== currentBold) {
        push(rl.bold ? CMD.BOLD_ON : CMD.BOLD_OFF);
        currentBold = !!rl.bold;
      }
      line(rl.text);
    }
    if (currentBold) push(CMD.BOLD_OFF);

    line();
    line();
    line();
    push(CMD.CUT);

    return bytes;
  }

  async printReceipt(nota: Nota, settings: Settings) {
    const bytes = await this.buildReceiptBytes(nota, settings);
    await this.write(bytes);
  }

  async testPrint(settings: Settings) {
    const bytes: number[] = [];
    const push = (arr: number[]) => bytes.push(...arr);
    const line = (text = "") => push(this.textToBytes(text + "\n"));

    push(CMD.INIT);
    push(CMD.ALIGN_CENTER);
    push(CMD.BOLD_ON);
    line("TEST PRINT");
    push(CMD.BOLD_OFF);
    line(settings.storeName || "Nota Tulis");
    line("Printer terhubung dengan baik");
    line();
    line();
    push(CMD.CUT);

    await this.write(bytes);
  }
}

export const printerService = new PrinterService();
