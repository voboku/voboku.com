import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The site is fully static, so emit deployable HTML alongside the existing
  // Worker build. Netlify serves the files from dist/client.
  output: "export",
};

export default nextConfig;
