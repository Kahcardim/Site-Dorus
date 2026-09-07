import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const calendarSource = await readFile(
  resolve(root, "public/integrations/calendar.js"),
  "utf8",
);
const endpoint = calendarSource.match(/WEB_APP_URL\s*=\s*'([^']+)'/)?.[1];
assert(endpoint, "Endpoint da agenda não encontrado no cliente.");

const ymd = (date) => date.toISOString().slice(0, 10);
const addDays = (value, days) => {
  const [year, month, day] = value.split("-").map(Number);
  return ymd(new Date(Date.UTC(year, month - 1, day + days, 12)));
};
const weekday = (value) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12)).getUTCDay();
};
const saoPauloToday = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
};

async function get(params, attempts = 3) {
  const url = new URL(endpoint);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(20000),
        headers: { "cache-control": "no-cache" },
      });
      assert.equal(response.status, 200, `${url.pathname}: HTTP ${response.status}`);
      return JSON.parse(await response.text());
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolveDelay) => setTimeout(resolveDelay, 1000 * attempt));
    }
  }
  throw lastError;
}

const status = await get({ action: "status" });
assert.equal(status.ok, true, "Agenda real não respondeu ao status.");

const today = saoPauloToday();
const yesterday = addDays(today, -1);
const max = addDays(today, 60);
const beyond = addDays(today, 61);
let sunday = today;
while (weekday(sunday) !== 0) sunday = addDays(sunday, 1);
if (sunday === today) sunday = addDays(sunday, 7);

const cases = [
  { id: "past", date: yesterday, ok: false, error: /passada/i },
  {
    id: "today",
    date: today,
    ok: weekday(today) !== 0,
    error: /domingo/i,
  },
  {
    id: "d+60",
    date: max,
    ok: weekday(max) !== 0,
    error: /domingo/i,
  },
  { id: "d+61", date: beyond, ok: false, error: /60 dias/i },
  { id: "sunday", date: sunday, ok: false, error: /domingo/i },
];

const results = [];
for (const testCase of cases) {
  const result = await get({ action: "availability", date: testCase.date });
  if (testCase.ok) {
    assert.equal(result.ok, true, `${testCase.id} (${testCase.date}) deveria ser aceito: ${JSON.stringify(result)}`);
    assert.equal(result.date, testCase.date);
    assert.equal(result.capacityPerPeriod, 5);
    assert(Array.isArray(result.periods), `${testCase.id}: períodos ausentes`);
  } else {
    assert.equal(result.ok, false, `${testCase.id} (${testCase.date}) deveria ser rejeitado.`);
    assert.match(String(result.error || ""), testCase.error, `${testCase.id}: erro inesperado`);
  }
  results.push({ id: testCase.id, date: testCase.date, ok: result.ok });
}

console.log(`OK: agenda real validada em modo leitura. ${JSON.stringify(results)}`);
