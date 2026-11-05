import assert from "node:assert/strict";
import { test } from "node:test";
import { register } from "node:module";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime.js";
import { SearchParamsContext, PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime.js";

register("../scripts/test-resolver.mjs", import.meta.url);
process.env.TMDB_API_KEY = "test-only-key";

const { default: HomePage } = await import("../app/page.tsx");
const { default: SearchPage, generateMetadata } = await import("../app/search/page.tsx");
const { default: BrowsePage } = await import("../app/browse/page.tsx");
const { default: WatchlistPage } = await import("../app/watchlist/page.tsx");
const { default: FilterBar } = await import("../components/client/FilterBar.tsx");
const { discoverMovies } = await import("../services/discover.ts");
const { toggleWatchlist } = await import("../app/actions/watchlist.ts");
const { resetMockCookies } = await import("../scripts/mock-headers.mjs");

const movie = (id, release_date = "2024-01-01") => ({
  id, title: `Movie ${id}`, release_date, genre_ids: [28], genres: [],
  poster_path: null, backdrop_path: null, overview: "", vote_average: 8,
});

function mockFetch(t, respond) {
  const requests = [];
  t.mock.method(globalThis, "fetch", async (input) => {
    const url = new URL(input);
    requests.push(url);
    const data = respond(url);
    return new Response(JSON.stringify(data), { status: typeof data === "number" ? data : 200 });
  });
  t.mock.method(console, "error", () => {});
  return requests;
}

function render(element, query = {}, pathname = "/search") {
  return renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: {} },
    createElement(PathnameContext.Provider, { value: pathname },
      createElement(SearchParamsContext.Provider, { value: new URLSearchParams(query) }, element))));
}

test("home rejects upstream failure instead of caching an empty page", async (t) => {
  mockFetch(t, () => 503);
  await assert.rejects(HomePage, /Lỗi gọi API TMDB/);
});

test("search accepts repeated query parameters and bounds the keyword", async (t) => {
  const requests = mockFetch(t, () => ({ results: [movie(1)] }));
  const params = { q: ["Batman", "Avatar"], genre: ["28", "35"] };
  const html = render(await SearchPage({ searchParams: Promise.resolve(params) }));
  assert.match(html, /href="\/movie\/1"/);
  assert.match((await generateMetadata({ searchParams: Promise.resolve(params) })).title, /Batman/);
  await SearchPage({ searchParams: Promise.resolve({ q: "x".repeat(125) }) });
  assert.equal(requests.at(-1).searchParams.get("query").length, 100);
});

test("classic keyword search keeps old films and excludes newer or undated ones", async (t) => {
  mockFetch(t, () => ({ results: [movie(1, "1999-01-01"), movie(2), movie(3, "")] }));
  const query = { q: "Batman", genre: "classic" };
  const html = render(await SearchPage({ searchParams: Promise.resolve(query) }), query);
  assert.match(html, /href="\/movie\/1"/);
  assert.doesNotMatch(html, /href="\/movie\/[23]"/);
});

test("unsupported keyword filters redirect to a URL that matches the results", async () => {
  for (const extra of [{ country: "JP" }, { sortBy: "revenue.desc" }]) {
    await assert.rejects(() => SearchPage({ searchParams: Promise.resolve({ q: "Batman", ...extra }) }),
      (error) => error.digest === "NEXT_REDIRECT;replace;/search?q=Batman;307;");
  }
});

test("discover uses one native TMDB page and validates untrusted filters", async (t) => {
  const requests = mockFetch(t, () => ({ results: Array.from({ length: 20 }, (_, i) => movie(i + 1)), total_pages: 600, total_results: 12000 }));
  const data = await discoverMovies({ page: 3 });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].searchParams.get("page"), "3");
  assert.equal(data.results.length, 20);
  assert.equal(data.totalPages, 500);
  await discoverMovies({ page: Infinity, sortBy: "revenue.desc&include_adult=true", country: "invalid" });
  assert.equal(requests.at(-1).searchParams.get("page"), "1");
  assert.equal(requests.at(-1).searchParams.get("sort_by"), "popularity.desc");
  assert.equal(requests.at(-1).searchParams.has("include_adult"), false);
  assert.equal(requests.at(-1).searchParams.has("with_origin_country"), false);
});

test("browse normalizes repeated filters and invalid page numbers", async (t) => {
  const requests = mockFetch(t, () => ({ results: [movie(1)], total_pages: 1, total_results: 1 }));
  const html = render(await BrowsePage({ searchParams: Promise.resolve({ genre: ["28", "35"], page: "-2" }) }));
  assert.match(html, /href="\/movie\/1"/);
  assert.equal(requests[0].searchParams.get("page"), "1");
  assert.equal(requests[0].searchParams.get("with_genres"), "28");
});

test("watchlist add, reload and remove render the state from the Server Action", async (t) => {
  resetMockCookies();
  mockFetch(t, () => movie(1));
  await toggleWatchlist(1);
  assert.match(render(await WatchlistPage()), /href="\/movie\/1"/);
  assert.match(render(await WatchlistPage()), /href="\/movie\/1"/);
  await toggleWatchlist(1);
  assert.match(render(await WatchlistPage()), /Danh sách xem sau của bạn đang trống/);
});

test("watchlist propagates service errors but skips deleted movies", async (t) => {
  resetMockCookies(new Map([["mh_watchlist", "[1]"]]));
  let status = 503;
  mockFetch(t, () => status);
  await assert.rejects(WatchlistPage, /Lỗi gọi API TMDB/);
  status = 404;
  assert.match(render(await WatchlistPage()), /Danh sách xem sau của bạn đang trống/);
});

test("keyword filters have accessible labels and offer only supported choices", () => {
  const html = render(createElement(FilterBar), { q: "Batman" });
  assert.match(html, /for="filter-genre"/);
  assert.match(html, /id="filter-genre"/);
  assert.doesNotMatch(html, /id="filter-country"/);
  assert.doesNotMatch(html, /value="revenue.desc"/);
  assert.match(html, /Liên quan nhất/);
});
