import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import vm from "node:vm";

const source = await readFile(
  resolve(import.meta.dirname, "../../integrations/google-calendar/Code.gs"),
  "utf8",
);
const fixedNow = "2026-09-07T12:00:00.000Z";

function createHarness({ morning = 0, afternoon = 0 } = {}) {
  const cache = new Map();
  const created = [];
  class FixedDate extends Date {
    constructor(...args) {
      super(...(args.length ? args : [fixedNow]));
    }
    static now() {
      return new Date(fixedNow).getTime();
    }
  }
  const parseDate = (value) => {
    const [date, time = "00:00"] = String(value).split(" ");
    return new Date(`${date}T${time}:00.000Z`);
  };
  const calendar = {
    getEvents(start) {
      return Array.from({
        length: start.getUTCHours() < 13 ? morning : afternoon,
      });
    },
    createEvent(title, start, end, options) {
      const event = {
        id: `event-${created.length + 1}`,
        title,
        start,
        end,
        options,
        getId() {
          return this.id;
        },
        setTransparency() {},
      };
      created.push(event);
      return event;
    },
  };
  const scriptCache = {
    get: (key) => cache.get(key) ?? null,
    put: (key, value) => cache.set(key, String(value)),
  };
  const context = vm.createContext({
    Date: FixedDate,
    JSON,
    Math,
    Set,
    String,
    Number,
    Error,
    encodeURIComponent,
    CalendarApp: {
      EventTransparency: { OPAQUE: "OPAQUE" },
      getCalendarById: () => calendar,
    },
    CacheService: { getScriptCache: () => scriptCache },
    LockService: {
      getScriptLock: () => ({ waitLock() {}, releaseLock() {} }),
    },
    Utilities: {
      Charset: { UTF_8: "UTF_8" },
      DigestAlgorithm: { SHA_256: "SHA_256" },
      parseDate,
      formatDate(date, _timezone, format) {
        if (format === "u") return String(date.getUTCDay() || 7);
        return date.toISOString().slice(0, 10);
      },
      computeDigest(_algorithm, value) {
        return [...createHash("sha256").update(value).digest()].map((byte) =>
          byte > 127 ? byte - 256 : byte,
        );
      },
      getUuid: () => "00000000-0000-4000-8000-000000000000",
    },
  });
  vm.runInContext(source, context, { filename: "Code.gs" });
  return {
    call(expression) {
      return vm.runInContext(expression, context);
    },
    cache,
    created,
  };
}

const validAppointment = {
  name: "Cliente QA",
  phone: "(11) 99999-9999",
  neighborhood: "Centro",
  address: "Rua de teste, 1",
  equipment: "Geladeira",
  brand: "Marca X",
  problem: "Não está gelando",
  date: "2026-09-08",
  period: "manha",
};
const invoke = (harness, name, payload) =>
  harness.call(`${name}(${JSON.stringify(payload)})`);

test("backend rejeita todos os campos obrigatórios ausentes", () => {
  const harness = createHarness();
  for (const field of [
    "name",
    "phone",
    "neighborhood",
    "address",
    "equipment",
    "problem",
    "date",
    "period",
  ]) {
    const payload = { ...validAppointment, [field]: "" };
    assert.throws(
      () => invoke(harness, "validateRequired", payload),
      new RegExp(`Campo obrigatório ausente: ${field}`),
    );
  }
});

test("backend aplica limites e saneia texto controlado pelo usuário", () => {
  const harness = createHarness();
  assert.throws(
    () =>
      invoke(harness, "validateRequired", {
        ...validAppointment,
        phone: "123",
      }),
    /Telefone inválido/,
  );
  assert.throws(
    () =>
      invoke(harness, "validateRequired", {
        ...validAppointment,
        problem: "x".repeat(1501),
      }),
    /Descrição muito longa/,
  );
  assert.equal(harness.call(`sanitize(" <b>teste</b> ")`), "bteste/b");
});

test("backend aceita hoje e D+60, mas bloqueia passado, D+61 e domingo", () => {
  const harness = createHarness();
  assert.doesNotThrow(() => harness.call(`validateDate("2026-09-07")`));
  assert.doesNotThrow(() => harness.call(`validateDate("2026-11-06")`));
  assert.throws(
    () => harness.call(`validateDate("2026-09-06")`),
    /data passada/,
  );
  assert.throws(() => harness.call(`validateDate("2026-11-07")`), /60 dias/);
  assert.throws(() => harness.call(`validateDate("2026-09-13")`), /domingos/);
});

test("disponibilidade respeita capacidade por período e bloqueia integral parcial", () => {
  const harness = createHarness({ morning: 5, afternoon: 4 });
  const result = harness.call(`getAvailabilityByDate("2026-09-08")`);
  assert.equal(result.capacityPerPeriod, 5);
  assert.deepEqual(
    Array.from(result.periods, (period) => period.value),
    ["tarde"],
  );
});

test("criação revalida lotação dentro do lock", () => {
  const harness = createHarness({ morning: 5 });
  const result = invoke(harness, "createAppointment", validAppointment);
  assert.equal(result.conflict, true);
  assert.equal(harness.created.length, 0);
});

test("requisição duplicada não cria um segundo evento", () => {
  const harness = createHarness();
  const first = invoke(harness, "createAppointment", validAppointment);
  const second = invoke(harness, "createAppointment", validAppointment);
  assert.equal(first.ok, true);
  assert.equal(second.duplicate, true);
  assert.equal(harness.created.length, 1);
});
