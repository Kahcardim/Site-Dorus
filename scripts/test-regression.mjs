import { run as runIntegratedAgenda } from "./regression/agenda-integrated.mjs";
import { run as runRoutes } from "./regression/routes.mjs";
import { run as runMenu } from "./regression/menu.mjs";
import { run as runHome } from "./regression/home.mjs";
import { run as runCarousels } from "./regression/carousels.mjs";
import { run as runForms } from "./regression/forms.mjs";
import { run as runAccessibility } from "./regression/accessibility.mjs";
import { run as runVisual } from "./regression/visual.mjs";
import { createServer } from "node:http";
import { readFile, stat, writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..", "dist");
const sitemap = await readFile(resolve(root, "sitemap.xml"), "utf8");
const routePaths = [
  ...sitemap.matchAll(
    /<loc>https:\/\/assistenciadorus\.com\.br([^<]+)<\/loc>/g,
  ),
].map((match) => match[1]);
const accessibilityPaths = [
  "/",
  "/servicos/",
  "/servicos/geladeiras/",
  "/curiosidades/",
  "/curiosidades/geladeira-nao-gela/",
  "/sobre/",
  "/fale-conosco/",
  "/agendamento/",
  "/privacidade/",
  "/links/",
];
const startedAt = Date.now();
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".xml": "application/xml; charset=utf-8",
};

const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, "http://127.0.0.1").pathname;
    let file = resolve(root, `.${pathname}`);
    if ((await stat(file).catch(() => null))?.isDirectory())
      file = resolve(file, "index.html");
    const body = await readFile(file);
    response
      .writeHead(200, {
        "content-type": mime[extname(file)] || "application/octet-stream",
      })
      .end(body);
  } catch {
    response.writeHead(404).end("Not found");
  }
});

await new Promise((done) => server.listen(4174, "127.0.0.1", done));
let browser;
const failures = [];
const groups = [];
let activeGroup = "runtime";
const accessibility = [];
const check = (condition, message) => {
  if (!condition) failures.push(`[${activeGroup}] ${message}`);
};

async function loadLazyImages(targetPage) {
  const height = await targetPage.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 700) {
    await targetPage.evaluate((position) => window.scrollTo(0, position), y);
    await targetPage.waitForTimeout(40);
  }
  await targetPage.evaluate(() => window.scrollTo(0, 0));
  await targetPage.waitForTimeout(200);
}

try {
  browser = await chromium.launch({ headless: true });
  const shared = { browser, root, routePaths, accessibilityPaths, check, failures, accessibility, loadLazyImages };
  const runGroup = async (name, run) => {
    activeGroup = name;
    const started = Date.now();
    const before = failures.length;
    try { return await run(shared); }
    finally {
      const result = { name, elapsedSeconds: (Date.now() - started) / 1000, failures: failures.length - before };
      groups.push(result);
      console.log(JSON.stringify(result));
    }
  };
  const { context, page } = await runGroup("routes", runRoutes);
  Object.assign(shared, { context, page });

  await runGroup("menu", runMenu);

  await runGroup("home", runHome);

  await runGroup("carousels", runCarousels);

  await runGroup("forms", runForms);
  await runGroup("agenda-integrated", runIntegratedAgenda);

  await runGroup("accessibility", runAccessibility);

  const screenshots = await runGroup("visual", runVisual);

  const summary = {
    groups,
    routeCrawl: routePaths.length,
    accessibilityScenarios: accessibility.length,
    accessibilityTemplates: accessibilityPaths,
    elapsedSeconds: Number(((Date.now() - startedAt) / 1000).toFixed(2)),
    failures: failures.length,
  };
  await writeFile(
    resolve(screenshots, "regression-summary.json"),
    JSON.stringify(summary, null, 2),
  );
  if (failures.length)
    throw new Error(`Regressão falhou:\n- ${failures.join("\n- ")}`);
  console.log(
    `OK: ${routePaths.length} rotas sem JS e com hidratação; Menu Digital, carrosséis, formulários e WhatsApp; ${accessibility.length} cenários axe WCAG A/AA representando 10 templates. ${summary.elapsedSeconds}s. Validação manual ainda complementar.`,
  );
} finally {
  await browser?.close();
  await new Promise((done) => server.close(done));
}
