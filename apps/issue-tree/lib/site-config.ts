import type { SiteConfig } from "@constellation/content-pages/seo";

/**
 * Site configuration for IssueTree
 *
 * Centralized config used across landing pages, blog, and SEO.
 */
export const siteConfig: SiteConfig = {
  url: "https://issuetree.ai",
  name: "Problem Solve App by Socratify",
  description: "AI-native structured problem solving tool using MECE frameworks.",
  ogImage: "/og-image.png",
  // twitterHandle: "socratify", // Uncomment when Twitter is set up
};

/**
 * Content directory paths
 */
export const contentPaths = {
  pages: "content",
  blog: "content/blog",
} as const;
