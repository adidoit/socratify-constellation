import path from "path";
import { loadBlogPosts } from "@constellation/content-pages/loader";
import { siteConfig, contentPaths } from "@/lib/site-config";

/**
 * RSS Feed for blog posts.
 *
 * Accessible at /blog/feed.xml
 * Helps with SEO and content distribution.
 */
export async function GET() {
  const blogDir = path.join(process.cwd(), contentPaths.blog);
  const posts = loadBlogPosts(blogDir);

  const feedItems = posts
    .map((post) => {
      const pubDate = post.data.meta.publishedAt
        ? new Date(post.data.meta.publishedAt).toUTCString()
        : new Date().toUTCString();

      const authorTag = post.data.meta.author
        ? `<author>${post.data.meta.author}</author>`
        : "";
      const categoryTag = post.data.meta.section
        ? `<category>${post.data.meta.section}</category>`
        : "";

      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteConfig.url}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteConfig.url}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${pubDate}</pubDate>
      ${authorTag}
      ${categoryTag}
    </item>`;
    })
    .join("");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteConfig.name} Blog</title>
    <link>${siteConfig.url}/blog</link>
    <description>Articles and insights from ${siteConfig.name}</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteConfig.url}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    ${feedItems}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
