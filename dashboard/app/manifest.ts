import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EKOTONE 2026",
    short_name: "EKOTONE",
    description: "Programme officiel EKOTONE · PRIMITIV · Paris 2026",
    start_url: "/schedule",
    display: "standalone",
    background_color: "#0F0F0F",
    theme_color: "#0F0F0F",
    orientation: "portrait",
    icons: [
      // Placeholder — replace with real PNGs when brand assets are ready:
      // { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      // { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
