// default open-next.config.ts file created by @opennextjs/cloudflare
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
// import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

const config = defineCloudflareConfig({
	// For best results consider enabling R2 caching
	// See https://opennext.js.org/cloudflare/caching for more details
	// incrementalCache: r2IncrementalCache
});

// Cloudflare Workers 사이즈 제한(무료 3MiB / 유료 10MiB)에 맞추기 위해
// 서버 핸들러 번들을 minify. 기본값 false라 그대로 두면 11MiB+로 배포 실패.
config.default.minify = true;

export default config;
