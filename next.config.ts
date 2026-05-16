import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Sakrij Next.js dev indikator (logo dolje lijevo).
  devIndicators: false,
  // Allow the Cloudflare quick-tunnel + LAN to reach the dev server.
  allowedDevOrigins: ["*.trycloudflare.com", "10.10.0.211"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
