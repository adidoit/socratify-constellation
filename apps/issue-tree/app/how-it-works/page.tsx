import type { Metadata } from "next";
import Link from "next/link";
import { SocratifyBranding } from "@/components/SocratifyBranding";

const BASE_URL = "https://issuetree.ai";
const OG_IMAGE = "/og-image.png";

const PAGE_TITLE = "How Issue Tree AI Works | Issue Tree AI";
const PAGE_DESCRIPTION =
  "See how Issue Tree AI turns a messy problem into a clear, MECE issue tree you can edit, stress-test, and refine with AI.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: `${BASE_URL}/how-it-works`,
  },
  openGraph: {
    type: "article",
    url: `${BASE_URL}/how-it-works`,
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    siteName: "Issue Tree AI",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Issue Tree AI – AI-native issue tree builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HowItWorksPage() {
  const canonicalUrl = `${BASE_URL}/how-it-works`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How Issue Tree AI works",
    description: PAGE_DESCRIPTION,
    articleSection: "Product",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    author: {
      "@type": "Organization",
      name: "Issue Tree AI",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Issue Tree AI",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/og-image.png`,
      },
    },
  };

  return (
    <main className="h-screen bg-[#FBFBF6] overflow-y-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="max-w-3xl mx-auto px-6 py-20 lg:py-28">
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 transition-colors mb-6"
          >
            <span aria-hidden="true" className="mr-1">
              ←
            </span>
            Back to Issue Tree AI
          </Link>

          <p className="text-sm font-semibold tracking-wide text-violet-600 uppercase">
            How it works
          </p>

          <h1 className="mt-3 text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
            How Issue Tree AI works
          </h1>

          <p className="mt-6 text-xl md:text-2xl text-slate-600 leading-relaxed max-w-2xl">
            Start from a messy question. End with a clear, MECE issue tree you
            can actually use to make decisions.
          </p>
        </div>

        <article className="max-w-none text-lg md:text-xl text-slate-700 leading-relaxed space-y-6">
          <p>
            Issue Tree AI is a small, opinionated tool for structured problem
            solving. It takes the consulting-style issue tree you might sketch
            on a whiteboard and makes it fast to build, change, and stress-test
            with AI.
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight mt-10 mb-4">
            1. Start from the real problem, not a template
          </h2>
          <p>
            You begin with plain language:{" "}
            <em>&quot;Reduce user churn,&quot;</em>{" "}
            <em>&quot;Improve activation,&quot;</em> or{" "}
            <em>&quot;Make this new product launch work.&quot;</em> There&apos;s
            no rigid template to force-fit into.
          </p>
          <p>
            When you submit your problem, Issue Tree AI can optionally{" "}
            <strong>rephrase it into a concise root question</strong>—keeping
            your original wording as context. This gives you a sharp, testable
            starting point without losing the nuance of how you described it.
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight mt-10 mb-4">
            2. Build a MECE issue tree, one branch at a time
          </h2>
          <p>
            Each problem lives as an <strong>issue tree</strong>: a root node,
            branches, and sub-branches that break the problem down into mutually
            exclusive, collectively exhaustive (MECE) paths.
          </p>
          <p>
            You can add, edit, and rearrange nodes quickly. The goal isn&apos;t
            to draw a perfect diagram—it&apos;s to make your current model of
            the problem explicit, so you can see what&apos;s missing and where
            you&apos;re hand-waving.
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight mt-10 mb-4">
            3. Use AI as a sparring partner, not an oracle
          </h2>
          <p>
            At any node in the tree, you can ask Issue Tree AI to{" "}
            <strong>
              propose a better label, a new child, or a new sibling
            </strong>
            . Under the hood, the model sees the full tree and the local context
            around that node, then suggests one small, concrete change.
          </p>
          <p>
            That constraint matters. Instead of rewriting your entire problem,
            the AI behaves like a sparring partner—nudging one branch at a time
            to be more MECE, more precise, or more actionable.
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight mt-10 mb-4">
            4. Stress-test the tree with a structured assessment
          </h2>
          <p>
            When you&apos;re ready, you can run an{" "}
            <strong>AI assessment of the whole tree</strong>. The model scores
            your structure against a rubric: clarity of the root question,
            strength of the breakdown, gaps in coverage, and where branches
            might be overlapping.
          </p>
          <p>
            You get targeted feedback, not a generic summary—pointing you to
            specific nodes to tighten, expand, or reframe.
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight mt-10 mb-4">
            5. Keep a history you can revisit and share
          </h2>
          <p>
            Every issue tree you create is saved under an anonymous client ID,
            so you can{" "}
            <strong>
              come back to old problems and see how your thinking evolved
            </strong>
            .
          </p>
          <p>
            You can export a snapshot of the tree to share with teammates or
            drop into a doc or slide. The tree becomes a lightweight shared
            artifact for product reviews, strategy discussions, or one-on-ones.
          </p>
        </article>

        <section className="mt-16 border-t border-slate-200 pt-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
                Turn your next problem into a tree
              </h2>
              <p className="mt-3 text-lg text-slate-600 leading-relaxed max-w-lg">
                The best way to understand Issue Tree AI is to try it on a real
                problem—something on your plate this week, not a toy example.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-start md:justify-end items-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
              >
                Start
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-10 mb-4 flex justify-center">
          <SocratifyBranding variant="full" />
        </div>
      </section>
    </main>
  );
}
