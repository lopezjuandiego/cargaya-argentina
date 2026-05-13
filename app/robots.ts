import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/buscar"],
    },
    sitemap: "https://cargaya-argentina.vercel.app/sitemap.xml",
  };
}
