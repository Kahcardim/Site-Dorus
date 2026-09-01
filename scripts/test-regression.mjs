import { createServer } from "node:http";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
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
const accessibility = [];
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
  const noScript = await browser.newContext({ javaScriptEnabled: false });
  const crawlPage = await noScript.newPage();
  for (const path of routePaths) {
    await crawlPage.goto(`http://127.0.0.1:4174${path}`);
    check(
      (await crawlPage.locator("main h1").count()) === 1,
      `${path}: conteúdo depende de JavaScript`,
    );
    check(
      (await crawlPage.locator("main").innerText()).length > 150,
      `${path}: HTML sem conteúdo suficiente`,
    );
    check(
      (await crawlPage.locator('a[href^="/servicos/"]').count()) > 0,
      `${path}: links não rastreáveis`,
    );
  }
  await noScript.close();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => failures.push(`Runtime: ${error.message}`));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /hydration|Minified React error|didn't match/i.test(message.text())
    )
      failures.push(message.text());
  });
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

  for (const path of ["/", "/servicos/"]) {
    await page.goto(`http://127.0.0.1:4174${path}`, {
      waitUntil: "networkidle",
    });
    const brands = page.locator(".brand-list");
    check(
      (await brands.locator(".brand-logo").count()) === 13,
      `${path}: marcas ausentes do carrossel`,
    );
    await brands.scrollIntoViewIfNeeded();
    await page
      .getByRole("button", { name: "Próximo: Marcas atendidas" })
      .click();
    await page.waitForTimeout(600);
    const next = await brands.evaluate((element) => element.scrollLeft);
    check(next > 0, `${path}: seta do carrossel não avança`);
    await brands.focus();
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(600);
    check(
      (await brands.evaluate((element) => element.scrollLeft)) < next,
      `${path}: teclado do carrossel não retorna`,
    );
    check(
      (await page
        .getByRole("button", { name: /Retomar carrossel de marcas/ })
        .getAttribute("aria-pressed")) === "true",
      `${path}: interação não pausou o carrossel`,
    );
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://127.0.0.1:4174/", { waitUntil: "networkidle" });
  const reducedTrack = page.locator(".brand-list");
  await reducedTrack.scrollIntoViewIfNeeded();
  const reducedStart = await reducedTrack.evaluate(
    (element) => element.scrollLeft,
  );
  await page.waitForTimeout(3800);
  check(
    (await reducedTrack.evaluate((element) => element.scrollLeft)) ===
      reducedStart,
    "Carrossel não respeita movimento reduzido",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("http://127.0.0.1:4174/", { waitUntil: "networkidle" });
  await page.locator(".brand-list").scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(3800);
  check(
    (await page
      .locator(".brand-list")
      .evaluate((element) => element.scrollLeft)) > 0,
    "Carrossel não avança automaticamente",
  );
  await page
    .getByRole("button", { name: /Pausar carrossel de marcas/ })
    .click();
  await page.mouse.move(0, 0);
  await page.locator(".brand-list").evaluate((element) => element.blur());
  const stopped = await page
    .locator(".brand-list")
    .evaluate((element) => element.scrollLeft);
  await page.waitForTimeout(3800);
  check(
    (await page
      .locator(".brand-list")
      .evaluate((element) => element.scrollLeft)) === stopped,
    "Pausa do carrossel não foi mantida",
  );

  await page.goto("http://127.0.0.1:4174/fale-conosco/", {
    waitUntil: "networkidle",
  });
  check(
    (await page.locator(".contact-message").getAttribute("open")) === null,
    "Contato: formulário deve ser opcional e recolhido inicialmente",
  );
  check(
    await page.locator('.contact-hero a[href^="tel:"]').isVisible(),
    "Contato: ligação direta ausente",
  );
  await page.locator(".contact-message > summary").click();
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
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of routePaths) {
      await page.goto(`http://127.0.0.1:4174${path}`, {
        waitUntil: "networkidle",
      });
      if (path === "/fale-conosco/")
        await page.locator(".contact-message > summary").click();
      const visualErrors = await page.evaluate(() => {
        const errors = [];
        for (const image of document.querySelectorAll(
          ".service-card-media img",
        )) {
          const box = image.getBoundingClientRect();
          const frame = image.parentElement.getBoundingClientRect();
          if (
            Math.abs(box.width - frame.width) > 2 ||
            Math.abs(box.height - frame.height) > 2
          )
            errors.push("imagem não preenche moldura");
          if (Math.abs(frame.width - frame.height) > 2)
            errors.push("moldura distorce proporção quadrada");
        }
        for (const heading of document.querySelectorAll(
          ".internal h1, .section-head",
        )) {
          if (getComputedStyle(heading).textAlign !== "center")
            errors.push("cabeçalho descentralizado");
        }
        for (const panel of document.querySelectorAll(".professional-cta")) {
          if (
            !panel.querySelector(".cta-trust")?.textContent.includes("90 dias")
          )
            errors.push("CTA sem garantia");
          if (
            getComputedStyle(panel.querySelector(".cta-copy")).textAlign !==
            "center"
          )
            errors.push("CTA descentralizado");
          const box = panel.getBoundingClientRect();
          if (Math.abs(box.left + box.width / 2 - innerWidth / 2) > 2)
            errors.push("painel CTA fora do centro");
        }
        if (
          !document
            .querySelector(".footer-credit")
            ?.textContent.includes("Kauan Cardim")
        )
          errors.push("rodapé sem autor");
        return errors;
      });
      check(
        visualErrors.length === 0,
        `${path} (${width}px): ${visualErrors.join(", ")}`,
      );
      await page.addScriptTag({ content: axeSource });
      const result = await page.evaluate(() =>
        axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
        }),
      );
      const severe = result.violations;
      const clippedImages = await page
        .locator(".service-card-media img")
        .evaluateAll(
          (images) =>
            images.filter((image) => {
              const imageBox = image.getBoundingClientRect();
              const frame = image.parentElement.getBoundingClientRect();
              return (
                imageBox.top < frame.top - 1 ||
                imageBox.bottom > frame.bottom + 1 ||
                imageBox.left < frame.left - 1 ||
                imageBox.right > frame.right + 1
              );
            }).length,
        );
      check(
        clippedImages === 0,
        `${path} (${width}px): imagem de serviço fora da moldura`,
      );
      accessibility.push({ path, width, violations: severe });
      check(
        severe.length === 0,
        `${path} (${width}px): axe ${severe.map((item) => item.id).join(", ")}`,
      );
      check(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `${path} (${width}px): overflow`,
      );
    }
  }

  const screenshots = resolve(root, "..", "test-results");
  await mkdir(screenshots, { recursive: true });
  await writeFile(
    resolve(screenshots, "accessibility.json"),
    JSON.stringify(accessibility, null, 2),
  );
  await page.setViewportSize({ width: 390, height: 844 });
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
  for (const width of [390, 1440]) {
    await desktop.setViewportSize({ width, height: 1000 });
    for (const [name, path] of Object.entries({
      sobre: "/sobre/",
      servicos: "/servicos/",
      guias: "/curiosidades/",
      geladeira: "/servicos/geladeiras/",
      guia: "/curiosidades/geladeira-nao-gela/",
      contato: "/fale-conosco/",
      agendamento: "/agendamento/",
    })) {
      await desktop.goto(`http://127.0.0.1:4174${path}`, {
        waitUntil: "networkidle",
      });
      await loadLazyImages(desktop);
      await desktop.screenshot({
        path: resolve(screenshots, `${name}-${width}.png`),
        fullPage: true,
      });
    }
  }
  await desktop.close();
  await desktopContext.close();

  if (failures.length)
    throw new Error(`Regressão falhou:\n- ${failures.join("\n- ")}`);
  console.log(
    "OK: 21 rotas sem JS, navegação, formulários e WhatsApp; 42 verificações axe WCAG A/AA sem violações automáticas. Validação manual ainda complementar.",
  );
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
