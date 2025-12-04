"use client";

import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { IssueNode } from "@/types";
import {
  ArrowRight,
  Loader2,
  Megaphone,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SocratifyBranding } from "@/components/SocratifyBranding";
import { SignUpModal } from "@/components/SignUpModal";

const PENDING_PROBLEM_KEY = "issue-tree:pending-problem";

type SubmitStatus = "idle" | "synthesizing" | "creating" | "error";

const LandingPageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeParam = searchParams.get("resume");
  const { isSignedIn } = useAuth();
  const [isResuming, setIsResuming] = useState(false);
  const resumeAttemptedRef = useRef(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [inputValue, setInputValue] = useState("");

  const examplePrompts = [
    { label: "Reduce user churn", icon: TrendingDown },
    { label: "Improve conversion", icon: TrendingUp },
    { label: "Increase awareness", icon: Megaphone },
  ];

  const synthesizeProblem = useCallback(
    async (
      problemStatement: string
    ): Promise<{ synthesizedTitle: string; explanation?: string } | null> => {
      try {
        const response = await fetch("/api/issue-tree-synthesis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ problemStatement }),
        });

        if (!response.ok) {
          console.warn("Synthesis API failed, falling back to original text");
          return null;
        }

        return (await response.json()) as {
          synthesizedTitle: string;
          explanation?: string;
        };
      } catch (err) {
        console.warn("Synthesis API error, falling back to original text", err);
        return null;
      }
    },
    []
  );

  const createTreeFromProblem = useCallback(
    async (text: string, skipSynthesis: boolean = false, opts?: { isResume?: boolean }) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      if (!isSignedIn) {
        try {
          localStorage.setItem(PENDING_PROBLEM_KEY, trimmed);
        } catch {
          // ignore storage failures
        }
        setShowSignUpModal(true);
        return;
      }

      try {
        const isResume = opts?.isResume ?? false;
        if (isResume) {
          setIsResuming(true);
        }
        setShowSignUpModal(false);
        let rootContent = trimmed;
        let description: string | undefined;

        if (!skipSynthesis) {
          setSubmitStatus("synthesizing");
          const synthesisResult = await synthesizeProblem(trimmed);

          if (synthesisResult) {
            rootContent = synthesisResult.synthesizedTitle;
            description = trimmed;
          }
        }

        setSubmitStatus("creating");

        const root: IssueNode = {
          id: crypto.randomUUID(),
          content: rootContent,
          type: "root",
          parentId: null,
          isExpanded: true,
          children: [],
        };

        const response = await fetch("/api/issue-trees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: rootContent,
            description,
            tree: root,
          }),
        });

        if (!response.ok) {
          console.error("Failed to create issue tree from problem input");
          if (response.status === 401) {
            setShowSignUpModal(true);
          }
          setSubmitStatus("error");
          if (isResume) {
            setIsResuming(false);
          }
          return;
        }

        const created = (await response.json()) as { id: string };
        try {
          localStorage.removeItem(PENDING_PROBLEM_KEY);
        } catch {
          // ignore storage failures
        }
        router.push(`/t/${created.id}`);
      } catch (err) {
        console.error("Error creating issue tree from problem input", err);
        setSubmitStatus("error");
      } finally {
        setSubmitStatus("idle");
        if (opts?.isResume) {
          setIsResuming(false);
        }
      }
    },
    [isSignedIn, router, synthesizeProblem]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void createTreeFromProblem(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      void createTreeFromProblem(inputValue);
    }
  };

  useEffect(() => {
    if (!isSignedIn) return;

    const shouldResume = resumeParam === "1";
    if (!shouldResume || resumeAttemptedRef.current) return;

    setIsResuming(true);
    const stored = (() => {
      try {
        return localStorage.getItem(PENDING_PROBLEM_KEY);
      } catch {
        return null;
      }
    })();

    resumeAttemptedRef.current = true;

    if (stored) {
      setInputValue(stored);
      void createTreeFromProblem(stored, false, { isResume: true });
    } else {
      setIsResuming(false);
      router.replace("/");
    }
  }, [createTreeFromProblem, isSignedIn, resumeParam, router]);

  const isLoading =
    submitStatus === "synthesizing" || submitStatus === "creating";
  const canSubmit = !!inputValue.trim() && !isLoading;

  const getLoadingMessage = () => {
    if (submitStatus === "synthesizing") return "Analyzing your problem...";
    if (submitStatus === "creating") return "Creating your tree...";
    return null;
  };

  const renderResumeSpinner = () => (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3 px-6 py-4 rounded-xl border border-border bg-card shadow-lg">
        <Loader2 className="h-5 w-5 animate-spin" />
        <p className="text-sm font-medium text-foreground">
          Finishing your issue tree…
        </p>
        <p className="text-xs text-muted-foreground text-center">
          Hang tight — we&apos;ll redirect once the first node is ready.
        </p>
      </div>
    </div>
  );

  if (isResuming) {
    return <AppShell>{renderResumeSpinner()}</AppShell>;
  }

  return (
    <AppShell>
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
        {/* Heading */}
        <div className="flex flex-col items-center gap-3 mb-12">
          <h1 className="text-display-lg text-center leading-tight max-w-4xl">
            What should we solve today?
          </h1>
          <div className="text-center text-muted-foreground text-sm">
            <SocratifyBranding variant="minimal" />
          </div>
        </div>

        {/* Prompt input container */}
        <div className="w-full max-w-xl">
          <form onSubmit={handleSubmit}>
            <div className="bg-secondary rounded-xl border border-border shadow-lg overflow-hidden">
              {/* Textarea */}
              <div className="p-4">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe the problem..."
                  className="pl-2 w-full bg-transparent text-foreground font-sans text-base font-normal placeholder-muted-foreground/60 resize-none outline-none min-h-[72px] leading-relaxed transition-colors focus:placeholder-muted-foreground/40"
                  rows={2}
                  disabled={isLoading}
                />
              </div>

              {/* Bottom toolbar */}
              <div className="px-4 py-2 flex items-center justify-between">
                {isLoading ? (
                  <span className="text-muted-foreground text-xs font-sans font-medium flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {getLoadingMessage()}
                  </span>
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-xs hidden sm:inline font-mono">
                    <kbd className="px-2 py-1 text-[10px] font-medium bg-muted rounded border border-border">
                      Cmd
                    </kbd>
                    <span className="mx-1">+</span>
                    <kbd className="px-2 py-1 text-[10px] font-medium bg-muted rounded border border-border">
                      Enter
                    </kbd>
                  </span>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Example prompts - skip synthesis since these are already concise */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {examplePrompts.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setInputValue(label);
                }}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-xs font-sans font-medium text-muted-foreground hover:bg-accent hover:text-foreground hover:border-foreground/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <SignUpModal
        open={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
      />

      {isResuming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur">
          <div className="flex flex-col items-center gap-3 px-6 py-4 rounded-xl border border-border bg-card shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p className="text-sm font-medium text-foreground">
              Finishing your issue tree…
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Hang tight — we&apos;ll redirect once the first node is ready.
            </p>
          </div>
        </div>
      )}
    </AppShell>
  );
};

const LandingPage: React.FC = () => {
  return (
    <Suspense fallback={
      <AppShell>
        <div className="flex min-h-screen items-center justify-center px-4">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      </AppShell>
    }>
      <LandingPageContent />
    </Suspense>
  );
};

export default LandingPage;
