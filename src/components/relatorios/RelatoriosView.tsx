import { ChartNoAxesCombined, Download, Info } from "lucide-react";
import { PageHeader } from "../ui";
import type { useRelatoriosVM } from "../../viewmodels/useRelatoriosVM";
import { AbaAdesao } from "./AbaAdesao";
import { AbaBeneficios } from "./AbaBeneficios";
import { AbaConveniados } from "./AbaConveniados";
import { AbaPeriodo } from "./AbaPeriodo";
import { AbaUtilizacoes } from "./AbaUtilizacoes";
import { ReportPeriod } from "./ReportPeriod";
import { ReportStats } from "./ReportStats";
import { ReportTabs } from "./ReportTabs";

export default function RelatoriosView(
  props: ReturnType<typeof useRelatoriosVM>,
) {
  const {
    inicio,
    fim,
    tab,
    setInicio,
    setFim,
    setPage,
    changeTab,
    report,
    delta,
    benefitPage,
    partnerPage,
    periodPage,
    campaignPage,
    statusCounts,
    exportar,
  } = props;

  return (
    <>
      <PageHeader
        eyebrow="INTELIGÊNCIA E GESTÃO"
        icon={ChartNoAxesCombined}
        title="Relatórios"
        description="Transforme os registros de utilização em informações para a fundação."
        actions={
          <button
            type="button"
            className="btn btn-secondary"
            onClick={exportar}
            disabled={!report.valid || !report.filtered.length}
          >
            <Download size={17} /> Exportar utilizações (CSV)
          </button>
        }
      />
      <ReportPeriod
        inicio={inicio}
        fim={fim}
        valid={report.valid}
        onInicioChange={setInicio}
        onFimChange={setFim}
      />
      <ReportStats report={report} delta={delta} />
      <ReportTabs tab={tab} onChange={changeTab} />
      <div role="tabpanel" id={`report-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "utilizacoes" && (
          <AbaUtilizacoes
            report={report}
            inicio={inicio}
            fim={fim}
            statusCounts={statusCounts}
          />
        )}
        {tab === "adesao" && (
          <AbaAdesao
            report={report}
            campaignPage={campaignPage}
            onPageChange={setPage}
          />
        )}
        {tab === "beneficios" && (
          <AbaBeneficios
            report={report}
            benefitPage={benefitPage}
            onPageChange={setPage}
          />
        )}
        {tab === "periodo" && (
          <AbaPeriodo
            report={report}
            periodPage={periodPage}
            onPageChange={setPage}
          />
        )}
        {tab === "conveniados" && (
          <AbaConveniados
            report={report}
            partnerPage={partnerPage}
            onPageChange={setPage}
          />
        )}
      </div>
      <p className="report-note">
        <Info size={16} /> Os indicadores são calculados a partir dos dados
        carregados no portal. “Valor aplicado” é o valor registrado no resgate e
        não comprova despesa contábil. O CSV exporta todas as solicitações do
        intervalo, incluindo pendentes, reprovadas e estornadas.
      </p>
    </>
  );
}
