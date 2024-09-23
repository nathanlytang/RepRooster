import { crx } from "@crxjs/vite-plugin"
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import manifest from "./manifest.json"
import path from "path";

export default defineConfig({
  plugins: [svelte(), crx({ manifest })],
  resolve: {
    alias: {
      $lib: path.resolve("./lib"),
      $models: path.resolve("./src/models"),
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
})