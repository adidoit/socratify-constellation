import type { Metadata } from "next";
import { notFound } from "next/navigation";
import path from "path";
import { ContentPage } from "@constellation/content-pages";
import { loadBlogPost, getBlogSlugs } from "@constellation/content-pages/loader";
import { generateBlogPostMetadata } from "@constellation/content-pages/seo";
import { siteConfig, contentPaths } from "@/lib/site-config";

const BLOG_DIR = path.join(process.cwd(), contentPaths.blog);

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = loadBlogPost(BLOG_DIR, slug);

  if (!post) {
    return {
      title: `Blog | ${siteConfig.name}`,
    };
  }

  return generateBlogPostMetadata({
    site: siteConfig,
    post,
    slug,
  });
}

// Static generation: pre-render all blog posts at build time
export function generateStaticParams() {
  const slugs = getBlogSlugs(BLOG_DIR);
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = loadBlogPost(BLOG_DIR, slug);

  if (!post) {
    notFound();
  }

  // Override backLink to point to blog index
  const pageWithBlogBackLink = {
    ...post,
    backLink: {
      href: "/blog",
      label: "Back to Blog",
    },
  };

  return (
    <ContentPage
      page={pageWithBlogBackLink}
      baseUrl={siteConfig.url}
      siteName={siteConfig.name}
    />
  );
}
