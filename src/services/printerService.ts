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

// Kunci localStorage untuk menyimpan id printer terakhir yang berhasil disambung,
// dipakai untuk mencoba reconnect diam-diam (tanpa dialog pilih perangkat) di sesi berikutnya.
const LAST_DEVICE_ID_KEY = "notaTulis:lastPrinterDeviceId";

// Berapa byte dikirim per potongan BLE, dan jeda antar potongan.
// Nilai kecil + jeda ini sengaja dipilih supaya buffer printer thermal murah tidak
// kebanjiran data, karena itu penyebab umum printer memutus koneksi sendiri saat mencetak.
const WRITE_CHUNK_SIZE = 100;
const WRITE_CHUNK_DELAY_MS = 12;

const CONNECT_TIMEOUT_MS = 8000;

export type PrinterStatus = "disconnected" | "connecting" | "connected" | "reconnecting";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}

class PrinterService {
  private device: BluetoothDevice | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private status: PrinterStatus = "disconnected";
  private listeners = new Set<(status: PrinterStatus) => void>();
  private writeChain: Promise<void> = Promise.resolve();
  private disconnectHandler = () => {
    this.characteristic = null;
    this.setStatus("disconnected");
    // Printer BLE murah sering putus sendiri karena idle timeout, bukan karena
    // benar-benar dimatikan/dijauhkan. Coba sambung ulang diam-diam di latar
    // belakang supaya pas user tekan cetak berikutnya, printer sudah siap lagi.
    void this.attemptSilentReconnect();
  };

  isSupported(): boolean {
    return typeof navigator !== "undefined" && !!navigator.bluetooth;
  }

  isConnected(): boolean {
    return !!this.device?.gatt?.connected && !!this.characteristic;
  }

  getStatus(): PrinterStatus {
    return this.status;
  }

