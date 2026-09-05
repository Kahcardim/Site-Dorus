import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(process.env.SEO_TARGET_DIR || resolve(root, "dist"));
const backup = JSON.parse(
  await readFile(
    resolve(root, "tests/fixtures/pre-react-contract.json"),
    "utf8",
  ),
);
const json = async (name) =>
  JSON.parse(await readFile(resolve(root, "src/data", name + ".json"), "utf8"));
const metadata = await json("seo-metadata");
const guides = await json("guide-content");
const services = await json("service-content");
const institutional = await json("institutional-content");
const faq = await json("faq");
const intentionalContentChanges = new Set([
  "/",
  "/servicos/",
  "/servicos/geladeiras/",
  "/servicos/maquinas-de-lavar/",
  "/servicos/lava-e-seca/",
]);
const plain = (value) =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x([\da-f]+);/gi, (_, n) =>
      String.fromCodePoint(parseInt(n, 16)),
    )
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const sitemap = await readFile(resolve(dist, "sitemap.xml"), "utf8");
const titles = new Set(),
  descriptions = new Set();
const generated = new Map();

for (const [path, expected] of Object.entries(metadata)) {
  const html = await readFile(resolve(dist, `.${path}`, "index.html"), "utf8");
  generated.set(path, plain(html.match(/<main[^>]*>([\s\S]*?)<\/main>/)[1]));
  const title = plain(html.match(/<title>(.*?)<\/title>/)[1]);
  const description = plain(
    html.match(/<meta name="description" content="([^"]*)"/)[1],
  );
  assert.equal(title, expected.title, `${path}: título original perdido`);
  assert.equal(
    description,
    expected.description,
    `${path}: descrição original perdida`,
  );
  assert(!titles.has(title), `${path}: título duplicado`);
  titles.add(title);
  assert(!descriptions.has(description), `${path}: descrição duplicada`);
  descriptions.add(description);
  assert.match(html, /<html lang="pt-BR"/);
  assert(!html.includes('content="noindex'), `${path}: noindex indevido`);
  assert(sitemap.includes(`<loc>https://assistenciadorus.com.br${path}</loc>`));
  const schema = JSON.parse(
    html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1],
  );
  const types = schema["@graph"].map((node) => node["@type"]);
  assert(types.includes("Organization") && types.includes("WebSite"));
  const organization = schema["@graph"].find(
    (node) => node["@type"] === "Organization",
  );
  assert.deepEqual(
    organization.areaServed.map((city) => city.name),
    ["Guarulhos", "São Paulo"],
  );
  assert(
    organization.sameAs.includes("https://instagram.com/assistenciadorus"),
  );
  if (path !== "/") {
    const crumbs = schema["@graph"].find(
      (node) => node["@type"] === "BreadcrumbList",
    );
    const expectedCount = path.split("/").filter(Boolean).length + 1;
    assert.equal(crumbs.itemListElement.length, expectedCount);
    assert.match(html, /aria-label="Caminho de navegação"/);
  }
  if (path.startsWith("/curiosidades/") && path !== "/curiosidades/") {
    const article = schema["@graph"].find(
      (node) => node["@type"] === "Article",
    );
    assert(
      article?.publisher &&
        article?.author &&
        article?.image &&
        article?.inLanguage,
    );
  }
  if (path.startsWith("/servicos/") && path !== "/servicos/")
    assert(types.includes("Service"));
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = new URL(
      match[1].replaceAll("&amp;", "&"),
      `https://assistenciadorus.com.br${path}`,
    );
    if (url.origin !== "https://assistenciadorus.com.br") continue;
    const asset = resolve(
      dist,
      "." + decodeURIComponent(url.pathname),
      url.pathname.endsWith("/") ? "index.html" : "",
    );
    await access(asset).catch(() =>
      assert.fail(`${path}: link/arquivo ausente ${url.pathname}`),
    );
  }
  for (const city of organization.areaServed)
    assert(plain(html).includes(city.name), `${path}: cidade ausente no DOM`);
}

