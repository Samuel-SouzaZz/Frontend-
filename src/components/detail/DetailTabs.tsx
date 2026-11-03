export type DetailTab<T extends string> = {
  id: T;
  label: string;
  total?: number;
};

export function DetailTabs<T extends string>({
  abas,
  atual,
  onChange,
}: {
  abas: DetailTab<T>[];
  atual: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="detail-tabs" role="tablist">
      {abas.map((aba) => (
        <button
          key={aba.id}
          type="button"
          role="tab"
          aria-selected={aba.id === atual}
          className={aba.id === atual ? "is-active" : undefined}
          onClick={() => onChange(aba.id)}
        >
          {aba.label}

          {aba.total !== undefined && (
            <span>{aba.total}</span>
          )}
        </button>
      ))}
    </div>
  );
}