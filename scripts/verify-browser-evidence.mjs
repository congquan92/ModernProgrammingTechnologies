import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function waitFor(check, label, timeout = 15000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await check()) return;
    await sleep(50);
  }
  throw new Error(`Timed out: ${label}`);
}

export async function verifyBrowser(baseURL, movieId = 550) {
  assert.match(new URL(baseURL).hostname, /^(127\.0\.0\.1|localhost|\[::1\])$/, "Browser checks require loopback mock server");
  assert.ok(Number.isSafeInteger(Number(movieId)) && Number(movieId) > 0);
  const binary = process.env.CHROME_BIN || ["/opt/google/chrome/chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome-stable"].find(existsSync);
  assert.ok(binary, "Chrome missing; set CHROME_BIN");
  const profile = await mkdtemp(join(tmpdir(), "moviehub-browser-"));
  const child = spawn(binary, ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--no-first-run", "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
  let socket;
  let log = "";
  let launchError;
  child.on("error", (error) => { launchError = error; });
  child.stderr.on("data", (chunk) => { log += chunk; });
  const closed = once(child, "close").catch(() => {});
  const results = [];
  try {
    await waitFor(() => {
      if (launchError) throw launchError;
      assert.equal(child.exitCode, null, log);
      return /DevTools listening on (ws:\/\/\S+)/.test(log);
    }, "Chrome startup");
    const endpoint = new URL(log.match(/DevTools listening on (ws:\/\/\S+)/)[1]);
    const targets = await (await fetch(`http://${endpoint.host}/json/list`)).json();
    socket = new WebSocket(targets.find((target) => target.type === "page").webSocketDebuggerUrl);
    await once(socket, "open");
    let sequence = 0;
    const pending = new Map();
    let intercept = async (event) => send("Fetch.continueRequest", { requestId: event.requestId });
    const protocolErrors = [];
    socket.addEventListener("message", ({ data }) => {
      const message = JSON.parse(data);
      if (message.id) {
        const request = pending.get(message.id);
        if (!request) return;
        pending.delete(message.id);
        clearTimeout(request.timer);
        if (message.error) request.reject(new Error(JSON.stringify(message.error)));
        else request.resolve(message.result);
      } else if (message.method === "Fetch.requestPaused") {
        intercept(message.params).catch((error) => protocolErrors.push(error.message));
      }
    });
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = ++sequence;
        const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 15000);
        pending.set(id, { resolve, reject, timer });
        socket.send(JSON.stringify({ id, method, params }));
      });
    }
    async function evaluate(expression) {
      const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
      assert.ok(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
      return result.result.value;
    }
    const ready = (expression, label) => waitFor(() => evaluate(expression), label);
    async function navigate(path) {
      await send("Page.navigate", { url: new URL(path, baseURL).href });
      await ready(`location.pathname === ${JSON.stringify(new URL(path, baseURL).pathname)} && document.readyState === 'complete' && !!document.querySelector('main')`, path);
      await ready(`(() => { const control = document.querySelector('main #filter-genre, main input, main button[aria-pressed]'); return control && Object.keys(control).some(key => key.startsWith('__reactProps$')); })()`, "client control hydrated");
    }
    async function type(selector, text) {
      await evaluate(`(() => { const input = document.querySelector(${JSON.stringify(selector)}); input.focus(); input.select(); })()`);
      await send("Input.insertText", { text });
    }
    async function key(key, code = key) {
      const windowsVirtualKeyCode = { Enter: 13, Escape: 27, Tab: 9 }[key];
      await send("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode });
      await send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode });
    }
    const mainInput = 'main input[aria-label="Tìm kiếm phim"]';
    const mainValue = `document.querySelector(${JSON.stringify(mainInput)})?.value`;
    async function scenario(name, run) {
      try { await run(); results.push({ name, status: "passed" }); }
      catch (error) { results.push({ name, status: "failed", error: error.message }); }
      finally {
        intercept = async (event) => send("Fetch.continueRequest", { requestId: event.requestId });
        await send("Fetch.disable");
      }
    }
    await send("Page.enable");
    await scenario("rapid filters preserve both changes and reset page", async () => {
      await navigate("/browse?type=movie&page=3");
      let held;
      intercept = async (event) => {
        if (!held && new URL(event.request.url).searchParams.has("genre")) { held = event.requestId; return; }
        await send("Fetch.continueRequest", { requestId: event.requestId });
      };
      await send("Fetch.enable", { patterns: [{ urlPattern: `${baseURL}/browse*`, requestStage: "Request" }] });
      await evaluate(`(() => { const select = document.querySelector('#filter-genre'); select.value = '28'; select.dispatchEvent(new Event('change', {bubbles:true})); })()`);
      await waitFor(() => held, "first filter navigation held");
      await evaluate(`(() => { const select = document.querySelector('#filter-year'); select.value = '2024'; select.dispatchEvent(new Event('change', {bubbles:true})); })()`);
      await send("Fetch.continueRequest", { requestId: held });
      await ready("new URLSearchParams(location.search).get('year') === '2024'", "year navigation");
      assert.equal(await evaluate("new URLSearchParams(location.search).get('genre')"), "28", "Second filter dropped first filter");
      assert.equal(await evaluate("new URLSearchParams(location.search).has('page')"), false);
      assert.deepEqual(await evaluate("[document.querySelector('#filter-genre').value, document.querySelector('#filter-year').value]"), ["28", "2024"]);
      assert.ok(await evaluate("document.querySelector('main').textContent.includes('Phim minh chứng')"));
    });
    await scenario("slow search navigation preserves newer focused draft", async () => {
      await navigate("/search?q=initial");
      let held;
      intercept = async (event) => {
        if (!held && new URL(event.request.url).searchParams.get("q") === "older") { held = event.requestId; return; }
        await send("Fetch.continueRequest", { requestId: event.requestId });
      };
      await send("Fetch.enable", { patterns: [{ urlPattern: `${baseURL}/search*`, requestStage: "Request" }] });
      await type(mainInput, "older");
      await waitFor(() => held, "old search navigation held");
      await type(mainInput, "older plus newer");
      await send("Fetch.continueRequest", { requestId: held });
      await sleep(150);
      assert.equal(await evaluate(mainValue), "older plus newer", "Old response overwrote newer draft");
      assert.ok(await evaluate(`document.activeElement === document.querySelector(${JSON.stringify(mainInput)})`), "Typing lost focus");
      await ready("new URLSearchParams(location.search).get('q') === 'older plus newer'", "newer query committed");
      assert.equal(await evaluate(mainValue), "older plus newer");
      assert.ok(await evaluate(`document.activeElement === document.querySelector(${JSON.stringify(mainInput)})`), "Own query navigation lost input focus");
    });
    await scenario("header search and Back/Forward sync main search input", async () => {
      await navigate("/search?q=before-header");
      await type(mainInput, "typed-before-header");
      await ready("new URLSearchParams(location.search).get('q') === 'typed-before-header'", "own query before header navigation");
      await evaluate("document.querySelector('header button[aria-label=\"Tìm kiếm phim\"]').click()");
      await ready("!!document.querySelector('header input')", "header search opens");
      await type("header input", "header-query");
      await key("Enter");
      await ready("new URLSearchParams(location.search).get('q') === 'header-query'", "header router navigation");
      assert.equal(await evaluate(mainValue), "header-query", "Main search stayed on old external query");
      await evaluate("history.back()");
      await ready(`new URLSearchParams(location.search).get('q') === 'typed-before-header' && ${mainValue} === 'typed-before-header'`, "Back sync");
      await evaluate("history.forward()");
      await ready(`new URLSearchParams(location.search).get('q') === 'header-query' && ${mainValue} === 'header-query'`, "Forward sync");
    });
    await scenario("native history query updates mounted search input", async () => {
      await navigate("/search?q=before-history");
      await type(mainInput, "typed-before-history");
      await ready("new URLSearchParams(location.search).get('q') === 'typed-before-history'", "own query before native history");
      await evaluate("history.pushState(null, '', '/search?q=external-history')");
      await ready(`${mainValue} === 'external-history'`, "native external query sync");
      await evaluate("history.back()");
      await ready(`new URLSearchParams(location.search).get('q') === 'typed-before-history' && ${mainValue} === 'typed-before-history'`, "native history Back sync");
    });
    await scenario("pending search debounce preserves concurrent filter", async () => {
      await navigate("/search?q=before-filter");
      let held;
      let queryRequested = false;
      intercept = async (event) => {
        const params = new URL(event.request.url).searchParams;
        if (!held && params.get("genre") === "18") { held = event.requestId; return; }
        if (params.get("q") === "query with filter") queryRequested = true;
        await send("Fetch.continueRequest", { requestId: event.requestId });
      };
      await send("Fetch.enable", { patterns: [{ urlPattern: `${baseURL}/search*`, requestStage: "Request" }] });
      await type(mainInput, "query with filter");
      await evaluate(`(() => { const select = document.querySelector('#filter-genre'); select.value = '18'; select.dispatchEvent(new Event('change', {bubbles:true})); })()`);
      await waitFor(() => held, "filter navigation held during debounce");
      await waitFor(() => queryRequested, "query requested before filter response");
      await send("Fetch.continueRequest", { requestId: held });
      await ready("new URLSearchParams(location.search).get('q') === 'query with filter'", "debounced query committed");
      assert.equal(await evaluate("new URLSearchParams(location.search).get('genre')"), "18", "Debounced query dropped concurrent filter");
      assert.equal(await evaluate(mainValue), "query with filter");
      assert.equal(await evaluate("document.querySelector('#filter-genre').value"), "18");
      assert.ok(await evaluate("document.querySelector('main').textContent.includes('Phim minh chứng')"));
    });
    await scenario("failed watchlist action rolls optimistic state back", async () => {
      await navigate(`/movie/${movieId}`);
      const selector = 'main button[aria-pressed]';
      const saved = await evaluate(`document.querySelector(${JSON.stringify(selector)}).getAttribute('aria-pressed')`);
      let held;
      intercept = async (event) => {
        if (event.request.method === "POST" && Object.keys(event.request.headers).some((name) => name.toLowerCase() === "next-action")) { held = event.requestId; return; }
        await send("Fetch.continueRequest", { requestId: event.requestId });
      };
      await send("Fetch.enable", { patterns: [{ urlPattern: `${baseURL}/*`, requestStage: "Request" }] });
      await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
      await waitFor(() => held, "watchlist Server Action held");
      assert.equal(await evaluate(`document.querySelector(${JSON.stringify(selector)}).getAttribute('aria-pressed')`), saved === "true" ? "false" : "true");
      assert.ok(await evaluate(`document.querySelector(${JSON.stringify(selector)}).disabled`));
      await send("Fetch.failRequest", { requestId: held, errorReason: "Failed" });
      await ready(`!!document.querySelector('main [role=alert]') && !document.querySelector(${JSON.stringify(selector)}).disabled`, "watchlist rollback alert");
      assert.equal(await evaluate(`document.querySelector(${JSON.stringify(selector)}).getAttribute('aria-pressed')`), saved);
    });
    await scenario("trailer dialog traps keyboard focus and restores trigger", async () => {
      await navigate(`/movie/${movieId}`);
      const trigger = `main button[aria-label="Xem Trailer phim Phim minh chứng ${movieId}"]`;
      await evaluate(`(() => { const button = document.querySelector(${JSON.stringify(trigger)}); button.focus(); button.click(); })()`);
      await ready("!!document.querySelector('dialog[open]')", "trailer opens");
      assert.ok(await evaluate("document.querySelector('dialog').contains(document.activeElement)"));
      for (let index = 0; index < 4; index++) {
        await key("Tab");
        // Chrome may focus its document sentinel between the last and first modal controls.
        assert.ok(await evaluate("document.activeElement === document.body || document.querySelector('dialog').contains(document.activeElement)"), "Focus escaped to background control");
      }
      await key("Escape");
      await ready("!document.querySelector('dialog[open]')", "Escape closes trailer");
      assert.ok(await evaluate(`document.activeElement === document.querySelector(${JSON.stringify(trigger)})`), "Trailer did not restore trigger focus");
    });
    assert.deepEqual(protocolErrors, [], "CDP interception errors");
    const failures = results.filter((result) => result.status === "failed");
    if (failures.length) {
      const error = new Error(JSON.stringify(results, null, 2));
      error.results = results;
      throw error;
    }
    return { browser: (await send("Browser.getVersion")).product, checks: results };
  } finally {
    socket?.close();
    child.kill("SIGTERM");
    await Promise.race([closed, sleep(2000)]);
    if (child.exitCode === null && child.signalCode === null) { child.kill("SIGKILL"); await closed; }
    await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(await verifyBrowser(process.argv[2], Number(process.argv[3] || 550)), null, 2));
}
