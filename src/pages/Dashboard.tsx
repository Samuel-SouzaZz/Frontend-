import { PageHeader } from "../components/ui";
import { BenefitColumns } from "../components/dashboard/BenefitColumns";
import { CategoryChart } from "../components/dashboard/CategoryChart";
import { DashboardStats } from "../components/dashboard/DashboardStats";
import { LeastUsedBenefits } from "../components/dashboard/LeastUsedBenefits";
import { MonthlyChart } from "../components/dashboard/MonthlyChart";
import { PeriodSelect } from "../components/dashboard/PeriodSelect";
import { RecentUsages } from "../components/dashboard/RecentUsages";
import { TopPartners } from "../components/dashboard/TopPartners";
import {
  beneficioDaUtilizacao,
  capitalizeFirstLetter,
  colaboradorNome,
  conveniadoDaUtilizacao,
} from "../models/selectors";
import { useDashboardVM } from "../viewmodels/useDashboardVM";

export default function Dashboard() {
  const {
    data,
    user,
    days,
    setDays,
    approved,
    report,
    byBenefit,
    least,
    colors,
    donut,
    maximum,
    latest,
    months,
    maxMonth,
    chartPoints,
  } = useDashboardVM();

  const primeiroNome = capitalizeFirstLetter(user?.nome ?? "")
    .split(" ")
    .slice(0, 2)
    .join(" ");

  return (
    <>
      <PageHeader
        title={`Olá, ${primeiroNome}!`}
        description="Aqui está um resumo das utilizações e dos benefícios da Fundação."
        actions={<PeriodSelect days={days} onChange={setDays} />}
      />
      <DashboardStats
        aprovadas={approved.length}
        beneficiosUtilizados={byBenefit.filter((item) => item.count > 0).length}
        colaboradoresAtivos={
          data.colaboradores.filter((item) => item.status === "ATIVO").length
        }
        beneficiosSemUso={byBenefit.filter((item) => item.count === 0).length}
      />
      <div className="dashboard-grid">
        <MonthlyChart
          months={months}
          maxMonth={maxMonth}
          chartPoints={chartPoints}
        />
        <CategoryChart
          categories={report.categories}
          total={approved.length}
          donut={donut}
          colors={colors}
        />
        <LeastUsedBenefits items={least} maximum={maximum} />
      </div>
      <div className="dashboard-bottom">
        <TopPartners partners={report.partners} total={approved.length} />
        <BenefitColumns items={byBenefit} maximum={maximum} colors={colors} />
        <RecentUsages
          usos={latest}
          beneficio={(uso) => beneficioDaUtilizacao(data, uso)?.nome}
          colaborador={(uso) => colaboradorNome(data, uso.colaborador_id)}
          conveniado={(uso) => conveniadoDaUtilizacao(data, uso)?.nome_fantasia}
        />
      </div>
    </>
  );
}
