import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import vm from "node:vm";

const source = await readFile(
  resolve(import.meta.dirname, "../../public/integrations/analytics.js"),
  "utf8",
);

function createHarness(consent = null) {
  const listeners = new Map();
  const scripts = [];
  const storage = new Map();
  const document = {
    cookie: consent ? `dorus_consent=${consent}` : "",
    readyState: "complete",
    documentElement: { dataset: {} },
    head: { appendChild: (element) => scripts.push(element) },
    createElement: () => ({
      setAttribute(name, value) {
        this[name] = value;
      },
    }),
    querySelector(selector) {
      if (selector === "script[data-dorus-ga4]") return scripts[0] || null;
      return null;
    },
    addEventListener(type, listener) {
      listeners.set(`document:${type}`, listener);
    },
  };
  const window = {
    location: {
      hostname: "assistenciadorus.com.br",
      pathname: "/agendamento/",
      href: "https://assistenciadorus.com.br/agendamento/",
    },
    dataLayer: [],
    addEventListener(type, listener) {
      listeners.set(`window:${type}`, listener);
    },
  };
  const localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  };
  vm.runInContext(
    source,
    vm.createContext({ window, document, localStorage, URL, Date }),
    {
      filename: "analytics.js",
    },
  );
  return { document, listeners, scripts, window };
}

test("analytics começa negado e não carrega GA4 sem consentimento", () => {
  const harness = createHarness();
  assert.equal(harness.scripts.length, 0);
  assert.equal(harness.window.dorusAnalytics.track("qa_test"), false);
  const consentDefault = Array.from(harness.window.dataLayer[0]);
  assert.deepEqual(consentDefault.slice(0, 2), ["consent", "default"]);
  assert.equal(consentDefault[2].analytics_storage, "denied");
  assert.equal(consentDefault[2].ad_storage, "denied");
});

test("consentimento total carrega GA4 uma vez e libera evento", () => {
  const harness = createHarness("all");
  assert.equal(harness.scripts.length, 1);
  assert.match(
    harness.scripts[0].src,
    /googletagmanager\.com\/gtag\/js\?id=G-480Q4RXYNC/,
  );
  assert.equal(harness.window.dorusAnalytics.track("qa_test"), true);
  harness.listeners.get("window:dorus:consent")({ detail: { value: "all" } });
  assert.equal(
    harness.scripts.length,
    1,
    "GA4 não pode ser carregado em duplicidade",
  );
});

test("rejeição permanece sem envio de evento e mantém publicidade negada", () => {
  const harness = createHarness("necessary");
  harness.listeners.get("window:dorus:consent")({
    detail: { value: "necessary" },
  });
  assert.equal(harness.window.dorusAnalytics.trackLead("whatsapp"), false);
  assert.equal(harness.scripts.length, 0);
  const consentUpdate = Array.from(harness.window.dataLayer.at(-1));
  assert.deepEqual(consentUpdate.slice(0, 2), ["consent", "update"]);
  assert.equal(consentUpdate[2].analytics_storage, "denied");
  assert.equal(consentUpdate[2].ad_personalization, "denied");
});
