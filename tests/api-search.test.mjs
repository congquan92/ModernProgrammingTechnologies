import assert from "node:assert/strict";
import { test } from "node:test";
import { register } from "node:module";

// Register custom module resolver for Next.js imports (@/*, next/headers, next/cache, next/server)
register("../scripts/test-resolver.mjs", import.meta.url);

process.env.TMDB_API_KEY = "test-api-key";

const { GET: searchRouteHandler } = await import("../app/api/search/route.ts");
const { searchQuickLive } = await import("../services/search.ts");

test("route GET /api/search: returns empty results for empty or short queries", async () => {
  for (const q of ["", "a", "   ", "  a  "]) {
    const req = new Request(`http://localhost/api/search?q=${encodeURIComponent(q)}`);
    const res = await searchRouteHandler(req);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.deepEqual(body, { results: [] });
  }
});

test("route GET /api/search: includes standard Cache-Control header and returns results", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.TMDB_API_KEY;
  process.env.TMDB_API_KEY = "test-api-key";

  try {
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({
        results: [
          { id: 27205, title: "Inception", release_date: "2010-07-15" },
        ],
      }),
    });

    const req = new Request("http://localhost/api/search?q=Inception");
    const res = await searchRouteHandler(req);
    assert.equal(res.status, 200);
    assert.equal(
      res.headers.get("cache-control"),
      "public, s-maxage=120, stale-while-revalidate=60"
    );

    const data = await res.json();
    assert.equal(data.results.length, 1);
    assert.equal(data.results[0].title, "Inception");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey !== undefined) {
      process.env.TMDB_API_KEY = originalKey;
    } else {
      delete process.env.TMDB_API_KEY;
    }
  }
});

test("route GET /api/search: sanitizes control characters and truncates queries to 100 chars", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.TMDB_API_KEY;
  process.env.TMDB_API_KEY = "test-api-key";
  const capturedUrls = [];

  try {
    globalThis.fetch = async (url) => {
      capturedUrls.push(String(url));
      return {
        ok: true,
        json: async () => ({ results: [] }),
      };
    };

    // 1. Control characters test
    const dirty = "Batman\x00\x1F\x7F";
    const reqDirty = new Request(`http://localhost/api/search?q=${encodeURIComponent(dirty)}`);
    const resDirty = await searchRouteHandler(reqDirty);
    assert.equal(resDirty.status, 200);
    assert.ok(capturedUrls.some((u) => u.includes("query=Batman&")));

    // 2. Truncation test (> 100 characters)
    const longQuery = "x".repeat(125);
    const reqLong = new Request(`http://localhost/api/search?q=${encodeURIComponent(longQuery)}`);
    const resLong = await searchRouteHandler(reqLong);
    assert.equal(resLong.status, 200);
    assert.ok(capturedUrls.some((u) => u.includes(`query=${"x".repeat(100)}&`)));
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey !== undefined) {
      process.env.TMDB_API_KEY = originalKey;
    } else {
      delete process.env.TMDB_API_KEY;
    }
  }
});

test("search service: searchQuickLive limits output to exactly 5 items", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.TMDB_API_KEY;
  process.env.TMDB_API_KEY = "test-api-key";

  try {
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({
        results: Array.from({ length: 15 }, (_, i) => ({
          id: i + 1,
          title: `Movie ${i + 1}`,
          release_date: "2024-01-01",
        })),
      }),
    });

    const results = await searchQuickLive("Matrix");
    assert.equal(results.length, 5);
    assert.equal(results[0].title, "Movie 1");
    assert.equal(results[4].title, "Movie 5");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey !== undefined) {
      process.env.TMDB_API_KEY = originalKey;
    } else {
      delete process.env.TMDB_API_KEY;
    }
  }
});
