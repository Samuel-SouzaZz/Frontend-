const ABAS = [
  { id: "utilizacoes", label: "Utilizações" },
  { id: "adesao", label: "Adesão" },
  { id: "beneficios", label: "Benefícios" },
  { id: "periodo", label: "Dados por período" },
  { id: "conveniados", label: "Conveniados" },
];

export function ReportTabs({
  tab,
  onChange,
}: {
  tab: string;
  onChange: (tab: string) => void;
}) {
  return (
    <div className="tabs" role="tablist" aria-label="Tipos de relatório">
      {ABAS.map((item) => (
        <button
          type="button"
          key={item.id}
          id={`tab-${item.id}`}
          className={`tab ${tab === item.id ? "active" : ""}`}
          role="tab"
          aria-selected={tab === item.id}
          aria-controls={`report-${item.id}`}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
