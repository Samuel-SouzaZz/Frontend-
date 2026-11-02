import { ClipboardCheck, Gift, Handshake, Users } from "lucide-react";
import { StatCard, StatsGrid } from "../ui";

type DashboardStatsProps = {
  aprovadas: number;
  beneficiosUtilizados: number;
  colaboradoresAtivos: number;
  beneficiosSemUso: number;
};

export function DashboardStats({
  aprovadas,
  beneficiosUtilizados,
  colaboradoresAtivos,
  beneficiosSemUso,
}: DashboardStatsProps) {
  return (
    <StatsGrid>
      <StatCard
        label="Total de utilizações"
        value={aprovadas}
        icon={<ClipboardCheck />}
        detail="No período selecionado"
        tone="green"
      />
      <StatCard
        label="Benefícios utilizados"
        value={beneficiosUtilizados}
        icon={<Gift />}
        detail="Com utilizações aprovadas no período"
        tone="purple"
      />
      <StatCard
        label="Colaboradores ativos"
        value={colaboradoresAtivos}
        icon={<Users />}
        detail="Pessoas com cadastro ativo"
      />
      <StatCard
        label="Benefícios pouco utilizados"
        value={beneficiosSemUso}
        icon={<Handshake />}
        detail="Sem utilizações aprovadas no período"
        tone="amber"
      />
    </StatsGrid>
  );
}