  onStatusChange(listener: (status: PrinterStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private setStatus(status: PrinterStatus) {
    this.status = status;
    for (const listener of this.listeners) listener(status);
  }

  private saveLastDeviceId(id: string) {
    try {
      localStorage.setItem(LAST_DEVICE_ID_KEY, id);
    } catch {
      // localStorage bisa saja tidak tersedia (mis. mode privat); abaikan saja.
    }
  }

  private getLastDeviceId(): string | null {
    try {
      return localStorage.getItem(LAST_DEVICE_ID_KEY);
    } catch {
      return null;
    }
  }

  /** Cari characteristic yang bisa ditulis di server GATT yang sudah connect. */
  private async discoverWritableCharacteristic(
    server: BluetoothRemoteGATTServer
  ): Promise<BluetoothRemoteGATTCharacteristic> {
    try {
      const service = await server.getPrimaryService(PRINTER_SERVICE_UUID);
      return await service.getCharacteristic(PRINTER_CHARACTERISTIC_UUID);
    } catch {
      const services = await server.getPrimaryServices();
      for (const service of services) {
        const chars = await service.getCharacteristics();
        const writable = chars.find((c) => c.properties.write || c.properties.writeWithoutResponse);
        if (writable) return writable;
      }
    }
    throw new Error("Tidak ditemukan layanan cetak pada printer ini.");
  }

  /** Hubungkan ke server GATT sebuah device yang sudah punya izin, dengan timeout + beberapa kali percobaan. */
  private async connectGatt(device: BluetoothDevice, attempts = 3): Promise<BluetoothRemoteGATTServer> {
    let lastError: unknown;
    for (let i = 0; i < attempts; i++) {
      try {
        if (!device.gatt) throw new Error("Perangkat ini tidak mendukung GATT.");
        const server = await withTimeout(
          device.gatt.connect(),
          CONNECT_TIMEOUT_MS,
          "Waktu koneksi ke printer habis. Pastikan printer menyala dan dalam jangkauan."
        );
        return server;
      } catch (err) {
        lastError = err;
        if (i < attempts - 1) await sleep(300 * (i + 1));
      }
    }
    throw lastError instanceof Error ? lastError : new Error("Gagal terhubung ke printer.");
  }

  /** Pasang device sebagai device aktif: connect GATT, cari characteristic, pasang listener disconnect. */
  private async attachDevice(device: BluetoothDevice): Promise<{ id: string; name: string }> {
    const server = await this.connectGatt(device);
    const characteristic = await this.discoverWritableCharacteristic(server);

    // Hindari listener dobel kalau device yang sama dipasang ulang.
    this.device?.removeEventListener("gattserverdisconnected", this.disconnectHandler);
    device.addEventListener("gattserverdisconnected", this.disconnectHandler);

    this.device = device;
    this.characteristic = characteristic;
    this.saveLastDeviceId(device.id);
    this.setStatus("connected");

    return { id: device.id, name: device.name || "Printer Bluetooth" };
  }

  /**
   * Coba sambung ulang tanpa memunculkan dialog pilih perangkat, memakai:
   * 1) referensi device di memori (paling umum, saat drop di sesi yang sama), atau
   * 2) navigator.bluetooth.getDevices() untuk mencari device yang sudah pernah diizinkan.
   * Melempar error kalau semua gagal — pemanggil boleh fallback ke scanAndConnect() (butuh tap user).
   */
  private async attemptSilentReconnect(): Promise<{ id: string; name: string }> {
    if (typeof navigator === "undefined" || !navigator.bluetooth) {
      throw new Error("Web Bluetooth tidak didukung di perangkat/browser ini.");
    }
    this.setStatus("reconnecting");

    if (this.device) {
      try {
        return await this.attachDevice(this.device);
      } catch {
        // lanjut coba cara lain di bawah
      }
    }

    const lastId = this.getLastDeviceId();
    if (navigator.bluetooth.getDevices && lastId) {
      try {
        const devices = await navigator.bluetooth.getDevices();
        const match = devices.find((d) => d.id === lastId);
        if (match) {
          return await this.attachDevice(match);
        }
      } catch {
        // getDevices() mungkin tidak didukung penuh di browser ini; abaikan.
      }
    }

    this.setStatus("disconnected");
    throw new Error("Printer terputus. Tekan \"Cari Printer\" untuk menyambungkan ulang.");
  }

  /**
   * Pastikan sudah tersambung sebelum mencetak. Dipakai oleh printReceipt/testPrint
   * supaya print pertama tidak langsung gagal hanya karena koneksi sempat drop.
   */
  async ensureConnected(): Promise<void> {
    if (this.isConnected()) return;
    await this.attemptSilentReconnect();
  }

  /** Memunculkan dialog pilih perangkat Bluetooth. Harus dipanggil langsung dari aksi/tap user. */
  async scanAndConnect(): Promise<{ id: string; name: string }> {
    if (typeof navigator === "undefined" || !navigator.bluetooth) {
      throw new Error("Web Bluetooth tidak didukung di perangkat/browser ini.");
    }
    this.setStatus("connecting");
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [PRINTER_SERVICE_UUID],
      });
      return await this.attachDevice(device);
    } catch (err) {
      this.setStatus(this.isConnected() ? "connected" : "disconnected");
      throw err;
    }
  }

  async disconnect() {
    this.device?.removeEventListener("gattserverdisconnected", this.disconnectHandler);
    this.device?.gatt?.disconnect();
    this.device = null;
    this.characteristic = null;
    this.setStatus("disconnected");
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

  /** Kirim byte ke printer, dipecah jadi potongan kecil + jeda, dan diantre supaya tidak tabrakan. */
  private async write(bytes: number[]) {
    // Antrekan supaya dua pemanggilan write() yang tumpang tindih (mis. user tap cetak 2x
    // cepat) tidak saling tabrakan dan memicu error "GATT operation already in progress".
    const run = this.writeChain.then(() => this.writeInternal(bytes));
    // Simpan promise baru di rantai, tapi jangan biarkan kegagalan salah satu write
    // menyumbat antrean untuk write berikutnya.
    this.writeChain = run.catch(() => undefined);
    return run;
  }

  private async writeInternal(bytes: number[], isRetry = false): Promise<void> {
    if (!this.characteristic) {
      throw new Error("Printer belum terhubung.");
    }
    const data = new Uint8Array(bytes);
    try {
      for (let i = 0; i < data.length; i += WRITE_CHUNK_SIZE) {
        const chunk = data.slice(i, i + WRITE_CHUNK_SIZE);
        await this.characteristic.writeValue(chunk);
        if (i + WRITE_CHUNK_SIZE < data.length) await sleep(WRITE_CHUNK_DELAY_MS);
      }
    } catch (err) {
      if (isRetry) {
        throw err instanceof Error ? err : new Error("Gagal mengirim data ke printer.");
      }
      // Kemungkinan koneksi drop di tengah proses kirim. Coba sambung ulang sekali,
      // lalu ulangi pengiriman dari awal sebelum benar-benar menyerah.
      await this.ensureConnected();
      await this.writeInternal(bytes, true);
    }
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
    await this.ensureConnected();
    const bytes = await this.buildReceiptBytes(nota, settings);
    await this.write(bytes);
  }

  async testPrint(settings: Settings) {
    await this.ensureConnected();
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
