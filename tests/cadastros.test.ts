import assert from "node:assert/strict";
import test from "node:test";
import { planejarOfertas } from "../src/models/ofertasSync";
import {
  campanhaVazia,
  duracaoEmDias,
  errosDaIniciativa,
  errosDosItens,
  novoItem,
  progressoDoPeriodo,
  situacaoDoPeriodo,
  statusPelasDatas,
} from "../src/models/campanhaDraft";
import {
  beneficioVazio,
  errosDasRegras,
  errosDoSobre,
  fraseDaRegra,
  payloadDoBeneficio,
  resumoCurto,
} from "../src/models/beneficioDraft";
import { descreverValor, erroValor } from "../src/models/valorBeneficio";
import type { Campanha } from "../src/models/types";

test("planejarOfertas cria, reativa e inativa só o que mudou", () => {
  const existentes = [
    { id: 1, conveniado_id: 10, status: "ATIVO" as const },
    { id: 2, conveniado_id: 20, status: "INATIVO" as const },
    { id: 3, conveniado_id: 30, status: "ATIVO" as const },
  ];
  assert.deepEqual(planejarOfertas(existentes, [10, 20, 40]), [
    { tipo: "status", id: 2, status: "ATIVO" },
    { tipo: "criar", conveniado_id: 40 },
    { tipo: "status", id: 3, status: "INATIVO" },
  ]);
  assert.deepEqual(planejarOfertas(existentes, [10, 30]), []);
  assert.deepEqual(planejarOfertas([], [5, 5]), [{ tipo: "criar", conveniado_id: 5 }]);
});

test("status e situação da campanha seguem as datas", () => {
  assert.equal(statusPelasDatas("2026-11-10", "2026-11-20", "2026-11-03"), "PLANEJADA");
  assert.equal(statusPelasDatas("2026-11-01", "2026-11-30", "2026-11-03"), "ATIVA");
  assert.equal(statusPelasDatas("2026-10-01", "2026-10-31", "2026-11-03"), "ENCERRADA");
  assert.equal(situacaoDoPeriodo("2026-11-04", "2026-11-10", "2026-11-03"), "Começa amanhã");
  assert.equal(situacaoDoPeriodo("2026-11-13", "2026-11-20", "2026-11-03"), "Começa em 10 dias");
  assert.equal(situacaoDoPeriodo("2026-11-01", "2026-11-03", "2026-11-03"), "Termina hoje");
  assert.equal(situacaoDoPeriodo("2026-11-01", "2026-11-30", "2026-11-03"), "Faltam 27 dias para terminar");
  assert.equal(situacaoDoPeriodo("2026-10-01", "2026-10-31", "2026-11-03"), "Terminou em 31/10/2026");
  assert.equal(duracaoEmDias("2026-02-01", "2026-02-28"), 28);
  assert.equal(duracaoEmDias("2026-02-10", "2026-02-01"), 0);
  assert.equal(progressoDoPeriodo("2026-11-01", "2026-11-10", "2026-10-30"), 0);
  assert.equal(progressoDoPeriodo("2026-11-01", "2026-11-10", "2026-11-05"), 50);
  assert.equal(progressoDoPeriodo("2026-11-01", "2026-11-10", "2026-12-01"), 100);
});

test("passo Sobre da campanha avisa o que falta", () => {
  assert.deepEqual(errosDaIniciativa(campanhaVazia()), [
    "Dê um nome.",
    "Informe quando começa.",
    "Informe quando termina.",
  ]);
  const patrocinado = {
    ...campanhaVazia(),
    tipo: "EVENTO_PATROCINADO" as const,
    nome: "Corrida",
    data_inicio: "2026-11-10",
    data_fim: "2026-11-01",
  };
  assert.deepEqual(errosDaIniciativa(patrocinado), [
    "A data de término precisa ser igual ou depois do começo.",
    "Informe quem patrocina o evento.",
  ]);
});

test("passo Benefícios da campanha exige nome, valor e parceiro", () => {
  const draft = { ...campanhaVazia(), itens: [{ ...novoItem("a"), valor: "150" }] };
  assert.deepEqual(errosDosItens(draft), [
    "Dê um nome para o benefício 1.",
    "Benefício 1: o desconto não pode passar de 100%.",
    "Benefício 1: escolha pelo menos um parceiro onde o colaborador vai usar.",
  ]);
  const certo = {
    ...campanhaVazia(),
    itens: [{ ...novoItem("a"), nome: "Check-up", valor: "100", conveniados: [1] }],
  };
  assert.deepEqual(errosDosItens(certo), []);
});

test("valor do benefício em texto simples", () => {
  assert.equal(descreverValor("PERCENTUAL", 15), "15% de desconto");
  assert.equal(descreverValor("PERCENTUAL", 100), "Gratuito");
  assert.equal(descreverValor("VALOR_FIXO", 50), "R$ 50,00 de desconto");
  assert.equal(descreverValor("VALOR_FIXO", ""), "Valor a definir");
  assert.equal(erroValor("VALOR_FIXO", "12,50"), "");
  assert.equal(erroValor("PERCENTUAL", "0"), "Informe quantos por cento de desconto.");
});

test("regra do benefício vira frase e payload certo", () => {
  const fixo = { ...beneficioVazio(), quantidade: "4" };
  assert.equal(
    fraseDaRegra(fixo),
    "Cada colaborador pode usar 4 vezes por mês. O saldo volta no dia 1 de cada mês.",
  );
  assert.equal(resumoCurto(fixo), "4 vezes por mês");
  const movel = {
    ...beneficioVazio(),
    tipo_janela: "JANELA_MOVEL" as const,
    intervalo_valor: "1",
    intervalo_unidade: "MES" as const,
    referencia_contagem: "DATA_ADMISSAO_COLABORADOR" as const,
  };
  assert.equal(
    fraseDaRegra(movel),
    "Cada colaborador pode usar 1 vez a cada 1 mês, contando a partir da data de admissão do colaborador.",
  );
  const payload = payloadDoBeneficio({ ...movel, nome: " Ótica ", valor: "20,5" });
  assert.equal(payload.nome, "Ótica");
  assert.equal(payload.valor, 20.5);
  assert.equal(payload.unidade_ciclo, null);
  assert.equal(payload.intervalo_valor, 1);
  assert.deepEqual(errosDoSobre(beneficioVazio()), [
    "Dê um nome para o benefício.",
    "Informe quantos por cento de desconto.",
  ]);
  assert.deepEqual(errosDasRegras({ ...movel, quantidade: "0", intervalo_valor: "" }), [
    "Informe quantas vezes o colaborador pode usar (a partir de 1).",
    "Informe de quanto em quanto tempo o saldo volta (a partir de 1).",
  ]);
});
