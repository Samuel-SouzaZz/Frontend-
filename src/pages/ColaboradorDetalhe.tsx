import { Link, useParams } from "react-router-dom";

import {
  Pencil,
  UserMinus,
  UserRound,
} from "lucide-react";

import {
  Badge,
  ConfirmModal,
} from "../components/ui";

import { DetailHeader } from "../components/detail/DetailHeader";
import { DetailTabs } from "../components/detail/DetailTabs";
import { SideStats } from "../components/detail/SideStats";
import { Timeline } from "../components/detail/Timeline";

import { ColaboradorFormModal } from "../components/colaboradores/ColaboradorFormModal";

import { formatDate } from "../models/formatters";

import { useColaboradorDetalheVM } from "../viewmodels/useColaboradorDetalheVM";

export default function ColaboradorDetalhe() {
  const vm = useColaboradorDetalheVM(
    Number(useParams().id)
  );

  const { colaborador } = vm;

  if (vm.loading) {
    return (
      <div className="loading-state" role="status">
        Carregando…
      </div>
    );
  }

  if (!colaborador) {
    return (
      <div className="error-state">
        <h1>Colaborador não encontrado</h1>

        <p>
          Ele pode ter sido removido ou o endereço
          está errado.
        </p>

        <Link
          className="btn btn-primary"
          to="/colaboradores"
        >
          Voltar para colaboradores
        </Link>
      </div>
    );
  }

  return (
    <div className="detail-page">
      {/* CABEÇALHO DO COLABORADOR */}

      <DetailHeader
        voltarPara={{
          to: "/colaboradores",
          label: "Colaboradores",
        }}
        icone={<UserRound size={26} />}
        titulo={vm.nome}
        etiquetas={
          <>
            <span className="tag">
              {colaborador.cargo}
            </span>

            <Badge status={colaborador.status} />
          </>
        }
        detalhes={`Matrícula ${colaborador.matricula} · ${colaborador.setor} · na Fundação desde ${formatDate(colaborador.data_admissao)}`}
        acoes={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => vm.openForm(colaborador)}
            >
              <Pencil
                size={16}
                aria-hidden="true"
              />
              Editar
            </button>

            {colaborador.status !== "INATIVO" && (
              <button
                type="button"
                className="btn btn-secondary btn-danger-outline"
                onClick={() =>
                  vm.setInactivating(colaborador)
                }
              >
                <UserMinus
                  size={16}
                  aria-hidden="true"
                />
                Inativar
              </button>
            )}
          </>
        }
      />

      {/* CONTEÚDO PRINCIPAL */}

      <div className="detail-layout">
        <section className="detail-main">
          {/* ABAS */}

          <DetailTabs
            atual={vm.aba}
            onChange={vm.setAba}
            abas={[
              {
                id: "historico",
                label: "Histórico de uso",
                total: vm.historico.length,
              },
              {
                id: "dados",
                label: "Dados do colaborador",
              },
            ]}
          />

          {/* ABA HISTÓRICO */}

          {vm.aba === "historico" && (
            <Timeline
              vazio={
                <>
                  <strong>
                    Ainda não usou nenhum benefício
                  </strong>

                  <p>
                    Cada vez que usar um benefício
                    pelo app, aparece aqui.
                  </p>
                </>
              }
              itens={vm.historico.map((uso) => ({
                chave: uso.id,

                titulo: `Usou ${uso.beneficio}`,

                descricao: uso.parceiro
                  ? `em ${uso.parceiro}`
                  : undefined,

                data: formatDate(uso.quando, true),

                selo: (
                  <Badge status={uso.status} />
                ),
              }))}
            />
          )}

          {/* ABA DADOS DO COLABORADOR */}

          {vm.aba === "dados" && (
            <dl className="detail-data">
              <div>
                <dt>E-mail</dt>
                <dd>
                  {vm.email ?? "Não informado"}
                </dd>
              </div>

              <div>
                <dt>Telefone</dt>
                <dd>
                  {colaborador.telefone ||
                    "Não informado"}
                </dd>
              </div>

              <div>
                <dt>Matrícula</dt>
                <dd>{colaborador.matricula}</dd>
              </div>

              <div>
                <dt>Setor</dt>
                <dd>{colaborador.setor}</dd>
              </div>

              <div>
                <dt>Cargo</dt>
                <dd>{colaborador.cargo}</dd>
              </div>

              <div>
                <dt>Admissão</dt>
                <dd>
                  {formatDate(
                    colaborador.data_admissao
                  )}
                </dd>
              </div>
            </dl>
          )}
        </section>

        {/* RESUMO LATERAL */}

        <aside className="detail-side">
          <SideStats
            titulo="Em números"
            itens={[
              {
                rotulo: "usos neste mês",
                valor: vm.numeros.usosNoMes,
              },
              {
                rotulo: "usos aprovados no total",
                valor: vm.numeros.aprovadas,
              },
              {
                rotulo: "último uso",
                valor: vm.numeros.ultimoUso
                  ? formatDate(
                      vm.numeros.ultimoUso
                    )
                  : "—",
              },
            ]}
          />
        </aside>
      </div>

      {/* MODAL DE EDIÇÃO */}

      {vm.formOpen && (
        <ColaboradorFormModal
          form={vm.form}
          onChange={vm.setForm}
          availableUsers={vm.availableUsers}
          editing={Boolean(vm.editing)}
          submitting={vm.submitting}
          error={vm.formError}
          onSubmit={vm.submit}
          onClose={() =>
            vm.setFormOpen(false)
          }
        />
      )}

      {/* MODAL DE INATIVAÇÃO */}

      {vm.inactivating && (
        <ConfirmModal
          title="Inativar colaborador"
          description="Ele perde o acesso aos benefícios. O histórico continua guardado."
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
            <strong>{vm.nome}</strong>
          </p>
        </ConfirmModal>
      )}
    </div>
  );
}