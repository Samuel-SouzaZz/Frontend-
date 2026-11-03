import assert from "node:assert/strict";
import test from "node:test";
import {
  dataPorExtenso,
  diasEntre,
  diasNoMes,
  foraDoLimite,
  formatarData,
  gradeDoMes,
  lerIso,
  lerTextoDaData,
  mascararData,
  somarDias,
  somarMeses,
} from "../src/models/seletorData";

test("grade do mês começa no domingo e tem 6 semanas", () => {
  const grade = gradeDoMes({ ano: 2026, mes: 10 });
  assert.equal(grade.length, 42);
  assert.equal(grade[0].iso, "2026-11-01");
  assert.equal(grade.filter((dia) => dia.doMes).length, 30);
  const fevereiro = gradeDoMes({ ano: 2026, mes: 1 });
  assert.equal(fevereiro[0].iso, "2026-02-01");
  assert.equal(gradeDoMes({ ano: 2026, mes: 9 })[0].iso, "2026-09-27");
});

test("anos bissextos e meses", () => {
  assert.equal(diasNoMes(2028, 1), 29);
  assert.equal(diasNoMes(2026, 1), 28);
  assert.equal(lerIso("2026-02-29"), null);
  assert.deepEqual(somarMeses({ ano: 2026, mes: 0 }, -1), { ano: 2025, mes: 11 });
  assert.deepEqual(somarMeses({ ano: 2026, mes: 11 }, 1), { ano: 2027, mes: 0 });
  assert.equal(somarDias("2026-12-31", 1), "2027-01-01");
});

test("digitar a data", () => {
  assert.equal(mascararData("04112026"), "04/11/2026");
  assert.equal(mascararData("0411"), "04/11");
  assert.equal(mascararData("4a"), "4");
  assert.equal(lerTextoDaData("04/11/2026"), "2026-11-04");
  assert.equal(lerTextoDaData("31/02/2026"), null);
  assert.equal(lerTextoDaData("04/11"), null);
  assert.equal(formatarData("2026-11-04"), "04/11/2026");
  assert.equal(formatarData(""), "");
  assert.equal(dataPorExtenso("2026-03-01"), "1 de março de 2026");
});

test("limites de data", () => {
  assert.equal(foraDoLimite("2026-11-03", "2026-11-04"), true);
  assert.equal(foraDoLimite("2026-11-04", "2026-11-04"), false);
  assert.equal(foraDoLimite("2026-11-05", undefined, "2026-11-04"), true);
});

test("dias do período contam o primeiro e o último", () => {
  assert.equal(diasEntre("2026-11-04", "2026-11-13"), 10);
  assert.equal(diasEntre("2026-11-04", "2026-11-04"), 1);
  assert.equal(diasEntre("2026-12-30", "2027-01-02"), 4);
  assert.equal(diasEntre("2026-11-13", "2026-11-04"), 0);
});
