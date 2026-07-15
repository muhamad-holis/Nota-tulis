"use client";

export function cropImageToSquareDataUrl(file: File, size = 240): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Gagal memuat gambar."));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas tidak didukung di perangkat ini."));
          return;
        }
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Mengonversi sebuah data URL gambar (mis. logo toko) menjadi bitmap
 * monokrom 1-bit yang siap dibungkus jadi perintah ESC/POS "GS v 0"
 * untuk dicetak di printer thermal Bluetooth.
 */
export function imageToMonoRaster(
  dataUrl: string,
  maxWidthPx: number,
  maxHeightPx = 180
): Promise<{ widthPx: number; heightPx: number; data: number[] }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error("Gagal memuat gambar logo."));
    img.onload = () => {
      let targetW = Math.min(maxWidthPx, img.width);
      let targetH = Math.round((img.height / img.width) * targetW);
      if (targetH > maxHeightPx) {
        targetH = maxHeightPx;
        targetW = Math.round((img.width / img.height) * targetH);
      }
      targetW = Math.max(8, Math.floor(targetW / 8) * 8);

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas tidak didukung di perangkat ini."));
        return;
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, targetW, targetH);
      ctx.drawImage(img, 0, 0, targetW, targetH);

      const { data: px } = ctx.getImageData(0, 0, targetW, targetH);
      const bytesPerRow = targetW / 8;
      const data: number[] = new Array(bytesPerRow * targetH).fill(0);

      for (let y = 0; y < targetH; y++) {
        for (let x = 0; x < targetW; x++) {
          const i = (y * targetW + x) * 4;
          const r = px[i], g = px[i + 1], b = px[i + 2], a = px[i + 3];
          const gray = (r * 0.299 + g * 0.587 + b * 0.114) * (a / 255) + 255 * (1 - a / 255);
          const isBlack = gray < 200;
          if (isBlack) {
            const byteIndex = y * bytesPerRow + (x >> 3);
            data[byteIndex] |= 0x80 >> (x % 8);
          }
        }
      }

      resolve({ widthPx: targetW, heightPx: targetH, data });
    };
    img.src = dataUrl;
  });
}
