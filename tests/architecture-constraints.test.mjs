import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("architecture: FilterBar implements all 5 independent criteria", () => {
  const content = readFileSync("components/client/FilterBar.tsx", "utf8");
  const criteria = ["type", "genre", "country", "year", "sortBy"];
  for (const crit of criteria) {
    assert.match(content, new RegExp(`updateFilter\\("${crit}"`), `Missing criterion: ${crit}`);
  }
});

test("architecture: services/client.ts contains no 'as any' type bypasses", () => {
  const content = readFileSync("services/client.ts", "utf8");
  assert.doesNotMatch(content, /as\s+any/);
});
