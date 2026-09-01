import { createServer } from "node:http";
import { mkdir, readFile, stat } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..", "dist");
const sitemap = await readFile(resolve(root, "sitemap.xml"), "utf8");
const routePaths = [
  ...sitemap.matchAll(
    /<loc>https:\/\/assistenciadorus\.com\.br([^<]+)<\/loc>/g,
  ),
].map((match) => match[1]);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
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
const browser = await chromium.launch({ headless: true });
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
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
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.route("https://script.google.com/**", (route) => route.abort());

  for (const path of routePaths) {
    const response = await page.goto(`http://127.0.0.1:4174${path}`, {
      waitUntil: "networkidle",
    });
    check(response?.status() === 200, `${path}: HTTP ${response?.status()}`);
    check(
      (await page.locator("main#conteudo").count()) === 1,
      `${path}: main ausente`,
    );
    check((await page.locator("h1").count()) === 1, `${path}: deve ter um h1`);
    check(
      (await page.locator('link[rel="canonical"]').getAttribute("href")) ===
        `https://assistenciadorus.com.br${path}`,
      `${path}: canonical incorreto`,
    );
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    check(overflow <= 1, `${path}: overflow horizontal de ${overflow}px`);
    check(
      (await page.locator('.whatsapp-float[href*="wa.me"]').count()) === 1,
      `${path}: WhatsApp flutuante ausente`,
    );
  }

  await page.goto("http://127.0.0.1:4174/", { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  check(
    (await page.locator(":focus").textContent())?.includes("Pular"),
    "Home: skip link não recebe foco",
  );
  check(
    (await page.locator("[data-cookie-banner]").count()) === 1,
    "Home: banner de cookies ausente",
  );
  await page.getByRole("button", { name: "Somente necessários" }).click();
  check(
    (await page.locator("[data-cookie-banner]").count()) === 0,
    "Home: banner de cookies não fecha",
  );
  await page.locator(".mobile-nav summary").click();
  check(
    (await page.locator(".mobile-nav").getAttribute("open")) !== null,
    "Home: menu móvel não abre",
  );

  await page.goto("http://127.0.0.1:4174/fale-conosco/", {
    waitUntil: "networkidle",
  });
  await page.evaluate(() => {
    window.open = (url) => {
      window.__dorusOpened = url;
    };
  });
  await page.locator("#nome").fill("Teste QA");
  await page.locator("#problema").fill("Teste de regressão");
  await page.getByRole("button", { name: /Continuar no WhatsApp/ }).click();
  check(
    (await page.evaluate(() => window.__dorusOpened || "")).includes(
      "wa.me/5511913573932",
    ),
    "Contato: não abriu WhatsApp",
  );

  await page.goto("http://127.0.0.1:4174/agendamento/", {
    waitUntil: "domcontentloaded",
  });
  await page.evaluate(() => {
    window.open = (url) => {
      window.__dorusOpened = url;
    };
  });
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const form = page.locator("[data-schedule-form]");
  await form.locator('[name="nome"]').fill("Teste QA");
  await form.locator('[name="telefone"]').fill("11999999999");
  await form.locator('[name="bairro"]').fill("Centro");
  await form.locator('[name="endereco"]').fill("Rua de teste, 1");
  await form
    .locator('[name="equipamento"]')
    .selectOption({ label: "Geladeira" });
  await form.locator('[name="data"]').fill(tomorrow);
  await form.locator('[name="periodo"]').selectOption({ index: 1 });
  await form.locator('[name="problema"]').fill("Não está gelando");
  await form.locator('[name="consentimento"]').check();
  await form.getByRole("button", { name: /WhatsApp/ }).click();
  check(
    (await page.evaluate(() => window.__dorusOpened || "")).includes(
      "wa.me/5511913573932",
    ),
    "Agenda: fallback do WhatsApp falhou",
  );

  const axeSource = await readFile(
    resolve(root, "..", "node_modules", "axe-core", "axe.min.js"),
    "utf8",
  );
  for (const path of [
    "/",
    "/servicos/",
    "/servicos/geladeiras/",
    "/agendamento/",
    "/fale-conosco/",
  ]) {
    await page.goto(`http://127.0.0.1:4174${path}`, {
      waitUntil: "networkidle",
    });
    await page.addScriptTag({ content: axeSource });
    const result = await page.evaluate(() =>
      axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      }),
    );
    const severe = result.violations.filter((violation) =>
      ["critical", "serious"].includes(violation.impact),
    );
    check(
      severe.length === 0,
      `${path}: axe ${severe.map((item) => item.id).join(", ")}`,
    );
  }

  const screenshots = resolve(root, "..", "test-results");
  await mkdir(screenshots, { recursive: true });
  await page.goto("http://127.0.0.1:4174/", { waitUntil: "networkidle" });
  await loadLazyImages(page);
  await page.screenshot({
    path: resolve(screenshots, "home-mobile.png"),
    fullPage: true,
  });
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const desktop = await desktopContext.newPage();
  await desktop.goto("http://127.0.0.1:4174/", { waitUntil: "networkidle" });
  const desktopConsent = desktop.getByRole("button", {
    name: "Somente necessários",
  });
  if (await desktopConsent.isVisible()) await desktopConsent.click();
  await loadLazyImages(desktop);
  await desktop.screenshot({
    path: resolve(screenshots, "home-desktop.png"),
    fullPage: true,
  });
  await desktop.close();
  await desktopContext.close();

  if (failures.length)
    throw new Error(`Regressão falhou:\n- ${failures.join("\n- ")}`);
  console.log(
    "OK: 21 rotas, navegação, formulários, WhatsApp, responsividade e acessibilidade WCAG validados.",
  );
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
