import type { MetadataRoute } from "next";

const BASE_URL = "https://laklaiview.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const rooms = ["house1", "house2", "house3", "house4"];

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/coffee`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },

    ...rooms.map((id) => ({
      url: `${BASE_URL}/rooms/${id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}