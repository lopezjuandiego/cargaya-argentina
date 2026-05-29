import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DóndeCargar",
    short_name: "DóndeCargar",
    description: "Cargadores eléctricos en Argentina y Uruguay",
    start_url: "/",
    display: "standalone",
    background_color: "#0c0c0c",
    theme_color: "#4ade80",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
