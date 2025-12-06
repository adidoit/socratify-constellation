import Link from "next/link";
import type { BlogPostSummary } from "./loader";

// ============================================
// Types
// ============================================

export interface BlogIndexProps {
  /** Array of blog post summaries */
  posts: BlogPostSummary[];
  /** Base URL for the site (e.g., "https://issuetree.ai") */
  baseUrl: string;
  /** Site name for branding */
  siteName: string;
  /** Page title */
  title?: string;
  /** Page description */
  description?: string;
  /** Back link configuration */
  backLink?: {
    href: string;
    label: string;
  };
}

// ============================================
// JSON-LD Structured Data
// ============================================

function generateBlogListingJsonLd(
  props: BlogIndexProps
): object {
  const { posts, baseUrl, siteName, title, description } = props;

  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: title || `${siteName} Blog`,
    description: description || `Articles from ${siteName}`,
    url: `${baseUrl}/blog`,
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: baseUrl,
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      url: `${baseUrl}/blog/${post.slug}`,
      author: {
        "@type": "Organization",
        name: siteName,
      },
    })),
  };
}

// ============================================
// Component
// ============================================

/**
 * BlogIndex - Reusable blog listing page component
 *
 * Features:
 * - Renders list of blog posts with title, label, and excerpt
 * - Includes JSON-LD structured data for SEO
 * - Consistent styling with Constellation design system
 * - Empty state handling
 */
export function BlogIndex({
  posts,
  baseUrl,
  siteName,
  title = "Blog",
  description,
  backLink,
}: BlogIndexProps) {
  const jsonLd = generateBlogListingJsonLd({
    posts,
    baseUrl,
    siteName,
    title,
    description,
  });

  if (posts.length === 0) {
    return (
      <main className="fixed inset-0 overflow-y-auto bg-background">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="max-w-3xl mx-auto px-6 pt-20 lg:pt-28 pb-16">
          {/* Back Link */}
          <Link
            href={backLink?.href || "/"}
            className="group inline-flex items-center text-body-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <span
              aria-hidden="true"
              className="mr-2 transition-transform group-hover:-translate-x-1"
            >
              ←
            </span>
            {backLink?.label || `Back to ${siteName}`}
          </Link>

          <h1 className="text-display-lg text-foreground mb-6">{title}</h1>
          <p className="text-body-lg text-muted-foreground">
            No blog posts yet. Check back soon!
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 overflow-y-auto bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-3xl mx-auto px-6 pt-20 lg:pt-28 pb-16">
        {/* Back Link */}
        <Link
          href={backLink?.href || "/"}
          className="group inline-flex items-center text-body-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <span
            aria-hidden="true"
            className="mr-2 transition-transform group-hover:-translate-x-1"
          >
            ←
          </span>
          {backLink?.label || `Back to ${siteName}`}
        </Link>

        <h1 className="text-display-lg text-foreground mb-4">{title}</h1>
        {description && (
          <p className="text-body-lg text-muted-foreground mb-12">
            {description}
          </p>
        )}

        {/* Blog Post List */}
        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group border-b border-border pb-8 last:border-0"
            >
              <Link href={`/blog/${post.slug}`} className="block">
                {/* Label */}
                <p className="text-label text-primary mb-2">{post.label}</p>

                {/* Title */}
                <h2 className="text-heading-lg text-foreground group-hover:text-primary transition-colors mb-2">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="text-body-lg text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>

                {/* Read more */}
                <span className="inline-flex items-center mt-4 text-body-md font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Read more
                  <span aria-hidden="true" className="ml-1">→</span>
                </span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
