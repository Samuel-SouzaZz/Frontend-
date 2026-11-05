import assert from "node:assert/strict";
import test from "node:test";
import {
  ordenarLinhas,
  proximaOrdem,
  type Ordenadores,
} from "../src/models/ordenacao";

type Linha = { nome: string; valor: number | null; data: string };

const linhas: Linha[] = [
  { nome: "Élisa", valor: 30, data: "2023-01-16" },
  { nome: "carla", valor: null, data: "2019-03-11" },
  { nome: "Diego", valor: 5, data: "2021-08-02" },
  { nome: "Fábio", valor: 120, data: "2018-05-21" },
];

const ordenadores: Ordenadores<Linha> = {
  nome: (linha) => linha.nome,
  valor: (linha) => linha.valor,
  data: (linha) => linha.data,
};

const nomes = (lista: Linha[]) => lista.map((linha) => linha.nome);

test("clique alterna entre crescente, decrescente e sem ordem", () => {
  const primeira = proximaOrdem(null, "nome");
  assert.deepEqual(primeira, { coluna: "nome", direcao: "asc" });
  const segunda = proximaOrdem(primeira, "nome");
  assert.deepEqual(segunda, { coluna: "nome", direcao: "desc" });
  assert.equal(proximaOrdem(segunda, "nome"), null);
  assert.deepEqual(proximaOrdem(segunda, "data"), {
    coluna: "data",
    direcao: "asc",
  });
});

test("texto ignora maiusculas e acentos", () => {
  const ordem = { coluna: "nome", direcao: "asc" } as const;
  assert.deepEqual(nomes(ordenarLinhas(linhas, ordem, ordenadores)), [
    "carla",
    "Diego",
    "Élisa",
    "Fábio",
  ]);
});

test("numero ordena pelo valor e vazio fica sempre no fim", () => {
  const asc = ordenarLinhas(linhas, { coluna: "valor", direcao: "asc" }, ordenadores);
  assert.deepEqual(nomes(asc), ["Diego", "Élisa", "Fábio", "carla"]);
  const desc = ordenarLinhas(linhas, { coluna: "valor", direcao: "desc" }, ordenadores);
  assert.deepEqual(nomes(desc), ["Fábio", "Élisa", "Diego", "carla"]);
});

test("data no formato do banco ordena certo", () => {
  const desc = ordenarLinhas(linhas, { coluna: "data", direcao: "desc" }, ordenadores);
  assert.deepEqual(nomes(desc), ["Élisa", "Diego", "carla", "Fábio"]);
});

test("sem ordem ou coluna desconhecida mantem a lista como veio", () => {
  assert.equal(ordenarLinhas(linhas, null, ordenadores), linhas);
  assert.equal(
    ordenarLinhas(linhas, { coluna: "x", direcao: "asc" }, ordenadores),
    linhas,
  );
});
