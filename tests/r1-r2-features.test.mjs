import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

test("R1: Dead code and TV subsystem files are pruned", () => {
    assert.equal(existsSync("app/actions/search.ts"), false, "app/actions/search.ts must be deleted");
    assert.equal(existsSync("components/server/Header.tsx"), false, "components/server/Header.tsx must be deleted");
    assert.equal(existsSync("components/server/MovieSection.tsx"), false, "components/server/MovieSection.tsx must be deleted");
    assert.equal(existsSync("app/tv"), false, "app/tv directory must be deleted");
    assert.equal(existsSync("services/tv.ts"), false, "services/tv.ts must be deleted");

    const headerSource = readFileSync("components/client/Header.tsx", "utf8");
    assert.doesNotMatch(headerSource, /["']\/tv["']/, "Header.tsx must not contain any /tv links");

    const tmdbSource = readFileSync("services/tmdb.ts", "utf8");
    assert.doesNotMatch(tmdbSource, /export\s+\*\s+from\s+["']\.\/tv["']/, "services/tmdb.ts must not export ./tv");

    const clientSource = readFileSync("services/client.ts", "utf8");
    assert.doesNotMatch(clientSource, /dns\.lookup/, "services/client.ts must not monkey-patch dns.lookup");
});

test("R1: searchQuickLive queries /search/movie for pure movie results", () => {
    const searchSource = readFileSync("services/search.ts", "utf8");
    assert.match(searchSource, /\/search\/movie\?query=\$\{encodeURIComponent\(trimmed\)\}/, "searchQuickLive must use /search/movie endpoint");
    assert.doesNotMatch(searchSource, /\/search\/multi/, "searchQuickLive must not use /search/multi endpoint");
});

test("R2: robots.ts provides correct crawler directives and sitemap URL", async () => {
    const robotsModule = await import("../app/robots.ts");
    const robotsFn = robotsModule.default;
    assert.equal(typeof robotsFn, "function", "robots.ts must export default function");

    const config = robotsFn();
    assert.equal(config.rules.userAgent, "*");
    assert.equal(config.rules.allow, "/");
    assert.deepEqual(config.rules.disallow, ["/api/", "/watchlist"]);
    assert.match(config.sitemap, /\/sitemap\.xml$/);
});

test("R2: sitemap.ts provides valid sitemap configuration with fallback", () => {
    const sitemapSource = readFileSync("app/sitemap.ts", "utf8");
    assert.match(sitemapSource, /export\s+default\s+async\s+function\s+sitemap/, "sitemap.ts must export default async function sitemap");
    assert.match(sitemapSource, /baseUrl\s*,\s*lastModified:\s*now/, "sitemap.ts must contain root path");
    assert.match(sitemapSource, /\/browse/, "sitemap.ts must contain /browse");
    assert.match(sitemapSource, /\/watchlist/, "sitemap.ts must contain /watchlist");
    assert.match(sitemapSource, /\/movie\/\$\{movie\.id\}/, "sitemap.ts must contain dynamic /movie/ routes");
    assert.match(sitemapSource, /try\s*\{[\s\S]*getTrendingMovies[\s\S]*\}\s*catch/, "sitemap.ts must have try/catch fallback");
});

test("R2: next.config.ts configures mandatory HTTP security headers", async () => {
    const nextConfigModule = await import("../next.config.ts");
    const nextConfig = nextConfigModule.default;
    assert.equal(typeof nextConfig.headers, "function", "next.config.ts must declare async headers()");

    const headerConfigs = await nextConfig.headers();
    assert.ok(Array.isArray(headerConfigs), "headers() must return an array");
    const globalRule = headerConfigs.find((r) => r.source === "/:path*");
    assert.ok(globalRule, "must have a rule for /:path*");

    const headersMap = Object.fromEntries(globalRule.headers.map((h) => [h.key, h.value]));
    assert.equal(headersMap["X-Frame-Options"], "DENY");
    assert.equal(headersMap["X-Content-Type-Options"], "nosniff");
    assert.equal(headersMap["Referrer-Policy"], "strict-origin-when-cross-origin");
});

test("R2: error boundaries and 404 components exist and export default", async () => {
    assert.ok(existsSync("app/error.tsx"), "app/error.tsx must exist");
    assert.ok(existsSync("app/global-error.tsx"), "app/global-error.tsx must exist");
    assert.ok(existsSync("app/not-found.tsx"), "app/not-found.tsx must exist");

    const globalErrorContent = readFileSync("app/global-error.tsx", "utf8");
    assert.match(globalErrorContent, /<html/i, "global-error.tsx must declare <html>");
    assert.match(globalErrorContent, /<body/i, "global-error.tsx must declare <body>");

    const rootNotFoundContent = readFileSync("app/not-found.tsx", "utf8");
    assert.match(rootNotFoundContent, /404/, "not-found.tsx must display 404");
    assert.match(rootNotFoundContent, /#E50914/, "not-found.tsx must use brand red #E50914");
});
