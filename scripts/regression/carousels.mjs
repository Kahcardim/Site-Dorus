
export async function run({ browser, page, root, routePaths, accessibilityPaths, check, failures, accessibility, loadLazyImages }) {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:4174/", { waitUntil: "networkidle" });
  await page.locator("#avaliacoes").scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await page.evaluate(() => document.activeElement?.blur());

  const reviewTrack = page.locator("#avaliacoes .review-carousel");
  check(
    (await page.locator('#avaliacoes button[aria-label="Anterior: Avaliações de clientes"]').count()) === 0 &&
      (await page.locator('#avaliacoes button[aria-label="Próximo: Avaliações de clientes"]').count()) === 0,
    "REV-CAR-001: avaliações ainda exibem setas de navegação",
  );
  check(
    (
      await page.locator("#avaliacoes .carousel-toolbar p").innerText()
    ).includes("avançam automaticamente"),
    "REV-CAR-002: autoplay das avaliações não foi comunicado",
  );
  const reviewPause = page.getByRole("button", {
    name: /Pausar carrossel de avaliações de clientes/,
  });
  check(await reviewPause.isVisible(), "REV-CAR-003: controle de pausa do autoplay ausente");

  const reviewStart = await reviewTrack.evaluate((element) => element.scrollLeft);
  await page.waitForTimeout(5200);
  const reviewAutoNext = await reviewTrack.evaluate((element) => element.scrollLeft);
  check(
    reviewAutoNext > reviewStart,
    "REV-CAR-004: avaliações não avançam automaticamente no desktop",
  );

  await reviewPause.click();
  await page.mouse.move(0, 0);
  await page.evaluate(() => document.activeElement?.blur());
  await page.waitForTimeout(600);
  const reviewStopped = await reviewTrack.evaluate((element) => element.scrollLeft);
  await page.waitForTimeout(5200);
  check(
    (await reviewTrack.evaluate((element) => element.scrollLeft)) === reviewStopped,
    "REV-CAR-005: pausa das avaliações não interrompe o autoplay",
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:4174/", { waitUntil: "networkidle" });
  await page.locator("#avaliacoes").scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await page.evaluate(() => document.activeElement?.blur());
  const mobileReviewTrack = page.locator("#avaliacoes .review-carousel");
  check(
    (await page.locator('#avaliacoes button[aria-label="Anterior: Avaliações de clientes"]').count()) === 0 &&
      (await page.locator('#avaliacoes button[aria-label="Próximo: Avaliações de clientes"]').count()) === 0,
    "REV-CAR-006: avaliações exibem setas no mobile",
  );
  await mobileReviewTrack.dispatchEvent("pointerdown");
  const mobileReviewStart = await mobileReviewTrack.evaluate((element) => element.scrollLeft);
  await page.waitForTimeout(5200);
  check(
    (await mobileReviewTrack.evaluate((element) => element.scrollLeft)) > mobileReviewStart,
    "REV-CAR-007: autoplay das avaliações não continua após toque no mobile",
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
