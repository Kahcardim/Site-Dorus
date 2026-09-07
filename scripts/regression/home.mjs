
export async function run({ browser, page, root, routePaths, accessibilityPaths, check, failures, accessibility, loadLazyImages }) {
  await page.goto("http://127.0.0.1:4174/", { waitUntil: "networkidle" });
  const chunks = await page.evaluate(() =>
    performance.getEntriesByType("resource").map((entry) => entry.name),
  );
  check(
    !chunks.some((url) =>
      /\/(InstitutionalPages|ServicePages|GuidePages)-/.test(url),
    ),
    "Home: carregou código de páginas não visitadas",
  );
  check(
    chunks.filter((url) => url.includes("/google-rating.json")).length === 1,
    "Home: requisições duplicadas para a avaliação",
  );
  check(
    await page.locator(".hero-rating [data-google-rating]").isVisible(),
    "Home: nota ausente do topo",
  );
  check(
    (await page.locator("#avaliacoes .review-card").count()) === 3,
    "Home: depoimentos ausentes",
  );
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

}
