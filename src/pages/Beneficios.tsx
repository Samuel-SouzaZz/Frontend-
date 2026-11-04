import { useState } from "react";
import { Gift, Plus } from "lucide-react";
import { DataTable, PageHeader, Pagination, SearchField, type Column } from "../components/ui";
import { Drawer, Selo } from "../components/board/Drawer";
import { BeneficioForm } from "../components/beneficios/BeneficioForm";
import { AcoesBeneficio, PainelBeneficio, SELO_BENEFICIO } from "../components/beneficios/PainelBeneficio";
import { FiltroSituacao } from "../components/tabela/FiltroSituacao";
import { draftDoBeneficio, resumoCurto } from "../models/beneficioDraft";
import { descreverValor } from "../models/valorBeneficio";
import { useBeneficiosVM, type ResumoBeneficio } from "../viewmodels/useBeneficiosVM";

export default function Beneficios() {
  const vm = useBeneficiosVM();
  const [formSujo, setFormSujo] = useState(false);
  const aberto = vm.aberto ? vm.resumir(vm.aberto) : undefined;

  const colunas: Column<ResumoBeneficio>[] = [
    {
      key: "nome",
      label: "Nome",
      render: ({ beneficio }) => (
        <span className="t-nome">
          <strong>{beneficio.nome}</strong>
          {beneficio.descricao && <small>{beneficio.descricao}</small>}
        </span>
      ),
    },
    {
      key: "valor",
      label: "Desconto",
      render: ({ beneficio }) => (
        <span className="t-valor">{descreverValor(beneficio.tipo_beneficio, beneficio.valor)}</span>
      ),
    },
    {
      key: "regra",
      label: "Cada um pode usar",
      render: ({ beneficio }) => resumoCurto(draftDoBeneficio(beneficio, [])),
    },
    {
      key: "parceiros",
      label: "Onde usar",
      render: ({ beneficio, parceiros }) =>
        parceiros.length ? (
          <span className="t-parceiros">{parceiros.join(", ")}</span>
        ) : beneficio.status === "DESCONTINUADO" ? (
          <span className="t-vazio">Nenhum</span>
        ) : (
          <button
            type="button"
            className="t-falta"
            onClick={() => vm.editar(beneficio.id)}
            aria-label={`Escolher parceiros de ${beneficio.nome}`}
          >
            <Plus size={14} aria-hidden="true" /> Escolher
          </button>
        ),
    },
    {
      key: "situacao",
      label: "Situação",
      render: ({ beneficio }) => (
        <Selo tom={SELO_BENEFICIO[beneficio.status].tom}>{SELO_BENEFICIO[beneficio.status].texto}</Selo>
      ),
    },
  ];

  const fecharEdicao = vm.emEdicao ? () => vm.abrir(vm.emEdicao?.id ?? 0) : vm.fecharPainel;

  return (
    <>
      <PageHeader
        eyebrow="CATÁLOGO"
        icon={Gift}
        title="Benefícios"
        description="Clique num benefício para ver, editar, pausar ou encerrar."
        actions={
          <button type="button" className="btn btn-primary" onClick={vm.novo}>
            <Plus size={18} aria-hidden="true" /> Novo benefício
          </button>
        }
      />
      <section className="panel t-lista">
        <div className="t-barra">
          <FiltroSituacao
            valor={vm.situacao}
            onChange={vm.setSituacao}
            opcoes={[
              { value: "", label: "Todos", total: vm.total },
              { value: "ATIVO", label: "Ativos", total: vm.contagem("ATIVO") },
              { value: "INATIVO", label: "Pausados", total: vm.contagem("INATIVO") },
              { value: "DESCONTINUADO", label: "Encerrados", total: vm.contagem("DESCONTINUADO") },
            ]}
          />
          <SearchField value={vm.busca} onChange={vm.setBusca} placeholder="Buscar benefício" />
        </div>
        <DataTable
          columns={colunas}
          rows={vm.linhas}
          getRowKey={(linha) => linha.beneficio.id}
          onRowClick={(linha) => vm.abrir(linha.beneficio.id)}
          rowLabel={(linha) => `Abrir ${linha.beneficio.nome}`}
        />
        {vm.totalFiltrado > vm.PAGE_SIZE && (
          <Pagination page={vm.pagina} total={vm.totalFiltrado} pageSize={vm.PAGE_SIZE} onChange={vm.setPagina} />
        )}
      </section>

      {aberto && (
        <Drawer
          janela
          key={`ver-${aberto.beneficio.id}`}
          titulo={aberto.beneficio.nome}
          onFechar={vm.fecharPainel}
          rodape={
            <AcoesBeneficio
              beneficio={aberto.beneficio}
              onEditar={() => vm.editar(aberto.beneficio.id)}
              onMudarStatus={(status) => vm.mudarStatus(aberto.beneficio.id, status)}
              salvando={vm.salvando}
            />
          }
        >
          <PainelBeneficio resumo={aberto} onEditar={() => vm.editar(aberto.beneficio.id)} />
        </Drawer>
      )}
      {(vm.criando || vm.emEdicao) && (
        <Drawer
          janela
          key={vm.emEdicao ? `editar-${vm.emEdicao.id}` : "novo"}
          titulo={vm.emEdicao ? `Editar ${vm.emEdicao.nome}` : "Novo benefício"}
          protegido={formSujo}
          onFechar={fecharEdicao}
        >
          <BeneficioForm
            beneficio={vm.emEdicao}
            onFechar={fecharEdicao}
            onSalvo={vm.emEdicao ? vm.aoSalvar : vm.fecharPainel} onSujo={setFormSujo} />
        </Drawer>
      )}
    </>
  );
}
