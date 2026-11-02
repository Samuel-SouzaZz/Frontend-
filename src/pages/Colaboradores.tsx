import { Plus, Users } from "lucide-react";
import {
  ConfirmModal,
  EmptyState,
  FilterBar,
  PageHeader,
  Pagination,
  SearchField,
  Select,
  type SelectOption,
} from "../components/ui";
import { ColaboradorDetailsModal } from "../components/colaboradores/ColaboradorDetailsModal";
import { ColaboradorFormModal } from "../components/colaboradores/ColaboradorFormModal";
import { ColaboradoresStats } from "../components/colaboradores/ColaboradoresStats";
import { ColaboradoresTable } from "../components/colaboradores/ColaboradoresTable";
import { colaboradorNome } from "../models/selectors";
import type { Colaborador } from "../models/types";
import { useColaboradoresVM } from "../viewmodels/useColaboradoresVM";

const STATUS_FILTRO: SelectOption[] = [
  { value: "", label: "Todos os status" },
  { value: "ATIVO", label: "Ativos" },
  { value: "AFASTADO", label: "Afastados" },
  { value: "INATIVO", label: "Inativos" },
];

export default function Colaboradores() {
  const vm = useColaboradoresVM();
  const nomeDe = (item: Colaborador) => colaboradorNome(vm.data, item.id);
  const filtrar = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    vm.setPage(1);
  };
  const details = vm.details;

  return (
    <>
      <PageHeader
        eyebrow="GESTÃO DE PESSOAS"
        icon={Users}
        title="Colaboradores"
        description="Cadastre e acompanhe os colaboradores da Fundação."
        actions={
          <button
            type="button"
            className="btn btn-primary"
            disabled={vm.loading}
            onClick={() => vm.openForm()}
          >
            <Plus size={18} /> Novo colaborador
          </button>
        }
      />
      <ColaboradoresStats colaboradores={vm.data.colaboradores} />
      <section className="panel" aria-label="Lista de colaboradores">
        <FilterBar>
          <SearchField
            value={vm.search}
            onChange={filtrar(vm.setSearch)}
            placeholder="Buscar por nome, matrícula, setor ou cargo..."
          />
          <Select
            aria-label="Filtrar colaboradores por status"
            value={vm.status}
            options={STATUS_FILTRO}
            onChange={filtrar(vm.setStatus)}
          />
          <Select
            aria-label="Filtrar por setor"
            value={vm.setor}
            onChange={filtrar(vm.setSetor)}
            options={[
              { value: "", label: "Todos os setores" },
              ...vm.sectors.map((value) => ({ value, label: value })),
            ]}
          />
        </FilterBar>
        {vm.filtered.length ? (
          <ColaboradoresTable
            rows={vm.visibleRows}
            nomeDe={nomeDe}
            onView={vm.setDetails}
            onEdit={vm.openForm}
            onInactivate={vm.setInactivating}
          />
        ) : (
          <EmptyState
            title={
              vm.loading
                ? "Carregando colaboradores..."
                : "Nenhum colaborador encontrado"
            }
            description="Ajuste os filtros ou cadastre um novo colaborador."
          />
        )}
        <Pagination
          page={vm.currentPage}
          total={vm.filtered.length}
          pageSize={vm.PAGE_SIZE}
          onChange={vm.setPage}
        />
      </section>
      {vm.formOpen && (
        <ColaboradorFormModal
          form={vm.form}
          onChange={vm.setForm}
          availableUsers={vm.availableUsers}
          editing={Boolean(vm.editing)}
          submitting={vm.submitting}
          error={vm.formError}
          onSubmit={vm.submit}
          onClose={() => vm.setFormOpen(false)}
        />
      )}
      {details && (
        <ColaboradorDetailsModal
          colaborador={details}
          nome={nomeDe(details)}
          email={
            vm.data.usuarios.find((user) => user.id === details.usuario_id)
              ?.email
          }
          utilizacoes={
            vm.data.utilizacoes.filter(
              (item) => item.colaborador_id === details.id,
            ).length
          }
          onClose={() => vm.setDetails(undefined)}
          onEdit={() => {
            vm.openForm(details);
            vm.setDetails(undefined);
          }}
        />
      )}
      {vm.inactivating && (
        <ConfirmModal
          title="Inativar colaborador"
          description={`Deseja inativar ${nomeDe(vm.inactivating)}? O acesso aos benefícios será bloqueado e os registros anteriores serão preservados.`}
          onClose={() => {
            if (!vm.submitting) vm.setInactivating(undefined);
          }}
          onConfirm={vm.inactivate}
          confirming={vm.submitting}
          confirmLabel="Confirmar inativação"
          confirmingLabel="Inativando..."
        />
      )}
    </>
  );
}
