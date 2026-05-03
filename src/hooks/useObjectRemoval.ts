"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { validateFile } from "@/lib/validation";
import { createObjectURL, revokeObjectURL } from "@/lib/imageUtils";

export type ObjectRemovalState = "idle" | "selecting" | "processing" | "complete" | "error";

export interface ObjectRemovalResult {
  state: ObjectRemovalState;
  progress: number;
  stage: string;
  originalUrl: string | null;
  resultUrl: string | null;
  resultBlob: Blob | null;
  error: string | null;
  maskDataUrl: string | null;
  hasMask: boolean;
  processImage: (file: File) => Promise<void>;
  applyInpainting: () => Promise<void>;
  reset: () => void;
  cancel: () => void;
}

export function useObjectRemoval(): ObjectRemovalResult {
  const [state, setState] = useState<ObjectRemovalState>("idle");
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [maskDataUrl, setMaskDataUrl] = useState<string | null>(null);

  const originalUrlRef = useRef<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);
  const cancelledRef = useRef(false);
  const originalFileRef = useRef<File | null>(null);

  const cleanup = useCallback(() => {
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
    setMaskDataUrl(null);
    cancelledRef.current = false;
    originalFileRef.current = null;
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
      cleanup();
      cancelledRef.current = false;
      originalFileRef.current = file;

      setState("idle");
      setProgress(0);
      setStage("Validating file");
      setError(null);
      setResultUrl(null);
      setResultBlob(null);
      setMaskDataUrl(null);

      const validation = await validateFile(file);
      if (!validation.valid) {
        setState("error");
        setError(validation.error ?? "Validation failed");
        return;
      }

      if (cancelledRef.current) return;

      const origUrl = createObjectURL(file);
      originalUrlRef.current = origUrl;
      setOriginalUrl(origUrl);
      setState("selecting");
    },
    [cleanup]
  );

  const applyInpainting = useCallback(async () => {
    if (!originalUrl || !maskDataUrl) return;
    
    cancelledRef.current = false;
    setState("processing");
    setProgress(0);
    setStage("Preparing inpainting");

    try {
      // Load original image
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = originalUrl;
      });

      if (cancelledRef.current) return;

      setProgress(10);
      setStage("Loading mask");

      // Load mask image
      const maskImg = new Image();
      maskImg.crossOrigin = "anonymous";
      
      await new Promise<void>((resolve, reject) => {
        maskImg.onload = () => resolve();
        maskImg.onerror = reject;
        maskImg.src = maskDataUrl;
      });

      if (cancelledRef.current) return;

      setProgress(20);
      setStage("Running inpainting");

      // Create canvas for inpainting
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        throw new Error("Failed to create canvas context");
      }

      // Draw original image
      ctx.drawImage(img, 0, 0);

      if (cancelledRef.current) return;

      setProgress(40);

      // Get mask data
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = maskImg.width;
      maskCanvas.height = maskImg.height;
      const maskCtx = maskCanvas.getContext("2d");
      
      if (!maskCtx) {
        throw new Error("Failed to create mask canvas context");
      }
      
      maskCtx.drawImage(maskImg, 0, 0);
      const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);

      if (cancelledRef.current) return;

      setProgress(50);
      setStage("Analyzing surroundings");

      // Get original image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Scale mask to match image dimensions if needed
      const scaleX = canvas.width / maskImg.width;
      const scaleY = canvas.height / maskImg.height;

      // Simple inpainting using surrounding pixel averaging
      const inpaintedData = ctx.createImageData(canvas.width, canvas.height);
      inpaintedData.data.set(imageData.data);

      // Process mask pixels
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const maskX = Math.floor(x / scaleX);
          const maskY = Math.floor(y / scaleY);
          const maskIdx = (maskY * maskCanvas.width + maskX) * 4;
          
          // Check if this pixel is in the mask (white in mask)
          if (maskData.data[maskIdx] > 128) {
            const idx = (y * canvas.width + x) * 4;
            
            // Sample from surrounding area (weighted average from edges)
            let r = 0, g = 0, b = 0, samples = 0;
            const sampleRadius = 20;
            
            for (let dy = -sampleRadius; dy <= sampleRadius; dy += 2) {
              for (let dx = -sampleRadius; dx <= sampleRadius; dx += 2) {
                const sx = x + dx;
                const sy = y + dy;
                
                // Check if sample point is outside mask
                const smx = Math.floor(sx / scaleX);
                const smy = Math.floor(sy / scaleY);
                
                if (smx >= 0 && smx < maskCanvas.width && smy >= 0 && smy < maskCanvas.height) {
                  const smIdx = (smy * maskCanvas.width + smx) * 4;
                  if (maskData.data[smIdx] < 128) {
                    const sampleIdx = ((sy * canvas.width) + sx) * 4;
                    if (sampleIdx >= 0 && sampleIdx < imageData.data.length - 3) {
                      const weight = 1 / (Math.abs(dx) + Math.abs(dy) + 1);
                      r += imageData.data[sampleIdx] * weight;
                      g += imageData.data[sampleIdx + 1] * weight;
                      b += imageData.data[sampleIdx + 2] * weight;
                      samples += weight;
                    }
                  }
                }
              }
            }
            
            if (samples > 0) {
              inpaintedData.data[idx] = Math.round(r / samples);
              inpaintedData.data[idx + 1] = Math.round(g / samples);
              inpaintedData.data[idx + 2] = Math.round(b / samples);
            }
          }
        }
        
        // Update progress
        if (y % 50 === 0) {
          setProgress(50 + Math.round((y / canvas.height) * 40));
        }
        
        if (cancelledRef.current) return;
      }

      if (cancelledRef.current) return;

      setProgress(90);
      setStage("Finalizing");

      // Apply inpainted data
      ctx.putImageData(inpaintedData, 0, 0);

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to create blob"));
          },
          "image/png"
        );
      });

      if (cancelledRef.current) return;

      const url = createObjectURL(blob);
      resultUrlRef.current = url;
      
      setResultUrl(url);
      setResultBlob(blob);
      setProgress(100);
      setStage("Complete");
      setState("complete");
    } catch (err) {
      if (!cancelledRef.current) {
        setState("error");
        setError(err instanceof Error ? err.message : "Inpainting failed");
      }
    }
  }, [originalUrl, maskDataUrl]);

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
    maskDataUrl,
    hasMask: maskDataUrl !== null && maskDataUrl !== "",
    processImage,
    applyInpainting,
    reset,
    cancel,
  };
}
