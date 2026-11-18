import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Tags } from "lucide-react";

import {
  ConfirmModal,
  EmptyState,
  FilterBar,
  PageHeader,
  SearchField,
} from "../components/ui";

import {
  CategoriaFormModal,
} from "../components/categorias/CategoriaFormModal";

import {
  CategoriasTable,
} from "../components/categorias/CategoriasTable";

import {
  useCategoriasVM,
} from "../viewmodels/useCategoriasVM";

export default function Categorias() {
  const vm = useCategoriasVM();

  return (
    <>
      <PageHeader
        eyebrow="REDE DE PARCEIROS"
        icon={Tags}
        title="Categorias"
        description="Organize os conveniados por tipo. Cada conveniado precisa de ao menos uma categoria."
        actions={
          <>
            <Link
              className="btn btn-secondary"
              to="/conveniados"
            >
              <ArrowLeft size={18} />
              Conveniados
            </Link>

            <button
              type="button"
              className="btn btn-primary"
              disabled={vm.loading}
              onClick={() => vm.abrirForm()}
            >
              <Plus size={18} />
              Nova categoria
            </button>
          </>
        }
      />

      <section
        className="panel"
        aria-label="Lista de categorias"
      >
        <FilterBar>
          <SearchField
            value={vm.busca}
            onChange={vm.setBusca}
            placeholder="Buscar categoria..."
          />
        </FilterBar>

        {vm.linhas.length ? (
          <CategoriasTable
            rows={vm.linhas}
            totalConveniados={vm.totalConveniados}
            onEdit={vm.abrirForm}
            onToggle={vm.alternarStatus}
            onDelete={vm.setExcluindo}
            ordenacao={vm.ordenacao}
            onSort={vm.alternar}
          />
        ) : (
          <EmptyState
            title={
              vm.loading
                ? "Carregando categorias..."
                : "Nenhuma categoria encontrada"
            }
            description={
              vm.total
                ? "Ajuste a busca."
                : "Cadastre a primeira categoria."
            }
          />
        )}
      </section>

      {vm.formOpen && (
        <CategoriaFormModal
          form={vm.form}
          onChange={vm.setForm}
          editing={Boolean(vm.editing)}
          submitting={vm.submitting}
          error={vm.formError}
          onSubmit={vm.salvar}
          onClose={() => vm.setFormOpen(false)}
        />
      )}

      {vm.excluindo && (
        <ConfirmModal
          title="Excluir categoria"
          description={`Deseja excluir a categoria ${vm.excluindo.nome}? Ela não tem conveniados vinculados.`}
          onClose={() => {
            if (!vm.submitting) {
              vm.setExcluindo(undefined);
            }
          }}
          onConfirm={vm.confirmarExclusao}
          confirming={vm.submitting}
          confirmLabel="Excluir"
          confirmingLabel="Excluindo..."
        />
      )}
    </>
  );
}