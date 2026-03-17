"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { WorkerMessage, WorkerResponse } from "@/workers/backgroundRemoval.worker";
import { validateFile } from "@/lib/validation";
import { resizeImageIfNeeded, createObjectURL, revokeObjectURL } from "@/lib/imageUtils";

export type ProcessingState = "idle" | "validating" | "processing" | "complete" | "error";

export interface BackgroundRemovalResult {
  state: ProcessingState;
  progress: number;
  stage: string;
  originalUrl: string | null;
  resultUrl: string | null;
  resultBlob: Blob | null;
  error: string | null;
  processImage: (file: File) => Promise<void>;
  reset: () => void;
  cancel: () => void;
}

export function useBackgroundRemoval(): BackgroundRemovalResult {
  const [state, setState] = useState<ProcessingState>("idle");
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const originalUrlRef = useRef<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);
  const cancelledRef = useRef(false);

  const cleanup = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    if (originalUrlRef.current) {
      revokeObjectURL(originalUrlRef.current);
      originalUrlRef.current = null;
    }
    if (resultUrlRef.current) {
      revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    cleanup();
    setState("idle");
    setProgress(0);
    setStage("");
    setOriginalUrl(null);
    setResultUrl(null);
    setResultBlob(null);
    setError(null);
    cancelledRef.current = false;
  }, [cleanup]);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    cleanup();
    setState("idle");
    setProgress(0);
    setStage("");
    setError(null);
  }, [cleanup]);

  const processImage = useCallback(
    async (file: File) => {
      // Clean up any previous run
      cleanup();
      cancelledRef.current = false;

      setState("validating");
      setProgress(0);
      setStage("Validating file");
      setError(null);
      setResultUrl(null);
      setResultBlob(null);

      // Validate
      const validation = await validateFile(file);
      if (!validation.valid) {
        setState("error");
        setError(validation.error ?? "Validation failed");
        return;
      }

      if (cancelledRef.current) return;

      // Set original preview
      const origUrl = createObjectURL(file);
      originalUrlRef.current = origUrl;
      setOriginalUrl(origUrl);

      setState("processing");
      setStage("Preparing image");

      // Resize if needed
      let processBlob: Blob;
      try {
        const { blob, wasResized } = await resizeImageIfNeeded(file);
        processBlob = blob;
        if (wasResized) {
          setStage("Image resized for optimal processing");
        }
      } catch {
        setState("error");
        setError("Failed to prepare image for processing");
        return;
      }

      if (cancelledRef.current) return;

      // Create worker
      const worker = new Worker(
        new URL("@/workers/backgroundRemoval.worker.ts", import.meta.url)
      );
      workerRef.current = worker;

      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        if (cancelledRef.current) return;

        const data = event.data;

        switch (data.type) {
          case "progress":
            setProgress(data.progress ?? 0);
            if (data.stage) setStage(data.stage);
            break;

          case "complete":
            if (data.result) {
              const blob = new Blob([data.result], { type: "image/png" });
              const url = createObjectURL(blob);
              resultUrlRef.current = url;
              setResultUrl(url);
              setResultBlob(blob);
              setState("complete");
              setProgress(100);
              setStage("Complete");
            }
            break;

          case "error":
            setState("error");
            setError(data.error ?? "Processing failed");
            break;
        }
      };

      worker.onerror = () => {
        if (!cancelledRef.current) {
          setState("error");
          setError("Background removal worker encountered an error");
        }
      };

      // Send image data to worker
      try {
        const arrayBuffer = await processBlob.arrayBuffer();
        const message: WorkerMessage = {
          type: "start",
          imageData: arrayBuffer,
          mimeType: file.type,
        };
        worker.postMessage(message, [arrayBuffer]);
      } catch {
        setState("error");
        setError("Failed to send image to processing worker");
      }
    },
    [cleanup]
  );

  // Preload AI model on mount so it's cached before the user uploads
  useEffect(() => {
    const preloadWorker = new Worker(
      new URL("@/workers/backgroundRemoval.worker.ts", import.meta.url)
    );

    const message: WorkerMessage = { type: "preload" };
    preloadWorker.postMessage(message);

    preloadWorker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      if (event.data.type === "preloaded") {
        preloadWorker.terminate();
      }
    };

    return () => {
      preloadWorker.terminate();
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    state,
    progress,
    stage,
    originalUrl,
    resultUrl,
    resultBlob,
    error,
    processImage,
    reset,
    cancel,
  };
}
