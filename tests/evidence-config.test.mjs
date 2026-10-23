import assert from "node:assert/strict";
import { test } from "node:test";

test("short evidence TTL is allowed only for the loopback mock", async (t) => {
  const originalFetch = globalThis.fetch;
  const originalEnv = { ...process.env };
  t.after(() => {
    globalThis.fetch = originalFetch;
    for (const name of ["TMDB_API_KEY", "TMDB_BASE_URL", "TMDB_MOCK_REVALIDATE_SECONDS"]) {
      if (originalEnv[name] === undefined) delete process.env[name];
      else process.env[name] = originalEnv[name];
    }
  });
  process.env.TMDB_API_KEY = "evidence-only";
  process.env.TMDB_MOCK_REVALIDATE_SECONDS = "15";
  const requests = [];
  globalThis.fetch = async (_, options) => {
    requests.push(options);
    return { ok: true, json: async () => ({ id: 550 }) };
  };

  process.env.TMDB_BASE_URL = "http://127.0.0.1:4100/3";
  const local = await import("../services/client.ts?evidence-local");
  await local.fetchTMDB("/movie/550", 3600);
  assert.equal(requests.at(-1).next.revalidate, 15);

  for (const invalid of ["0", "-1", "1.5", "abc", "61"]) {
    process.env.TMDB_MOCK_REVALIDATE_SECONDS = invalid;
    await assert.rejects(() => local.fetchTMDB("/movie/550"), /TMDB_MOCK_REVALIDATE_SECONDS/);
  }

  process.env.TMDB_MOCK_REVALIDATE_SECONDS = "15";
  process.env.TMDB_BASE_URL = "https://api.themoviedb.org/3";
  const remote = await import("../services/client.ts?evidence-remote");
  await assert.rejects(() => remote.fetchTMDB("/movie/550"), /loopback/);
  assert.equal(requests.length, 1, "invalid evidence settings must fail before fetching");

  delete process.env.TMDB_MOCK_REVALIDATE_SECONDS;
  await remote.fetchTMDB("/movie/550", 3600);
  assert.equal(requests.at(-1).next.revalidate, 3600);
});
