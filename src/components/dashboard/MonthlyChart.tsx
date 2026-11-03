type Mes = { label: string; count: number };

const X0 = 40;
const PASSO = 86;
const BASE = 175;
const ALTURA = 130;

export function MonthlyChart({
  months,
  maxMonth,
  chartPoints,
}: {
  months: Mes[];
  maxMonth: number;
  chartPoints: string;
}) {
  const descricao = months.map((mes) => `${mes.label}: ${mes.count}`).join(", ");
  return (
    <section className="panel dashboard-chart">
      <div className="panel-header">
        <div>
          <span className="eyebrow">ACOMPANHAMENTO</span>
          <h2>Utilizações no período</h2>
        </div>
        <span className="chart-legend">
          <i />
          Aprovadas
        </span>
      </div>
      <div className="line-chart">
        <svg
          viewBox="0 0 520 215"
          role="img"
          aria-label={`Utilizações aprovadas: ${descricao}`}
        >
          <title>
            Utilizações aprovadas no período selecionado, divididas em seis
            intervalos
          </title>
          {[0, 1, 2, 3].map((linha) => (
            <g key={linha}>
              <line
                x1={X0}
                y1={BASE - linha * 43}
                x2="485"
                y2={BASE - linha * 43}
                className="grid-line"
              />
              <text x="10" y={BASE + 4 - linha * 43}>
                {Math.round((maxMonth * linha) / 3)}
              </text>
            </g>
          ))}
          <polygon
            points={`${X0},${BASE} ${chartPoints} 470,${BASE}`}
            className="chart-area"
          />
          <polyline points={chartPoints} className="chart-line" />
          {months.map((mes, index) => (
            <g key={`${mes.label}-${index}`}>
              <circle
                cx={X0 + index * PASSO}
                cy={BASE - (mes.count / maxMonth) * ALTURA}
                r="5"
                className="chart-dot"
              />
              <text x={X0 + index * PASSO} y="202" textAnchor="middle">
                {mes.label}
              </text>
            </g>
          ))}
        </svg>
        <p className="chart-caption">
          Eixo vertical: utilizações aprovadas · Eixo horizontal: início de
          cada intervalo · Fonte: registros do portal
        </p>
      </div>
    </section>
  );
}
