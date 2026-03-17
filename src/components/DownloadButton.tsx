"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { downloadBlob, generateFilename } from "@/lib/imageUtils";

interface DownloadButtonProps {
  blob: Blob;
}

export function DownloadButton({ blob }: DownloadButtonProps) {
  const handleDownload = () => {
    const filename = generateFilename();
    downloadBlob(blob, filename);
  };

  return (
    <motion.button
      onClick={handleDownload}
      className="
        inline-flex items-center gap-2.5 
        px-7 py-3 rounded-lg
        bg-ev-accent text-ev-black
        font-sora text-sm font-medium tracking-wide
        transition-colors duration-200
        hover:bg-ev-accent/90
        focus-visible:outline-2 focus-visible:outline-ev-accent focus-visible:outline-offset-2
      "
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      style={{
        boxShadow: "0 0 20px rgba(6, 182, 212, 0.2), 0 4px 16px rgba(0, 0, 0, 0.3)",
      }}
    >
      <Download className="w-4 h-4" strokeWidth={2} />
      Download PNG
    </motion.button>
  );
}
