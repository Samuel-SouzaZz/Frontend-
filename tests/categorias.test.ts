import assert from "node:assert/strict";
import test from "node:test";

import {
  categoriasParaEscolher,
  nomesCategorias,
  temCategoria,
} from "../src/models/categorias";

import type { Categoria } from "../src/models/types";

const farmacia: Categoria = {
  id: 1,
  nome: "Farmácia",
  status: "ATIVO",
};

const saude: Categoria = {
  id: 2,
  nome: "Saúde",
  status: "ATIVO",
};

const lazer: Categoria = {
  id: 3,
  nome: "Lazer",
  status: "INATIVO",
};

test("nomesCategorias junta os nomes ou avisa quando não tem", () => {
  assert.equal(
    nomesCategorias({
      categorias: [farmacia, saude],
    }),
    "Farmácia, Saúde"
  );

  assert.equal(
    nomesCategorias({
      categorias: [],
    }),
    "Sem categoria"
  );
});

test("temCategoria procura pelo id", () => {
  assert.equal(
    temCategoria(
      { categorias: [farmacia] },
      1
    ),
    true
  );

  assert.equal(
    temCategoria(
      { categorias: [farmacia] },
      2
    ),
    false
  );
});

test("categoriasParaEscolher mostra as ativas e as inativas já marcadas, em ordem", () => {
  assert.deepEqual(
    categoriasParaEscolher(
      [saude, lazer, farmacia],
      []
    ).map((categoria) => categoria.nome),
    ["Farmácia", "Saúde"]
  );

  assert.deepEqual(
    categoriasParaEscolher(
      [saude, lazer, farmacia],
      [3]
    ).map((categoria) => categoria.nome),
    ["Farmácia", "Lazer", "Saúde"]
  );
});