import { useState } from "react";
import { Pencil, Plus, Store, XCircle } from "lucide-react";
import { IconeDoTipo } from "./IconeDoTipo";
import { Selo } from "../board/Drawer";
import {
  descreverPeriodo,
  nomeDoTipo,
  situacaoDoPeriodo,
} from "../../models/campanhaDraft";
import { formatDate, statusLabel } from "../../models/formatters";
import type { ResumoCampanha } from "../../viewmodels/useCampanhasVM";

export const SELO_CAMPANHA = {
  PLANEJADA: { tom: "amarelo", texto: "Planejada" },
  ATIVA: { tom: "verde", texto: "No ar" },
  ENCERRADA: { tom: "cinza", texto: "Encerrada" },
  CANCELADA: { tom: "vermelho", texto: "Cancelada" },
} as const;

export function PainelCampanha({
  resumo,
  hoje,
  onEditar,
}: {
  resumo: ResumoCampanha;
  hoje: string;
  onEditar: () => void;
}) {
  const { campanha, status, beneficios, participantes, usos } = resumo;
  const inicio = campanha.data_inicio.slice(0, 10);
  const fim = campanha.data_fim.slice(0, 10);
  const selo = SELO_CAMPANHA[status];
  const vigente = status === "ATIVA" || status === "PLANEJADA";

  return (
    <div className="painel">
      <header className="painel-head">
        <span className={`chip-tipo chip-grande tipo-${campanha.tipo.toLowerCase()}`} aria-hidden="true">
          <IconeDoTipo tipo={campanha.tipo} size={24} />
        </span>
        <div>
          <h2>{campanha.nome}</h2>
          <Selo tom={selo.tom}>
            {selo.texto}
            {vigente ? ` · ${situacaoDoPeriodo(inicio, fim, hoje).toLocaleLowerCase("pt-BR")}` : ""}
          </Selo>
        </div>
      </header>

      <dl className="painel-dados">
        <div>
          <dt>Tipo</dt>
          <dd>
            {nomeDoTipo(campanha.tipo)}
            {campanha.patrocinador ? ` · ${campanha.patrocinador}` : ""}
          </dd>
        </div>
        <div>
          <dt>Período</dt>
          <dd>{descreverPeriodo(inicio, fim)}</dd>
        </div>
        <div>
          <dt>Quem participa</dt>
          <dd>{campanha.criterio_elegibilidade || "Todos os colaboradores"}</dd>
        </div>
        <div>
          <dt>Participação</dt>
          <dd>
            {participantes === 0
              ? "Ninguém usou ainda"
              : `${participantes} ${participantes === 1 ? "colaborador" : "colaboradores"}`}
          </dd>
        </div>
      </dl>
      {campanha.descricao && <p className="painel-texto">{campanha.descricao}</p>}

      <section className="painel-secao">
        <h3>O que o colaborador ganha</h3>
        {beneficios.length ? (
          <ul className="painel-beneficios">
            {beneficios.map((item) => (
              <li key={item.id}>
                <span>
                  <strong>{item.nome}</strong>
                  <small>
                    <Store size={12} aria-hidden="true" />{" "}
                    {item.parceiros.length ? item.parceiros.join(", ") : "Nenhum parceiro"}
                  </small>
                </span>
                <b>{item.valor}</b>
              </li>
            ))}
          </ul>
        ) : (
          <p className="painel-vazio">Ainda não oferece nenhum benefício.</p>
        )}
        {vigente && (
          <button type="button" className="link-acao" onClick={onEditar}>
            <Plus size={15} aria-hidden="true" /> {beneficios.length ? "Adicionar ou mudar benefício" : "Adicionar benefício"}
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
                    {uso.oque}
                    {uso.onde ? ` · ${uso.onde}` : ""} · {formatDate(uso.quando)}
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

export function AcoesCampanha({
  resumo,
  onEditar,
  onCancelar,
  cancelando,
}: {
  resumo: ResumoCampanha;
  onEditar: () => void;
  onCancelar: () => void;
  cancelando: boolean;
}) {
  const { campanha, status } = resumo;
  const [confirmando, setConfirmando] = useState(false);
  const palavra = campanha.tipo.startsWith("EVENTO") ? "evento" : "campanha";
  const vigente = status === "ATIVA" || status === "PLANEJADA";
  if (confirmando)
    return (
      <div className="painel-confirma" role="alert">
        <p>
          Cancelar {palavra === "evento" ? "o evento" : "a campanha"} “{campanha.nome}”? Os colaboradores deixam de ver. O
          histórico fica guardado.
        </p>
        <div>
          <button type="button" className="btn btn-secondary" disabled={cancelando} onClick={() => setConfirmando(false)}>
            Voltar
          </button>
          <button type="button" className="btn btn-danger" disabled={cancelando} onClick={onCancelar}>
            {cancelando ? "Cancelando…" : `Sim, cancelar ${palavra}`}
          </button>
        </div>
      </div>
    );
  return (
    <div className="painel-acoes">
      <button type="button" className="btn btn-primary" onClick={onEditar}>
        <Pencil size={16} aria-hidden="true" /> Editar
      </button>
      {vigente && (
        <button type="button" className="btn btn-secondary btn-perigo" onClick={() => setConfirmando(true)}>
          <XCircle size={16} aria-hidden="true" /> Cancelar {palavra}
        </button>
      )}
    </div>
  );
}
