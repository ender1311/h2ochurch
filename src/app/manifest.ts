import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "H2O Church",
    short_name: "H2O Church",
    description: "A campus church at Ohio State — groups, events, sermons, and giving.",
    start_url: "/",
    display: "standalone",
    background_color: "#434b56",
    theme_color: "#434b56",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
