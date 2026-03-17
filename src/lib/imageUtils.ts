const MAX_DIMENSION = 3840; // 4K

export function createObjectURL(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function revokeObjectURL(url: string): void {
  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export async function resizeImageIfNeeded(
  file: File
): Promise<{ blob: Blob; wasResized: boolean }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = createObjectURL(file);

    img.onload = () => {
      revokeObjectURL(objectUrl);

      const { width, height } = img;

      if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
        resolve({ blob: file, wasResized: false });
        return;
      }

      // Calculate new dimensions maintaining aspect ratio
      const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
      const newWidth = Math.round(width * scale);
      const newHeight = Math.round(height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to create canvas context"));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to resize image"));
            return;
          }
          resolve({ blob, wasResized: true });
        },
        file.type,
        0.92
      );
    };

    img.onerror = () => {
      revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for resizing"));
    };

    img.src = objectUrl;
  });
}

export function generateFilename(): string {
  const timestamp = Date.now();
  return `edgevision-${timestamp}.png`;
}

export async function downloadBlob(blob: Blob, filename: string): Promise<void> {
  // Modern approach: native Save As dialog
  if ("showSaveFilePicker" in window) {
    try {
      const handle = await window.showSaveFilePicker!({
        suggestedName: filename,
        types: [
          {
            description: "PNG Image",
            accept: { "image/png": [".png"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err) {
      // User cancelled the dialog — that's fine, just return
      if (err instanceof Error && err.name === "AbortError") return;
    }
  }

  // Fallback: anchor + data URL (works in all browsers including Safari)
  const reader = new FileReader();
  reader.onloadend = () => {
    const dataUrl = reader.result as string;
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };
  reader.readAsDataURL(blob);
}

