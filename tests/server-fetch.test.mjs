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
    assert.deepEqual(requests[0].options.next, { revalidate: 1800 });
    assert.ok(requests[0].options.signal instanceof AbortSignal);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.TMDB_API_KEY;
    delete process.env.TMDB_BASE_URL;
  }
});


test("TMDB failures preserve HTTP status, hide secrets and reject missing configuration", async (t) => {
  const original = { fetch: globalThis.fetch, timeout: AbortSignal.timeout, key: process.env.TMDB_API_KEY };
  t.after(() => {
    globalThis.fetch = original.fetch;
    AbortSignal.timeout = original.timeout;
    if (original.key === undefined) delete process.env.TMDB_API_KEY;
    else process.env.TMDB_API_KEY = original.key;
  });
  const { fetchTMDB, TMDBError } = await import("../services/client.ts");
  process.env.TMDB_API_KEY = "private-test-key";
  let deadline;
  AbortSignal.timeout = (ms) => { deadline = ms; return new AbortController().signal; };
  for (const status of [404, 401, 500, 503]) {
    globalThis.fetch = async () => ({ ok: false, status });
    await assert.rejects(fetchTMDB("/movie/7"), (error) => error instanceof TMDBError && error.status === status);
  }
  assert.equal(deadline, 10000);
  for (const failure of [new DOMException("expired", "TimeoutError"), new Error("url?api_key=private-test-key")]) {
    globalThis.fetch = async () => { throw failure; };
    await assert.rejects(fetchTMDB("/movie/7"), (error) => error instanceof TMDBError && error.status === 0 && !error.message.includes("private-test-key"));
  }
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ results: [] }) });
  assert.deepEqual(await fetchTMDB("/movie/7"), { results: [] });
  delete process.env.TMDB_API_KEY;
  globalThis.fetch = async () => { assert.fail("missing key must fail before network"); };
  await assert.rejects(fetchTMDB("/movie/7"), /TMDB_API_KEY/);
});
