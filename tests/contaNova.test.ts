import assert from "node:assert/strict";
import test from "node:test";
import { contaLimpa, erroDaContaNova } from "../src/models/contaNova";
import type { Usuario } from "../src/models/types";

const usuarios: Usuario[] = [{ id: 1, nome: "Carla", email: "carla@fcv.org.br", perfil_id: 3, status: "ATIVO" }];
const conta = { nome: "Marcos Lima", email: "marcos.teste@otica.com", senha: "123456" };

test("conta nova completa passa", () => {
  assert.equal(erroDaContaNova(conta, usuarios), "");
});

test("conta nova sem nome, com e-mail ruim ou senha curta é barrada", () => {
  assert.match(erroDaContaNova({ ...conta, nome: "  " }, usuarios), /nome/);
  assert.match(erroDaContaNova({ ...conta, email: "marcos@" }, usuarios), /e-mail válido/);
  assert.match(erroDaContaNova({ ...conta, senha: "123" }, usuarios), /6 caracteres/);
});

test("e-mail que já existe é barrado mesmo com maiúscula e espaço", () => {
  assert.match(erroDaContaNova({ ...conta, email: " Carla@FCV.org.br " }, usuarios), /Já existe/);
});

test("conta limpa tira espaços e deixa o e-mail minúsculo", () => {
  assert.deepEqual(contaLimpa({ nome: " Marcos ", email: " Marcos@Otica.com ", senha: " 123456" }), {
    nome: "Marcos",
    email: "marcos@otica.com",
    senha: " 123456",
  });
});
