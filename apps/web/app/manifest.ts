import { BRAND } from "@/lib/marketing";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: BRAND.name,
    description: "The AI-native, open-source scheduling platform.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#FAF9F6",
    theme_color: "#6743e6",
    icons: [
      { src: "/brand/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/brand/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
