import type { MetadataRoute } from "next";
import path from "path";
import { getBlogSlugs } from "@constellation/content-pages/loader";
import { siteConfig, contentPaths } from "@/lib/site-config";

/**
 * Dynamic sitemap generation for SEO.
 *
 * Next.js automatically serves this at /sitemap.xml
 * Google Search Console will use this to discover pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  // Dynamic blog posts
  const blogDir = path.join(process.cwd(), contentPaths.blog);
  const blogSlugs = getBlogSlugs(blogDir);

  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages];
}
