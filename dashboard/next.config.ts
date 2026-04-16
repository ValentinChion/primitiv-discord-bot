import type { NextConfig } from "next";
import withSerwist from "@serwist/next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
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
