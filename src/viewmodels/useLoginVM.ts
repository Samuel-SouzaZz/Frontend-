import { useState, type FormEvent } from "react";
import { useAuth } from "./AuthContext";
import { errorMessage } from "../hooks/useAsyncAction";

export function useLoginVM() {
  const { user, restoring, login } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [recovering, setRecovering] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await login(email.trim(), senha);
    } catch (error) {
      setError(errorMessage(error, "Não foi possível entrar."));
    } finally {
      setBusy(false);
    }
  }
  function beginRecovery() {
    setError("");
    setRecovering(true);
  }
  return {
    user,
    restoring,
    email,
    setEmail,
    senha,
    setSenha,
    visible,
    setVisible,
    busy,
    error,
    recovering,
    setRecovering,
    submit,
    beginRecovery,
  };
}
