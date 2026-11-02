import { CalendarDays, Gift, Megaphone, Users } from "lucide-react";
import { StatCard, StatsGrid } from "../ui";
import type { Campanha, ItemCampanha } from "../../models/types";

type CampanhasStatsProps = {
  campanhas: Campanha[];
  itens: ItemCampanha[];
  participantes: number;
  today: string;
};

export function CampanhasStats({
  campanhas,
  itens,
  participantes,
  today,
}: CampanhasStatsProps) {
  const emAndamento = campanhas.filter(
    (item) =>
      item.tipo === "CAMPANHA" &&
      item.status === "ATIVA" &&
      item.data_inicio.slice(0, 10) <= today &&
      item.data_fim.slice(0, 10) >= today,
  ).length;
  const proximosEventos = campanhas.filter(
    (item) =>
      item.tipo.startsWith("EVENTO") &&
      ["ATIVA", "PLANEJADA"].includes(item.status) &&
      item.data_inicio.slice(0, 10) >= today,
  ).length;
  const itensAtivos = itens.filter((item) => item.status === "ATIVO").length;
  return (
    <StatsGrid className="campaign-stats">
      <StatCard
        label="Campanhas em andamento"
        value={emAndamento}
        icon={<Megaphone />}
        detail="Ativas e dentro do período de vigência"
      />
      <StatCard
        label="Próximos eventos"
        value={proximosEventos}
        icon={<CalendarDays />}
        tone="green"
        detail="Eventos planejados ou ativos"
      />
      <StatCard
        label="Itens promocionais ativos"
        value={itensAtivos}
        icon={<Gift />}
        tone="purple"
        detail="Itens cadastrados em campanhas e eventos"
      />
      <StatCard
        label="Colaboradores participantes"
        value={participantes}
        icon={<Users />}
        tone="amber"
        detail="Com resgate aprovado de item promocional"
      />
    </StatsGrid>
  );
}
