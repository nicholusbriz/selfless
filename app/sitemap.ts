import type { MetadataRoute } from "next";

const baseUrl = "https://selfless-henna.vercel.app";

const publicPages = [
  {
    path: "",
    changeFrequency: "weekly" as const,
    priority: 1,
  },
  {
    path: "/about",
    changeFrequency: "monthly" as const,
    priority: 0.8,
  },
  {
    path: "/features",
    changeFrequency: "monthly" as const,
    priority: 0.9,
  },
  {
    path: "/tech-centers",
    changeFrequency: "monthly" as const,
    priority: 0.8,
  },
  {
    path: "/help",
    changeFrequency: "monthly" as const,
    priority: 0.7,
  },
  {
    path: "/privacy",
    changeFrequency: "yearly" as const,
    priority: 0.3,
  },
  {
    path: "/terms",
    changeFrequency: "yearly" as const,
    priority: 0.3,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicPages.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
