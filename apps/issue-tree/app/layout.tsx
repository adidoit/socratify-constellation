import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { AppProviders } from "@/components/AppProviders";
import "./globals.css";

const SITE_URL = "https://issuetree.ai";
const SITE_NAME = "Problem Solve App by Socratify";
const SITE_DESCRIPTION = "AI-native structured problem solving tool.";

// Inline script to set theme before first paint, preventing flash
const themeInitScript = `
  (function() {
    try {
      var stored = window.localStorage.getItem('theme');
      var theme = (stored === 'light' || stored === 'dark') ? stored : null;

      if (!theme) {
        var mql = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
        theme = mql && mql.matches ? 'dark' : 'light';
      }

      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  })();
`;

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
} as const;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} – AI-native structured problem solving tool.`,
  description: SITE_DESCRIPTION,
  keywords: [
    "issue tree",
    "issue trees",
    "MECE",
    "MECE framework",
    "problem solving",
    "structured problem solving",
    "strategy consulting",
    "product management",
    "growth experimentation",
    "AI issue tree",
    "Issue Tree AI",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: `${SITE_NAME} – AI-native structured problem solving tool.`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: "/og-image.png",
        alt: `${SITE_NAME} – AI-native structured problem solving tool.`,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} – AI-native structured problem solving tool.`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className={`${geist.variable} ${geistMono.variable} ${poppins.variable} font-sans`}>
        <AppProviders>{children}</AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
