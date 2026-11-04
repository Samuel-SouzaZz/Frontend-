export type OpcaoSituacao = { value: string; label: string; total: number };

export function FiltroSituacao({
  opcoes,
  valor,
  onChange,
}: {
  opcoes: OpcaoSituacao[];
  valor: string;
  onChange: (valor: string) => void;
}) {
  return (
    <div className="t-situacao" role="group" aria-label="Filtrar por situação">
      {opcoes.map((opcao) => (
        <button
          key={opcao.value || "todas"}
          type="button"
          aria-pressed={valor === opcao.value}
          onClick={() => onChange(opcao.value)}
        >
          {opcao.label}
          <span>{opcao.total}</span>
        </button>
      ))}
    </div>
  );
}
