import Link from "next/link";
import Image from "next/image";
import type {
  ContentPageProps,
  ContentBlock,
  HeadingBlock,
  ImageBlock,
  BlockquoteBlock,
  ListBlock,
  VideoBlock,
} from "./types";
import {
  generateContentPageJsonLd,
  generateContentPageBreadcrumbJsonLd,
  calculateReadingTime,
} from "./seo";

// ============================================
// Content Block Renderers
// ============================================

function renderParagraph(text: string, index: number) {
  return (
    <p key={`p-${index}`} className="text-body-lg text-muted-foreground mb-6">
      {text}
    </p>
  );
}

function renderHeading(block: HeadingBlock, index: number) {
  if (block.level === 2) {
    return (
      <h2
        key={`h2-${index}`}
        className="text-heading-lg text-foreground mt-12 mb-5"
      >
        {block.text}
      </h2>
    );
  }
  return (
    <h3
      key={`h3-${index}`}
      className="text-heading-md text-foreground mt-10 mb-4"
    >
      {block.text}
    </h3>
  );
}

function renderImage(block: ImageBlock, index: number) {
  return (
    <figure key={`img-${index}`} className="my-10 md:my-14">
      <div className="relative w-full overflow-hidden rounded-xl bg-muted">
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={block.src}
            alt={block.alt}
            fill
            priority={block.priority}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 720px"
          />
        </div>
      </div>
      {block.caption && (
        <figcaption className="mt-3 text-center text-body-sm text-muted-foreground italic">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

function renderBlockquote(block: BlockquoteBlock, index: number) {
  return (
    <blockquote
      key={`bq-${index}`}
      className="my-8 pl-6 border-l-4 border-primary/30 italic text-muted-foreground"
    >
      <p className="text-body-lg">{block.text}</p>
      {block.attribution && (
        <cite className="block mt-2 text-body-md not-italic text-muted-foreground/80">
          — {block.attribution}
        </cite>
      )}
    </blockquote>
  );
}

function renderList(block: ListBlock, index: number) {
  const ListTag = block.style === "numbered" ? "ol" : "ul";
  const listClass =
    block.style === "numbered"
      ? "list-decimal list-inside"
      : "list-disc list-inside";

  return (
    <ListTag
      key={`list-${index}`}
      className={`${listClass} my-6 space-y-2 text-body-lg text-muted-foreground`}
    >
      {block.items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ListTag>
  );
}

/**
 * Extract video embed URL from various YouTube/Vimeo URL formats.
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://vimeo.com/VIDEO_ID
 * - Just the video ID (assumes YouTube)
 */
function getVideoEmbedUrl(url: string): string {
  // Already an embed URL
  if (url.includes("/embed/") || url.includes("player.vimeo.com")) {
    return url;
  }

  // YouTube watch URL
  const youtubeWatchMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (youtubeWatchMatch) {
    return `https://www.youtube.com/embed/${youtubeWatchMatch[1]}`;
  }

  // Vimeo URL
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Assume it's just a YouTube video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return `https://www.youtube.com/embed/${url}`;
  }

  // Return as-is if we can't parse it
  return url;
}

function renderVideo(block: VideoBlock, index: number) {
  const embedUrl = getVideoEmbedUrl(block.url);
  const aspectRatio = block.aspectRatio || "16:9";
  const aspectClass = aspectRatio === "4:3" ? "aspect-[4/3]" : "aspect-[16/9]";

  return (
    <figure key={`video-${index}`} className="my-10 md:my-14">
      <div className="relative w-full overflow-hidden rounded-xl bg-muted shadow-lg">
        <div className={`relative ${aspectClass} w-full`}>
          <iframe
            src={embedUrl}
            title={block.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      </div>
      {block.caption && (
        <figcaption className="mt-3 text-center text-body-sm text-muted-foreground italic">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

function renderContentBlock(block: ContentBlock, index: number) {
  switch (block.type) {
    case "paragraph":
      return renderParagraph(block.text, index);
    case "heading":
      return renderHeading(block, index);
    case "image":
      return renderImage(block, index);
    case "blockquote":
      return renderBlockquote(block, index);
    case "list":
      return renderList(block, index);
    case "video":
      return renderVideo(block, index);
    default:
      return null;
  }
}

// ============================================
// Main Component
// ============================================

/**
 * ContentPage - YAML-driven content page layout
 *
 * Renders a complete content page with:
 * - Hero section with label, title, subtitle
 * - Article body with content blocks
 * - CTA section with optional buttons
 * - JSON-LD structured data for SEO (Article + BreadcrumbList)
 * - Reading time indicator
 *
 * Use for about pages, blog posts, and any long-form content.
 * Uses Constellation design tokens (Geist + Poppins fonts, CSS variables).
 */
export function ContentPage({
  page,
  baseUrl,
  siteName,
  logoUrl,
}: ContentPageProps) {
  const { meta, hero, content, cta, backLink } = page;

  // Generate JSON-LD for SEO
  const siteConfig = {
    url: baseUrl,
    name: siteName,
    logoUrl,
  };
  const articleJsonLd = generateContentPageJsonLd(siteConfig, page);
  const breadcrumbJsonLd = generateContentPageBreadcrumbJsonLd(siteConfig, page);

  // Calculate reading time
  const readingTime = calculateReadingTime(content);

  return (
    <main className="fixed inset-0 overflow-y-auto bg-background">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero Section */}
      <section className="max-w-3xl mx-auto px-6 pt-20 lg:pt-28 pb-12">
        <div className="mb-12 animate-fade-in">
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

          {/* Section Label + Reading Time */}
          <div className="flex items-center gap-3 mb-4">
            <p className="text-label text-primary">{hero.label}</p>
            <span className="text-muted-foreground/50">•</span>
            <p className="text-body-sm text-muted-foreground">
              {readingTime} min read
            </p>
          </div>

          {/* Headline */}
          <h1 className="text-display-lg text-foreground">
            {hero.title}
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-body-lg text-muted-foreground max-w-2xl">
            {hero.subtitle}
          </p>

          {/* Publication date if available */}
          {meta.publishedAt && (
            <p className="mt-4 text-body-sm text-muted-foreground/70">
              Published {new Date(meta.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {meta.modifiedAt && meta.modifiedAt !== meta.publishedAt && (
                <> · Updated {new Date(meta.modifiedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</>
              )}
            </p>
          )}
        </div>
      </section>

      {/* Article Body */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <article className="animate-fade-in">
          {content.map((block, index) => renderContentBlock(block, index))}
        </article>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-heading-lg text-foreground">
                {cta.title}
              </h2>
              <p className="mt-4 text-body-lg text-muted-foreground max-w-lg">
                {cta.description}
              </p>
            </div>

            {(cta.primaryButton || cta.secondaryButton) && (
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                {cta.primaryButton && (
                  <Link
                    href={cta.primaryButton.href}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                  >
                    {cta.primaryButton.text}
                  </Link>
                )}
                {cta.secondaryButton && (
                  <Link
                    href={cta.secondaryButton.href}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors"
                  >
                    {cta.secondaryButton.text}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
