/* eslint-disable no-restricted-globals */

import { removeBackground, type Config } from "@imgly/background-removal";

export interface WorkerMessage {
  type: "start" | "preload";
  imageData?: ArrayBuffer;
  mimeType?: string;
}

export interface WorkerResponse {
  type: "progress" | "complete" | "error" | "preloaded";
  progress?: number;
  stage?: string;
  result?: ArrayBuffer;
  error?: string;
}

// Tiny 1x1 transparent PNG for preloading the model
const TINY_PNG = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
  0x0d, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0x60, 0x60, 0x60, 0x60,
  0x00, 0x00, 0x00, 0x05, 0x00, 0x01, 0xa5, 0xf6, 0x45, 0x40, 0x00, 0x00,
  0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
]);

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type } = event.data;

  if (type === "preload") {
    try {
      const blob = new Blob([TINY_PNG], { type: "image/png" });
      await removeBackground(blob, {
        progress: (key: string, current: number, total: number) => {
          if (key.includes("fetch")) {
            const response: WorkerResponse = {
              type: "progress",
              progress: Math.round((current / total) * 100),
              stage: "Preloading AI model",
            };
            self.postMessage(response);
          }
        },
      });
      const response: WorkerResponse = { type: "preloaded" };
      self.postMessage(response);
    } catch {
      // Preload failure is non-critical, model will load on first use
    }
    return;
  }

  const { imageData, mimeType } = event.data;

  try {
    const blob = new Blob([imageData!], { type: mimeType });

    const config: Config = {
      progress: (key: string, current: number, total: number) => {
        const percentage = Math.round((current / total) * 100);
        let stage = "Initializing";

        if (key.includes("fetch")) {
          stage = "Loading AI model";
        } else if (key.includes("compute")) {
          stage = "Removing background";
        } else if (key.includes("encode")) {
          stage = "Encoding result";
        }

        const response: WorkerResponse = {
          type: "progress",
          progress: percentage,
          stage,
        };
        self.postMessage(response);
      },
    };

    const result = await removeBackground(blob, config);
    const arrayBuffer = await result.arrayBuffer();

    const response: WorkerResponse = {
      type: "complete",
      result: arrayBuffer,
    };
    self.postMessage(response, [arrayBuffer]);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    const response: WorkerResponse = {
      type: "error",
      error: errorMessage,
    };
    self.postMessage(response);
  }
};

