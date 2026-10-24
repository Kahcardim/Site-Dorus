import test from "node:test";
import assert from "node:assert/strict";
import { validPhone, validateField } from "../../src/formValidation.js";
test("telefones brasileiros com DDD, pontuação e código do país", () => {
  for (const value of [
    "11999999999",
    "(11) 99999-9999",
    "+55 (11) 99999-9999",
    "1123456789",
    "(21) 2345-6789",
  ])
    assert.ok(validPhone(value), value);
  for (const value of [
    "",
    "          ",
    "abcdefghij",
    "abc11999999999",
    "0000000000",
    "00999999999",
    "119999",
    "1199999999999999",
  ])
    assert.equal(validPhone(value), false, value);
});
test("texto obrigatório não aceita só espaços e recupera validade após correção", () => {
  const field = {
    type: "text",
    name: "nome",
    required: true,
    value: "  ",
    setCustomValidity(message) {
      this.error = message;
    },
  };
  validateField(field);
  assert.ok(field.error);
  field.value = " João da Silva ";
  validateField(field);
  assert.equal(field.error, "");
});


test("agenda rejeita sábado e domingo e recupera validade na segunda-feira", () => {
  const field = {type: "date", name: "data", required: true, value: "2026-10-24", setCustomValidity(message) { this.error = message; }};
  validateField(field); assert.match(field.error, /sábados e domingos/);
  field.value = "2026-10-25"; validateField(field); assert.match(field.error, /sábados e domingos/);
  field.value = "2026-10-26"; validateField(field); assert.equal(field.error, "");
});
