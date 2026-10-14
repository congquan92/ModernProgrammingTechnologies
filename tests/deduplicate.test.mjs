import assert from "node:assert/strict";
import { test } from "node:test";
import { deduplicateMovies } from "../services/client.ts";

test("deduplicateMovies retains the first movie for each positive ID", () => {
  const movies = [
    { id: 5, title: "first" },
    { id: 2, title: "second" },
    { id: 5, title: "duplicate" },
    { id: 0, title: "invalid" },
  ];
  assert.deepEqual(deduplicateMovies(movies), [movies[0], movies[1]]);
});
