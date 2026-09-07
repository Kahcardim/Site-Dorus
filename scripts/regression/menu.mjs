
export async function run({ browser, page, root, routePaths, accessibilityPaths, check, failures, accessibility, loadLazyImages }) {
  const menuResponse = await page.goto("http://127.0.0.1:4174/links/", {
    waitUntil: "networkidle",
  });
  check(menuResponse?.status() === 200, "Menu digital: rota indisponível");
  check(
    (await page.locator("main h1").count()) === 1,
    "Menu digital: H1 ausente",
  );
  check(
    (await page
      .locator("main h1")
      .evaluate((heading) => getComputedStyle(heading).textAlign)) === "center",
    "Menu digital: título principal descentralizado",
  );
  check(
    (await page
      .locator('.primary-actions a[href*="wa.me/5511913573932"]')
      .count()) === 1,
    "Menu digital: CTA principal não abre o WhatsApp oficial",
  );
  check(
    (await page
      .locator('.primary-actions a[href*="utm_campaign=menu_digital"]')
      .count()) >= 1,
    "Menu digital: origem do lead não foi preservada",
  );
  check(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    "Menu digital: overflow horizontal",
  );

}
