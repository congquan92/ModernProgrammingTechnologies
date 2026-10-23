import assert from "node:assert/strict";
import { test } from "node:test";
import { verifyStream } from "../scripts/verify-stream-evidence.mjs";

test("streaming verifier rejects a buffered response split into multiple chunks", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async () => new Response(new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      for (const part of [
        '<main data-movie-id="550"><div data-stream="cast-fallback"></div><div data-stream="similar-fallback"></div>',
        '<div data-stream="cast-result"></div>',
        '<div data-stream="similar-result"></div></main>',
      ]) controller.enqueue(encoder.encode(part));
      controller.close();
    },
  }));
  await assert.rejects(() => verifyStream("http://mock.invalid", "550"), /arrive progressively/);
});
