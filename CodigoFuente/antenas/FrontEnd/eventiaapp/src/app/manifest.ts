import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Eventia - Gestión de Eventos",
    short_name: "Eventia",
    description: "Plataforma de gestión y control de acceso a eventos",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3b82f6", // Azul moderno característico
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
