import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://issuetree.ai";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
  ];
}

