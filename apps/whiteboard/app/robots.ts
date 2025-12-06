import type { MetadataRoute } from "next";
import { siteConfig } from "@/app/lib/site-config";

/**
 * Dynamic robots.txt generation.
 *
 * Next.js automatically serves this at /robots.txt
 * Tells search engines what to crawl and where the sitemap is.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",      // Don't index API routes
          "/_next/",    // Don't index Next.js internals
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
