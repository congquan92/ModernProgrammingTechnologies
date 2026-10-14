import assert from "node:assert/strict";
import { test } from "node:test";

test("fetchTMDB keeps the key in the server request and configures revalidation", async () => {
  process.env.TMDB_API_KEY = "test-only-key";
  process.env.TMDB_BASE_URL = "https://mock-tmdb.invalid/3";
  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return { ok: true, json: async () => ({ results: [{ id: 7 }] }) };
  };

  try {
    const { fetchTMDB } = await import("../services/client.ts");
    const data = await fetchTMDB("/movie/popular?page=2", 1800);
    assert.deepEqual(data, { results: [{ id: 7 }] });
    assert.equal(requests.length, 1);
    assert.match(requests[0].url, /^https:\/\/mock-tmdb\.invalid\/3\/movie\/popular\?page=2&api_key=test-only-key&language=vi-VN$/);
    assert.deepEqual(requests[0].options, { next: { revalidate: 1800 } });
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.TMDB_API_KEY;
    delete process.env.TMDB_BASE_URL;
  }
});
