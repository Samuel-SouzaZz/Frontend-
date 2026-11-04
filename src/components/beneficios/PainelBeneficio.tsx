import { useState } from "react";
import { Ban, Gift, Pause, Pencil, Play, Plus, Store } from "lucide-react";
import { Selo } from "../board/Drawer";
import { draftDoBeneficio, fraseDaRegra } from "../../models/beneficioDraft";
import { formatDate, statusLabel } from "../../models/formatters";
import { descreverValor } from "../../models/valorBeneficio";
import type { Beneficio } from "../../models/types";
import type { ResumoBeneficio } from "../../viewmodels/useBeneficiosVM";

const PERGUNTA: Record<Beneficio["status"], { texto: string; botao: string; perigo: boolean }> = {
  ATIVO: { texto: "Voltar a mostrar para os colaboradores?", botao: "Sim, reativar", perigo: false },
  INATIVO: { texto: "Esconder do app até você reativar? Nada do histórico se perde.", botao: "Sim, pausar", perigo: false },
  DESCONTINUADO: { texto: "Encerrar de vez? Ele não volta, mas o histórico fica guardado.", botao: "Sim, encerrar", perigo: true },
};

export const SELO_BENEFICIO = {
  ATIVO: { tom: "verde", texto: "Ativo" },
  INATIVO: { tom: "amarelo", texto: "Pausado" },
  DESCONTINUADO: { tom: "cinza", texto: "Encerrado" },
} as const;

export function PainelBeneficio({
  resumo,
  onEditar,
}: {
  resumo: ResumoBeneficio;
  onEditar: () => void;
}) {
  const { beneficio, parceiros, usosAprovados, colaboradores, usos } = resumo;
  const selo = SELO_BENEFICIO[beneficio.status];

  return (
    <div className="painel">
      <header className="painel-head">
        <span className={`chip-tipo chip-grande ${beneficio.tipo_beneficio === "PERCENTUAL" ? "tipo-beneficio" : "tipo-beneficio-reais"}`} aria-hidden="true">
          <Gift size={24} />
        </span>
        <div>
          <h2>{beneficio.nome}</h2>
          <Selo tom={selo.tom}>{selo.texto}</Selo>
        </div>
      </header>

      <dl className="painel-dados">
        <div>
          <dt>Vale</dt>
          <dd>{descreverValor(beneficio.tipo_beneficio, beneficio.valor)}</dd>
        </div>
        <div>
          <dt>Uso</dt>
          <dd>
            {usosAprovados === 0
              ? "Ninguém usou ainda"
              : `${usosAprovados} ${usosAprovados === 1 ? "uso" : "usos"} por ${colaboradores} ${colaboradores === 1 ? "pessoa" : "pessoas"}`}
          </dd>
        </div>
      </dl>
      <p className="painel-texto">{fraseDaRegra(draftDoBeneficio(beneficio, []))}</p>
      {beneficio.descricao && <p className="painel-texto">{beneficio.descricao}</p>}

      <section className="painel-secao">
        <h3>Onde o colaborador usa</h3>
        {parceiros.length ? (
          <ul className="painel-beneficios">
            {parceiros.map((nome) => (
              <li key={nome}>
                <span>
                  <strong>
                    <Store size={14} aria-hidden="true" /> {nome}
                  </strong>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="painel-vazio">Nenhum parceiro aceita. O colaborador vê o benefício, mas não tem onde usar.</p>
        )}
        {beneficio.status !== "DESCONTINUADO" && (
          <button type="button" className="link-acao" onClick={onEditar}>
            <Plus size={15} aria-hidden="true" /> {parceiros.length ? "Adicionar ou tirar parceiro" : "Escolher parceiros"}
          </button>
        )}
      </section>

      {usos.length > 0 && (
        <section className="painel-secao">
          <h3>Últimos usos</h3>
          <ul className="painel-usos">
            {usos.map((uso) => (
              <li key={uso.id}>
                <span>
                  <strong>{uso.quem}</strong>
                  <small>
                    {uso.onde ? `${uso.onde} · ` : ""}
                    {formatDate(uso.quando)}
                  </small>
                </span>
                <Selo tom={uso.status === "APROVADA" ? "verde" : uso.status === "PENDENTE" ? "amarelo" : "cinza"}>
                  {statusLabel(uso.status)}
                </Selo>
              </li>
            ))}
          </ul>
        </section>
      )}

    </div>
  );
}

export function AcoesBeneficio({
  beneficio,
  onEditar,
  onMudarStatus,
  salvando,
}: {
  beneficio: Beneficio;
  onEditar: () => void;
  onMudarStatus: (status: Beneficio["status"]) => Promise<void>;
  salvando: boolean;
}) {
  const [confirmar, setConfirmar] = useState<Beneficio["status"] | null>(null);
  const pergunta = confirmar ? PERGUNTA[confirmar] : null;
  if (pergunta && confirmar)
    return (
      <div className="painel-confirma" role="alert">
        <p>{pergunta.texto}</p>
        <div>
          <button type="button" className="btn btn-secondary" disabled={salvando} onClick={() => setConfirmar(null)}>
            Voltar
          </button>
          <button
            type="button"
            className={pergunta.perigo ? "btn btn-danger" : "btn btn-primary"}
            disabled={salvando}
            onClick={() => void onMudarStatus(confirmar).then(() => setConfirmar(null))}
          >
            {salvando ? "Salvando…" : pergunta.botao}
          </button>
        </div>
      </div>
    );
  return (
    <div className="painel-acoes">
      <button type="button" className="btn btn-primary" onClick={onEditar}>
        <Pencil size={16} aria-hidden="true" /> Editar
      </button>
      {beneficio.status === "ATIVO" && (
        <button type="button" className="btn btn-secondary" onClick={() => setConfirmar("INATIVO")}>
          <Pause size={16} aria-hidden="true" /> Pausar benefício
        </button>
      )}
      {beneficio.status === "INATIVO" && (
        <button type="button" className="btn btn-secondary" onClick={() => setConfirmar("ATIVO")}>
          <Play size={16} aria-hidden="true" /> Reativar benefício
        </button>
      )}
      {beneficio.status !== "DESCONTINUADO" && (
        <button type="button" className="btn btn-secondary btn-perigo" onClick={() => setConfirmar("DESCONTINUADO")}>
          <Ban size={16} aria-hidden="true" /> Encerrar benefício
        </button>
      )}
    </div>
  );
}
