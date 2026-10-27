import { useState, useMemo } from "react";
import { buildReport } from "../models/reportSelectors";
import { withinPeriod, parseDate, toLocalDateString } from "../models/selectors";
import { useAuth } from "./AuthContext";
import { usePortal } from "./PortalContext";

export function useDashboardVM() {
  const { data } = usePortal();
  const { user } = useAuth();
  const [days, setDays] = useState(30);

  const usages = useMemo(
    () => data.utilizacoes.filter((u) => withinPeriod(u.data_solicitacao, days)),
    [data.utilizacoes, days],
  );

  const approved = useMemo(
    () => usages.filter((u) => u.status === "APROVADA"),
    [usages],
  );

  const today = useMemo(() => toLocalDateString(), []);

  const first = useMemo(
    () => [...usages].map((item) => item.data_solicitacao.slice(0, 10)).sort()[0] || today,
    [usages, today],
  );

  const report = useMemo(
    () => buildReport({ ...data, utilizacoes: usages }, first, today),
    [data, usages, first, today],
  );

  const byBenefit = useMemo(
    () => report.benefits.map((item) => ({ name: item.nome, count: item.count })),
    [report.benefits],
  );

  const least = useMemo(
    () => [...byBenefit].sort((a, b) => a.count - b.count).slice(0, 3),
    [byBenefit],
  );

  const colors = useMemo(
    () => ["#283772", "#3b4b86", "#4f6098", "#6575ae", "#8391c0", "#a7b1d2"],
    [],
  );

  const donut = useMemo(() => {
    let offset = 0;
    const stops = report.categories.map((item, index) => {
      const start = offset;
      offset += approved.length ? (item.count / approved.length) * 100 : 0;
      return `${colors[index % colors.length]} ${start}% ${offset}%`;
    });
    return stops.length ? `conic-gradient(${stops.join(",")})` : "#e8f1f8";
  }, [report.categories, approved.length, colors]);

  const maximum = useMemo(
    () => Math.max(1, ...byBenefit.map((item) => item.count)),
    [byBenefit],
  );

  const latest = useMemo(
    () =>
      [...usages]
        .sort((a, b) => b.data_solicitacao.localeCompare(a.data_solicitacao))
        .slice(0, 5),
    [usages],
  );

  const months = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - (5 - i));
      const targetMonth = date.getMonth();
      const targetYear = date.getFullYear();

      const count = approved.filter((u) => {
        const usageDate = parseDate(u.data_solicitacao);
        return (
          usageDate.getMonth() === targetMonth &&
          usageDate.getFullYear() === targetYear
        );
      }).length;

      return {
        label: date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
        count,
      };
    });
  }, [approved]);

  const maxMonth = useMemo(
    () => Math.max(1, ...months.map((month) => month.count)),
    [months],
  );

  const chartPoints = useMemo(
    () =>
      months
        .map((month, i) => `${40 + i * 86},${175 - (month.count / maxMonth) * 130}`)
        .join(" "),
    [months, maxMonth],
  );

  return {
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
  };
}
