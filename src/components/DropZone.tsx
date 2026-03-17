"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, AlertCircle } from "lucide-react";
import { formatFileSize } from "@/lib/validation";

interface DropZoneProps {
  onFileAccepted: (file: File) => void;
  disabled?: boolean;
}

export function DropZone({ onFileAccepted, disabled = false }: DropZoneProps) {
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setRejectionError(null);
      if (acceptedFiles.length > 0 && acceptedFiles[0]) {
        onFileAccepted(acceptedFiles[0]);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "image/png": [".png"],
        "image/jpeg": [".jpg", ".jpeg"],
      },
      maxSize: 10 * 1024 * 1024,
      multiple: false,
      disabled,
      onDropRejected: (fileRejections) => {
        const firstError = fileRejections[0]?.errors[0];
        if (firstError?.code === "file-too-large") {
          setRejectionError(
            `File is too large. Maximum size is ${formatFileSize(10 * 1024 * 1024)}.`
          );
        } else if (firstError?.code === "file-invalid-type") {
          setRejectionError("Only PNG and JPG images are accepted.");
        } else {
          setRejectionError(firstError?.message ?? "File not accepted.");
        }
      },
    });

  return (
    <div className="w-full">
      <motion.div
        whileHover={disabled ? {} : { scale: 1.005 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
      >
        <div
          {...getRootProps()}
          className={`
            relative cursor-pointer rounded-lg p-12 
            border-2 border-dashed transition-colors duration-200
            flex flex-col items-center justify-center gap-4
            min-h-[240px]
            ${
              isDragActive && !isDragReject
                ? "border-ev-accent bg-ev-accent-muted"
                : isDragReject
                ? "border-ev-danger bg-red-500/5"
                : "border-ev-border hover:border-ev-accent/50 bg-ev-surface/30"
            }
            ${disabled ? "pointer-events-none opacity-40" : ""}
          `}
        >
          <input {...getInputProps()} />

          {/* Animated glow border on drag */}
          <AnimatePresence>
            {isDragActive && !isDragReject && (
              <motion.div
                className="absolute inset-0 rounded-lg pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  boxShadow:
                    "inset 0 0 30px rgba(6, 182, 212, 0.1), 0 0 40px rgba(6, 182, 212, 0.1)",
                }}
              />
            )}
          </AnimatePresence>

          <motion.div
            animate={isDragActive ? { y: -4, scale: 1.05 } : { y: 0, scale: 1 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
          >
            {isDragReject ? (
              <AlertCircle className="w-10 h-10 text-ev-danger" strokeWidth={1.5} />
            ) : (
              <Upload
                className={`w-10 h-10 ${
                  isDragActive ? "text-ev-accent" : "text-ev-text-muted"
                }`}
                strokeWidth={1.5}
              />
            )}
          </motion.div>

          <div className="text-center space-y-2">
            {isDragReject ? (
              <p className="font-sora text-sm text-ev-danger">
                This file type is not supported
              </p>
            ) : isDragActive ? (
              <p className="font-sora text-sm text-ev-accent">
                Drop your image here
              </p>
            ) : (
              <>
                <p className="font-sora text-sm text-ev-text-bright">
                  Drop an image here, or{" "}
                  <span className="text-ev-accent">browse</span>
                </p>
                <p className="text-xs text-ev-text-muted">
                  PNG or JPG — up to 10 MB
                </p>
              </>
            )}
          </div>


        </div>
      </motion.div>

      {/* Rejection error */}
      <AnimatePresence>
        {rejectionError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-3 flex items-center gap-2 text-sm text-ev-danger"
          >
            <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            <span>{rejectionError}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
