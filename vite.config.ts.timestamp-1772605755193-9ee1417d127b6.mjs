// vite.config.ts
import legacy from "file:///D:/WORK/fred/marketplace/marketplace-v1/markit-marketplace/node_modules/@vitejs/plugin-legacy/dist/index.mjs";
import vue from "file:///D:/WORK/fred/marketplace/marketplace-v1/markit-marketplace/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import path from "path";
import { defineConfig } from "file:///D:/WORK/fred/marketplace/marketplace-v1/markit-marketplace/node_modules/vite/dist/node/index.js";
import tailwindcss from "file:///D:/WORK/fred/marketplace/marketplace-v1/markit-marketplace/node_modules/@tailwindcss/vite/dist/index.mjs";
var __vite_injected_original_dirname = "D:\\WORK\\fred\\marketplace\\marketplace-v1\\markit-marketplace";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    legacy(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    target: "es2015",
    // safer for mobile webviews
    modulePreload: {
      polyfill: true
    },
    rollupOptions: {
      output: {
        manualChunks: void 0
        // 🔥 disables code splitting (IMPORTANT)
      }
    },
    chunkSizeWarningLimit: 1500
    // avoid warnings due to single bundle
  },
  server: {
    headers: {
      "Cache-Control": "no-store"
      // prevent stale chunks in dev
    }
  },
  test: {
    globals: true,
    environment: "jsdom"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxXT1JLXFxcXGZyZWRcXFxcbWFya2V0cGxhY2VcXFxcbWFya2V0cGxhY2UtdjFcXFxcbWFya2l0LW1hcmtldHBsYWNlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxXT1JLXFxcXGZyZWRcXFxcbWFya2V0cGxhY2VcXFxcbWFya2V0cGxhY2UtdjFcXFxcbWFya2l0LW1hcmtldHBsYWNlXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9XT1JLL2ZyZWQvbWFya2V0cGxhY2UvbWFya2V0cGxhY2UtdjEvbWFya2l0LW1hcmtldHBsYWNlL3ZpdGUuY29uZmlnLnRzXCI7Ly8vIDxyZWZlcmVuY2UgdHlwZXM9XCJ2aXRlc3RcIiAvPlxyXG5cclxuaW1wb3J0IGxlZ2FjeSBmcm9tICdAdml0ZWpzL3BsdWdpbi1sZWdhY3knXHJcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSAnQHRhaWx3aW5kY3NzL3ZpdGUnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtcclxuICAgIHZ1ZSgpLFxyXG4gICAgbGVnYWN5KCksXHJcbiAgICB0YWlsd2luZGNzcygpLFxyXG4gIF0sXHJcblxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIGJ1aWxkOiB7XHJcbiAgICB0YXJnZXQ6ICdlczIwMTUnLCAvLyBzYWZlciBmb3IgbW9iaWxlIHdlYnZpZXdzXHJcbiAgICBtb2R1bGVQcmVsb2FkOiB7XHJcbiAgICAgIHBvbHlmaWxsOiB0cnVlLFxyXG4gICAgfSxcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB1bmRlZmluZWQsIC8vIFx1RDgzRFx1REQyNSBkaXNhYmxlcyBjb2RlIHNwbGl0dGluZyAoSU1QT1JUQU5UKVxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTUwMCwgLy8gYXZvaWQgd2FybmluZ3MgZHVlIHRvIHNpbmdsZSBidW5kbGVcclxuICB9LFxyXG5cclxuICBzZXJ2ZXI6IHtcclxuICAgIGhlYWRlcnM6IHtcclxuICAgICAgJ0NhY2hlLUNvbnRyb2wnOiAnbm8tc3RvcmUnLCAvLyBwcmV2ZW50IHN0YWxlIGNodW5rcyBpbiBkZXZcclxuICAgIH0sXHJcbiAgfSxcclxuXHJcbiAgdGVzdDoge1xyXG4gICAgZ2xvYmFsczogdHJ1ZSxcclxuICAgIGVudmlyb25tZW50OiAnanNkb20nLFxyXG4gIH0sXHJcbn0pIl0sCiAgIm1hcHBpbmdzIjogIjtBQUVBLE9BQU8sWUFBWTtBQUNuQixPQUFPLFNBQVM7QUFDaEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8saUJBQWlCO0FBTnhCLElBQU0sbUNBQW1DO0FBUXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxJQUNKLE9BQU87QUFBQSxJQUNQLFlBQVk7QUFBQSxFQUNkO0FBQUEsRUFFQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQUEsRUFFQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUE7QUFBQSxJQUNSLGVBQWU7QUFBQSxNQUNiLFVBQVU7QUFBQSxJQUNaO0FBQUEsSUFDQSxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUE7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxJQUNBLHVCQUF1QjtBQUFBO0FBQUEsRUFDekI7QUFBQSxFQUVBLFFBQVE7QUFBQSxJQUNOLFNBQVM7QUFBQSxNQUNQLGlCQUFpQjtBQUFBO0FBQUEsSUFDbkI7QUFBQSxFQUNGO0FBQUEsRUFFQSxNQUFNO0FBQUEsSUFDSixTQUFTO0FBQUEsSUFDVCxhQUFhO0FBQUEsRUFDZjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
