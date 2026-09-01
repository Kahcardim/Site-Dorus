import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, dirname, sep } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const target = resolve(root, "test-results/published");
const origin = "https://assistenciadorus.com.br";
const expectedRevision = process.env.DORUS_REVISION || process.env.GITHUB_SHA;
assert(
  expectedRevision,
  "Informe GITHUB_SHA para validar exatamente a revisão publicada.",
);
const backup = JSON.parse(
  await readFile(
    resolve(root, "tests/fixtures/pre-react-contract.json"),
    "utf8",
  ),
);
const saved = new Set();
const responses = [];
const download = async (path, allowedStatus = [200]) => {
  const url = new URL(path, origin);
  assert.equal(url.origin, origin);
  const file = resolve(
    target,
    "." + decodeURIComponent(url.pathname),
    url.pathname.endsWith("/") ? "index.html" : "",
  );
  assert(file.startsWith(target + sep));
  if (saved.has(file)) return readFile(file, "utf8");
  url.searchParams.set("revision", expectedRevision);
  const response = await fetch(url, {
    signal: AbortSignal.timeout(30000),
    headers: { "cache-control": "no-cache" },
  });
  assert(
    allowedStatus.includes(response.status),
    `${path}: HTTP ${response.status}`,
  );
  assert.equal(
    new URL(response.url).origin,
    origin,
    `${path}: redirecionamento externo`,
  );
  const body = Buffer.from(await response.arrayBuffer());
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, body);
  saved.add(file);
  responses.push({ path, status: response.status, bytes: body.length });
  return body.toString("utf8");
};

for (const path of Object.keys(backup.metadata)) {
  const html = await download(path);
  assert(
    html.includes(`<meta name="dorus-revision" content="${expectedRevision}">`),
    `${path}: versão antiga no cache`,
  );
  assert(html.includes("30.204.892/0001-03"), `${path}: CNPJ ausente`);
  assert(html.includes("5511913573932"), `${path}: WhatsApp divergente`);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = new URL(match[1].replaceAll("&amp;", "&"), origin + path);
    if (url.origin === origin && !url.pathname.endsWith("/"))
      await download(url.pathname);
  }
}
for (const path of [
  "/sitemap.xml",
  "/robots.txt",
  "/google-rating.json",
  "/integrations/analytics.js",
  "/integrations/calendar.js",
])
  await download(path);
await download("/404.html", [200, 404]);
const notFound = await fetch(
  `${origin}/validacao-rota-inexistente-${expectedRevision}/`,
  { signal: AbortSignal.timeout(30000) },
);
assert.equal(
  notFound.status,
  404,
  "URL inexistente deve responder HTTP 404 real.",
);
const validation = spawnSync(process.execPath, ["scripts/test-seo.mjs"], {
  cwd: root,
  env: { ...process.env, SEO_TARGET_DIR: target },
  encoding: "utf8",
});
console.log(validation.stdout);
console.error(validation.stderr);
const rating = JSON.parse(
  await readFile(resolve(target, "google-rating.json"), "utf8"),
);
await writeFile(
  resolve(root, "test-results/post-deploy.json"),
  JSON.stringify(
    {
      revision: expectedRevision,
      backupCommit: backup.backupCommit,
      backupTree: backup.gitTree,
      checkedAt: new Date().toISOString(),
      passed: validation.status === 0,
      pages: Object.keys(backup.metadata).length,
      rating: { before: backup.rating, published: rating },
      responses,
      checks: validation.stdout,
      errors: validation.stderr,
      limitations: [
        "Sem envio real de formulário ou criação de agendamento",
        "Não mede posições nem indexação no Google",
        "Comparação semântica e de dados, não igualdade do HTML/CSS refatorado",
      ],
    },
    null,
    2,
  ),
);
assert.equal(validation.status, 0, "Comparação com backup falhou.");
console.log(
  `OK: publicação ${expectedRevision}; 21 páginas e dados conferidos com backup ${backup.backupCommit}.`,
);
