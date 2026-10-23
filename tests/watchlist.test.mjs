import assert from "node:assert/strict";
import { test } from "node:test";
import { register } from "node:module";

// Register custom module resolver for Next.js imports (@/*, next/headers, next/cache)
register("../scripts/test-resolver.mjs", import.meta.url);

const { toggleWatchlist, getWatchlistIds, clearAllWatchlist, isMovieSaved } = await import("../app/actions/watchlist.ts");
const { resetMockCookies, getMockCookieMap } = await import("../scripts/mock-headers.mjs");

test("watchlist: rejects invalid movieId inputs with exact error", async () => {
  for (const invalid of [-5, 0, 12.34, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1, "550", "", "inception", true, false, null, undefined, {}, { id: 550 }, [550]]) {
    resetMockCookies();
    await assert.rejects(
      () => toggleWatchlist(invalid),
      { message: "Mã định danh phim (movieId) không hợp lệ." }
    );
  }
});

test("watchlist: untrusted cookies accept only unique positive safe integers", async () => {
  resetMockCookies(new Map([["mh_watchlist", JSON.stringify([
    550, 550, "551", true, null, {}, [], -1, 0, 1.5, Number.MAX_SAFE_INTEGER + 1, 552,
  ])]]));
  assert.deepEqual(await getWatchlistIds(), [550, 552]);
});

test("watchlist: incoming cookies cannot bypass item and byte limits", async () => {
  const tooMany = Array.from({ length: 201 }, (_, i) => i + 1);
  resetMockCookies(new Map([["mh_watchlist", JSON.stringify(tooMany)]]));
  assert.equal((await getWatchlistIds()).length, 200);

  resetMockCookies(new Map([["mh_watchlist", `[550]${" ".repeat(3800)}`]]));
  assert.deepEqual(await getWatchlistIds(), []);
});

test("watchlist: byte limit includes cookie percent encoding", async () => {
  const initial = Array.from({ length: 199 }, (_, i) => 9007199254740000 + i);
  resetMockCookies(new Map([["mh_watchlist", JSON.stringify(initial)]]));
  const result = await toggleWatchlist(9007199254740500);
  assert.match(result.error, /dung lượng Cookie/);
  assert.deepEqual(await getWatchlistIds(), initial);
});

test("watchlist: toggleWatchlist adds and removes movie authentic state", async () => {
  resetMockCookies();
  const addResult = await toggleWatchlist(550);
  assert.equal(addResult.isSaved, true);
  assert.equal(await isMovieSaved(550), true);
  assert.deepEqual(await getWatchlistIds(), [550]);

  const removeResult = await toggleWatchlist(550);
  assert.equal(removeResult.isSaved, false);
  assert.equal(await isMovieSaved(550), false);
  assert.deepEqual(await getWatchlistIds(), []);
});

test("watchlist: capacity boundary allows 200 items, rejects 201st", async () => {
  const initial199 = Array.from({ length: 199 }, (_, i) => 1000 + i);
  resetMockCookies(new Map([["mh_watchlist", JSON.stringify(initial199)]]));

  // Add 200th item -> succeeds
  const res200 = await toggleWatchlist(9999);
  assert.equal(res200.isSaved, true);
  const currentIds = await getWatchlistIds();
  assert.equal(currentIds.length, 200);

  // Attempt to add 201st item -> rejected with capacity error
  const res201 = await toggleWatchlist(10000);
  assert.equal(res201.isSaved, false);
  assert.match(res201.error, /đạt giới hạn tối đa/);
  assert.equal((await getWatchlistIds()).length, 200);

  // Removing an existing movie must still work at full capacity.
  const removed = await toggleWatchlist(initial199[0]);
  assert.equal(removed.isSaved, false);
  assert.equal(removed.error, undefined);
  const remaining = await getWatchlistIds();
  assert.equal(remaining.length, 199);
  assert.ok(!remaining.includes(initial199[0]));
});

test("watchlist: 200 serialized IDs byte size safely under RFC 6265 limit", () => {
  const realistic200Ids = Array.from({ length: 200 }, (_, i) => 100000 + i);
  const serialized = JSON.stringify(realistic200Ids);
  const cookieByteLength = Buffer.byteLength(`mh_watchlist=${serialized}`, "utf8");
  assert.ok(cookieByteLength < 3800, `Byte size ${cookieByteLength} exceeds 3800 bytes threshold`);
});

test("watchlist: resilience to malformed or dirty cookie data", async () => {
  // Malformed JSON string
  resetMockCookies(new Map([["mh_watchlist", "malformed-json{]"]]));
  assert.deepEqual(await getWatchlistIds(), []);

  resetMockCookies(new Map([["mh_watchlist", JSON.stringify({ id: 550 })]]));
  assert.deepEqual(await getWatchlistIds(), []);

  // Dirty array containing non-positive and non-integer entries
  resetMockCookies(new Map([["mh_watchlist", JSON.stringify([101, "abc", null, -5, 202])]]));
  assert.deepEqual(await getWatchlistIds(), [101, 202]);

  // Clear all
  await clearAllWatchlist();
  assert.deepEqual(await getWatchlistIds(), []);
  assert.equal(getMockCookieMap().has("mh_watchlist"), false);
});
