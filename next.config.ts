import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // OpenNext의 node-file-tracer가 pg-cloudflare 패키지의 dist/index.js를
  // 누락시켜 Cloudflare Workers 번들링이 실패하는 문제 회피. 모든 라우트에서
  // pg-cloudflare 전체를 트레이싱 출력에 명시적으로 포함.
  outputFileTracingIncludes: {
    "/**/*": ["./node_modules/pg-cloudflare/**/*"],
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
