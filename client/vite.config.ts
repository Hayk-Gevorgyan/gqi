import vue              from "@vitejs/plugin-vue";
import path             from "path";
import { defineConfig } from "vite";
import webExtension     from "vite-plugin-web-extension";
import svgLoader        from "vite-svg-loader";

// https://vitejs.dev/config/
export default defineConfig({

  define: {
    // enable hydration mismatch details in production build
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "true"
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src")
    }
  },
  server: {
    hmr: false,
    host: "0.0.0.0",
    allowedHosts: ["gqi.fake.relcu.me"],
    port: 14000
  },
  build: {
    minify:false,
    sourcemap: true,
    target: "esnext",
  },
  plugins: [
    vue({}),
    svgLoader(),
    webExtension({
      browser: "chrome",
      disableAutoLaunch: true,
      watchFilePaths: ["src/manifest.json", "src"]
    })
  ]
});
