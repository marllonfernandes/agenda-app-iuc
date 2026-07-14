import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'App Unida',
        short_name: 'Unida',
        description: 'Aplicativo de Agenda e Organização',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  root: "./",
  build: {
    outDir: "dist",
  },
  server: {
    port: 3000,
  },
});
