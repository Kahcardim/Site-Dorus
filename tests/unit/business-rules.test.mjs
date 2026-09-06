import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(
  process.env.DORUS_CONTRACT_ROOT || resolve(import.meta.dirname, "../.."),
);
const files = async (...paths) =>
  Promise.all(paths.map((path) => readFile(resolve(root, path), "utf8")));

const commercialTerms = [
  "deslocamento e diagnóstico",
  "valor será informado antes da confirmação do agendamento",
  "será abatido do serviço",
  "valor pode variar conforme a localização",
];

test("fallback React e agenda integrada preservam as condições comerciais", async () => {
  const [react, integration] = await files(
    "src/pages/InstitutionalPages.jsx",
    "public/integrations/calendar.js",
  );
  for (const term of commercialTerms) {
    assert.match(react, new RegExp(term, "i"), `React sem: ${term}`);
    assert.match(integration, new RegExp(term, "i"), `Integração sem: ${term}`);
  }
});

test("períodos oficiais permanecem iguais no frontend, integração e backend", async () => {
  const [react, integration, backend, docs] = await files(
    "src/pages/InstitutionalPages.jsx",
    "public/integrations/calendar.js",
    "integrations/google-calendar/Code.gs",
    "docs/TESTES.md",
  );
  for (const source of [react, integration, backend, docs]) {
    assert.match(source, /8h[^\n]{0,12}13h/);
    assert.match(source, /13h[^\n]{0,12}18h/);
    assert.match(source, /8h[^\n]{0,12}18h/);
    assert.doesNotMatch(source, /8h[^\n]{0,12}12h|13h[^\n]{0,12}17h/);
  }
});

test("campos High têm limites equivalentes ao backend", async () => {
  const [react, backend] = await files(
    "src/pages/InstitutionalPages.jsx",
    "integrations/google-calendar/Code.gs",
  );
  for (const limit of [100, 120, 250, 1500]) {
    assert.match(react, new RegExp(`maxLength=\\"${limit}\\"`));
    assert.match(backend, new RegExp(`length > ${limit}`));
  }
  assert.match(react, /name="telefone"[\s\S]{0,220}pattern=/);
  assert.match(react, /name="data"[\s\S]{0,180}max=\{maxDate\}/);
  for (const consent of ["ciencia_visita", "consentimento"])
    assert.match(
      react,
      new RegExp(`name=\\"${consent}\\"[^>]+required`),
      `${consent} precisa ser obrigatório`,
    );
});
