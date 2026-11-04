import assert from "node:assert/strict";
import test from "node:test";
import type { Campanha } from "../src/models/types";
import {
    descreverPeriodo,
    duracaoEmDias,
    ehEvento,
    nomeDoTipo,
    statusEfetivo,
    statusPelasDatas,
} from "../src/models/periodo";

const HOJE = "2026-11-10";

test("status sai das datas", () => {
    assert.equal(statusPelasDatas("2026-11-20", "2026-11-30", HOJE), "PLANEJADA");
    assert.equal(statusPelasDatas("2026-11-01", "2026-11-30", HOJE), "ATIVA");
    assert.equal(statusPelasDatas("2026-11-10", "2026-11-10", HOJE), "ATIVA");
    assert.equal(statusPelasDatas("2026-10-01", "2026-10-31", HOJE), "ENCERRADA");
});

test("campanha cancelada continua cancelada", () => {
    const campanha = {
        status: "CANCELADA",
        data_inicio: "2026-11-01",
        data_fim: "2026-11-30",
    } as Campanha;
    assert.equal(statusEfetivo(campanha, HOJE), "CANCELADA");
    assert.equal(statusEfetivo({ ...campanha, status: "PLANEJADA" }, HOJE), "ATIVA");
});

test("conta os dias contando o primeiro e o ultimo", () => {
    assert.equal(duracaoEmDias("2026-11-01", "2026-11-30"), 30);
    assert.equal(duracaoEmDias("2026-11-10", "2026-11-10"), 1);
    assert.equal(duracaoEmDias("2026-11-10", "2026-11-01"), 0);
});

test("descreve o periodo", () => {
    assert.equal(descreverPeriodo("2026-11-10", "2026-11-10"), "Em 10/11/2026");
    assert.equal(descreverPeriodo("2026-11-01", "2026-11-30"), "De 01/11/2026 a 30/11/2026");
    assert.equal(descreverPeriodo("", ""), "Período a definir");
});

test("nome e grupo do tipo", () => {
    assert.equal(nomeDoTipo("EVENTO_PATROCINADO"), "Evento patrocinado");
    assert.equal(ehEvento("EVENTO_INTERNO"), true);
    assert.equal(ehEvento("CAMPANHA"), false);
});