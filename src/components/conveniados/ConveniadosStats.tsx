import { Building2, CheckCircle2, Clock3, Power } from "lucide-react";
import { StatCard, StatsGrid } from "../ui";
import type { Conveniado } from "../../models/types";

export function ConveniadosStats({
  conveniados,
}: {
  conveniados: Conveniado[];
}) {
  const contar = (status: Conveniado["status"]) =>
    conveniados.filter((item) => item.status === status).length;
  return (
    <StatsGrid>
      <StatCard
        label="Total de conveniados"
        value={conveniados.length}
        icon={<Building2 size={21} />}
        detail="Estabelecimentos cadastrados"
      />
      <StatCard
        label="Conveniados ativos"
        value={contar("ATIVO")}
        icon={<CheckCircle2 size={21} />}
        tone="green"
        detail="Prontos para oferecer benefícios"
      />
      <StatCard
        label="Em análise"
        value={contar("EM_ANALISE")}
        icon={<Clock3 size={21} />}
        tone="amber"
        detail="Aguardando liberação da FCV"
      />
      <StatCard
        label="Conveniados inativos"
        value={contar("INATIVO")}
        icon={<Power size={21} />}
        tone="purple"
        detail="Histórico preservado"
      />
    </StatsGrid>
  );
}
