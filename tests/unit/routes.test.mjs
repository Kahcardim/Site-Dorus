import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "vite";

const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});
const { findRoute, normalizePath, routes } =
  await vite.ssrLoadModule("/src/routes.jsx");

test.after(async () => vite.close());

test("mantém as 21 rotas indexáveis e a página 404", () => {
  assert.equal(routes.filter((route) => route.index).length, 21);
  assert.equal(routes.at(-1).path, "/404.html");
});

test("normaliza URLs sem barra final", () => {
  assert.equal(normalizePath("/servicos"), "/servicos/");
  assert.equal(findRoute("/servicos/geladeiras").path, "/servicos/geladeiras/");
  assert.equal(
    findRoute("/servicos/geladeiras/index.html?origem=teste").path,
    "/servicos/geladeiras/",
  );
  assert.equal(findRoute("/index.html?origem=teste").path, "/");
});

test("cada rota indexável possui metadados essenciais", () => {
  for (const route of routes.filter((item) => item.index)) {
    assert.ok(route.title.length > 15, route.path);
    assert.ok(route.description.length > 40, route.path);
    assert.ok(route.image.startsWith("/assets/"), route.path);
  }
});
