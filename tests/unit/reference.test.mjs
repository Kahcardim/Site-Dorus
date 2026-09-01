import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

const root = resolve(import.meta.dirname, "../..");
const manifest = JSON.parse(await readFile(resolve(root, "tests/fixtures/legacy-manifest.json"), "utf8"));
test("mantém intacta a base de referência usada na auditoria", async () => {
  for (const [path, expected] of Object.entries(manifest.files)) {
    const body = await readFile(resolve(root, "tests/fixtures/legacy", path));
    const actual = createHash("sha1").update("blob " + body.length + "\0").update(body).digest("hex");
    assert.equal(actual, expected, path);
  }
});
