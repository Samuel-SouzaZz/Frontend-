import { Field } from "../ui";
import { capitalizeFirstLetter } from "../../models/formatters";
import { SENHA_MINIMA } from "../../models/rules";
import type { ContaNova, ModoConta } from "../../models/contaNova";
import type { Usuario } from "../../models/types";

const MODOS: { value: ModoConta; label: string }[] = [
  { value: "nova", label: "Pessoa nova" },
  { value: "existente", label: "Já tem conta" },
];

type ContaNovaCamposProps = {
  modo: ModoConta;
  onModo: (modo: ModoConta) => void;
  conta: ContaNova;
  onConta: (patch: Partial<ContaNova>) => void;
  editing: boolean;
  podeCriarConta: boolean;
  contaAtual?: Usuario;
  rotuloNome: string;
  exemploNome: string;
  exemploEmail: string;
  tituloDados: string;
};

export function ContaNovaCampos({
  modo,
  onModo,
  conta,
  onConta,
  editing,
  podeCriarConta,
  contaAtual,
  rotuloNome,
  exemploNome,
  exemploEmail,
  tituloDados,
}: ContaNovaCamposProps) {
  if (editing)
    return contaAtual ? (
      <p className="full-width colab-conta">
        Conta de acesso: <strong>{capitalizeFirstLetter(contaAtual.nome)}</strong> · {contaAtual.email}
      </p>
    ) : null;

  return (
    <>
      {podeCriarConta && (
        <div className="full-width colab-modo">
          <span className="s-toggle" role="radiogroup" aria-label="Como cadastrar">
            {MODOS.map((item) => (
              <button
                key={item.value}
                type="button"
                role="radio"
                aria-checked={modo === item.value}
                className={modo === item.value ? "is-active" : undefined}
                onClick={() => onModo(item.value)}
              >
                {item.label}
              </button>
            ))}
          </span>
        </div>
      )}
      {modo === "nova" && (
        <>
          <p className="full-width colab-secao">Conta de acesso</p>
          <Field label={rotuloNome} required>
            <input
              required
              maxLength={150}
              autoComplete="off"
              value={conta.nome}
              onChange={(event) => onConta({ nome: event.target.value })}
              placeholder={exemploNome}
            />
          </Field>
          <Field label="E-mail" required>
            <input
              required
              type="email"
              maxLength={150}
              autoComplete="off"
              value={conta.email}
              onChange={(event) => onConta({ email: event.target.value })}
              placeholder={exemploEmail}
            />
          </Field>
          <Field
            label="Senha inicial"
            required
            hint={`Mínimo de ${SENHA_MINIMA} caracteres. A pessoa usa para entrar no app.`}
          >
            <input
              required
              type="password"
              minLength={SENHA_MINIMA}
              autoComplete="new-password"
              value={conta.senha}
              onChange={(event) => onConta({ senha: event.target.value })}
            />
          </Field>
          <p className="full-width colab-secao">{tituloDados}</p>
        </>
      )}
    </>
  );
}
