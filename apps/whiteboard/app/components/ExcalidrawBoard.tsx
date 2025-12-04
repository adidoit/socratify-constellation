'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { exportToBlob, convertToExcalidrawElements } from '@excalidraw/excalidraw';
import { Streamdown } from 'streamdown';
import { Loader2, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Dynamic import (Excalidraw touches DOM APIs; disable SSR)
const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  { ssr: false }
);

export default function ExcalidrawBoard() {
  const apiRef = React.useRef<any>(null);
  const [elements, setElements] = React.useState<readonly any[]>([]);
  const [appState, setAppState] = React.useState<any>({});
  const [files, setFiles] = React.useState<any>({});
  const [isUploading, setIsUploading] = React.useState(false);
  const [isCritiquing, setIsCritiquing] = React.useState(false);
  const [critique, setCritique] = React.useState<string | null>(null);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [authEmail, setAuthEmail] = React.useState('');
  const [authStatus, setAuthStatus] = React.useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [authError, setAuthError] = React.useState<string | null>(null);

  const supabase = React.useMemo(() => createClient(), []);

  // Create example architecture diagram
  const createExampleArchitecture = React.useCallback(() => {
    return convertToExcalidrawElements([
      // Title
      {
        type: "text",
        x: 200,
        y: 50,
        text: "Uber Delivery Time Prediction System",
        fontSize: 24,
        fontFamily: 1,
      },

      // Client Layer
      {
        type: "text",
        x: 50,
        y: 120,
        text: "Client Layer",
        fontSize: 16,
        fontFamily: 1,
      },
      {
        type: "rectangle",
        x: 50,
        y: 150,
        width: 140,
        height: 70,
        backgroundColor: "#a5d8ff",
        label: { text: "Mobile App" },
      },
      {
        type: "rectangle",
        x: 220,
        y: 150,
        width: 140,
        height: 70,
        backgroundColor: "#a5d8ff",
        label: { text: "Web Dashboard" },
      },

      // API Gateway
      {
        type: "text",
        x: 450,
        y: 120,
        text: "Gateway",
        fontSize: 16,
        fontFamily: 1,
      },
      {
        type: "rectangle",
        x: 450,
        y: 150,
        width: 140,
        height: 70,
        backgroundColor: "#ffd8a8",
        label: { text: "API Gateway" },
      },

      // Services Layer
      {
        type: "text",
        x: 50,
        y: 280,
        text: "Services Layer",
        fontSize: 16,
        fontFamily: 1,
      },
      {
        type: "rectangle",
        x: 50,
        y: 310,
        width: 140,
        height: 70,
        backgroundColor: "#b2f2bb",
        label: { text: "User Service" },
      },
      {
        type: "rectangle",
        x: 220,
        y: 310,
        width: 140,
        height: 70,
        backgroundColor: "#b2f2bb",
        label: { text: "Delivery Service" },
      },
      {
        type: "rectangle",
        x: 390,
        y: 310,
        width: 140,
        height: 70,
        backgroundColor: "#b2f2bb",
        label: { text: "Order Service" },
      },

      // ML/Prediction Layer
      {
        type: "text",
        x: 650,
        y: 280,
        text: "Prediction",
        fontSize: 16,
        fontFamily: 1,
      },
      {
        type: "rectangle",
        x: 650,
        y: 310,
        width: 160,
        height: 70,
        backgroundColor: "#ffc9c9",
        label: { text: "ML Time Predictor" },
      },

      // Data Layer
      {
        type: "text",
        x: 50,
        y: 450,
        text: "Data Layer",
        fontSize: 16,
        fontFamily: 1,
      },
      {
        type: "rectangle",
        x: 50,
        y: 480,
        width: 140,
        height: 70,
        backgroundColor: "#d0bfff",
        label: { text: "PostgreSQL" },
      },
      {
        type: "rectangle",
        x: 220,
        y: 480,
        width: 140,
        height: 70,
        backgroundColor: "#d0bfff",
        label: { text: "Redis Cache" },
      },
      {
        type: "rectangle",
        x: 390,
        y: 480,
        width: 140,
        height: 70,
        backgroundColor: "#d0bfff",
        label: { text: "Kafka Queue" },
      },

      // Real-time Components
      {
        type: "rectangle",
        x: 650,
        y: 480,
        width: 160,
        height: 70,
        backgroundColor: "#ffe066",
        label: { text: "WebSocket Server" },
      },

      // Arrows - Client to Gateway
      {
        type: "arrow",
        x: 190,
        y: 185,
        points: [[0, 0], [260, 0]],
      },
      {
        type: "arrow",
        x: 360,
        y: 185,
        points: [[0, 0], [90, 0]],
      },

      // Arrows - Gateway to Services
      {
        type: "arrow",
        x: 520,
        y: 220,
        points: [[0, 0], [-400, 90]],
      },
      {
        type: "arrow",
        x: 520,
        y: 220,
        points: [[0, 0], [-230, 90]],
      },
      {
        type: "arrow",
        x: 520,
        y: 220,
        points: [[0, 0], [-60, 90]],
      },

      // Arrows - Services to ML
      {
        type: "arrow",
        x: 530,
        y: 345,
        points: [[0, 0], [120, 0]],
      },

      // Arrows - Services to Data
      {
        type: "arrow",
        x: 120,
        y: 380,
        points: [[0, 0], [0, 100]],
      },
      {
        type: "arrow",
        x: 290,
        y: 380,
        points: [[0, 0], [0, 100]],
      },
      {
        type: "arrow",
        x: 460,
        y: 380,
        points: [[0, 0], [0, 100]],
      },

      // Arrow - ML to WebSocket
      {
        type: "arrow",
        x: 730,
        y: 380,
        points: [[0, 0], [0, 100]],
      },
    ]);
  }, []);

  // Load example architecture
  const handleLoadExample = React.useCallback(() => {
    const exampleElements = createExampleArchitecture();
    if (apiRef.current) {
      apiRef.current.updateScene({
        elements: exampleElements,
        appState: {
          viewBackgroundColor: "#ffffff",
        },
      });
      // Clear any existing critique
      setCritique(null);
    }
  }, [createExampleArchitecture]);

  // Toggle expand/collapse
  const toggleExpand = React.useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // Handle ESC key to close expanded view
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isExpanded]);

  // Customize UI: hide image tool and most canvas actions
  const UIOptions = React.useMemo(
    () => ({
      canvasActions: {
        changeViewBackgroundColor: false,
        clearCanvas: true,
        loadScene: false,
        saveToActiveFile: false,
        toggleTheme: false,
        saveAsImage: false,
        export: false as const,
      },
    }),
    []
  );

  const handleDownload = async () => {
    if (!apiRef.current) return;

    const blob = await exportToBlob({
      elements: elements as any,
      appState,
      files,
      mimeType: 'image/png',
      quality: 1,
      getDimensions: () => ({ width: 1920, height: 1080, scale: 2 }),
    });

    // Trigger download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whiteboard-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    if (!apiRef.current) return;

    setIsUploading(true);
    try {
      const blob = await exportToBlob({
        elements: elements as any,
        appState,
        files,
        mimeType: 'image/png',
        quality: 1,
        getDimensions: () => ({ width: 1920, height: 1080, scale: 2 }),
      });

      // Upload to API endpoint
      const formData = new FormData();
      formData.append('file', blob, `whiteboard-${Date.now()}.png`);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      alert(`Upload successful! File saved to: ${data.path}`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Check console for details.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCritique = async () => {
    if (!apiRef.current) return;

    // Require auth before allowing critique
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsCritiquing(true);
    setCritique('');
    try {
      const blob = await exportToBlob({
        elements: elements as any,
        appState,
        files,
        mimeType: 'image/png',
        quality: 1,
        getDimensions: () => ({ width: 1920, height: 1080, scale: 2 }),
      });

      // Send to critique API endpoint
      const formData = new FormData();
      formData.append('file', blob, `whiteboard-${Date.now()}.png`);

      const response = await fetch('/api/critique', {
        method: 'POST',
        body: formData,
      });

      if (response.status === 401) {
        setShowAuthModal(true);
        return;
      }

      if (!response.ok) {
        throw new Error('Critique failed');
      }

      // Stream the response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let fullText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setCritique(fullText);
      }
    } catch (error) {
      console.error('Critique error:', error);
      alert('Critique failed. Check console for details.');
    } finally {
      setIsCritiquing(false);
    }
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          /* Hide tools not needed for interview prep */
          /* Keep: Selection, Rectangle, Ellipse, Arrow, Line, Draw, Text, Eraser */
          [title*="Diamond"],
          [title*="Hand (panning tool)"],
          [title*="Insert image"],
          [title*="More tools"],
          [title*="Library"] {
            display: none !important;
          }
        `,
        }}
      />

      <div className="flex w-full flex-col gap-5">
        <div className="flex items-start gap-6">
          <div className={isExpanded ? 'hidden' : 'flex-[3] basis-3/4 min-w-0'}>
            <div className="flex h-[88vh] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-3">
                <button
                  onClick={handleLoadExample}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground hover:border-foreground/20 transition-all duration-200"
                  title="Load example Uber architecture"
                >
                  Load Example
                </button>
                <div className="h-6 w-px bg-border" />
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground hover:border-foreground/20 transition-all duration-200"
                  title="Download PNG to your computer"
                >
                  Download PNG
                </button>
                <button
                  onClick={handleCritique}
                  disabled={isCritiquing}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Get AI critique of your architecture"
                >
                  {isCritiquing ? 'Analyzing...' : 'Critique'}
                </button>
                <div className="flex-1" />
                <button
                  onClick={toggleExpand}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground hover:border-foreground/20 transition-all duration-200"
                  title="Expand to fullscreen (ESC to close)"
                >
                  Expand
                </button>
              </div>

              <div className="flex-1 min-h-0">
                <Excalidraw
                  excalidrawAPI={(api) => (apiRef.current = api)}
                  onChange={(els, app, fs) => {
                    setElements(els);
                    setAppState(app);
                    setFiles(fs);
                  }}
                  UIOptions={UIOptions}
                  name="Interview Whiteboard"
                  theme="light"
                />
              </div>
            </div>
          </div>

          {!isExpanded && (
            <div className="flex-1 basis-1/4 min-w-[280px] max-w-sm">
              <div className="flex h-[88vh] flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
                {critique !== null ? (
                  <>
                    <div className="flex items-center gap-2 text-heading-sm text-foreground">
          {isCritiquing && (
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
          )}
          Critique
        </div>
                    <div className="prose prose-sm max-w-none flex-1 overflow-y-auto rounded-lg bg-secondary p-4 text-foreground [&_p]:text-foreground [&_li]:text-foreground [&_strong]:text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground">
                      <Streamdown>{critique}</Streamdown>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-1 items-center justify-center rounded-xl bg-secondary text-center text-muted-foreground">
                    <div className="space-y-2 px-6">
                      <p className="text-heading-sm text-foreground">Draw your architecture</p>
                      <p className="text-body-md">
                        Sketch on the canvas, then click "Critique" for feedback.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-3 shadow-sm">
              <button
                onClick={handleLoadExample}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground hover:border-foreground/20 transition-all duration-200"
                title="Load example Uber architecture"
              >
                Load Example
              </button>
              <div className="h-6 w-px bg-border" />
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground hover:border-foreground/20 transition-all duration-200"
                title="Download PNG to your computer"
              >
                Download PNG
              </button>
              <button
                onClick={handleCritique}
                disabled={isCritiquing}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                title="Get AI critique of your architecture"
              >
                {isCritiquing ? 'Analyzing...' : 'Critique'}
              </button>
              <div className="flex-1" />
              <button
                onClick={toggleExpand}
                className="inline-flex items-center gap-2 rounded-full bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-all duration-200"
                title="Close fullscreen (ESC)"
              >
                Close
              </button>
            </div>

            <div className="flex-1 min-h-0">
              <Excalidraw
                excalidrawAPI={(api) => (apiRef.current = api)}
                onChange={(els, app, fs) => {
                  setElements(els);
                  setAppState(app);
                  setFiles(fs);
                }}
                UIOptions={UIOptions}
                name="Interview Whiteboard"
                theme="light"
              />
            </div>
          </div>
        </div>
      )}

      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-base font-semibold text-foreground">Sign in to continue</div>
                  <div className="text-sm text-muted-foreground">We’ll email you a magic link.</div>
                </div>
              </div>
              <button
                onClick={() => {
                  if (authStatus !== 'sending') {
                    setShowAuthModal(false);
                    setAuthError(null);
                    setAuthStatus('idle');
                    setAuthEmail('');
                  }
                }}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4">
              {authError && (
                <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {authError}
                </div>
              )}

              {authStatus === 'sent' ? (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="text-foreground text-base font-medium">Check your email</div>
                  <p>We sent a magic link to <strong className="text-foreground">{authEmail}</strong>.</p>
                  <p>Click it to finish signing in, then hit Critique again.</p>
                </div>
              ) : (
                <form
                  className="space-y-3"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!authEmail) return;
                    setAuthStatus('sending');
                    setAuthError(null);
                    try {
                      const redirectTo = (() => {
                        try {
                          const url = new URL(window.location.href);
                          const next = url.pathname + url.search;
                          return `${url.origin}/auth/callback?next=${encodeURIComponent(next)}`;
                        } catch {
                          return `${window.location.origin}/auth/callback`;
                        }
                      })();

                      const { error } = await supabase.auth.signInWithOtp({
                        email: authEmail,
                        options: { emailRedirectTo: redirectTo },
                      });

                      if (error) {
                        setAuthError(error.message);
                        setAuthStatus('error');
                      } else {
                        setAuthStatus('sent');
                      }
                    } catch (err) {
                      setAuthError(err instanceof Error ? err.message : 'Failed to send link');
                      setAuthStatus('error');
                    }
                  }}
                >
                  <label className="block text-sm font-medium text-foreground">
                    Work or personal email
                  </label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-0 focus:border-primary"
                    placeholder="you@example.com"
                    disabled={authStatus === 'sending'}
                  />
                  <button
                    type="submit"
                    disabled={!authEmail || authStatus === 'sending'}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {authStatus === 'sending' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending magic link...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        Send magic link
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
