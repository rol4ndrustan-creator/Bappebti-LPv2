import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "export",
    basePath: "/Bappebti-LPv2",
    assetPrefix: "/Bappebti-LPv2",
    images: {
          unoptimized: true,
    },
};

export default nextConfig;
