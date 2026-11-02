import type { FormEvent } from "react";
import { ConfirmModal, DetailList, Field } from "../ui";
import { formatMoney } from "../../models/formatters";
import type { Utilizacao } from "../../models/types";
import { referenciaUtilizacao, type DescricaoUtilizacao } from "./descricao";

type EstornoModalProps = {
  uso: Utilizacao;
  descricao: DescricaoUtilizacao;
  motivo: string;
  onMotivoChange: (value: string) => void;
  saving: boolean;
  onConfirm: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export function EstornoModal({
  uso,
  descricao,
  motivo,
  onMotivoChange,
  saving,
  onConfirm,
  onClose,
}: EstornoModalProps) {
  return (
    <ConfirmModal
      title="Estornar utilização"
      description={`O registro ${referenciaUtilizacao(uso.id)} permanecerá no histórico com o status Estornada.`}
      onClose={() => {
        if (!saving) onClose();
      }}
      onConfirm={onConfirm}
      confirming={saving}
      confirmLabel="Confirmar estorno"
      confirmingLabel="Estornando…"
      confirmDisabled={!motivo.trim()}
    >
      <DetailList
        items={[
          { label: "Colaborador", value: descricao.colaborador(uso) },
          {
            label: "Benefício",
            value: descricao.beneficio(uso) ?? "Não encontrado",
          },
          {
            label: "Valor aplicado",
            value: formatMoney(Number(uso.valor_aplicado)),
          },
        ]}
      />
      <Field
        label="Motivo do estorno"
        required
        hint="Informe o motivo para manter a rastreabilidade do registro."
      >
        <textarea
          required
          autoFocus
          rows={4}
          maxLength={1500}
          value={motivo}
          onChange={(event) => onMotivoChange(event.target.value)}
          placeholder="Descreva por que esta utilização será estornada"
        />
      </Field>
    </ConfirmModal>
  );
}
