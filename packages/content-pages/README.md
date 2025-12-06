# @constellation/content-pages

A YAML-driven content management system for Constellation apps. Create high-quality about pages, blog posts, and other long-form content with production-grade SEO out of the box.

## Features

- **YAML-driven content** — Write content in YAML, render as beautiful pages
- **Blog system** — Index page + dynamic routes, just add YAML files
- **Production SEO** — Open Graph, Twitter Cards, JSON-LD structured data
- **Reading time** — Auto-calculated from content
- **Breadcrumbs** — JSON-LD BreadcrumbList for Google
- **Responsive media** — Images and YouTube/Vimeo videos
- **Constellation styling** — Uses your app's design tokens (Geist/Poppins fonts, CSS variables)

## Quick Start

### 1. Add the package dependency

In your app's `package.json`:

```json
{
  "dependencies": {
    "@constellation/content-pages": "workspace:*"
  }
}
```

### 2. Configure TypeScript paths

In your app's `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@constellation/content-pages": ["../../packages/content-pages/src"],
      "@constellation/content-pages/loader": ["../../packages/content-pages/src/loader"],
      "@constellation/content-pages/seo": ["../../packages/content-pages/src/seo"]
    }
  }
}
```

### 3. Add to Tailwind content paths

In your app's `tailwind.config.js`:

```js
module.exports = {
  content: [
    // ... your existing paths
    "../../packages/content-pages/src/**/*.{ts,tsx}",
  ],
};
```

### 4. Create site configuration

Create `lib/site-config.ts` in your app:

```typescript
import type { SiteConfig } from "@constellation/content-pages/seo";

export const siteConfig: SiteConfig = {
  url: "https://yourapp.com",        // No trailing slash
  name: "Your App Name",
  description: "Your app description",
  ogImage: "/og-image.png",          // Relative to url
  twitterHandle: "yourhandle",       // Without @
  logoUrl: "/logo.png",              // For JSON-LD
  defaultAuthor: "Your Team",        // Optional
};

export const contentPaths = {
  pages: "content",
  blog: "content/blog",
} as const;
```

### 5. Create content directories

```
your-app/
├── content/
│   ├── about.yaml           # /about page
│   └── blog/
│       ├── my-first-post.yaml    # /blog/my-first-post
│       └── another-post.yaml     # /blog/another-post
```

## Setting Up Pages

### About Page (or any content page)

Create `app/about/page.tsx`:

```typescript
import path from "path";
import { ContentPage } from "@constellation/content-pages";
import { loadContentPage } from "@constellation/content-pages/loader";
import { generateContentPageMetadata } from "@constellation/content-pages/seo";
import { siteConfig, contentPaths } from "@/lib/site-config";

const page = loadContentPage(
  path.join(process.cwd(), contentPaths.pages, "about.yaml")
);

export const metadata = generateContentPageMetadata({
  site: siteConfig,
  page,
});

export default function AboutPage() {
  return (
    <ContentPage
      page={page}
      baseUrl={siteConfig.url}
      siteName={siteConfig.name}
    />
  );
}
```

### Blog Index Page

Create `app/blog/page.tsx`:

```typescript
import path from "path";
import { BlogIndex } from "@constellation/content-pages";
import { loadBlogPosts } from "@constellation/content-pages/loader";
import { generateBlogIndexMetadata } from "@constellation/content-pages/seo";
import { siteConfig, contentPaths } from "@/lib/site-config";

const BLOG_DIR = path.join(process.cwd(), contentPaths.blog);
const posts = loadBlogPosts(BLOG_DIR);

export const metadata = generateBlogIndexMetadata({
  site: siteConfig,
  title: "Blog",
  description: "Articles about your topic.",
});

export default function BlogIndexPage() {
  return (
    <BlogIndex
      posts={posts}
      baseUrl={siteConfig.url}
      siteName={siteConfig.name}
      title="Blog"
      description="Articles about your topic."
      backLink={{
        href: "/",
        label: "Back to Home",
      }}
    />
  );
}
```

### Blog Post Dynamic Route

Create `app/blog/[slug]/page.tsx`:

```typescript
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import path from "path";
import { ContentPage } from "@constellation/content-pages";
import { loadBlogPost, getBlogSlugs } from "@constellation/content-pages/loader";
import { generateBlogPostMetadata } from "@constellation/content-pages/seo";
import { siteConfig, contentPaths } from "@/lib/site-config";

