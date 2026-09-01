import { createServer } from "node:http";
import { readFile, stat, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { gzipSync } from "node:zlib";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "test-results/performance");
await mkdir(output, { recursive: true });
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};
const serve = async (directory, port) => {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");
      let file = resolve(directory, "." + decodeURIComponent(url.pathname));
      if (!file.startsWith(directory + sep) && file !== directory)
        throw new Error("Invalid path");
      if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
      let body = await readFile(file);
      const type = mime[extname(file)] || "application/octet-stream";
      const headers = {
        "content-type": type,
        "cache-control": "public, max-age=3600",
      };
      if (
        /text|json|svg/.test(type) &&
        req.headers["accept-encoding"]?.includes("gzip")
      ) {
        body = gzipSync(body);
        headers["content-encoding"] = "gzip";
      }
      res.writeHead(200, headers).end(body);
    } catch {
      res.writeHead(404).end("Not found");
    }
  });
  await new Promise((done) => server.listen(port, "127.0.0.1", done));
  return server;
};
const legacy = await serve(root, 4180);
const react = await serve(resolve(root, "dist"), 4181);
const results = [];
try {
  const scenarios = [
    ...[1, 2, 3].flatMap((run) => [
      { version: "legacy", path: "/", device: "mobile", run },
      { version: "react", path: "/", device: "mobile", run },
    ]),
    { version: "legacy", path: "/", device: "desktop", run: 1 },
    { version: "react", path: "/", device: "desktop", run: 1 },
    {
      version: "react",
      path: "/servicos/geladeiras/",
      device: "mobile",
      run: 1,
    },
    {
      version: "react",
      path: "/curiosidades/geladeira-nao-gela/",
      device: "mobile",
      run: 1,
    },
  ];
  for (const scenario of scenarios) {
    const name = `${scenario.version}-${scenario.device}-${scenario.path.replaceAll("/", "_")}-${scenario.run}`;
    const reportPath = resolve(output, `${name}.json`);
    const args = [
      `http://127.0.0.1:${scenario.version === "legacy" ? 4180 : 4181}${scenario.path}`,
      "--only-categories=performance,accessibility,best-practices,seo",
      "--output=json",
      `--output-path=${reportPath}`,
      "--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage",
      "--quiet",
    ];
    if (scenario.device === "desktop") args.push("--preset=desktop");
    await new Promise((done, reject) => {
      const process = spawn("lighthouse", args, { stdio: "inherit" });
      process.on("error", reject);
      process.on("exit", (code) =>
        code === 0 ? done() : reject(new Error(`Lighthouse: ${code}`)),
      );
    });
    const report = JSON.parse(await readFile(reportPath, "utf8"));
    if (report.runtimeError)
      throw new Error(JSON.stringify(report.runtimeError));
    const row = {
      ...scenario,
      scores: Object.fromEntries(
        Object.entries(report.categories).map(([key, value]) => [
          key,
          value.score,
        ]),
      ),
      lcp: report.audits["largest-contentful-paint"].numericValue,
      cls: report.audits["cumulative-layout-shift"].numericValue,
      tbt: report.audits["total-blocking-time"].numericValue,
    };
    results.push(row);
    console.log(JSON.stringify(row));
  }
  await writeFile(
    resolve(output, "summary.json"),
    JSON.stringify(results, null, 2),
  );
  for (const result of results.filter((row) => row.version === "react")) {
    assert(
      result.scores.performance >= 0.8,
      `Performance abaixo de 80: ${result.path}`,
    );
    assert(
      result.scores.seo >= 0.95,
      `SEO técnico abaixo de 95: ${result.path}`,
    );
    assert(result.cls <= 0.1, `CLS acima de 0.1: ${result.path}`);
  }
  const median = (values) =>
    [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
  const home = (version) =>
    results.filter(
      (row) =>
        row.version === version && row.path === "/" && row.device === "mobile",
    );
  const before = median(home("legacy").map((row) => row.lcp));
  const after = median(home("react").map((row) => row.lcp));
  assert(
    after <= Math.max(before * 1.2, before + 500),
    `Regressão de LCP: ${before}ms → ${after}ms`,
  );
  console.log(
    `LCP mediano mobile: legado ${Math.round(before)}ms; React ${Math.round(after)}ms. Medição de laboratório, não dados de campo.`,
  );
} finally {
  await Promise.all(
    [legacy, react].map((server) => new Promise((done) => server.close(done))),
  );
}
