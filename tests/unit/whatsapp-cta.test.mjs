import test from "node:test";
import assert from "node:assert/strict";
import { WHATSAPP_CTA_MESSAGE, WHATSAPP_CTA_URL } from "../../src/data/whatsapp-copy.js";

test("CTA do WhatsApp abre com mensagem comercial preenchida", () => {
  const url = new URL(WHATSAPP_CTA_URL);
  assert.equal(url.hostname, "wa.me");
  assert.equal(url.pathname, "/5511913573932");
  assert.equal(url.searchParams.get("text"), WHATSAPP_CTA_MESSAGE);
  assert.match(WHATSAPP_CTA_MESSAGE, /Vim pelo site da D’orus/);
  assert.match(WHATSAPP_CTA_MESSAGE, /assistência técnica/);
  assert.match(WHATSAPP_CTA_MESSAGE, /disponibilidade de atendimento/);
  assert.ok(WHATSAPP_CTA_MESSAGE.length > 80, "A mensagem não pode ficar vazia ou genérica demais");
});
