import { Link, useParams } from "react-router-dom";

import {
  Ban,
  CheckCircle2,
  Gift,
  Megaphone,
  Pencil,
  Store,
} from "lucide-react";

import {
  Badge,
  ConfirmModal,
} from "../components/ui";

import { DetailHeader } from "../components/detail/DetailHeader";
import { DetailTabs } from "../components/detail/DetailTabs";
import { SideStats } from "../components/detail/SideStats";
import { Timeline } from "../components/detail/Timeline";

import { ConveniadoFormModal } from "../components/conveniados/ConveniadoFormModal";

import { canalValidacaoLabel } from "../components/utilizacoes/descricao";

import {
  formatCnpj,
  formatDate,
} from "../models/formatters";

import { descreverValor } from "../models/valorBeneficio";

import { useConveniadoDetalheVM } from "../viewmodels/useConveniadoDetalheVM";

export default function ConveniadoDetalhe() {
  const vm = useConveniadoDetalheVM(
    Number(useParams().id)
  );

  const { conveniado } = vm;

  // CARREGAMENTO

  if (vm.loading) {
    return (
      <div className="loading-state" role="status">
        Carregando…
      </div>
    );
  }

  // PARCEIRO NÃO ENCONTRADO

  if (!conveniado) {
    return (
      <div className="error-state">
        <h1>Parceiro não encontrado</h1>

        <p>
          Ele pode ter sido removido ou o endereço está errado.
        </p>

        <Link
          className="btn btn-primary"
          to="/conveniados"
        >
          Voltar para conveniados
        </Link>
      </div>
    );
  }

  const nome =
    conveniado.nome_fantasia ||
    conveniado.razao_social;

  return (
    <div className="detail-page">
      {/* CABEÇALHO DO CONVENIADO */}

      <DetailHeader
        voltarPara={{
          to: "/conveniados",
          label: "Conveniados",
        }}
        icone={<Store size={26} />}
        titulo={nome}
        etiquetas={
          <>
            <span className="tag">
              {conveniado.categoria}
            </span>

            <Badge status={conveniado.status} />
          </>
        }
        detalhes={`CNPJ ${formatCnpj(conveniado.cnpj)} · ${conveniado.endereco}`}
       acoes={
  <>
    {conveniado.status === "EM_ANALISE" && (
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => vm.setAprovando(true)}
      >
        <CheckCircle2
          size={16}
          aria-hidden="true"
        />
        Aprovar parceiro
      </button>
    )}

    <button
      type="button"
      className="btn btn-secondary"
      onClick={() => vm.openForm(conveniado)}
    >
      <Pencil size={16} aria-hidden="true" />
      Editar
    </button>
            {conveniado.status !== "INATIVO" && (
              <button
                type="button"
                className="btn btn-secondary btn-danger-outline"
                onClick={() =>
                  vm.setInactivating(conveniado)
                }
              >
                <Ban size={16} aria-hidden="true" />
                Inativar
              </button>
            )}
          </>
        }
      />

      {/* CONTEÚDO PRINCIPAL */}

      <div className="detail-layout">
        <section className="detail-main">
          <DetailTabs
            atual={vm.aba}
            onChange={vm.setAba}
            abas={[
              {
                id: "historico",
                label: "Histórico",
                total: vm.historico.length,
              },
              {
                id: "beneficios",
                label: "Benefícios oferecidos",
                total: vm.numeros.oferecidos,
              },
              {
                id: "dados",
                label: "Dados do parceiro",
              },
            ]}
          />

          {/* ABA DE HISTÓRICO */}

          {vm.aba === "historico" && (
            <Timeline
              vazio={
                <>
                  <strong>
                    Nenhuma utilização ainda
                  </strong>

                  <p>
                    Quando um colaborador usar um
                    benefício aqui, aparece nesta lista.
                  </p>
                </>
              }
              itens={vm.historico.map((uso) => ({
                chave: uso.id,

                titulo: `${uso.colaborador} usou ${uso.beneficio}`,

                descricao: uso.canal_validacao
                  ? `Validado pelo ${canalValidacaoLabel(uso.canal_validacao)}`
                  : undefined,

                data: formatDate(
                  uso.data_solicitacao,
                  true
                ),

                selo: (
                  <Badge status={uso.status} />
                ),
              }))}
            />
          )}

          {/* ABA DE BENEFÍCIOS OFERECIDOS */}

          {vm.aba === "beneficios" &&
            (vm.numeros.oferecidos ? (
              <div className="detail-cards">
                {vm.beneficios.map((item) => (
                  <Link
                    key={`b-${item.id}`}
                    to={`/beneficios?abrir=${item.id}`}
                    className="benefit-row is-link"
                  >
                    <span
                      className="benefit-row-icon"
                      aria-hidden="true"
                    >
                      <Gift size={18} />
                    </span>

                    <div className="benefit-row-text">
                      <strong>{item.nome}</strong>

                      <span>
                        {descreverValor(
                          item.tipo_beneficio,
                          item.valor
                        )}
                      </span>
                    </div>

                    <Badge status={item.status} />
                  </Link>
                ))}

                {vm.itensCampanha.map((item) => (
                  <Link
                    key={`c-${item.id}`}
                    to={`/campanhas?abrir=${item.campanha_id}`}
                    className="benefit-row is-link"
                  >
                    <span
                      className="benefit-row-icon"
                      aria-hidden="true"
                    >
                      <Megaphone size={18} />
                    </span>

                    <div className="benefit-row-text">
                      <strong>{item.nome}</strong>

                      <span>
                        {descreverValor(
                          item.tipo_beneficio,
                          item.valor
                        )}{" "}
                        · {item.campanha}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="detail-empty">
                <Gift size={26} aria-hidden="true" />

                <strong>
                  Este parceiro ainda não oferece benefícios
                </strong>

                <p>
                  Abra um benefício ou campanha e marque este
                  parceiro em “Onde usar”.
                </p>
              </div>
            ))}

          {/* ABA DE DADOS DO PARCEIRO */}

          {vm.aba === "dados" && (
            <dl className="detail-data">
              <div>
                <dt>Nome fantasia</dt>
                <dd>{conveniado.nome_fantasia}</dd>
              </div>

              <div>
                <dt>Razão social</dt>
                <dd>{conveniado.razao_social}</dd>
              </div>

              <div>
                <dt>CNPJ</dt>
                <dd>{formatCnpj(conveniado.cnpj)}</dd>
              </div>

              <div>
                <dt>Categoria</dt>
                <dd>{conveniado.categoria}</dd>
              </div>

              <div>
                <dt>Endereço</dt>
                <dd>{conveniado.endereco}</dd>
              </div>

              <div>
                <dt>Responsável</dt>

                <dd>
                  {vm.responsavel
                    ? `${vm.responsavel.nome} · ${vm.responsavel.email}`
                    : "Não informado"}
                </dd>
              </div>
            </dl>
          )}
        </section>

        {/* INDICADORES LATERAIS */}

        <aside className="detail-side">
          <SideStats
            titulo="Em números"
            itens={[
              {
                rotulo: "utilizações neste mês",
                valor: vm.numeros.usosNoMes,
              },
              {
                rotulo: "utilizações aprovadas no total",
                valor: vm.numeros.aprovadas,
              },
              {
                rotulo: "benefícios oferecidos",
                valor: vm.numeros.oferecidos,
              },
            ]}
          />
        </aside>
      </div>

      {/* MODAL DE EDIÇÃO */}

      {vm.formOpen && (
        <ConveniadoFormModal
          form={vm.form}
          onChange={vm.setForm}
          categories={vm.categories}
          availableUsers={vm.availableUsers}
          podeCriarConta={vm.podeCriarConta}
          contaAtual={vm.contaAtual}
          editing={Boolean(vm.editing)}
          submitting={vm.submitting}
          error={vm.formError}
          onSubmit={vm.submit}
          onClose={() => vm.setFormOpen(false)}
        />
      )}

      {/* MODAL DE INATIVAÇÃO */}

      {vm.inactivating && (
        <ConfirmModal
          title="Inativar parceiro"
          description="Ele deixa de aceitar benefícios. O histórico continua guardado."
          onClose={() => {
            if (!vm.submitting) {
              vm.setInactivating(undefined);
            }
          }}
          onConfirm={vm.inactivate}
          confirming={vm.submitting}
          confirmLabel="Sim, inativar"
          confirmingLabel="Inativando…"
        >
          <p>
            <strong>{nome}</strong>
          </p>
        </ConfirmModal>
      )}

      {vm.aprovando && (
  <ConfirmModal
    title="Aprovar parceiro"
    description="Depois de aprovado, ele pode ser escolhido nos benefícios e campanhas."
    onClose={() => {
      if (!vm.aprovandoAgora) {
        vm.setAprovando(false);
      }
    }}
    onConfirm={() => void vm.aprovar()}
    confirming={vm.aprovandoAgora}
    confirmLabel="Sim, aprovar"
    confirmingLabel="Aprovando…"
  >
    <p>
      <strong>{nome}</strong>
    </p>
  </ConfirmModal>
)}
    </div>
  );
}