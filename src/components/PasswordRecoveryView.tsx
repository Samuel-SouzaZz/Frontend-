import { ArrowLeft, ArrowRight } from "lucide-react";
import type { usePasswordRecoveryVM } from "../viewmodels/usePasswordRecoveryVM";

export default function PasswordRecoveryView(
  props: ReturnType<typeof usePasswordRecoveryVM>,
) {
  const {
    step,
    email,
    code,
    password,
    passwordMinLength,
    busy,
    error,
    isDone,
    title,
    description,
    action,
    back,
    setEmail,
    setCode,
    setPassword,
    submit,
    goBack,
  } = props;

  return (
    <section className="login-recovery">
      <h1>{title}</h1>
      <p>{description}</p>
      {!isDone && (
        <form onSubmit={submit} aria-busy={busy}>
          {step === "email" && (
            <input
              aria-label="E-mail"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Seu e-mail"
              disabled={busy}
            />
          )}
          {step === "reset" && (
            <>
              <input
                aria-label="Código de 6 dígitos"
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="Código de 6 dígitos"
                disabled={busy}
              />
              <input
                aria-label="Nova senha"
                type="password"
                required
                autoComplete="new-password"
                minLength={passwordMinLength}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={`Nova senha (mínimo ${passwordMinLength} caracteres)`}
                disabled={busy}
              />
            </>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="btn btn-primary login-submit" disabled={busy}>
            {busy ? "Aguarde…" : action}
            <ArrowRight size={20} />
          </button>
        </form>
      )}
      <button className="login-recovery-back" type="button" onClick={goBack}>
        <ArrowLeft size={18} />
        {back}
      </button>
    </section>
  );
}
