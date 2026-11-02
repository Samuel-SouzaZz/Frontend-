import type { SessionUser } from "../models/types";
import { useAuth } from "../viewmodels/AuthContext";

export function useSessionUser(): SessionUser {
  const { user } = useAuth();
  if (!user) throw new Error("Sessão encerrada. Faça login novamente.");
  return user;
}
