import path from "path";
import { ContentPage } from "@constellation/content-pages";
import { loadContentPage } from "@constellation/content-pages/loader";
import { generateContentPageMetadata } from "@constellation/content-pages/seo";
import { siteConfig, contentPaths } from "@/lib/site-config";

// Load the YAML content at build time (static generation)
const page = loadContentPage(
  path.join(process.cwd(), contentPaths.pages, "about.yaml")
);

// Generate SEO metadata
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
