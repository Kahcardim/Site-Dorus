export async function run({ browser, check }) {
  for (const width of [360, 390, 412, 1366]) {
    const context = await browser.newContext({
      viewport: { width, height: 844 },
    });
    const page = await context.newPage();
    await page.route("https://script.google.com/**", (route) => route.abort());
    await page.addInitScript(() => {
      window.__releaseCLS = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          if (!entry.hadRecentInput) window.__releaseCLS += entry.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    let ratingRequests = 0;
    if (width === 390) {
      await page.clock.install();
      await page.route("**/google-rating.json?*", (route) =>
        route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({ rating: 4.9, reviews: 52 + ++ratingRequests }),
        }),
      );
    }
    await page.goto("http://127.0.0.1:4174/", { waitUntil: "networkidle" });
    if (width === 390) {
      await page.waitForFunction(
        () =>
          document.querySelector("[data-google-review-count]")?.textContent ===
          "53",
      );
      check(
        ratingRequests === 1,
        "Avaliações: carga inicial deve ser compartilhada",
      );
      await page.clock.fastForward(5 * 60 * 1000);
      await page.waitForFunction(
        () =>
          document.querySelector("[data-google-review-count]")?.textContent ===
          "54",
      );
      check(
        ratingRequests === 2,
        "Avaliações: atualização periódica deve ser compartilhada",
      );
    }
    check(
      await page.locator('.hero .actions a[href="/fale-conosco/"]').isVisible(),
      `${width}px: contato secundário ausente da home`,
    );
    check(
      await page.evaluate(() => window.__releaseCLS <= 0.1),
      `${width}px: cookies causaram deslocamento de layout`,
    );
    const cookie = page.locator("[data-cookie-banner]");
    await cookie.waitFor();
    if (width <= 760) {
      const layout = await cookie.evaluate((e) => ({
        position: getComputedStyle(e).position,
        height: e.getBoundingClientRect().height,
      }));
      check(
        layout.position !== "fixed" && layout.height <= 220,
        `${width}px: aviso de cookies deve ser compacto e participar do fluxo`,
      );
    }
    await page
      .getByRole("button", { name: "Somente necessários", exact: true })
      .click();
    for (const path of ["/sobre/", "/fale-conosco/", "/agendamento/"]) {
      await page.goto(`http://127.0.0.1:4174${path}`, {
        waitUntil: "networkidle",
      });
      check(
        (await page
          .locator('nav[aria-label="Caminho de navegação"]')
          .count()) === 0,
        `${width}px ${path}: faixa redundante permanece`,
      );
      check(
        (await page.locator(".journey-switch").count()) === 0,
        `${width}px ${path}: seletor redundante permanece`,
      );
      check(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `${width}px ${path}: overflow horizontal`,
      );
    }
    await page.goto("http://127.0.0.1:4174/servicos/geladeiras/", {
      waitUntil: "networkidle",
    });
    check(
      await page
        .getByRole("navigation", { name: "Caminho de navegação" })
        .isVisible(),
      `${width}px: trilha do serviço detalhado deve permanecer`,
    );
    await context.close();
  }
}
