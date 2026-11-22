import assert from "node:assert/strict";
import test from "node:test";
import { agoraLocal, comStatusPelaData, venceu } from "../src/models/statusResgate";
import type { Utilizacao } from "../src/models/types";

const uso = (status: Utilizacao["status"], data_expiracao: string) =>
  ({ id: 1, colaborador_id: 1, token_qrcode: "t", data_solicitacao: "2026-11-18 09:00:00", data_expiracao, valor_aplicado: 10, status }) as Utilizacao;

test("agoraLocal escreve no mesmo formato da API", () => {
  assert.equal(agoraLocal(new Date(2026, 10, 8, 7, 5, 3)), "2026-11-08 07:05:03");
});

test("pendente com a data de expiração passada já é EXPIRADA", () => {
  assert.equal(venceu(uso("PENDENTE", "2026-11-18 12:00:00"), "2026-11-18 12:00:00"), true);
  assert.equal(venceu(uso("PENDENTE", "2026-11-18T12:00:01"), "2026-11-18 12:00:00"), false);
  assert.equal(venceu(uso("APROVADA", "2026-11-18 08:00:00"), "2026-11-18 12:00:00"), false);
});

test("comStatusPelaData troca só os pendentes vencidos", () => {
  const lista = comStatusPelaData(
    [uso("PENDENTE", "2026-11-18 10:00:00"), uso("PENDENTE", "2026-11-18 13:00:00"), uso("REPROVADA", "2026-11-18 10:00:00")],
    "2026-11-18 12:00:00",
  );
  assert.deepEqual(lista.map((item) => item.status), ["EXPIRADA", "PENDENTE", "REPROVADA"]);
});
