import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildManifest } from "../../scripts/build-manifest.mjs";

async function fixture(t, hash, revision) {
  const root = await mkdtemp(join(tmpdir(), "dorus-manifest-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "assets"));
  await writeFile(join(root, "index.html"), '<meta name="dorus-revision" content="' + revision + '"><script src="/assets/app-' + hash + '.js"></script><h1>Dorus</h1>');
  await writeFile(join(root, "assets/app-" + hash + ".js"), 'console.log("ready");\n//# sourceMappingURL=app-' + hash + '.js.map');
  return root;
}
test("ignora revisão, hashes de nomes e mapas; preserva igualdade do produto", async (t) => {
  const before = await fixture(t, "AAAAAAAA", "before");
  const after = await fixture(t, "BBBBBBBB", "after");
  await writeFile(join(after, "assets/app-BBBBBBBB.js.map"), "{}");
  await writeFile(join(after, "build-fingerprint.json"), "{}");
  assert.deepEqual(await buildManifest(before), await buildManifest(after));
});
test("detecta mudança real no JavaScript", async (t) => {
  const root = await fixture(t, "AAAAAAAA", "same");
  const before = await buildManifest(root);
  await writeFile(join(root, "assets/app-AAAAAAAA.js"), 'console.log("changed");');
  assert.notEqual(before.sha256, (await buildManifest(root)).sha256);
});
test("detecta alteração de conteúdo e inclusão de arquivo", async (t) => {
  const root = await fixture(t, "AAAAAAAA", "same");
  const before = await buildManifest(root);
  await writeFile(join(root, "index.html"), "<h1>Outro conteúdo</h1>");
  assert.notEqual(before.sha256, (await buildManifest(root)).sha256);
  const middle = await buildManifest(root);
  await writeFile(join(root, "new.txt"), "new");
  assert.notEqual(middle.sha256, (await buildManifest(root)).sha256);
});
