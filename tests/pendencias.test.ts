import assert from "node:assert/strict";
import test from "node:test";
import { createFixtureData } from "../src/local-demo/demoData";
import { montarPendencias, totalDePendencias } from "../src/models/pendencias";

const HOJE = "2026-11-10";

function cenario() {
  const data = createFixtureData();
  data.utilizacoes = [
    {
      ...data.utilizacoes[0],
      id: 1,
      status: "PENDENTE",
      data_solicitacao: "2026-11-10T09:00:00",
    },
    {
      ...data.utilizacoes[0],
      id: 2,
      status: "PENDENTE",
      data_solicitacao: "2026-11-05T09:00:00",
    },
    {
      ...data.utilizacoes[0],
      id: 3,
      status: "APROVADA",
      data_solicitacao: "2026-11-01T09:00:00",
    },
  ];
  data.campanhas = [
    {
      ...data.campanhas[0],
      id: 1,
      tipo: "CAMPANHA",
      status: "ATIVA",
      data_inicio: "2026-11-01",
      data_fim: "2026-11-30",
    },
    {
      ...data.campanhas[0],
      id: 2,
      tipo: "EVENTO_INTERNO",
      status: "PLANEJADA",
      data_inicio: "2026-11-20",
      data_fim: "2026-11-20",
    },
    {
      ...data.campanhas[0],
      id: 3,
      tipo: "CAMPANHA",
      status: "ATIVA",
      data_inicio: "2026-10-01",
      data_fim: "2026-10-31",
    },
  ];
  return data;
}

const grupo = (data: ReturnType<typeof cenario>, id: string) =>
  montarPendencias(data, HOJE).find((item) => item.id === id)?.itens ?? [];

test("parceiro em analise vira pendencia com link para o detalhe", () => {
  const itens = grupo(cenario(), "parceiros");
  assert.deepEqual(
    itens.map((item) => item.link),
    ["/conveniados/6"],
  );
});

test("utilizacao pendente ha 2 dias ou mais fica urgente", () => {
  const itens = grupo(cenario(), "utilizacoes");
  assert.deepEqual(
    itens.map((item) => item.chave),
    ["utilizacao-2", "utilizacao-1"],
  );
  assert.equal(itens[0].urgente, true);
  assert.match(itens[0].descricao, /há 5 dias$/);
  assert.equal(itens[1].urgente, false);
  assert.match(itens[1].descricao, /pedido hoje$/);
});

test("beneficio ativo sem parceiro vira pendencia", () => {
  const data = cenario();
  data.ofertas = data.ofertas.map((oferta) =>
    oferta.beneficio_id === 1 ? { ...oferta, status: "INATIVO" } : oferta,
  );
  assert.deepEqual(
    grupo(data, "beneficios").map((item) => item.chave),
    ["beneficio-1"],
  );
});

test("campanha no ar sem beneficio vira pendencia, evento nao", () => {
  const data = cenario();
  data.itensCampanha = [];
  assert.deepEqual(
    grupo(data, "campanhas").map((item) => item.chave),
    ["campanha-1"],
  );
});

test("soma todas as pendencias", () => {
  assert.equal(totalDePendencias(montarPendencias(cenario(), HOJE)), 3);
});
