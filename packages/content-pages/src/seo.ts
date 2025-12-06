/**
 * SEO Utilities for Content Pages and Blog
 *
 * High-quality, production-ready metadata generators following
 * Google's best practices and schema.org standards.
 *
 * Features:
 * - Complete Open Graph tags (including article-specific)
 * - Twitter Card optimization
 * - JSON-LD structured data (Article, BlogPosting, BreadcrumbList)
 * - Automatic reading time calculation
 * - Keyword support
 * - Publication/modification dates
 */

import type { Metadata } from "next";
import type { ContentPageData, ContentBlock } from "./types";

// ============================================
// Types
// ============================================

export interface SiteConfig {
  /** Base URL (e.g., "https://issuetree.ai") - no trailing slash */
  url: string;
  /** Site name for branding */
  name: string;
  /** Default description */
  description?: string;
  /** Default OG image path (relative to baseUrl, e.g., "/og-image.png") */
  ogImage?: string;
  /** Twitter handle (without @) */
  twitterHandle?: string;
  /** Logo URL for JSON-LD (relative or absolute) */
  logoUrl?: string;
  /** Default author name */
  defaultAuthor?: string;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Ensure URL is absolute (prepend baseUrl if relative)
 */
function toAbsoluteUrl(url: string | undefined, baseUrl: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Calculate estimated reading time from content blocks
 * Based on average reading speed of 200 words per minute
 */
export function calculateReadingTime(content: ContentBlock[]): number {
  let wordCount = 0;

  for (const block of content) {
    switch (block.type) {
      case "paragraph":
        wordCount += block.text.split(/\s+/).length;
        break;
      case "heading":
        wordCount += block.text.split(/\s+/).length;
        break;
      case "blockquote":
        wordCount += block.text.split(/\s+/).length;
        break;
      case "list":
        wordCount += block.items.join(" ").split(/\s+/).length;
        break;
    }
  }

  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Extract plain text word count from content
 */
export function getWordCount(content: ContentBlock[]): number {
  let wordCount = 0;

  for (const block of content) {
    switch (block.type) {
      case "paragraph":
        wordCount += block.text.split(/\s+/).length;
        break;
      case "heading":
        wordCount += block.text.split(/\s+/).length;
        break;
      case "blockquote":
        wordCount += block.text.split(/\s+/).length;
        break;
      case "list":
        wordCount += block.items.join(" ").split(/\s+/).length;
        break;
    }
  }

  return wordCount;
}

// ============================================
// Blog Index Metadata
// ============================================

export interface BlogIndexMetadataOptions {
  site: SiteConfig;
  title?: string;
  description?: string;
}

/**
 * Generate metadata for blog index page.
 */
export function generateBlogIndexMetadata({
  site,
  title = "Blog",
  description,
}: BlogIndexMetadataOptions): Metadata {
  const fullTitle = `${title} | ${site.name}`;
  const desc = description || `Articles and insights from ${site.name}`;
  const url = `${site.url}/blog`;
  const ogImage = toAbsoluteUrl(site.ogImage, site.url);

  return {
    title: fullTitle,
    description: desc,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: site.name,
      type: "website",
      locale: "en_US",
      ...(ogImage && {
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${site.name} Blog`,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      ...(ogImage && { images: [ogImage] }),
      ...(site.twitterHandle && {
        site: `@${site.twitterHandle}`,
        creator: `@${site.twitterHandle}`,
      }),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

// ============================================
// Blog Post Metadata
// ============================================

export interface BlogPostMetadataOptions {
  site: SiteConfig;
  post: ContentPageData;
  slug: string;
}

/**
 * Generate metadata for individual blog post.
 * Includes article-specific Open Graph tags and dates.
 */
export function generateBlogPostMetadata({
  site,
  post,
  slug,
}: BlogPostMetadataOptions): Metadata {
  const url = `${site.url}/blog/${slug}`;
  const ogImage = toAbsoluteUrl(post.meta.ogImage, site.url) || toAbsoluteUrl(site.ogImage, site.url);
  const author = post.meta.author || site.defaultAuthor || site.name;

  return {
    title: post.meta.title,
    description: post.meta.description,
    ...(post.meta.keywords && { keywords: post.meta.keywords }),
    authors: [{ name: author }],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.meta.title,
      description: post.meta.description,
      url,
      siteName: site.name,
      type: "article",
      locale: "en_US",
      ...(post.meta.publishedAt && {
        publishedTime: post.meta.publishedAt,
      }),
      ...(post.meta.modifiedAt && {
        modifiedTime: post.meta.modifiedAt,
      }),
      authors: [author],
      ...(post.meta.section && { section: post.meta.section }),
      ...(post.meta.keywords && { tags: post.meta.keywords }),
      ...(ogImage && {
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: post.hero.title,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.meta.title,
      description: post.meta.description,
      ...(ogImage && { images: [ogImage] }),
      ...(site.twitterHandle && {
        site: `@${site.twitterHandle}`,
        creator: `@${site.twitterHandle}`,
      }),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

// ============================================
// Content Page Metadata
// ============================================

export interface ContentPageMetadataOptions {
  site: SiteConfig;
  page: ContentPageData;
}

/**
 * Generate metadata for content pages (about, etc.).
 */
export function generateContentPageMetadata({
  site,
  page,
}: ContentPageMetadataOptions): Metadata {
  const url = `${site.url}/${page.slug}`;
  const ogImage = toAbsoluteUrl(page.meta.ogImage, site.url) || toAbsoluteUrl(site.ogImage, site.url);
  const author = page.meta.author || site.defaultAuthor || site.name;

  return {
    title: page.meta.title,
    description: page.meta.description,
    ...(page.meta.keywords && { keywords: page.meta.keywords }),
    authors: [{ name: author }],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: page.meta.title,
      description: page.meta.description,
      url,
      siteName: site.name,
      type: "article",
      locale: "en_US",
      ...(page.meta.publishedAt && {
        publishedTime: page.meta.publishedAt,
      }),
      ...(page.meta.modifiedAt && {
        modifiedTime: page.meta.modifiedAt,
      }),
      authors: [author],
      ...(page.meta.section && { section: page.meta.section }),
      ...(ogImage && {
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: page.hero.title,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: page.meta.title,
      description: page.meta.description,
      ...(ogImage && { images: [ogImage] }),
      ...(site.twitterHandle && {
        site: `@${site.twitterHandle}`,
        creator: `@${site.twitterHandle}`,
      }),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

// ============================================
// JSON-LD Generators
// ============================================

/**
 * Generate JSON-LD for a blog post (BlogPosting schema).
 * Includes all recommended properties for rich results.
 */
export function generateBlogPostJsonLd(
  site: SiteConfig,
  post: ContentPageData,
  slug: string
): object {
  const url = `${site.url}/blog/${slug}`;
  const ogImage = toAbsoluteUrl(post.meta.ogImage, site.url) || toAbsoluteUrl(site.ogImage, site.url);
  const logoUrl = toAbsoluteUrl(site.logoUrl, site.url);
  const author = post.meta.author || site.defaultAuthor || site.name;
  const wordCount = getWordCount(post.content);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.hero.title,
    description: post.meta.description,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    author: {
      "@type": post.meta.author ? "Person" : "Organization",
      name: author,
      ...(post.meta.author ? {} : { url: site.url }),
    },
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
      ...(logoUrl && {
        logo: {
          "@type": "ImageObject",
          url: logoUrl,
        },
      }),
    },
    ...(post.meta.publishedAt && {
      datePublished: post.meta.publishedAt,
    }),
    ...(post.meta.modifiedAt && {
      dateModified: post.meta.modifiedAt,
    }),
    ...(!post.meta.modifiedAt && post.meta.publishedAt && {
      dateModified: post.meta.publishedAt,
    }),
    articleSection: post.meta.section || "Blog",
    ...(ogImage && {
      image: {
        "@type": "ImageObject",
        url: ogImage,
        width: 1200,
        height: 630,
      },
    }),
    ...(post.meta.keywords && {
      keywords: post.meta.keywords.join(", "),
    }),
    wordCount,
    inLanguage: "en-US",
  };
}

/**
 * Generate JSON-LD for a content page (Article schema).
 */
export function generateContentPageJsonLd(
  site: SiteConfig,
  page: ContentPageData
): object {
  const url = `${site.url}/${page.slug}`;
  const ogImage = toAbsoluteUrl(page.meta.ogImage, site.url) || toAbsoluteUrl(site.ogImage, site.url);
  const logoUrl = toAbsoluteUrl(site.logoUrl, site.url);
  const author = page.meta.author || site.defaultAuthor || site.name;
  const wordCount = getWordCount(page.content);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.hero.title,
    description: page.meta.description,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    author: {
      "@type": page.meta.author ? "Person" : "Organization",
      name: author,
      ...(page.meta.author ? {} : { url: site.url }),
    },
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
      ...(logoUrl && {
        logo: {
          "@type": "ImageObject",
          url: logoUrl,
        },
      }),
    },
    ...(page.meta.publishedAt && {
      datePublished: page.meta.publishedAt,
    }),
    ...(page.meta.modifiedAt && {
      dateModified: page.meta.modifiedAt,
    }),
    ...(!page.meta.modifiedAt && page.meta.publishedAt && {
      dateModified: page.meta.publishedAt,
    }),
    articleSection: page.meta.section || "General",
    ...(ogImage && {
      image: {
        "@type": "ImageObject",
        url: ogImage,
        width: 1200,
        height: 630,
      },
    }),
    ...(page.meta.keywords && {
      keywords: page.meta.keywords.join(", "),
    }),
    wordCount,
    inLanguage: "en-US",
  };
}

/**
 * Generate BreadcrumbList JSON-LD for blog posts.
 * Helps Google understand site hierarchy.
 */
export function generateBlogBreadcrumbJsonLd(
  site: SiteConfig,
  post: ContentPageData,
  slug: string
): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: site.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${site.url}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.hero.title,
        item: `${site.url}/blog/${slug}`,
      },
    ],
  };
}

/**
 * Generate BreadcrumbList JSON-LD for content pages.
 */
export function generateContentPageBreadcrumbJsonLd(
  site: SiteConfig,
  page: ContentPageData
): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: site.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: page.hero.title,
        item: `${site.url}/${page.slug}`,
      },
    ],
  };
}

/**
 * Generate complete JSON-LD array for a blog post page.
 * Includes both BlogPosting and BreadcrumbList schemas.
 */
export function generateBlogPostJsonLdArray(
  site: SiteConfig,
  post: ContentPageData,
  slug: string
): object[] {
  return [
    generateBlogPostJsonLd(site, post, slug),
    generateBlogBreadcrumbJsonLd(site, post, slug),
  ];
}

/**
 * Generate complete JSON-LD array for a content page.
 * Includes both Article and BreadcrumbList schemas.
 */
export function generateContentPageJsonLdArray(
  site: SiteConfig,
  page: ContentPageData
): object[] {
  return [
    generateContentPageJsonLd(site, page),
    generateContentPageBreadcrumbJsonLd(site, page),
  ];
}
