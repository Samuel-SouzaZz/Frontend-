import assert from "node:assert/strict";
import test from "node:test";
import type { Campanha } from "../src/models/types";
import {
    campanhasDoDia,
    diasDoMes,
    mesDaChave,
    mudarMes,
    nomeDoMes,
} from "../src/models/calendario";

test("novembro de 2026 comeca no domingo e tem 5 semanas", () => {
    const dias = diasDoMes(mesDaChave("2026-11-15"));
    assert.equal(dias.length, 35);
    assert.deepEqual(dias[0], { data: "2026-11-01", dia: 1, doMes: true });
    assert.equal(dias.filter((dia) => dia.doMes).length, 30);
});

test("dias de fora do mes completam a primeira semana", () => {
    const dias = diasDoMes(mesDaChave("2026-10-01"));
    assert.equal(dias[0].data, "2026-09-27");
    assert.equal(dias[0].doMes, false);
    assert.equal(dias.length % 7, 0);
});

test("muda de mes e de ano", () => {
    const dezembro = mudarMes(mesDaChave("2026-11-01"), 1);
    assert.equal(nomeDoMes(dezembro), "Dezembro de 2026");
    assert.equal(nomeDoMes(mudarMes(dezembro, 1)), "Janeiro de 2027");
});

test("acha as campanhas que acontecem no dia", () => {
    const campanhas = [
        { id: 1, nome: "Novembro Azul", data_inicio: "2026-11-01", data_fim: "2026-11-30" },
        { id: 2, nome: "Feira de Saúde", data_inicio: "2026-11-10 08:00:00", data_fim: "2026-11-10 17:00:00" },
        { id: 3, nome: "Outubro Rosa", data_inicio: "2026-10-01", data_fim: "2026-10-31" },
    ] as Campanha[];
    assert.deepEqual(campanhasDoDia(campanhas, "2026-11-10").map((item) => item.id), [1, 2]);
    assert.deepEqual(campanhasDoDia(campanhas, "2026-11-11").map((item) => item.id), [1]);
});
