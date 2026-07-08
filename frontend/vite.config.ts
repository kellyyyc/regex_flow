import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const allowedHosts = process.env.VITE_ALLOWED_HOSTS
  ?.split(",")
  .map((host) => host.trim())
  .filter(Boolean);
const devApiProxyTarget =
  process.env.VITE_DEV_API_PROXY_TARGET || "http://backend:8000";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: allowedHosts?.length
      ? allowedHosts
      : ["localhost", "127.0.0.1", "kellywebsite.com", "www.kellywebsite.com"],
    proxy: {
      "/api": {
        target: devApiProxyTarget,
        changeOrigin: true,
      },
    },
  },
});
