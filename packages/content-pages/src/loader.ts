/**
 * YAML Loader for Content Pages
 *
 * Server-side utilities for loading and validating YAML content files.
 * Use these functions in Next.js Server Components or getStaticProps.
 */

import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import type { ContentPageData } from "./types";

/**
 * Load a content page from a YAML file.
 *
 * @param filePath - Absolute path to the YAML file
 * @returns Parsed ContentPageData
 * @throws Error if file doesn't exist or is invalid
 *
 * @example
 * ```ts
 * // In a Next.js Server Component or page
 * import { loadContentPage } from '@constellation/content-pages/loader';
 * import path from 'path';
 *
 * const page = loadContentPage(
 *   path.join(process.cwd(), 'content/about.yaml')
 * );
 * ```
 */
export function loadContentPage(filePath: string): ContentPageData {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Content page file not found: ${filePath}`);
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const data = yaml.load(fileContents) as ContentPageData;

  // Basic validation
  if (!data.slug) {
    throw new Error(`Missing required field 'slug' in ${filePath}`);
  }
  if (!data.meta?.title) {
    throw new Error(`Missing required field 'meta.title' in ${filePath}`);
  }
  if (!data.hero?.title) {
    throw new Error(`Missing required field 'hero.title' in ${filePath}`);
  }

  return data;
}

/**
 * Load all content pages from a directory.
 *
 * @param dirPath - Absolute path to directory containing YAML files
 * @returns Map of slug -> ContentPageData
 *
 * @example
 * ```ts
 * const pages = loadAllContentPages(
 *   path.join(process.cwd(), 'content/pages')
 * );
 *
 * // Use in generateStaticParams
 * export function generateStaticParams() {
 *   return Object.keys(pages).map(slug => ({ slug }));
 * }
 * ```
 */
export function loadAllContentPages(
  dirPath: string
): Record<string, ContentPageData> {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Content pages directory not found: ${dirPath}`);
  }

  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));

  const pages: Record<string, ContentPageData> = {};

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const page = loadContentPage(filePath);
    pages[page.slug] = page;
  }

  return pages;
}

/**
 * Get all valid slugs from a content pages directory.
 * Useful for generateStaticParams.
 *
 * @param dirPath - Absolute path to directory containing YAML files
 * @returns Array of slug strings
 */
export function getContentPageSlugs(dirPath: string): string[] {
  const pages = loadAllContentPages(dirPath);
  return Object.keys(pages);
}

// ============================================
// Blog-specific utilities
// ============================================

export interface BlogPostSummary {
  /** URL slug (filename without extension) */
  slug: string;
  /** Post title from hero.title */
  title: string;
  /** Post subtitle from hero.subtitle */
  subtitle: string;
  /** Section label from hero.label */
  label: string;
  /** First paragraph of content (excerpt) */
  excerpt: string;
  /** Full page data for additional access */
  data: ContentPageData;
}

/**
 * Extract the first paragraph from content blocks as an excerpt.
 */
export function getExcerpt(page: ContentPageData): string {
  const firstParagraph = page.content.find((block) => block.type === "paragraph");
  if (firstParagraph && firstParagraph.type === "paragraph") {
    // Truncate to ~200 chars if needed
    const text = firstParagraph.text;
    if (text.length > 200) {
      return text.slice(0, 197).trim() + "...";
    }
    return text;
  }
  return page.meta.description;
}

/**
 * Load all blog posts from a directory, keyed by filename (slug).
 * Unlike loadAllContentPages, this uses the filename as the slug
 * rather than the slug field in the YAML.
 *
 * @param dirPath - Absolute path to directory containing YAML files
 * @returns Array of BlogPostSummary sorted by filename
 *
 * @example
 * ```ts
 * const posts = loadBlogPosts(path.join(process.cwd(), 'content/blog'));
 *
 * // In blog index page
 * posts.map(post => (
 *   <Link href={`/blog/${post.slug}`}>{post.title}</Link>
 * ))
 * ```
 */
export function loadBlogPosts(dirPath: string): BlogPostSummary[] {
  if (!fs.existsSync(dirPath)) {
    return []; // Return empty array if no blog posts yet
  }

  const files = fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
    .sort()
    .reverse(); // Newest first (assuming naming convention like 2024-01-post.yaml)

  const posts: BlogPostSummary[] = [];

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const slug = file.replace(/\.ya?ml$/, "");

    try {
      const page = loadContentPage(filePath);
      posts.push({
        slug,
        title: page.hero.title,
        subtitle: page.hero.subtitle,
        label: page.hero.label,
        excerpt: getExcerpt(page),
        data: page,
      });
    } catch (error) {
      console.warn(`Failed to load blog post ${file}:`, error);
    }
  }

  return posts;
}

/**
 * Load a single blog post by slug (filename without extension).
 *
 * @param dirPath - Absolute path to blog directory
 * @param slug - Filename without .yaml extension
 * @returns ContentPageData or null if not found
 */
export function loadBlogPost(
  dirPath: string,
  slug: string
): ContentPageData | null {
  const yamlPath = path.join(dirPath, `${slug}.yaml`);
  const ymlPath = path.join(dirPath, `${slug}.yml`);

  const filePath = fs.existsSync(yamlPath)
    ? yamlPath
    : fs.existsSync(ymlPath)
    ? ymlPath
    : null;

  if (!filePath) {
    return null;
  }

  return loadContentPage(filePath);
}

/**
 * Get all blog post slugs for generateStaticParams.
 *
 * @param dirPath - Absolute path to blog directory
 * @returns Array of slug strings (filenames without extension)
 */
export function getBlogSlugs(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  return fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
    .map((f) => f.replace(/\.ya?ml$/, ""));
}
