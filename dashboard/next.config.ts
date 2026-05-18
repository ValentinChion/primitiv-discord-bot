import type { NextConfig } from "next";
import withSerwist from "@serwist/next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['@prisma/client'],
  // Turbopack (dev): WASM is handled via NODE_OPTIONS='--experimental-wasm-modules'
  turbopack: {},
  // Webpack (production via `next build --webpack`): enable async WASM for Prisma
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
};

// Only wrap with serwist in production — withSerwist injects webpack plugins that
// conflict with Turbopack, which Next.js uses for `next dev` by default.
export default process.env.NODE_ENV === "development"
  ? nextConfig
  : withSerwist({
      swSrc: "app/sw.ts",
      swDest: "public/sw.js",
      reloadOnOnline: true,
    })(nextConfig);
