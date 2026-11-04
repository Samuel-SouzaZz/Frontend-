import { SENHA_MINIMA } from "./rules";
import type { Usuario } from "./types";

export type ModoConta = "nova" | "existente";

export type ContaNova = { nome: string; email: string; senha: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizarEmail = (email: string) => email.trim().toLocaleLowerCase("pt-BR");

export function erroDaContaNova(conta: ContaNova, usuarios: Usuario[]) {
  const email = normalizarEmail(conta.email);
  if (!conta.nome.trim()) return "Informe o nome de quem vai usar a conta.";
  if (!EMAIL.test(email)) return "Informe um e-mail válido.";
  if (usuarios.some((usuario) => normalizarEmail(usuario.email) === email))
    return "Já existe uma conta com este e-mail. Use a opção Já tem conta.";
  if (conta.senha.length < SENHA_MINIMA)
    return `A senha inicial precisa ter pelo menos ${SENHA_MINIMA} caracteres.`;
  return "";
}

export const contaLimpa = (conta: ContaNova): ContaNova => ({
  nome: conta.nome.trim(),
  email: normalizarEmail(conta.email),
  senha: conta.senha,
});
