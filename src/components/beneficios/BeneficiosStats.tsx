import { Building2, CalendarDays, CheckCircle2, Gift } from "lucide-react";
import { StatCard, StatsGrid } from "../ui";
import type { Beneficio, Oferta } from "../../models/types";

export function BeneficiosStats({
  beneficios,
  ofertas,
}: {
  beneficios: Beneficio[];
  ofertas: Oferta[];
}) {
  const ativos = beneficios.filter((item) => item.status === "ATIVO").length;
  const calendarioFixo = beneficios.filter(
    (item) => item.tipo_janela === "CALENDARIO_FIXO",
  ).length;
  const ofertasAtivas = ofertas.filter((item) => item.status === "ATIVO").length;
  return (
    <StatsGrid>
      <StatCard
        label="Total de benefícios"
        value={beneficios.length}
        icon={<Gift size={21} />}
        detail="Benefícios no catálogo"
      />
      <StatCard
        label="Benefícios ativos"
        value={ativos}
        icon={<CheckCircle2 size={21} />}
        tone="green"
        detail="Disponíveis conforme as regras"
      />
      <StatCard
        label="Calendário fixo"
        value={calendarioFixo}
        icon={<CalendarDays size={21} />}
        tone="purple"
        detail="Renovação por semana, mês ou ano"
      />
      <StatCard
        label="Ofertas ativas"
        value={ofertasAtivas}
        icon={<Building2 size={21} />}
        tone="amber"
        detail="Vínculos com conveniados"
      />
    </StatsGrid>
  );
}
