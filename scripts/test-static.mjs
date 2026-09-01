import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const dist = resolve(import.meta.dirname, "..", "dist");
const sitemap = await readFile(resolve(dist, "sitemap.xml"), "utf8");
const paths = [
  ...sitemap.matchAll(
    /<loc>https:\/\/assistenciadorus\.com\.br([^<]+)<\/loc>/g,
  ),
].map((match) => match[1]);

assert.equal(paths.length, 21, "O sitemap deve conter 21 rotas indexáveis.");

for (const path of paths) {
  const file =
    path === "/"
      ? resolve(dist, "index.html")
      : resolve(dist, path.slice(1), "index.html");
  const html = await readFile(file, "utf8");
  assert.equal(
    (html.match(/<h1(?:\s|>)/g) || []).length,
    1,
    `${path}: deve conter um h1`,
  );
  assert.match(html, /<main id="conteudo">/, `${path}: main sem id`);
  assert.match(
    html,
    /<meta name="description" content="[^"]{40,}"/,
    `${path}: descrição ausente`,
  );
  assert.match(
    html,
    new RegExp(
      `<link rel="canonical" href="https://assistenciadorus\\.com\\.br${path.replaceAll("/", "\\/")}"`,
    ),
    `${path}: canonical incorreto`,
  );
  assert.match(
    html,
    /<script type="application\/ld\+json">/,
    `${path}: Schema ausente`,
  );
  assert.doesNotMatch(
    html,
    /Revisão QA|camada final|futura consolidação|ferramenta antiga/i,
    `${path}: observação interna exposta`,
  );
  assert.match(
    html,
    /href="https:\/\/wa\.me\/5511913573932/,
    `${path}: WhatsApp ausente`,
  );
}

for (const required of [
  "CNAME",
  "robots.txt",
  "site.webmanifest",
  "google-rating.json",
  "404.html",
  "assets/dorus-logo-3d.webp",
]) {
  await access(resolve(dist, required));
}

const schedule = await readFile(
  resolve(dist, "agendamento", "index.html"),
  "utf8",
);
assert.match(schedule, /data-schedule-form/, "Formulário de agenda ausente");
assert.match(
  schedule,
  /<input(?=[^>]*name="consentimento")(?=[^>]*type="checkbox")(?=[^>]*required)/,
  "Consentimento obrigatório ausente",
);
assert.match(
  schedule,
  /\/integrations\/calendar\.js/,
  "Integração da agenda ausente",
);

const contact = await readFile(
  resolve(dist, "fale-conosco", "index.html"),
  "utf8",
);
assert.match(
  contact,
  /id="contact-title"/,
  "Formulário de contato sem nome acessível",
);

console.log(
  "OK: HTML estático, SEO, Schema, arquivos públicos, agenda, contato e WhatsApp validados.",
);
