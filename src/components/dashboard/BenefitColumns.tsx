type Item = { key: string; name: string; count: number };

export function BenefitColumns({
  items,
  maximum,
  colors,
}: {
  items: Item[];
  maximum: number;
  colors: string[];
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Utilizações por tipo de benefício</h2>
      </div>
      <div className="benefit-columns">
        {items.slice(0, 6).map((item, index) => (
          <div key={item.key}>
            <strong>{item.count}</strong>
            <div
              style={{
                height: `${(item.count / maximum) * 148}px`,
                background: colors[index % colors.length],
              }}
            />
            <small>{item.name}</small>
          </div>
        ))}
      </div>
      <p className="chart-caption">
        Eixo vertical: utilizações aprovadas · Eixo horizontal: benefício
      </p>
    </section>
  );
}
