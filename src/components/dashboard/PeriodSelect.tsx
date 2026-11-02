import { CalendarDays } from "lucide-react";
import { Select, type SelectOption } from "../ui";

const PERIODOS: SelectOption[] = [
  { value: "30", label: "Últimos 30 dias" },
  { value: "90", label: "Últimos 90 dias" },
  { value: "365", label: "Últimos 12 meses" },
  { value: "0", label: "Todo o período" },
];

export function PeriodSelect({
  days,
  onChange,
}: {
  days: number;
  onChange: (days: number) => void;
}) {
  return (
    <div className="period-control">
      <CalendarDays size={17} aria-hidden="true" />
      <Select
        aria-label="Período do dashboard"
        value={String(days)}
        options={PERIODOS}
        onChange={(value) => onChange(Number(value))}
      />
    </div>
  );
}
