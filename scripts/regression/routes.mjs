
export async function run({ browser, routePaths, check, failures }) {
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

    const finalCta = page.locator(".final-cta .actions");
    if ((await finalCta.count()) > 0) {
      check(
        (await finalCta.locator('a[href*="wa.me"]').count()) === 1 &&
          (await finalCta.locator('a[href="/agendamento/"]').count()) === 0 &&
          (await finalCta.locator("a").count()) === 1,
        `${path}: CTA final deve conter somente WhatsApp`,
      );
    }
  }

  return { context, page };
}
