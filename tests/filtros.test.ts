import assert from "node:assert/strict";
import test from "node:test";

import { juntarFiltro, passaNoFiltro, valoresFiltro } from "../src/models/filtros";

test("filtro vazio deixa passar tudo", () => {
  assert.equal(passaNoFiltro("", "ATIVO"), true);
  assert.equal(passaNoFiltro("", undefined), true);
});

test("filtro com um valor funciona como antes", () => {
  assert.equal(passaNoFiltro("ATIVO", "ATIVO"), true);
  assert.equal(passaNoFiltro("ATIVO", "INATIVO"), false);
});

test("filtro com vários valores aceita qualquer um deles", () => {
  const filtro = juntarFiltro(["PENDENTE", "EXPIRADA"]);
  assert.equal(passaNoFiltro(filtro, "PENDENTE"), true);
  assert.equal(passaNoFiltro(filtro, "EXPIRADA"), true);
  assert.equal(passaNoFiltro(filtro, "APROVADA"), false);
});

test("compara número com o texto do filtro", () => {
  assert.equal(passaNoFiltro(juntarFiltro(["2", "7"]), 7), true);
  assert.equal(passaNoFiltro(juntarFiltro(["2", "7"]), 17), false);
});

test("sem valor não passa quando há filtro", () => {
  assert.equal(passaNoFiltro("3", undefined), false);
  assert.equal(passaNoFiltro("3", null), false);
});

test("separa e junta sem perder vírgula do texto", () => {
  const filtro = juntarFiltro(["Administração, finanças", "Enfermagem"]);
  assert.deepEqual(valoresFiltro(filtro), ["Administração, finanças", "Enfermagem"]);
  assert.deepEqual(valoresFiltro(""), []);
});
