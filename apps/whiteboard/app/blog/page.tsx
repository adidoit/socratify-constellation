import path from "path";
import { BlogIndex } from "@constellation/content-pages";
import { loadBlogPosts } from "@constellation/content-pages/loader";
import { generateBlogIndexMetadata } from "@constellation/content-pages/seo";
import { siteConfig, contentPaths } from "@/app/lib/site-config";

const BLOG_DIR = path.join(process.cwd(), contentPaths.blog);

// Load all blog posts at build time (static generation)
const posts = loadBlogPosts(BLOG_DIR);

// Generate SEO metadata
export const metadata = generateBlogIndexMetadata({
  site: siteConfig,
  title: "Blog",
  description: "Articles about architecture diagrams, visual thinking, and system design.",
});

export default function BlogIndexPage() {
  return (
    <BlogIndex
      posts={posts}
      baseUrl={siteConfig.url}
      siteName={siteConfig.name}
      title="Blog"
      description="Articles about architecture diagrams, visual thinking, and system design."
      backLink={{
        href: "/",
        label: "Back to Whiteboards",
      }}
    />
  );
}
