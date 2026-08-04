import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://pipe-guard-ai.vercel.app";
  const routes = [
    "",
    "/dashboard",
    "/leak-detection",
    "/pipeline-map",
    "/pipe-information",
    "/inspection-records",
    "/model-information",
    "/about"
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" || route === "/dashboard" ? 1.0 : 0.8
  }));
}
