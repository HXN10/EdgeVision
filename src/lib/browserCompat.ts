export interface BrowserCompatReport {
  crossOriginIsolated: boolean;
  sharedArrayBuffer: boolean;
  webgl: boolean;
  webgpu: boolean;
  offscreenCanvas: boolean;
  isSafari: boolean;
  isSupported: boolean;
  warnings: string[];
}

export function detectBrowserCompat(): BrowserCompatReport {
  const isSafari =
    typeof navigator !== "undefined" &&
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  const crossOriginIsolated =
    typeof window !== "undefined" && window.crossOriginIsolated === true;

  const sharedArrayBuffer = typeof SharedArrayBuffer !== "undefined";

  let webgl = false;
  if (typeof document !== "undefined") {
    try {
      const canvas = document.createElement("canvas");
      webgl = !!(
        canvas.getContext("webgl2") || canvas.getContext("webgl")
      );
    } catch {
      webgl = false;
    }
  }

  const webgpu =
    typeof navigator !== "undefined" && "gpu" in navigator;

  const offscreenCanvas = typeof OffscreenCanvas !== "undefined";

  const warnings: string[] = [];

  if (!crossOriginIsolated) {
    warnings.push(
      "Cross-origin isolation is not enabled. Multi-threaded processing may be unavailable."
    );
  }

  if (!sharedArrayBuffer) {
    warnings.push(
      "SharedArrayBuffer is not supported. Processing will run in single-threaded mode."
    );
  }

  if (!webgl && !webgpu) {
    warnings.push(
      "Neither WebGL nor WebGPU is available. Processing may be significantly slower."
    );
  }

  if (isSafari && !sharedArrayBuffer) {
    warnings.push(
      "Safari has limited threading support. For best performance, use Chrome or Edge."
    );
  }

  const isSupported = webgl || webgpu;

  return {
    crossOriginIsolated,
    sharedArrayBuffer,
    webgl,
    webgpu,
    offscreenCanvas,
    isSafari,
    isSupported,
    warnings,
  };
}
