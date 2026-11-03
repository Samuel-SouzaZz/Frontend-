import assert from "node:assert/strict";
import test from "node:test";
import { descreverValor } from "../src/models/valorBeneficio";

test("descreve desconto em porcentagem", () => {
  assert.equal(
    descreverValor("PERCENTUAL", "15"),
    "15% de desconto"
  );

  assert.equal(
    descreverValor("PERCENTUAL", 12.5),
    "12,5% de desconto"
  );
});

test("100% vira gratuito", () => {
  assert.equal(
    descreverValor("PERCENTUAL", 100),
    "Gratuito"
  );
});

test("descreve desconto em reais", () => {
  assert.match(
    descreverValor("VALOR_FIXO", "20"),
    /^R\$\s20,00 de desconto$/
  );
});

test("valor vazio ou zero fica a definir", () => {
  assert.equal(
    descreverValor("PERCENTUAL", ""),
    "Valor a definir"
  );

  assert.equal(
    descreverValor("VALOR_FIXO", 0),
    "Valor a definir"
  );
});