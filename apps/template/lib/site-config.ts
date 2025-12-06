import type { SiteConfig } from "@constellation/content-pages/seo";

/**
 * Site configuration for your Constellation app
 *
 * Update these values for your specific app.
 * Used across landing pages, blog, and SEO.
 */
export const siteConfig: SiteConfig = {
  url: "https://yourapp.com",           // No trailing slash - update for your domain
  name: "Your App Name",                // Shown in titles and metadata
  description: "Your app description",  // Default meta description
  ogImage: "/og-image.png",             // Default OG image (relative to url)
  // twitterHandle: "yourhandle",       // Uncomment and set your Twitter handle
  // logoUrl: "/logo.png",              // Logo URL for JSON-LD
  // defaultAuthor: "Your Team",        // Default author name
};

/**
 * Content directory paths (relative to project root)
 */
export const contentPaths = {
  pages: "content",
  blog: "content/blog",
} as const;