const BLOG_DIR = path.join(process.cwd(), contentPaths.blog);

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = loadBlogPost(BLOG_DIR, slug);

  if (!post) {
    return { title: `Blog | ${siteConfig.name}` };
  }

  return generateBlogPostMetadata({ site: siteConfig, post, slug });
}

// Static generation: pre-render all posts at build time
export function generateStaticParams() {
  return getBlogSlugs(BLOG_DIR).map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = loadBlogPost(BLOG_DIR, slug);

  if (!post) {
    notFound();
  }

  return (
    <ContentPage
      page={{
        ...post,
        backLink: { href: "/blog", label: "Back to Blog" },
      }}
      baseUrl={siteConfig.url}
      siteName={siteConfig.name}
    />
  );
}
```

## YAML Content Format

### Full Example with All SEO Fields

```yaml
slug: about
meta:
  title: "About Us | Your App"
  description: "Learn about our mission and team. We help people solve problems better."
  section: "Company"
  keywords:
    - about us
    - our mission
    - team
  publishedAt: "2024-01-15"
  modifiedAt: "2024-12-01"
  author: "Jane Smith"              # Optional, defaults to organization
  ogImage: "/images/about-og.png"   # Optional, per-page OG image

hero:
  label: About
  title: Building better problem solvers
  subtitle: We're on a mission to help people think more clearly about complex challenges.

content:
  - type: paragraph
    text: |
      Your introductory paragraph here. This will be used as the excerpt
      on the blog index page (first 200 characters).

  - type: heading
    level: 2
    text: Our Mission

  - type: paragraph
    text: |
      More content here...

  - type: image
    src: /images/team.jpg
    alt: Our team working together
    caption: The team at our annual retreat
    priority: true                  # Use for above-the-fold images

  - type: blockquote
    text: "Great quote here that supports your message."
    attribution: Famous Person

  - type: list
    style: bullet                   # or "numbered"
    items:
      - First point
      - Second point
      - Third point

  - type: video
    url: https://www.youtube.com/watch?v=dQw4w9WgXcQ
    title: Our Product Demo
    caption: See how it works in 2 minutes
    aspectRatio: "16:9"             # or "4:3"

  - type: heading
    level: 3
    text: A Subheading (h3)

  - type: paragraph
    text: |
      Final thoughts...

cta:
  title: Ready to get started?
  description: Join thousands of users who think more clearly with our tools.
  primaryButton:
    text: Start Free
    href: /signup
  secondaryButton:
    text: Learn More
    href: /features

backLink:
  href: /
  label: Back to Home
```

## Content Block Types

| Type | Description | Required Fields |
|------|-------------|-----------------|
| `paragraph` | Body text | `text` |
| `heading` | Section header (h2 or h3) | `level`, `text` |
| `image` | Responsive image | `src`, `alt` |
| `blockquote` | Pull quote | `text` |
| `list` | Bullet or numbered list | `style`, `items` |
| `video` | YouTube/Vimeo embed | `url`, `title` |

### Image Block Options

```yaml
- type: image
  src: /images/photo.jpg      # Required - URL or path
  alt: Description of image   # Required - accessibility
  caption: Optional caption   # Optional - shown below image
  priority: true              # Optional - for above-fold images
```

### Video Block Options

```yaml
- type: video
  url: https://youtube.com/watch?v=...  # YouTube or Vimeo URL
  title: Video Title                     # Required - accessibility
  caption: Optional caption              # Optional
  aspectRatio: "16:9"                    # "16:9" (default) or "4:3"
```

Supported URL formats:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://vimeo.com/VIDEO_ID`
- Just the video ID (assumes YouTube)

## SEO Output

The package generates comprehensive SEO metadata:

### Meta Tags
- `<title>`, `<meta name="description">`
- `<meta name="keywords">` (from YAML keywords array)
- `<meta name="author">`
- `<link rel="canonical">`

