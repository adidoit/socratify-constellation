import type { SiteConfig } from "@constellation/content-pages/seo";

/**
 * Site configuration for Socratify Whiteboards
 *
 * Used across landing pages, blog, and SEO.
 */
export const siteConfig: SiteConfig = {
  url: "https://whiteboard.socratify.com",  // Update for your domain
  name: "Socratify Whiteboards",
  description: "A focused architecture whiteboard with roomy canvas, critique, and exports.",
  ogImage: "/og-image.png",
  // twitterHandle: "socratify",
};

/**
 * Content directory paths (relative to project root)
 */
export const contentPaths = {
  pages: "content",
  blog: "content/blog",
} as const;
