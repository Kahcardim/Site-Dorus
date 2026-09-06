import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(
  process.env.DORUS_CONTRACT_ROOT || resolve(import.meta.dirname, "../.."),
);

test("menu digital usa os tokens centrais da identidade oficial", async () => {
  const css = (
    await readFile(resolve(root, "public/links/styles.css"), "utf8")
  ).toLowerCase();
  for (const token of [
    "#0d3b8e",
    "#1557c0",
    "#102037",
    "#223042",
    "#5e7087",
    "#f5f9ff",
  ])
    assert.match(css, new RegExp(token), `token ausente: ${token}`);
  for (const legacy of [
    "#075ab7",
    "#0875d6",
    "#073f86",
    "#08213a",
    "#10263c",
    "#607487",
  ])
    assert.doesNotMatch(css, new RegExp(legacy), `token legado: ${legacy}`);
});

test("theme-color do menu digital usa o azul oficial", async () => {
  const html = await readFile(resolve(root, "public/links/index.html"), "utf8");
  assert.match(html, /name="theme-color" content="#0D3B8E"/);
});
