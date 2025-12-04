"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 overflow-hidden relative">
      {/* Glitch-style grid background */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Animated glitch lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute h-px bg-destructive/20 animate-pulse"
          style={{ top: '23%', left: '5%', width: '15%', animationDuration: '2s' }}
        />
        <div
          className="absolute h-px bg-destructive/15 animate-pulse"
          style={{ top: '67%', right: '10%', width: '20%', animationDuration: '3s', animationDelay: '0.5s' }}
        />
        <div
          className="absolute w-px bg-destructive/10 animate-pulse"
          style={{ left: '12%', top: '30%', height: '25%', animationDuration: '2.5s', animationDelay: '1s' }}
        />
        <div
          className="absolute w-px bg-destructive/15 animate-pulse"
          style={{ right: '18%', top: '15%', height: '20%', animationDuration: '2s', animationDelay: '0.3s' }}
        />

        {/* Error state nodes */}
        <div className="absolute top-[20%] left-[8%] w-3 h-3 rounded-full bg-destructive/30 animate-ping" style={{ animationDuration: '2s' }} />
        <div className="absolute bottom-[25%] right-[12%] w-2.5 h-2.5 rounded-full bg-destructive/25 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-md">
        {/* Broken/error tree illustration */}
        <div className="mb-8 flex justify-center">
          <svg
            width="180"
            height="120"
            viewBox="0 0 180 120"
            className="text-foreground"
            aria-hidden="true"
          >
            {/* Root node with error indicator */}
            <rect x="70" y="10" width="40" height="24" rx="6" fill="currentColor" opacity="0.9" />
            {/* Error X on root */}
            <g stroke="hsl(var(--destructive))" strokeWidth="2" strokeLinecap="round" opacity="0.8">
              <line x1="85" y1="17" x2="95" y2="27" />
              <line x1="95" y1="17" x2="85" y2="27" />
            </g>

            {/* Broken vertical line with jagged break */}
            <line x1="90" y1="34" x2="90" y2="42" stroke="currentColor" strokeWidth="2" opacity="0.5" />

            {/* Lightning bolt break symbol */}
            <path
              d="M87 46 L93 52 L87 52 L93 58"
              stroke="hsl(var(--destructive))"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.6"
            />

            {/* Collapsed/broken structure below */}
            <line x1="90" y1="62" x2="90" y2="70" stroke="currentColor" strokeWidth="2" opacity="0.2" strokeDasharray="2 2" />

            {/* Tilted/fallen horizontal line */}
            <line x1="35" y1="78" x2="145" y2="82" stroke="currentColor" strokeWidth="2" opacity="0.15" />

            {/* Scattered/fallen child nodes */}
            <rect x="25" y="90" width="38" height="18" rx="4" fill="currentColor" opacity="0.1" transform="rotate(-8 44 99)" />
            <rect x="71" y="92" width="38" height="18" rx="4" fill="currentColor" opacity="0.08" transform="rotate(3 90 101)" />
            <rect x="117" y="88" width="38" height="18" rx="4" fill="currentColor" opacity="0.12" transform="rotate(12 136 97)" />
          </svg>
        </div>

        {/* Error icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className="text-destructive"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
          Something broke
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg mb-8 leading-relaxed">
          The tree encountered an unexpected error.
          <br className="hidden sm:block" />
          <span className="sm:inline"> Let&apos;s try rebuilding from here.</span>
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-foreground text-background font-medium text-sm rounded-lg hover:bg-foreground/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-foreground/10"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M3 22v-6h6" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
            Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-secondary text-secondary-foreground font-medium text-sm rounded-lg hover:bg-accent transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border border-border"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Back to Home
          </a>
        </div>

        {/* Error digest for debugging (subtle) */}
        {error.digest && (
          <p className="mt-8 text-xs text-muted-foreground/50 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      {/* Bottom accent line with error tint */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-destructive/20 to-transparent" />
    </div>
  );
}
