import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { register } from "node:module";
import { test } from "node:test";
import { resolveTitle } from "next/dist/lib/metadata/resolvers/resolve-title.js";

register("../scripts/test-resolver.mjs", import.meta.url);
process.env.TMDB_API_KEY = "test-only-key";

const { generateMetadata: searchMetadata } = await import("../app/search/page.tsx");
const { generateMetadata: browseMetadata } = await import("../app/browse/page.tsx");
const { generateMetadata: movieMetadata } = await import("../app/movie/[id]/page.tsx");
const { metadata: watchlistMetadata } = await import("../app/watchlist/page.tsx");
const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
const template = layout.match(/template:\s*"([^"]+)"/)?.[1];
assert.equal(template, "%s | MovieHub");

test("child metadata applies root MovieHub suffix exactly once", async (t) => {
  let releaseDate = "2010-07-15";
  t.mock.method(globalThis, "fetch", async () => new Response(JSON.stringify({
    id: 27205, title: "Inception", release_date: releaseDate,
  })));

  const cases = [
    [await searchMetadata({ searchParams: Promise.resolve({}) }), "Tìm kiếm & Khám phá phim"],
    [await searchMetadata({ searchParams: Promise.resolve({ q: "Batman" }) }), 'Kết quả tìm kiếm: "Batman"'],
    [await browseMetadata({ searchParams: Promise.resolve({}) }), "Kho Phim"],
    [watchlistMetadata, "Danh Sách Yêu Thích"],
    [await movieMetadata({ params: Promise.resolve({ id: "27205" }) }), "Inception (2010)"],
  ];
  releaseDate = "";
  cases.push([await movieMetadata({ params: Promise.resolve({ id: "27205" }) }), "Inception"]);

  for (const [metadata, title] of cases) {
    assert.equal(resolveTitle(metadata.title, template).absolute, `${title} | MovieHub`);
  }
});
