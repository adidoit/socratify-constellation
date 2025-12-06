/**
 * @constellation/content-pages
 *
 * A YAML-driven content page and blog system for Constellation apps.
 *
 * Components are exported from this file.
 * Loader utilities are exported from './loader' (server-side only).
 * SEO utilities are exported from './seo'.
 *
 * @example
 * ```tsx
 * // In a Next.js page component
 * import { ContentPage, BlogIndex } from '@constellation/content-pages';
 * import { loadContentPage, loadBlogPosts } from '@constellation/content-pages/loader';
 * import { generateBlogIndexMetadata, type SiteConfig } from '@constellation/content-pages/seo';
 *
 * const site: SiteConfig = {
 *   url: "https://example.com",
 *   name: "My App",
 * };
 *
 * export const metadata = generateBlogIndexMetadata({ site });
 *
 * export default function BlogPage() {
 *   const posts = loadBlogPosts(path.join(process.cwd(), 'content/blog'));
 *   return <BlogIndex posts={posts} baseUrl={site.url} siteName={site.name} />;
 * }
 * ```
 */

// Component exports
export { ContentPage } from "./ContentPage";
export { BlogIndex } from "./BlogIndex";

// Type exports
export type {
  ContentPageData,
  ContentPageProps,
  ContentPageMeta,
  ContentPageHero,
  ContentPageCTA,
  ContentBlock,
  ParagraphBlock,
  HeadingBlock,
  ImageBlock,
  BlockquoteBlock,
  ListBlock,
  VideoBlock,
} from "./types";

export type { BlogIndexProps } from "./BlogIndex";
