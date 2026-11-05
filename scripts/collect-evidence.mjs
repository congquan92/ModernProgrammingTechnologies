import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { verifyStream } from "./verify-stream-evidence.mjs";
import { verifyBrowser } from "./verify-browser-evidence.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
process.chdir(root);
const output = pathToFileURL(resolve(process.env.MOVIEHUB_EVIDENCE_DIR || "baocao/evidence") + sep);
await mkdir(output, { recursive: true });
const git = (...args) => execFileSync("git", args, { encoding: "utf8", windowsHide: true }).trim();
async function fingerprint() {
  const sourceFiles = git("ls-files", "--cached", "--others", "--exclude-standard").split(/\r?\n/)
    .filter((path) => /^(app\/|components\/|services\/|utils\/|types\/|scripts\/|tests\/|package(-lock)?\.json$|next\.config\.ts$|tsconfig\.json$|eslint\.config\.mjs$|postcss\.config\.mjs$)/.test(path))
    .filter((path) => existsSync(path))
    .sort();
  const hash = createHash("sha256");
  for (const path of sourceFiles) hash.update(path).update("\0").update(await readFile(path)).update("\0");
  return hash.digest("hex");
}
const metadata = {
  generated_at: new Date().toISOString(),
  git_head: git("rev-parse", "HEAD"),
  working_tree_dirty: git("status", "--porcelain").length > 0,
  source_sha256: await fingerprint(),
  run_id: new Date().toISOString(),
  node: process.version,
  next: JSON.parse(await readFile("node_modules/next/package.json", "utf8")).version,
  platform: process.platform,
  mode: "production; controlled loopback TMDB mock; Cache Components disabled",
  scope: "HTTP streaming, Data Cache, Server Actions and Chrome interaction checks; no CWV/CDN claims",
};
const header = (command) => Object.entries({ ...metadata, command }).map(([key, value]) => `${key}: ${value}`).join("\n") + "\n\n";
const saveJSON = (name, value) => writeFile(new URL(name, output), JSON.stringify({ ...metadata, ...value }, null, 2) + "\n");
const children = new Set();
const processLogs = [];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const env = { ...process.env, NEXT_TELEMETRY_DISABLED: "1", MOVIEHUB_EVIDENCE_BUILD: "1", TMDB_API_KEY: "evidence-only" };
delete env.TMDB_MOCK_REVALIDATE_SECONDS;

async function freePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const port = server.address().port;
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return port;
}

