import type { FormEvent } from "react";
import { Link2, Plus, Unlink } from "lucide-react";
import {
  Badge,
  CellStack,
  DataTable,
  EmptyState,
  FilterBar,
  FormError,
  Modal,
  ModalFooter,
  Select,
} from "../ui";
import type { Beneficio, Conveniado, Oferta } from "../../models/types";

type BeneficioOffersModalProps = {
  beneficio: Beneficio;
  offers: Oferta[];
  conveniados: Conveniado[];
  availablePartners: Conveniado[];
  selectedPartner: string;
  onSelectPartner: (value: string) => void;
  submitting: boolean;
  error: string;
  onLink: (event: FormEvent<HTMLFormElement>) => void;
  onChangeOffer: (id: number, status: "ATIVO" | "INATIVO") => void;
  onClose: () => void;
};

export function BeneficioOffersModal({
  beneficio,
  offers,
  conveniados,
  availablePartners,
  selectedPartner,
  onSelectPartner,
  submitting,
  error,
  onLink,
  onChangeOffer,
  onClose,
}: BeneficioOffersModalProps) {
  const ativo = beneficio.status === "ATIVO";
  const conveniadoDe = (id: number) =>
    conveniados.find((partner) => partner.id === id);
  const close = () => {
    if (!submitting) onClose();
  };
  return (
    <Modal
      title="Conveniados do benefício"
      description={beneficio.nome}
      onClose={close}
      wide
    >
      <p className="text-muted">
        Vincule estabelecimentos ativos. Ao desvincular, a oferta fica inativa
        para preservar as utilizações anteriores.
      </p>
      {!ativo && (
        <p className="inline-notice">
          Este benefício está{" "}
          {beneficio.status === "DESCONTINUADO" ? "descontinuado" : "inativo"}.
          Ative-o no cadastro antes de disponibilizar novas ofertas.
        </p>
      )}
      <form onSubmit={onLink}>
        <FilterBar>
          <Select
            aria-label="Conveniado para vincular"
            required
            value={selectedPartner}
            disabled={submitting || !ativo}
            onChange={onSelectPartner}
            placeholder="Selecione um conveniado ativo"
            options={[
              { value: "", label: "Selecione um conveniado ativo" },
              ...availablePartners.map((partner) => ({
                value: String(partner.id),
                label: partner.nome_fantasia,
              })),
            ]}
          />
          <button
            className="btn btn-primary"
            type="submit"
            disabled={submitting || !selectedPartner || !ativo}
          >
            <Plus size={17} /> Vincular
          </button>
        </FilterBar>
      </form>
      <FormError message={error} />
      {offers.length ? (
        <DataTable
          rows={offers}
          getRowKey={(item) => item.id}
          columns={[
            {
              key: "conveniado",
              label: "Conveniado",
              render: (item) => {
                const partner = conveniadoDe(item.conveniado_id);
                return (
                  <CellStack
                    title={
                      partner?.nome_fantasia ||
                      partner?.razao_social ||
                      `Conveniado #${item.conveniado_id}`
                    }
                    subtitle={partner?.categoria}
                  />
                );
              },
            },
            {
              key: "status",
              label: "Oferta",
              render: (item) => <Badge status={item.status} />,
            },
            {
              key: "acoes",
              label: "Ações",
              render: (item) =>
                item.status === "ATIVO" ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={submitting}
                    onClick={() => onChangeOffer(item.id, "INATIVO")}
                  >
                    <Unlink size={16} /> Desvincular
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={
                      submitting ||
                      !ativo ||
                      conveniadoDe(item.conveniado_id)?.status !== "ATIVO"
                    }
                    onClick={() => onChangeOffer(item.id, "ATIVO")}
                  >
                    <Link2 size={16} /> Reativar
                  </button>
                ),
            },
          ]}
        />
      ) : (
        <EmptyState
          title="Nenhum conveniado vinculado"
          description="Selecione um estabelecimento acima para criar a primeira oferta deste benefício."
        />
      )}
      <ModalFooter>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={submitting}
          onClick={close}
        >
          Concluir
        </button>
      </ModalFooter>
    </Modal>
  );
}
