import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

test("lab starter patch round-trips the current exercise state without modifying the checkout", async (t) => {
  const source = await readFile(new URL("../app/movie/[id]/page.tsx", import.meta.url));
  const patch = fileURLToPath(new URL("../labs/streaming-cache/starter.patch", import.meta.url));
  const directory = await mkdtemp(join(tmpdir(), "moviehub-lab-patch-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const page = join(directory, "app", "movie", "[id]", "page.tsx");
  await mkdir(join(directory, "app", "movie", "[id]"), { recursive: true });
  await writeFile(page, source);

  const check = spawnSync("git", ["apply", "--check", patch], { cwd: directory, encoding: "utf8" });
  assert.ifError(check.error);
  // Support both the intentionally blocked starter and the completed solution.
  const directions = check.status === 0 ? [[], ["--reverse"]] : [["--reverse"], []];
  for (const direction of directions) {
    execFileSync("git", ["apply", ...direction, "--check", patch], { cwd: directory, stdio: "pipe" });
    execFileSync("git", ["apply", ...direction, patch], { cwd: directory, stdio: "pipe" });
  }
  assert.deepEqual(await readFile(page), source);
});
