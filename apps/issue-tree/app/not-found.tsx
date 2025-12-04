import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 overflow-hidden relative">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating disconnected nodes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Scattered floating nodes */}
        <div className="absolute top-[15%] left-[10%] w-3 h-3 rounded-full bg-muted-foreground/20 animate-pulse" style={{ animationDelay: '0s' }} />
        <div className="absolute top-[25%] right-[15%] w-4 h-4 rounded-full bg-muted-foreground/15 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-[30%] left-[20%] w-2 h-2 rounded-full bg-muted-foreground/25 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-[20%] right-[25%] w-3 h-3 rounded-full bg-muted-foreground/20 animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[40%] left-[5%] w-2.5 h-2.5 rounded-full bg-muted-foreground/15 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[60%] right-[8%] w-3.5 h-3.5 rounded-full bg-muted-foreground/20 animate-pulse" style={{ animationDelay: '0.3s' }} />

        {/* Broken connection lines */}
        <svg className="absolute top-[20%] left-[15%] w-20 h-20 text-muted-foreground/10" viewBox="0 0 80 80">
          <path d="M10 40 L30 40" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
        </svg>
        <svg className="absolute bottom-[35%] right-[20%] w-16 h-16 text-muted-foreground/10 rotate-45" viewBox="0 0 64 64">
          <path d="M10 32 L25 32" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-md">
        {/* Disconnected tree illustration */}
        <div className="mb-8 flex justify-center">
          <svg
            width="180"
            height="120"
            viewBox="0 0 180 120"
            className="text-foreground"
            aria-hidden="true"
          >
            {/* Root node */}
            <rect x="70" y="10" width="40" height="24" rx="6" fill="currentColor" opacity="0.9" />

            {/* Vertical line from root - broken */}
            <line x1="90" y1="34" x2="90" y2="45" stroke="currentColor" strokeWidth="2" opacity="0.4" />

            {/* Gap indicator */}
            <g opacity="0.3">
              <circle cx="90" cy="52" r="1.5" fill="currentColor" />
              <circle cx="90" cy="58" r="1.5" fill="currentColor" />
              <circle cx="90" cy="64" r="1.5" fill="currentColor" />
            </g>

            {/* Disconnected branch connector */}
            <line x1="90" y1="72" x2="90" y2="80" stroke="currentColor" strokeWidth="2" opacity="0.4" />

            {/* Horizontal line */}
            <line x1="30" y1="80" x2="150" y2="80" stroke="currentColor" strokeWidth="2" opacity="0.3" />

            {/* Vertical lines to children */}
            <line x1="50" y1="80" x2="50" y2="95" stroke="currentColor" strokeWidth="2" opacity="0.3" />
            <line x1="90" y1="80" x2="90" y2="95" stroke="currentColor" strokeWidth="2" opacity="0.3" />
            <line x1="130" y1="80" x2="130" y2="95" stroke="currentColor" strokeWidth="2" opacity="0.3" />

            {/* Child nodes - faded/ghosted */}
            <rect x="30" y="95" width="40" height="20" rx="5" fill="currentColor" opacity="0.15" />
            <rect x="70" y="95" width="40" height="20" rx="5" fill="currentColor" opacity="0.15" />
            <rect x="110" y="95" width="40" height="20" rx="5" fill="currentColor" opacity="0.15" />

            {/* Question mark in the gap */}
            <text x="90" y="58" textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="600" fill="currentColor" opacity="0.5">?</text>
          </svg>
        </div>

        {/* 404 number */}
        <div className="mb-4">
          <span className="font-display text-8xl sm:text-9xl font-bold tracking-tighter text-foreground/10">
            404
          </span>
        </div>

        {/* Message */}
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
          Branch not found
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg mb-8 leading-relaxed">
          This path doesn&apos;t connect to any node in the tree.
          <br className="hidden sm:block" />
          <span className="sm:inline"> Let&apos;s get you back to the root.</span>
        </p>

        {/* CTA Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 px-6 py-3 bg-foreground text-background font-medium text-sm rounded-lg hover:bg-foreground/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-foreground/10"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}
