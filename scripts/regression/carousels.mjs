
export async function run({ browser, page, root, routePaths, accessibilityPaths, check, failures, accessibility, loadLazyImages }) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:4174/", { waitUntil: "networkidle" });
  await page.locator("#avaliacoes").scrollIntoViewIfNeeded();
  const reviewTrack = page.locator("#avaliacoes .review-carousel");
  const reviewPrevious = page.getByRole("button", {
    name: "Anterior: Avaliações de clientes",
  });
  const reviewNext = page.getByRole("button", {
    name: "Próximo: Avaliações de clientes",
  });
  await page.waitForFunction(() => {
    const track = document.querySelector("#avaliacoes .review-carousel");
    const next = document.querySelector('#avaliacoes button[aria-label="Próximo: Avaliações de clientes"]');
    return track && next && track.scrollWidth > track.clientWidth + 2 && !next.disabled;
  });
  check(
    await reviewNext.isEnabled(),
    "QA-001: dez avaliações devem ativar navegação no desktop",
  );
  check(
    (
      await page.locator("#avaliacoes .carousel-toolbar p").innerText()
    ).includes("Use as setas"),
    "QA-001: estado com rolagem não foi comunicado",
  );
  const reviewStart = await reviewTrack.evaluate((element) => element.scrollLeft);
  await reviewNext.click();
  await page.waitForTimeout(600);
  const reviewDesktopNext = await reviewTrack.evaluate((element) => element.scrollLeft);
  check(
    reviewDesktopNext > reviewStart,
    "QA-001: seta das avaliações não avança no desktop",
  );
  await reviewPrevious.click();
  await page.waitForTimeout(600);
  check(
    (await reviewTrack.evaluate((element) => element.scrollLeft)) < reviewDesktopNext,
    "QA-001: seta anterior das avaliações não retorna no desktop",
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => {
    const track = document.querySelector("#avaliacoes .review-carousel");
    const next = document.querySelector('#avaliacoes button[aria-label="Próximo: Avaliações de clientes"]');
    return track && next && track.scrollWidth > track.clientWidth + 2 && !next.disabled;
  });
  check(
    await reviewNext.isEnabled(),
    "CAR-003: resize para mobile deve manter navegação das avaliações ativa",
  );
  await reviewTrack.evaluate((element) => element.scrollTo({ left: 0, behavior: "instant" }));
  await reviewNext.click();
  await page.waitForTimeout(600);
  check(
    (await reviewTrack.evaluate((element) => element.scrollLeft)) > 0,
    "CAR-003: avaliações não avançam no mobile",
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
  await page.evaluate(() => document.activeElement?.blur());
  await page.waitForTimeout(600);
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

}
