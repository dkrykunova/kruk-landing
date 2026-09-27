import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Нічого з цього не потрібно серверу — і не повинно потрапити в бандл.
  outputFileTracingExcludes: {
    "*": ["secrets/**", "fonts-source/**", "scripts/**", ".env*", "*.md", "wrangler.jsonc", "worker.ts"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
