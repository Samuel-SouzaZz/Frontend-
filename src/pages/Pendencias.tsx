import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ListChecks,
} from "lucide-react";
import { PageHeader } from "../components/ui";
import { usePendenciasVM } from "../viewmodels/usePendenciasVM";
export default function Pendencias() {
  const vm = usePendenciasVM();
  return (
    <>
      <PageHeader
        icon={ListChecks}
        title="Pendências"
        description="Tudo o que precisa da sua atenção, em um lugar só."
      />
      {vm.carregando ? (
        <div className="loading-state" role="status">
          Carregando…
        </div>
      ) : vm.total === 0 ? (
        <section className="panel pending-empty">
          <CheckCircle2 size={30} aria-hidden="true" />
          <strong>Tudo em dia</strong>
          <p>
            Nenhum parceiro esperando aprovação, nenhuma utilização parada e
            nenhum cadastro incompleto.
          </p>
        </section>
      ) : (
        <>
          <div className="pending-summary">
            {vm.grupos.map((grupo) => (
              <a
                key={grupo.id}
                href={`#${grupo.id}`}
                className={grupo.itens.length ? "has-items" : undefined}
              >
                <strong>{grupo.itens.length}</strong>
                <span>{grupo.titulo}</span>
              </a>
            ))}
          </div>
          {vm.comItens.map((grupo) => (
            <section
              key={grupo.id}
              id={grupo.id}
              className="panel pending-group"
            >
              <header>
                <h2>
                  {grupo.titulo} <span>{grupo.itens.length}</span>
                </h2>
                <p>{grupo.explicacao}</p>
              </header>
              <ul>
                {grupo.itens.map((item) => (
                  <li key={item.chave}>
                    {item.urgente && (
                      <AlertCircle
                        size={18}
                        className="pending-alert"
                        aria-label="Parado há mais de um dia"
                      />
                    )}
                    <div>
                      <strong>{item.titulo}</strong>
                      <span>{item.descricao}</span>
                    </div>
                    <Link
                      className="btn btn-secondary btn-small"
                      to={item.link}
                    >
                      {item.acao} <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </>
  );
}
