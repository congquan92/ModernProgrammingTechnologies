import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

// Read actual HTML chunks, not escaped marker strings in the embedded RSC payload.
export async function verifyStream(baseURL, id = String(Date.now())) {
  assert.match(id, /^[1-9]\d*$/);
  const started = performance.now();
  const response = await fetch(`${baseURL}/movie/${id}`, { signal: AbortSignal.timeout(30_000) });
  assert.equal(response.status, 200);
  assert.ok(response.body);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const markers = {
    main: `data-movie-id="${id}"`,
    cast_fallback: 'data-stream="cast-fallback"',
    similar_fallback: 'data-stream="similar-fallback"',
    cast_result: 'data-stream="cast-result"',
    similar_result: 'data-stream="similar-result"',
  };
  const events = {};
  const chunks = [];
  let html = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    html += decoder.decode(value, { stream: true });
    const ms = Math.round(performance.now() - started);
    chunks.push({ chunk: chunks.length + 1, ms, bytes: value.byteLength });
    for (const [name, marker] of Object.entries(markers)) {
      if (!events[name] && html.includes(marker)) events[name] = { ms, chunk: chunks.length };
    }
  }
  for (const name of Object.keys(markers)) assert.ok(events[name], `Missing streamed HTML: ${name}`);
  for (const result of ["cast_result", "similar_result"]) {
    assert.ok(events.main.chunk < events[result].chunk, `Main HTML must arrive before ${result}`);
    // The mock deliberately delays credits 2500ms and similar 4000ms. Distinct
    // transport chunks alone cannot distinguish streaming from a buffered body.
    assert.ok(events[result].ms - events.main.ms >= 1000, `${result} must arrive progressively, at least 1000ms after main HTML in this mock`);
  }
  assert.ok(events.cast_fallback.chunk < events.cast_result.chunk, "Cast fallback must arrive before cast content");
  assert.ok(events.similar_fallback.chunk < events.similar_result.chunk, "Similar fallback must arrive before similar content");
  return { route: `/movie/${id}`, status: response.status, events, chunks };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(await verifyStream(process.env.EVIDENCE_BASE_URL || "http://localhost:3000", process.argv[2]), null, 2));
}
