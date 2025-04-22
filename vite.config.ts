import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.ico",
        "robots.txt",
        "logo32.png",
        "logo192.png",
        "logo512.png",
      ],
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\.(?:mp3|wav|ogg|flac|zip)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "audio-assets",
              expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 365,
                maxEntries: 100,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: {
        name: "Velocity Studio",
        short_name: "Velocity",
        description: "Your app description",
        theme_color: "#06b8af",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "landscape",
        icons: [
          {
            src: "/logo192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/logo512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/logo512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