### Open Graph
- `og:title`, `og:description`, `og:url`, `og:image`
- `og:type` (website for index, article for posts)
- `og:locale`
- `article:published_time`, `article:modified_time`
- `article:author`, `article:section`, `article:tag`

### Twitter Cards
- `twitter:card` (summary_large_image)
- `twitter:title`, `twitter:description`, `twitter:image`
- `twitter:site`, `twitter:creator`

### JSON-LD Structured Data
- `Article` or `BlogPosting` schema
- `BreadcrumbList` for site navigation
- `wordCount`, `datePublished`, `dateModified`
- `author` (Person or Organization)
- `publisher` with logo

### Robots
- Full Googlebot directives
- `max-video-preview`, `max-image-preview`, `max-snippet`

## Next.js-Specific SEO Setup

For complete SEO, add these files to your app:

### 1. Dynamic Sitemap (`app/sitemap.ts`)

```typescript
import type { MetadataRoute } from "next";
import path from "path";
import { getBlogSlugs } from "@constellation/content-pages/loader";
import { siteConfig, contentPaths } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
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
```

### 2. Robots.txt (`app/robots.ts`)

```typescript
import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/private/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
```

### 3. RSS Feed (`app/blog/feed.xml/route.ts`)

Create a route handler that generates RSS XML for blog subscribers.
Add the feed to your layout metadata for auto-discovery:

```typescript
// In app/layout.tsx metadata
alternates: {
  canonical: SITE_URL,
  types: {
    "application/rss+xml": `${SITE_URL}/blog/feed.xml`,
  },
},
```

### 4. Submit to Google Search Console

After deploying:
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your site property
3. Submit your sitemap: `https://yoursite.com/sitemap.xml`
4. Request indexing for key pages

## API Reference

### Components

```typescript
import { ContentPage, BlogIndex } from "@constellation/content-pages";
```

### Loader Functions

```typescript
import {
  loadContentPage,      // Load single YAML file
  loadBlogPosts,        // Load all posts with excerpts
  loadBlogPost,         // Load single post by slug
  getBlogSlugs,         // Get all slugs for static generation
  getExcerpt,           // Extract excerpt from content
} from "@constellation/content-pages/loader";
```

### SEO Functions

```typescript
import {
  generateContentPageMetadata,
  generateBlogIndexMetadata,
  generateBlogPostMetadata,
  generateContentPageJsonLd,
  generateBlogPostJsonLd,
  generateBlogBreadcrumbJsonLd,
  calculateReadingTime,
  getWordCount,
  type SiteConfig,
} from "@constellation/content-pages/seo";
```

### Types

```typescript
import type {
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
  BlogIndexProps,
} from "@constellation/content-pages";
```

## Adding a New Blog Post

1. Create a YAML file in `content/blog/`:

```bash
touch content/blog/my-new-post.yaml
```

2. Add content following the YAML format above

3. The post automatically appears:
   - On `/blog` index (sorted by filename, newest first)
   - At `/blog/my-new-post` (slug = filename without .yaml)

**Tip:** Prefix filenames with dates for automatic sorting:
```
content/blog/
├── 2024-12-01-first-post.yaml
├── 2024-12-15-second-post.yaml
└── 2024-12-20-latest-post.yaml
```

## Troubleshooting

### Scrolling doesn't work

If your app has `overflow: hidden` on the body (common for canvas apps), the ContentPage component handles this with `fixed inset-0 overflow-y-auto`. This creates an independent scroll container.

### Images not loading

- Ensure images are in your `public/` folder or use full URLs
- Add domains to `next.config.js` for external images:

```js
module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'example.com' },
    ],
  },
};
```

### TypeScript can't find modules

Verify your `tsconfig.json` has the correct paths:

```json
{
  "compilerOptions": {
    "paths": {
      "@constellation/content-pages": ["../../packages/content-pages/src"],
      "@constellation/content-pages/loader": ["../../packages/content-pages/src/loader"],
      "@constellation/content-pages/seo": ["../../packages/content-pages/src/seo"]
    }
  }
}
```

### Styles not applying

Add the package to your Tailwind content paths in `tailwind.config.js`:

```js
content: [
  "../../packages/content-pages/src/**/*.{ts,tsx}",
]
```
