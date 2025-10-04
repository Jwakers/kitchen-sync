import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kitchen Sync - Family Meal Planning",
    short_name: "Kitchen Sync",
    description:
      "Create recipes, plan weekly meals, and generate smart shopping lists. Take the pain out of family meal planning with Kitchen Sync.",
    orientation: "portrait",
    categories: ["food", "lifestyle", "productivity"],
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    start_url: "/dashboard",
    scope: "/",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    lang: "en-GB",
    dir: "ltr",
  };
}
