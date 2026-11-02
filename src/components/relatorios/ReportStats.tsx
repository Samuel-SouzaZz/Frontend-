import { BarChart3, CheckCircle2, CircleDollarSign, Users } from "lucide-react";
import { StatCard, StatsGrid } from "../ui";
import { formatMoney } from "../../models/formatters";
import type { ReportResult } from "../../models/types";

function variacao(delta: number | null | undefined) {
  if (delta == null) return "Sem base no período anterior";
  const sinal = delta > 0 ? "+" : "";
  const valor = delta.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  return `${sinal}${valor}% em relação ao período anterior`;
}

export function ReportStats({
  report,
  delta,
}: {
  report: ReportResult;
  delta: number | null | undefined;
}) {
  return (
    <StatsGrid>
      <StatCard
        label="Resgates aprovados"
        value={report.approved.length}
        icon={<CheckCircle2 />}
        detail={variacao(delta)}
      />
      <StatCard
        label="Colaboradores participantes"
        value={report.participantes}
        icon={<Users />}
        tone="green"
        detail="Pessoas com ao menos um resgate aprovado"
      />
      <StatCard
        label="Valor aplicado"
        value={formatMoney(report.totalValor)}
        icon={<CircleDollarSign />}
        tone="purple"
        detail="Total registrado nas utilizações aprovadas"
      />
      <StatCard
        label="Custo médio por participante"
        value={formatMoney(report.custoMedio)}
        icon={<BarChart3 />}
        tone="amber"
        detail="Valor aplicado ÷ participantes únicos"
      />
    </StatsGrid>
  );
}
