"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In a real production app, you might log this to Sentry or Datadog
    console.error("React Error Boundary Caught:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-ev-danger/10 flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-ev-danger" />
      </div>

      <h2 className="font-sora text-2xl font-bold text-ev-text-bright mb-3 tracking-tight">
        Something went wrong
      </h2>
      
      <p className="text-ev-text-muted max-w-[40ch] mb-8 leading-relaxed">
        EdgeVision runs complex AI models directly in your browser. This crash was likely caused by running out of memory. Try using a smaller image.
      </p>

      <button
        onClick={() => reset()}
        className="
          inline-flex items-center gap-2 
          px-6 py-3 rounded-xl
          bg-ev-surface border border-ev-border text-ev-text-bright
          font-sora text-sm font-medium
          transition-all duration-200
          hover:border-ev-accent hover:text-ev-accent
          active:scale-[0.98]
        "
      >
        <RefreshCcw className="w-4 h-4" />
        Try Again
      </button>

      {/* Development only exact error trace */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-12 p-4 bg-red-950/20 border border-red-500/20 rounded-lg text-left w-full max-w-2xl overflow-auto text-xs font-mono text-red-300">
          {error.message}
          <br />
          {error.stack}
        </div>
      )}
    </div>
  );
}
