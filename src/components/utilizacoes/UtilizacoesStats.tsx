import { CheckCircle2, CircleDollarSign, History, Users } from "lucide-react";
import { StatCard, StatsGrid } from "../ui";
import { formatMoney } from "../../models/formatters";
import type { Utilizacao } from "../../models/types";

export function UtilizacoesStats({
  total,
  aprovadas,
}: {
  total: number;
  aprovadas: Utilizacao[];
}) {
  const colaboradores = new Set(aprovadas.map((uso) => uso.colaborador_id));
  const valor = aprovadas.reduce(
    (soma, uso) => soma + Number(uso.valor_aplicado),
    0,
  );
  return (
    <StatsGrid>
      <StatCard
        label="Registros encontrados"
        value={total}
        icon={<History />}
        detail="Conforme os filtros aplicados"
      />
      <StatCard
        label="Utilizações aprovadas"
        value={aprovadas.length}
        icon={<CheckCircle2 />}
        tone="green"
        detail="Estornos excluídos da contagem"
      />
      <StatCard
        label="Colaboradores atendidos"
        value={colaboradores.size}
        icon={<Users />}
        tone="purple"
        detail="Com ao menos um resgate aprovado"
      />
      <StatCard
        label="Valor aplicado"
        value={formatMoney(valor)}
        icon={<CircleDollarSign />}
        tone="amber"
        detail="Soma dos resgates aprovados"
      />
    </StatsGrid>
  );
}
