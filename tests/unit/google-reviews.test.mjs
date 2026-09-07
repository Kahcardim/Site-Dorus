import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const reviewsPath = new URL("../../src/data/google-reviews.json", import.meta.url);
const payload = JSON.parse(await readFile(reviewsPath, "utf8"));

test("carrossel mantém exatamente 10 avaliações com texto de exibição", () => {
  assert.equal(payload.reviews.length, 10);
  for (const review of payload.reviews) {
    assert.equal(typeof review.displayText, "string");
    assert.ok(review.displayText.trim().length > 0);
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
  assert.equal(translated.length, 7);
  assert.ok(translated.every((review) => review.text && review.displayText));
});