function includes(path, values) {
  for (const value of values.filter(Boolean))
    assert(
      generated.get(path).includes(plain(value)),
      `${path}: conteúdo perdido: ${value}`,
    );
}
function sectionText(sections) {
  return sections.flatMap((section) => [
    section.heading,
    ...section.paragraphs,
    ...section.cards.flatMap((card) => [card.title, card.description]),
    ...section.links.flatMap((link) => [link.title, link.description]),
  ]);
}
for (const [slug, content] of Object.entries(guides))
  includes(`/curiosidades/${slug}/`, [
    content.title,
    content.intro,
    ...sectionText(content.sections),
  ]);
for (const [slug, content] of Object.entries(services))
  includes(`/servicos/${slug}/`, [
    content.title,
    content.intro,
    ...content.issues.flatMap((issue) => [issue.title, issue.description]),
  ]);
for (const [slug, content] of Object.entries(institutional))
  includes(`/${slug}/`, [
    content.title,
    content.intro,
    ...sectionText(content.sections),
    ...content.faq.flatMap((item) => [item.question, item.answer]),
  ]);
includes(
  "/",
  faq.flatMap((item) => [item.question, item.answer]),
);
for (const path of ["/", "/servicos/"])
  includes(path, [
    "Bosch",
    "Samsung",
    "Brastemp",
    "Electrolux",
    "Consul",
    "LG",
    "GE",
  ]);
assert(!sitemap.includes("404.html"));
assert.match(
  await readFile(resolve(dist, "404.html"), "utf8"),
  /content="noindex, follow"/,
);
assert.match(
  await readFile(resolve(dist, "robots.txt"), "utf8"),
  /Sitemap: https:\/\/assistenciadorus.com.br\/sitemap.xml/,
);
console.log(
  "OK: 21 rotas, conteúdo atual, marcas/regiões no HTML, metadados únicos, grafos Schema, breadcrumbs, sitemap e destinos internos.",
);
for (const [path, paragraphs] of Object.entries(backup.content)) {
  if (!intentionalContentChanges.has(path)) includes(path, paragraphs);
}
for (const [path, hash] of Object.entries(backup.integrationHashes)) {
  const actual = createHash("sha256")
    .update(await readFile(resolve(dist, "." + path)))
    .digest("hex");
  assert.equal(
    actual,
    hash,
    `Integração alterada em relação ao backup: ${path}`,
  );
}
console.log(
  `OK: páginas não alteradas e integrações comparadas com o backup ${backup.backupCommit}.`,
);

const fullContent = JSON.parse(
  await readFile(
    resolve(root, "tests/fixtures/pre-react-content.json"),
    "utf8",
  ),
);
const normalizeContent = (value) =>
  plain(value.replace(/<!--[\s\S]*?-->/g, ""))
    .replace(/\s+([.,?!:;])/g, "$1")
    .replace(/‑/g, "-")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
const contentLosses = [];
const originalSchemaTypes = JSON.parse(
  await readFile(
    resolve(root, "tests/fixtures/pre-react-schema-types.json"),
    "utf8",
  ),
);
for (const [path, blocks] of Object.entries(fullContent.pages)) {
  const html = await readFile(resolve(dist, "." + path, "index.html"), "utf8");
  const main = normalizeContent(html.match(/<main[^>]*>([\s\S]*?)<\/main>/)[1]);
  const graph = JSON.parse(
    html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1],
  )["@graph"];
  for (const type of originalSchemaTypes[path])
    assert(
      graph.some((node) => node["@type"] === type),
      `${path}: marcação ${type} perdida`,
    );
  if (intentionalContentChanges.has(path)) continue;
  for (const block of blocks)
    if (!main.includes(normalizeContent(block.text)))
      contentLosses.push({ path, ...block });
}
assert.deepEqual(
  contentLosses,
  [],
  "Perda de conteúdo em páginas fora do escopo intencional da Sprint 2",
);
console.log(
  `OK: conteúdo histórico preservado fora das páginas intencionalmente reestruturadas; ${fullContent.omitted.length} mensagens de interface com substituição documentada.`,
);
