/**
 * Content Page Type Definitions
 *
 * A structured content system for YAML-driven content pages.
 * Content is defined in YAML files and rendered by ContentPage component.
 */

// ============================================
// Content Block Types
// ============================================

export interface ParagraphBlock {
  type: "paragraph";
  text: string;
}

export interface HeadingBlock {
  type: "heading";
  level: 2 | 3; // h2 or h3 - h1 is reserved for hero title
  text: string;
}

export interface ImageBlock {
  type: "image";
  src: string; // Full URL or relative path
  alt: string;
  caption?: string; // Optional caption below image
  priority?: boolean; // Set true for above-the-fold images
}

export interface BlockquoteBlock {
  type: "blockquote";
  text: string;
  attribution?: string; // Optional "— Author Name"
}

export interface ListBlock {
  type: "list";
  style: "bullet" | "numbered";
  items: string[];
}

export interface VideoBlock {
  type: "video";
  /** YouTube or Vimeo URL (full URL or just video ID) */
  url: string;
  /** Video title for accessibility */
  title: string;
  /** Optional caption below video */
  caption?: string;
  /** Aspect ratio: "16:9" (default) or "4:3" */
  aspectRatio?: "16:9" | "4:3";
}

/**
 * Union type of all supported content blocks.
 * Add new block types here as needed.
 */
export type ContentBlock =
  | ParagraphBlock
  | HeadingBlock
  | ImageBlock
  | BlockquoteBlock
  | ListBlock
  | VideoBlock;

// ============================================
// Content Page Structure
// ============================================

export interface ContentPageMeta {
  /** Page title for <title> tag and OG */
  title: string;
  /** Meta description for SEO (aim for 150-160 chars) */
  description: string;
  /** Optional custom OG image URL (defaults to site OG) */
  ogImage?: string;
  /** Article section for JSON-LD (e.g., "About", "Product", "Tutorial") */
  section?: string;
  /** Keywords for meta tags (optional, 5-10 relevant terms) */
  keywords?: string[];
  /** Publication date in ISO 8601 format (e.g., "2024-01-15") */
  publishedAt?: string;
  /** Last modified date in ISO 8601 format */
  modifiedAt?: string;
  /** Author name (defaults to organization if not specified) */
  author?: string;
}

export interface ContentPageHero {
  /** Small label above title (e.g., "About") */
  label: string;
  /** Main h1 headline */
  title: string;
  /** Subtitle/deck below headline */
  subtitle: string;
}

export interface ContentPageCTA {
  /** CTA section title */
  title: string;
  /** CTA description text */
  description: string;
  /** Primary button configuration */
  primaryButton?: {
    text: string;
    href: string;
  };
  /** Secondary button configuration */
  secondaryButton?: {
    text: string;
    href: string;
  };
}

export interface ContentPageData {
  /** URL slug (used in canonical URL) */
  slug: string;
  /** SEO metadata */
  meta: ContentPageMeta;
  /** Hero section content */
  hero: ContentPageHero;
  /** Page body as array of content blocks */
  content: ContentBlock[];
  /** Call-to-action section at bottom */
  cta: ContentPageCTA;
  /** Back link configuration */
  backLink?: {
    href: string;
    label: string;
  };
}

// ============================================
// Component Props
// ============================================

export interface ContentPageProps {
  /** Content page data (from YAML or inline) */
  page: ContentPageData;
  /** Base URL for canonical links */
  baseUrl: string;
  /** Site name for JSON-LD */
  siteName: string;
  /** Optional logo URL for JSON-LD */
  logoUrl?: string;
}
