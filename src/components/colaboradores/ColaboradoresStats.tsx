import { UserCheck, UserMinus, UserRoundCheck, Users } from "lucide-react";
import { StatCard, StatsGrid } from "../ui";
import type { Colaborador } from "../../models/types";

export function ColaboradoresStats({
  colaboradores,
}: {
  colaboradores: Colaborador[];
}) {
  const contar = (status: Colaborador["status"]) =>
    colaboradores.filter((item) => item.status === status).length;
  return (
    <StatsGrid>
      <StatCard
        label="Total de colaboradores"
        value={colaboradores.length}
        icon={<Users size={21} />}
        detail="Cadastros na plataforma"
      />
      <StatCard
        label="Colaboradores ativos"
        value={contar("ATIVO")}
        icon={<UserCheck size={21} />}
        tone="green"
        detail="Com acesso aos benefícios"
      />
      <StatCard
        label="Colaboradores afastados"
        value={contar("AFASTADO")}
        icon={<UserRoundCheck size={21} />}
        tone="amber"
        detail="Acesso suspenso por afastamento"
      />
      <StatCard
        label="Colaboradores inativos"
        value={contar("INATIVO")}
        icon={<UserMinus size={21} />}
        tone="purple"
        detail="Histórico preservado"
      />
    </StatsGrid>
  );
}
