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
      await ready(`(() => { const control = document.querySelector('main #filter-genre, main input, main button[aria-pressed], main button[aria-label]'); return control && Object.keys(control).some(key => key.startsWith('__reactProps$')); })()`, "client control hydrated");
    }
    async function type(selector, text) {
      await evaluate(`(() => { const input = document.querySelector(${JSON.stringify(selector)}); input.focus(); input.select(); })()`);
      await send("Input.insertText", { text });
    }
    async function key(key, code = key) {
      const windowsVirtualKeyCode = { Enter: 13, Escape: 27, Tab: 9 }[key];
      await send("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode, ...(key === "Enter" ? { text: "\r", unmodifiedText: "\r" } : {}) });
      await send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode });
    }
    const mainInput = 'main input[aria-label="Tìm kiếm phim"]';
    const mainValue = `document.querySelector(${JSON.stringify(mainInput)})?.value`;
    async function scenario(name, run) {
      try { const details = await run(); results.push({ name, status: "passed", ...(details ? { details } : {}) }); }
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
    await scenario("pending main debounce preserves newer slow header navigation", async () => {
      await navigate("/search?q=initial");
      await evaluate("document.querySelector('header button[aria-label=\"Tìm kiếm phim\"]').click()");
      await ready("!!document.querySelector('header input')", "header search opens");
      await type("header input", "external-header");
      let held;
      intercept = async (event) => {
        if (!held && new URL(event.request.url).searchParams.get("q") === "external-header") { held = event.requestId; return; }
        await send("Fetch.continueRequest", { requestId: event.requestId });
      };
      await send("Fetch.enable", { patterns: [{ urlPattern: `${baseURL}/search*`, requestStage: "Request" }] });
      await type(mainInput, "pending-main");
      await evaluate("document.querySelector('header input').focus()");
      await key("Enter");
      await waitFor(() => held, "newer external search held");
      await sleep(650);
      await send("Fetch.continueRequest", { requestId: held });
      await ready("new URLSearchParams(location.search).get('q') === 'external-header'", "newer external search wins");
      assert.equal(await evaluate(mainValue), "external-header");
    });
    await scenario("header search and results fit mobile, tablet and desktop viewports", async () => {
      try {
        for (const width of [320, 375, 768, 1024, 1280, 1536]) {
          await send("Emulation.setDeviceMetricsOverride", { width, height: 812, deviceScaleFactor: 1, mobile: true });
          await navigate("/search?q=mobile");
          await evaluate("document.querySelector('header button[aria-label=\"Tìm kiếm phim\"]').click()");
          await ready("!!document.querySelector('header input')", "mobile search opens");
          await type("header input", "mobile");
          await sleep(400);
          const rects = await evaluate("(() => { const input = document.querySelector('header input'); return [input, input.parentElement.nextElementSibling].map(element => { const rect = element.getBoundingClientRect(); return { left: rect.left, right: rect.right }; }); })()");
          for (const rect of rects) assert.ok(rect.left >= 0 && rect.right <= width, `Search clipped at ${width}px: ${JSON.stringify(rect)}`);
          await evaluate("document.querySelector('header button[aria-label=\"Tìm kiếm phim\"]').click()");
          await ready("!document.querySelector('header input')", "header search closes");
          if (width < 1280) {
            await evaluate("document.querySelector('header button[aria-controls=\"mobile-navigation\"]').click()");
            await ready("document.querySelector('header button[aria-controls=\"mobile-navigation\"]').getAttribute('aria-expanded') === 'true' && document.querySelector('#mobile-navigation a[href=\"/watchlist\"]').getClientRects().length > 0", "navigation menu available");
          }
        }
      } finally {
        await send("Emulation.clearDeviceMetricsOverride");
      }
    });
    await scenario("all carousel arrows show keyboard focus", async () => {
      for (const [path, group] of [["/", "group/row"], [`/movie/${movieId}`, "group/cast"], [`/movie/${movieId}`, "group/similar"]]) {
        await navigate(path);
        const selector = `main [class~="${group}"] button`;
        for (let index = 0; index < 2; index++) {
          await evaluate(`(() => { const target = document.querySelectorAll(${JSON.stringify(selector)})[${index}]; const controls = [...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')].filter(element => !element.disabled && element.tabIndex >= 0 && element.getClientRects().length); controls[controls.indexOf(target) - 1].focus(); })()`);
          await key("Tab");
          // Chrome thêm điểm dừng Tab cho vùng cuộn không có phần tử tương tác.
          for (let attempt = 0; attempt < 2 && !await evaluate(`document.activeElement === document.querySelectorAll(${JSON.stringify(selector)})[${index}]`); attempt++) await key("Tab");
          await sleep(350);
          const state = await evaluate(`(() => { const target = document.querySelectorAll(${JSON.stringify(selector)})[${index}]; const style = getComputedStyle(target); return { focused: document.activeElement === target, opacity: style.opacity, shadow: style.boxShadow }; })()`);
          assert.ok(state.focused, `${group} arrow not reached with Tab`);
          assert.equal(state.opacity, "1", `${group} focused arrow is invisible`);
          assert.notEqual(state.shadow, "none", `${group} focused arrow has no focus ring`);
        }
      }
    });
    for (const [path, group] of [["/", "group/row"], [`/movie/${movieId}`, "group/cast"], [`/movie/${movieId}`, "group/similar"]]) {
      await scenario(`${group} handles rapid clicks, reversal and a new step after wrapping`, async () => {
        try {
          await send("Emulation.setDeviceMetricsOverride", { width: 800, height: 900, deviceScaleFactor: 1, mobile: false });
          await navigate(path);
          const container = `document.querySelector('main [class~="${group}"]')`;
          const row = `${container}.querySelector('[class~="overflow-x-auto"]')`;
          const right = `${container}.querySelector('button[aria-label="Cuộn sang phải"]')`;
          const left = `${container}.querySelector('button[aria-label="Cuộn sang trái"]')`;
          await ready(`!!${container}`, "carousel rendered");
          const max = await evaluate(`${row}.scrollWidth - ${row}.clientWidth`);
          assert.ok(max > 200, "Carousel fixture must overflow");
          await evaluate(`${right}.click(); ${right}.click()`);
          await ready(`${row}.scrollLeft > 15`, "two right clicks move right");
          await evaluate(`${row}.scrollTo({left:${max / 2},behavior:'instant'}); ${right}.click(); ${left}.click()`);
          await sleep(800);
          assert.ok(await evaluate(`${row}.scrollLeft <= ${max / 2 + 15}`), "Direction reversal jumped to the far end");
          await evaluate(`${row}.scrollTo({left:${max},behavior:'instant'}); ${right}.click()`);
          await ready(`${row}.scrollLeft < 1`, "right wraps to beginning");
          await evaluate(`${right}.click()`);
          await ready(`${row}.scrollLeft > 15`, "next right after wrapping moves again");
        } finally {
          await send("Emulation.clearDeviceMetricsOverride");
        }
      });
    }
    await scenario("header search has visible keyboard focus and restores it on Escape", async () => {
      await navigate("/search?q=keyboard-focus");
      const trigger = 'header button[aria-label="Tìm kiếm phim"]';
      await evaluate(`(() => { const target = document.querySelector(${JSON.stringify(trigger)}); const controls = [...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')].filter(element => !element.disabled && element.tabIndex >= 0 && element.getClientRects().length); controls[controls.indexOf(target) - 1].focus(); })()`);
      await key("Tab");
      const state = await evaluate(`(() => { const target = document.querySelector(${JSON.stringify(trigger)}); const style = getComputedStyle(target); return { focused:document.activeElement === target, visible:target.matches(':focus-visible'), outline:style.outlineStyle, shadow:style.boxShadow }; })()`);
      assert.ok(state.focused && state.visible);
      assert.ok(state.outline !== "none" || state.shadow !== "none", "Search trigger has no visible keyboard focus");
      await key("Enter");
      await ready("document.activeElement === document.querySelector('header input')", "header input focused");
      await key("Escape");
      await ready(`!document.querySelector('header input') && document.activeElement === document.querySelector(${JSON.stringify(trigger)})`, "Escape restores search trigger focus");
    });
    await scenario("header search safely encodes an incomplete Unicode character", async () => {
      await navigate("/search?q=unicode");
      await evaluate("document.querySelector('header button[aria-label=\"Tìm kiếm phim\"]').click()");
      await ready("!!document.querySelector('header input')", "header input opens");
      await evaluate("(() => { const input = document.querySelector('header input'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'Unicode\\uD83D'); input.dispatchEvent(new Event('input', {bubbles:true})); })()");
      await ready("document.querySelector('header').textContent.includes('5 kết quả')", "Unicode preview loads");
      await key("Enter");
      await ready("new URLSearchParams(location.search).get('q') === 'Unicode\\uFFFD'", "Unicode Enter navigation succeeds");
    });
    await scenario("streamed cast and similar placeholders keep their layout dimensions", async () => {
      const measurements = [];
      try {
        for (const width of [375, 800]) {
          await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: false });
          const freshId = String(Date.now());
          await send("Page.navigate", { url: new URL(`/movie/${freshId}`, baseURL).href });
          await ready(`location.pathname === '/movie/${freshId}' && document.querySelector('[data-stream="cast-fallback"]')?.getBoundingClientRect().height > 0 && document.querySelector('[data-stream="similar-fallback"]')?.getBoundingClientRect().height > 0`, "streaming placeholders visible");
          const dimensions = (suffix) => `(() => { const cast = document.querySelector('[data-stream="cast-${suffix}"]'); const similar = document.querySelector('[data-stream="similar-${suffix}"]'); return {cast:cast.getBoundingClientRect().height, similar:similar.getBoundingClientRect().height, similarTop:similar.closest('section').getBoundingClientRect().top + scrollY}; })()`;
          const before = await evaluate(dimensions("fallback"));
          await ready("document.querySelector('[data-stream=\"cast-result\"]')?.getBoundingClientRect().height > 0 && document.querySelector('[data-stream=\"similar-result\"]')?.getBoundingClientRect().height > 0", "auxiliary content streamed");
          const after = await evaluate(dimensions("result"));
          for (const dimension of ["cast", "similar", "similarTop"]) assert.ok(Math.abs(after[dimension] - before[dimension]) <= 1, `${dimension} changed at ${width}px: ${before[dimension]} to ${after[dimension]}`);
          measurements.push({ width, before, after });
        }
      } finally {
        await send("Emulation.clearDeviceMetricsOverride");
      }
      return measurements;
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
