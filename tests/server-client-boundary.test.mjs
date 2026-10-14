import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("client sliders receive rendered cards instead of importing MovieCard", () => {
  for (const file of [
    "components/client/MovieRow.tsx",
    "components/client/SimilarMoviesSlider.tsx",
  ]) {
    const source = readFileSync(file, "utf8");
    assert.doesNotMatch(source, /import\s+MovieCard\s+from/);
  }
});
