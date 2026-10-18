import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const reviewsPath = new URL("../../src/data/google-reviews.json", import.meta.url);
const payload = JSON.parse(await readFile(reviewsPath, "utf8"));

test("seleção pública preserva entre 3 e 10 avaliações reais com texto", () => {
  assert.ok(payload.reviews.length >= 3 && payload.reviews.length <= 10);
  assert.equal(new Set(payload.reviews.map(r => `${r.author}:${r.text}`)).size, payload.reviews.length);
  for (const review of payload.reviews) {
    assert.equal(typeof review.text, "string");
    assert.ok((review.displayText || review.text).trim().length > 0);
  }
});

test("avaliações exibidas não usam os trechos em inglês recebidos do Google", () => {
  const display = payload.reviews.map((review) => review.displayText).join("\n");
  for (const englishFragment of [
    "Speaking about his service",
    "Exemplary technical knowledge",
    "Impeccable work",
    "Excellent service",
    "Excellent professional",
    "Wonderful service",
    "Highly competent professional",
  ]) {
    assert.doesNotMatch(display, new RegExp(englishFragment, "i"));
  }
});

test("texto original permanece preservado para rastreabilidade", () => {
  const translated = payload.reviews.filter(
    (review) => review.displayText !== review.text,
  );
  assert.ok(translated.length > 0);
  assert.ok(translated.every((review) => review.text && review.displayText));
});
