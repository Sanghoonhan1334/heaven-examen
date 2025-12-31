import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    unoptimized: true, // 이미지 최적화 비활성화 (로컬 이미지 문제 해결)
  },
};

export default nextConfig;
