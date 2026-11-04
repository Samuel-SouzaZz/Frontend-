import { useState } from "react";
import { Megaphone, Plus } from "lucide-react";
import { DataTable, PageHeader, Pagination, SearchField, type Column } from "../components/ui";
import { Drawer, Selo } from "../components/board/Drawer";
import { CampanhaForm } from "../components/campanhas/CampanhaForm";
import { IconeDoTipo } from "../components/campanhas/IconeDoTipo";
import { AcoesCampanha, PainelCampanha, SELO_CAMPANHA } from "../components/campanhas/PainelCampanha";
import { FiltroSituacao } from "../components/tabela/FiltroSituacao";
import { descreverPeriodo, nomeDoTipo, situacaoDoPeriodo } from "../models/campanhaDraft";
import { useCampanhasVM, type ResumoCampanha } from "../viewmodels/useCampanhasVM";

export default function Campanhas() {
  const vm = useCampanhasVM();
  const [formSujo, setFormSujo] = useState(false);
  const aberta = vm.aberta ? vm.resumir(vm.aberta) : undefined;

  const colunas: Column<ResumoCampanha>[] = [
    {
      key: "nome",
      label: "Nome",
      render: ({ campanha }) => (
        <span className="t-nome">
          <strong>{campanha.nome}</strong>
          {(campanha.patrocinador || campanha.descricao) && (
            <small>{campanha.patrocinador ? `Patrocínio: ${campanha.patrocinador}` : campanha.descricao}</small>
          )}
        </span>
      ),
    },
    {
      key: "tipo",
      label: "Tipo",
      render: ({ campanha }) => (
        <span className="t-tipo">
          <IconeDoTipo tipo={campanha.tipo} size={16} />
          {nomeDoTipo(campanha.tipo)}
        </span>
      ),
    },
    {
      key: "periodo",
      label: "Período",
      render: ({ campanha, status }) => {
        const inicio = campanha.data_inicio.slice(0, 10);
        const fim = campanha.data_fim.slice(0, 10);
        return (
          <span className="t-nome">
            <span>{descreverPeriodo(inicio, fim)}</span>
            {(status === "ATIVA" || status === "PLANEJADA") && <small>{situacaoDoPeriodo(inicio, fim, vm.hoje)}</small>}
          </span>
        );
      },
    },
    {
      key: "situacao",
      label: "Situação",
      render: ({ status }) => <Selo tom={SELO_CAMPANHA[status].tom}>{SELO_CAMPANHA[status].texto}</Selo>,
    },
    {
      key: "beneficios",
      label: "Benefícios",
      render: ({ campanha, beneficios, status }) =>
        beneficios.length ? (
          <span className="t-numero">{beneficios.length}</span>
        ) : status === "ATIVA" || status === "PLANEJADA" ? (
          <button
            type="button"
            className="t-falta"
            onClick={() => vm.editar(campanha.id)}
            aria-label={`Colocar benefícios em ${campanha.nome}`}
          >
            <Plus size={14} aria-hidden="true" /> Colocar
          </button>
        ) : (
          <span className="t-vazio">Nenhum</span>
        ),
    },
  ];

  const fecharEdicao = vm.emEdicao ? () => vm.abrir(vm.emEdicao?.id ?? 0) : vm.fecharPainel;

  return (
    <>
      <PageHeader
        eyebrow="RELACIONAMENTO"
        icon={Megaphone}
        title="Campanhas e eventos"
        description="Clique numa campanha para ver, editar ou cancelar."
        actions={
          <button type="button" className="btn btn-primary" onClick={vm.novo}>
            <Plus size={18} aria-hidden="true" /> Nova campanha ou evento
          </button>
        }
      />
      <section className="panel t-lista">
        <div className="t-barra">
          <FiltroSituacao
            valor={vm.situacao}
            onChange={vm.setSituacao}
            opcoes={[
              { value: "", label: "Todas", total: vm.total },
              { value: "ATIVA", label: "No ar", total: vm.contagem("ATIVA") },
              { value: "PLANEJADA", label: "Planejadas", total: vm.contagem("PLANEJADA") },
              { value: "ENCERRADA", label: "Encerradas", total: vm.contagem("ENCERRADA") },
              { value: "CANCELADA", label: "Canceladas", total: vm.contagem("CANCELADA") },
            ]}
          />
          <SearchField value={vm.busca} onChange={vm.setBusca} placeholder="Buscar campanha ou evento" />
        </div>
        <DataTable
          columns={colunas}
          rows={vm.linhas}
          getRowKey={(linha) => linha.campanha.id}
          onRowClick={(linha) => vm.abrir(linha.campanha.id)}
          rowLabel={(linha) => `Abrir ${linha.campanha.nome}`}
        />
        {vm.totalFiltrado > vm.PAGE_SIZE && (
          <Pagination page={vm.pagina} total={vm.totalFiltrado} pageSize={vm.PAGE_SIZE} onChange={vm.setPagina} />
        )}
      </section>

      {aberta && (
        <Drawer
          janela
          key={`ver-${aberta.campanha.id}`}
          titulo={aberta.campanha.nome}
          onFechar={vm.fecharPainel}
          rodape={
            <AcoesCampanha
              resumo={aberta}
              onEditar={() => vm.editar(aberta.campanha.id)}
              onCancelar={() => void vm.cancelar(aberta.campanha.id)}
              cancelando={vm.salvando}
            />
          }
        >
          <PainelCampanha resumo={aberta} hoje={vm.hoje} onEditar={() => vm.editar(aberta.campanha.id)} />
        </Drawer>
      )}
      {(vm.criando || vm.emEdicao) && (
        <Drawer
          janela
          key={vm.emEdicao ? `editar-${vm.emEdicao.id}` : "novo"}
          titulo={vm.emEdicao ? `Editar ${vm.emEdicao.nome}` : "Nova campanha ou evento"}
          protegido={formSujo}
          onFechar={fecharEdicao}
        >
          <CampanhaForm
            campanha={vm.emEdicao}
            onFechar={fecharEdicao}
            onSalvo={vm.emEdicao ? vm.aoSalvar : vm.fecharPainel} onSujo={setFormSujo} />
        </Drawer>
      )}
    </>
  );
}
