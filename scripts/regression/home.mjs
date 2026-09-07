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

  const structuralOrder = await page.evaluate(() => {
    const services = document.querySelector(".home-services-section");
    const reviews = document.querySelector("#avaliacoes");
    const brands = document.querySelector(".brands-section");
    const flow = document.querySelector(".home-flow-section");
    const guides = document.querySelector(".home-guides-section");
    const faq = document.querySelector(".faq-section") ||
      Array.from(document.querySelectorAll("main > section")).find((section) =>
        section.textContent.includes("Perguntas frequentes"),
      );
    const finalCta = document.querySelector(".final-cta");
    const all = Array.from(document.querySelectorAll("main > section"));
    const index = (element) => all.indexOf(element);
    return {
      services: index(services),
      reviews: index(reviews),
      brands: index(brands),
      flow: index(flow),
      guides: index(guides),
      faq: index(faq),
      finalCta: index(finalCta),
    };
  });
  check(
    structuralOrder.services >= 0 &&
      structuralOrder.services < structuralOrder.reviews &&
      structuralOrder.reviews < structuralOrder.brands &&
      structuralOrder.brands < structuralOrder.flow &&
      structuralOrder.flow < structuralOrder.guides &&
      structuralOrder.guides < structuralOrder.faq &&
      structuralOrder.faq < structuralOrder.finalCta,
    `Home: ordem estrutural divergente ${JSON.stringify(structuralOrder)}`,
  );

  check(
    (await page.getByText("Outros equipamentos", { exact: true }).count()) === 0,
    "Home: bloco redundante Outros equipamentos continua presente",
  );
  check(
    (await page.locator(".home-flow-section .step").count()) === 4,
    "Home: fluxo unificado deve possuir quatro etapas",
  );
  check(
    (await page.locator("main .trust-grid").count()) === 0,
    "Home: fluxo antigo Atendimento local continua duplicado",
  );
  check(
    (await page.locator(".home-guides-section").getAttribute("data-featured-criterion")) ===
      "editorial-priority",
    "Home: critério dos guias em destaque não está formalizado",
  );
  check(
    (await page.locator(".home-guides-section .card").count()) === 3,
    "Home: seleção de guias em destaque divergente",
  );

  await loadLazyImages(page);
  const bosch = page.locator('.brands-section img[alt="Bosch"]');
  check((await bosch.count()) === 1, "Home: Bosch continua sem ativo visual");
  if ((await bosch.count()) === 1) {
    check(
      await bosch.evaluate((image) => image.complete && image.naturalWidth > 0),
      "Home: ativo visual da Bosch não carregou",
    );
  }

  check(
    (await page.locator("main .actions").count()) === 2 &&
      (await page.locator(".hero .actions > a").count()) === 2 &&
      (await page.locator(".final-cta .actions > a").count()) === 2,
    "Home: pares completos de CTA devem existir somente no Hero e CTA final",
  );

  const ratingContract = await page.evaluate(() => ({
    heroRating: document.querySelector("[data-google-rating]")?.textContent?.trim(),
    finalRating: document.querySelector("[data-final-google-rating]")?.textContent?.trim(),
    heroCount: document.querySelector("[data-google-review-count]")?.textContent?.trim(),
    finalCount: document.querySelector("[data-final-google-review-count]")?.textContent?.trim(),
  }));
  check(
    Boolean(ratingContract.heroRating) &&
      ratingContract.heroRating === ratingContract.finalRating &&
      ratingContract.heroCount === ratingContract.finalCount,
    `Home: selo de avaliação final divergente ${JSON.stringify(ratingContract)}`,
  );

  check(
    (await page.locator('a[aria-current="page"][href="/"]').count()) >= 1,
    "Home: item atual não está identificado semanticamente no menu",
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
