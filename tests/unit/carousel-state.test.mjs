import test from "node:test";
import assert from "node:assert/strict";
import { getCarouselState } from "../../src/components/carouselState.js";

test("desativa navegação quando todos os itens cabem", () => {
  assert.deepEqual(getCarouselState(1120, 1120, 0), {
    hasOverflow: false,
    atStart: true,
    atEnd: true,
    maxScroll: 0,
  });
});

test("detecta overflow e limites com tolerância de dois pixels", () => {
  assert.deepEqual(getCarouselState(1500, 1000, 0), {
    hasOverflow: true,
    atStart: true,
    atEnd: false,
    maxScroll: 500,
  });
  assert.equal(getCarouselState(1500, 1000, 499).atEnd, true);
  assert.equal(getCarouselState(1001, 1000, 0).hasOverflow, false);
});