function launch(args, name) {
  const child = spawn(process.execPath, args, { cwd: root, env, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  children.add(child);
  let log = header(`node ${args.join(" ")}`);
  const capture = (chunk) => { log += chunk.toString().replace(/api_key=[^&\s"']+/gi, "api_key=[REDACTED]"); };
  child.stdout.on("data", capture);
  child.stderr.on("data", capture);
  const done = once(child, "close").then(async ([code, signal]) => {
    children.delete(child);
    log += `\nexit_code: ${code}\nsignal: ${signal ?? "none"}\n`;
    await writeFile(new URL(name, output), log);
    return code;
  });
  // Register a rejection handler immediately, including for long-running servers.
  done.catch(() => {});
  processLogs.push(done);
  return { child, done };
}

async function run(args, name) {
  console.log(`Running: node ${args.join(" ")}`);
  const code = await launch(args, name).done;
  assert.equal(code, 0, `Command failed; see ${fileURLToPath(new URL(name, output))}`);
}

async function waitFor(url, child) {
  for (let attempt = 0; attempt < 120; attempt++) {
    assert.equal(child.exitCode, null, `Server exited while waiting for ${url}`);
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
      await response.arrayBuffer();
      if (response.ok) return;
    } catch (error) {
      if (["EACCES", "EPERM"].includes(error.cause?.code)) {
        throw new Error("Local HTTP is blocked by the sandbox; rerun with permission to access loopback servers.");
      }
      // Retry only while our own server is starting.
    }
    await sleep(250);
  }
  throw new Error(`Server did not become ready: ${url}`);
}

await saveJSON("mock-runtime.json", { status: "running" });
try {
  // These checks do not need an API key or a running server.
  await run(["node_modules/eslint/bin/eslint.js", ".", "--max-warnings=0"], "lint-output.txt");
  await run(["--disable-warning=DEP0205", "--experimental-strip-types", "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "--test", "tests/*.test.mjs"], "test-output.txt");
  env.TMDB_MOCK_REVALIDATE_SECONDS = "15";
  env.EVIDENCE_PORT = String(await freePort());
  env.TMDB_BASE_URL = `http://127.0.0.1:${env.EVIDENCE_PORT}/3`;
  const mock = launch(["scripts/mock-tmdb-evidence.mjs"], "mock-origin-output.txt");
  const countsURL = `http://127.0.0.1:${env.EVIDENCE_PORT}/_counts`;
  await waitFor(countsURL, mock.child);
  await run(["node_modules/next/dist/bin/next", "build", "--webpack"], "build-mock-output.txt");
  assert.doesNotMatch(await readFile(new URL("build-mock-output.txt", output), "utf8"), /\b(?:warn(?:ing)?s?|errors?|fatal)\b|⚠|⨯|<w>/i, "Build must have zero errors and warnings");
  await run(["node_modules/typescript/bin/tsc", "--noEmit"], "typecheck-output.txt");
  const baseURL = `http://127.0.0.1:${await freePort()}`;
  const server = launch(["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", new URL(baseURL).port], "production-mock-output.txt");
  await waitFor(`${baseURL}/api/search?q=a`, server.child);

  const getCounts = async () => {
    const response = await fetch(countsURL, { signal: AbortSignal.timeout(5000) });
    assert.equal(response.status, 200);
    return response.json();
  };
  const getHTML = async (path, cookie) => {
    const response = await fetch(`${baseURL}${path}`, { headers: cookie ? { Cookie: cookie } : {}, signal: AbortSignal.timeout(30_000) });
    assert.equal(response.status, 200);
    return response.text();
  };

  const home = await getHTML("/");
  for (const heading of ["Phim Thịnh Hành Trong Tuần", "Top 10 Phim Đánh Giá Cao Nhất", "Phim Đang Chiếu Rạp Dành Cho Bạn", "Có Thể Bạn Muốn Xem Lại"]) {
    assert.ok(home.includes(heading), `Missing server-rendered row: ${heading}`);
  }
  assert.ok(!home.includes("api_key="), "Home HTML must not expose the API key");
  assert.ok((await getHTML("/search?q=Batman&q=Avatar")).includes("Batman"));
  const search = await fetch(`${baseURL}/api/search?q=Batman`);
  assert.equal(search.status, 200);
  assert.ok((await search.json()).results.length > 0);
  const missing = await fetch(`${baseURL}/movie/not-a-number`);
  const missingHTML = await missing.text();
  assert.ok([200, 404].includes(missing.status));
  assert.ok(missingHTML.includes("Không Tìm Thấy Bộ Phim Này") && missingHTML.includes('name="robots" content="noindex"'));
  await saveJSON("routes-http.json", { server_rendered_home_rows: 4, api_key_in_home: false, repeated_query_renders: true, search_handler_returns_results: true, invalid_movie_noindex: true });

  // A fresh ID avoids any build-time/preexisting cache entries.
  const id = String(Date.now());
  const paths = ["", "/videos", "/credits", "/similar"].map((suffix) => `/movie/${id}${suffix}`);
  const snapshot = async () => {
    const counts = await getCounts();
    return Object.fromEntries(paths.map((path) => [path, counts[path] || 0]));
  };
  const before = await snapshot();
  const stream = await verifyStream(baseURL, id);
  await saveJSON("streaming-mock.json", stream);
  const miss = await snapshot();
  for (const path of paths) assert.equal(miss[path] - before[path], 1, `Expected one upstream request: ${path}`);
  assert.ok((await getHTML(`/movie/${id}`)).includes("Phiên bản 1"));
  const hit = await snapshot();
  assert.deepEqual(hit, miss, "A cache hit must not call the mock origin");

  console.log("Waiting for the 15-second mock TTL to expire, then checking background revalidation...");
  await sleep(16_000);
  await getHTML(`/movie/${id}`);
  // Stale-while-revalidate can complete after the HTML response. Poll counters;
  // then allow the slowest mock response to complete before checking a warm hit.
  let refreshed;
  for (let attempt = 0; attempt < 30; attempt++) {
    refreshed = await snapshot();
    if (paths.every((path) => refreshed[path] > hit[path])) break;
    await sleep(250);
  }
  for (const path of paths) assert.equal(refreshed[path], hit[path] + 1, `Expected one background refresh: ${path}`);
  await sleep(4200);
  assert.ok((await getHTML(`/movie/${id}`)).includes("Phiên bản 2"), "Revalidated content must reflect the changed origin data");
  const warm = await snapshot();
  assert.deepEqual(warm, refreshed, "Refreshed data must be cached again");
  await saveJSON("cache-mock.json", { base_url: baseURL, ttl_seconds: 15, cache_components: false, content_before: "Phiên bản 1", content_after: "Phiên bản 2", before, miss, hit, after_expiry: refreshed, warm_after_refresh: warm,
    steps: [
      { input: `GET /movie/${id} (cold, HTTP stream)`, counts: miss, result: "miss; main and fallbacks before auxiliary content" },
      { input: `GET /movie/${id} (within TTL)`, counts: hit, result: "hit; no additional upstream requests" },
      { input: `wait 16s; GET /movie/${id}; wait for refresh`, counts: refreshed, result: "one background refresh per endpoint" },
      { input: `GET /movie/${id} (after refresh)`, counts: warm, result: "hit; refreshed data cached" },
    ] });

  // Resolve build-specific action IDs, never hard-code them or log cookie values.
  const manifest = JSON.parse(await readFile(".next-evidence/server/server-reference-manifest.json", "utf8"));
  const actionID = Object.entries(manifest.node).find(([, entry]) => entry.exportedName === "toggleWatchlist")?.[0];
  assert.ok(actionID, "Missing toggleWatchlist action in production manifest");
  let cookie = "";
  const action = async () => {
    const response = await fetch(`${baseURL}/movie/${id}`, {
      method: "POST",
      headers: { "Next-Action": actionID, "Content-Type": "text/plain;charset=UTF-8", Origin: baseURL, ...(cookie ? { Cookie: cookie } : {}) },
      body: JSON.stringify([Number(id)]),
      signal: AbortSignal.timeout(30_000),
    });
    assert.equal(response.status, 200);
    const setCookie = response.headers.getSetCookie().find((value) => value.startsWith("mh_watchlist="));
    assert.ok(setCookie, "Server Action must send the watchlist cookie");
    assert.match(setCookie, /httponly/i);
    assert.match(setCookie, /;\s*secure(?:;|$)/i);
    assert.match(setCookie, /samesite=lax/i);
    cookie = setCookie.split(";")[0];
    await response.text();
  };
  assert.ok(!(await getHTML("/watchlist")).includes(`Phim minh chứng ${id}`));
  await action();
  const saved = await getHTML("/watchlist", cookie);
  assert.ok(saved.includes(`Phim minh chứng ${id}`), "Saved movie must appear on server-rendered watchlist");
  const reload = await getHTML("/watchlist", cookie);
  assert.ok(reload.includes(`Phim minh chứng ${id}`), "Saved state must persist on a fresh HTTP request (reload)");
  assert.ok(!(await getHTML("/watchlist")).includes(`Phim minh chứng ${id}`), "A separate cookie jar must remain empty");
  await action();
  assert.ok(!(await getHTML("/watchlist", cookie)).includes(`Phim minh chứng ${id}`), "Removed movie must disappear");
  assert.ok(!(await getHTML("/watchlist", cookie)).includes(`Phim minh chứng ${id}`), "Removal must persist after reload");
  await saveJSON("watchlist-http.json", { route: `/movie/${id}`, add_post: 200, cookie_flags: ["Secure", "HttpOnly", "SameSite=Lax"], saved_on_watchlist: true, persisted_after_reload: true, separate_cookie_jar_empty: true, removed_on_watchlist: true, removal_persisted_after_reload: true, cookie_values: "omitted", scope: "real production Server Action HTTP requests; browser interaction/video not measured" });
  console.log("Checking search, filters, optimistic rollback and dialog focus in Chrome...");
  await saveJSON("browser-interactions.json", await verifyBrowser(baseURL, id));
  assert.equal(await fingerprint(), metadata.source_sha256, "Source files changed during verification; rerun npm run evidence");
  await saveJSON("mock-runtime.json", { status: "passed", build_errors: 0, build_warnings: 0, base_url: baseURL, tmdb_origin: env.TMDB_BASE_URL, mock_ttl_seconds: 15, build_directory: ".next-evidence", artifacts: ["build-mock-output.txt", "routes-http.json", "streaming-mock.json", "cache-mock.json", "watchlist-http.json", "browser-interactions.json"] });
  console.log(`Evidence saved in ${fileURLToPath(output)}. Mock measurements are not TMDB/CWV benchmarks.`);
} catch (error) {
  if (error.results) await saveJSON("browser-interactions.json", { checks: error.results });
  await saveJSON("mock-runtime.json", { status: "failed", error: error.message });
  console.error(error.message);
  process.exitCode = 1;
} finally {
  for (const child of children) child.kill();
  await Promise.allSettled(processLogs);
}
