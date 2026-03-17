"use client";

import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-ev-background text-ev-text flex items-center justify-center min-h-dvh">
        <div className="text-center p-8">
          <AlertTriangle className="w-12 h-12 text-ev-danger mx-auto mb-6" />
          <h2 className="font-sora text-2xl font-bold text-ev-text-bright mb-4">
            Critical Application Failure
          </h2>
          <p className="text-ev-text-muted mb-8 max-w-[50ch]">
            EdgeVision encountered an unrecoverable error at the root level.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 rounded-lg bg-ev-accent text-black font-semibold font-sora hover:opacity-90 transition-opacity"
          >
            Restart Application
          </button>
        </div>
      </body>
    </html>
  );
}
