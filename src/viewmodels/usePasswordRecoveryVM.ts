import { useState, type FormEvent } from "react";
import { requestPasswordReset, resetPassword } from "../services/api";
import { SENHA_MINIMA } from "../models/rules";

type Step = "email" | "reset" | "done";

const content: Record<
  Step,
  { title: string; description: string; action: string; back: string }
> = {
  email: {
    title: "Esqueci minha senha",
    description: "Informe o e-mail da sua conta para receber um código de redefinição.",
    action: "Enviar código",
    back: "Voltar ao login",
  },
  reset: {
    title: "Esqueci minha senha",
    description:
      "Se o e-mail estiver cadastrado, enviamos um código de 6 dígitos válido por 15 minutos. Digite o código e escolha a nova senha.",
    action: "Salvar nova senha",
    back: "Não recebeu? Voltar e informar o e-mail",
  },
  done: {
    title: "Senha redefinida",
    description: "Sua senha foi alterada. Volte ao login para entrar.",
    action: "",
    back: "Voltar ao login",
  },
};

export function usePasswordRecoveryVM({
  onBack,
  defaultEmail = "",
}: {
  onBack: () => void;
  defaultEmail?: string;
}) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    if (step === "reset" && password.length < SENHA_MINIMA) {
      setError(`A nova senha deve ter pelo menos ${SENHA_MINIMA} caracteres.`);
      return;
    }
    setBusy(true);
    try {
      if (step === "email") {
        await requestPasswordReset(email.trim());
        setStep("reset");
      } else if (step === "reset") {
        await resetPassword(email.trim(), code, password);
        setStep("done");
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível redefinir a senha.",
      );
    } finally {
      setBusy(false);
    }
  }

  function goBack() {
    if (step === "email" || step === "done") {
      onBack();
      return;
    }
    setStep("email");
    setCode("");
    setPassword("");
    setError("");
  }

  return {
    step,
    email,
    code,
    password,
    busy,
    error,
    isDone: step === "done",
    passwordMinLength: SENHA_MINIMA,
    ...content[step],
    setEmail,
    setCode: (value: string) => setCode(value.replace(/\D/g, "").slice(0, 6)),
    setPassword,
    submit,
    goBack,
  };
}
