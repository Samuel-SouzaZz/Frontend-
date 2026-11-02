import type { FormEvent } from "react";
import { Field, FormModal, Select } from "../ui";
import type { Conveniado } from "../../models/types";

type VincularConveniadoModalProps = {
  itemNome: string;
  conveniados: Conveniado[];
  partnerId: string;
  onPartnerChange: (value: string) => void;
  saving: boolean;
  error: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export function VincularConveniadoModal({
  itemNome,
  conveniados,
  partnerId,
  onPartnerChange,
  saving,
  error,
  onSubmit,
  onClose,
}: VincularConveniadoModalProps) {
  return (
    <FormModal
      grid={false}
      title="Vincular conveniado"
      description={`Selecione quem oferece o item “${itemNome}”.`}
      submitting={saving}
      submitLabel="Vincular conveniado"
      submittingLabel="Vinculando…"
      submitDisabled={!partnerId}
      error={error}
      onSubmit={onSubmit}
      onClose={onClose}
    >
      <Field label="Conveniado ativo" required>
        <Select
          value={partnerId}
          onChange={onPartnerChange}
          placeholder="Selecione um conveniado"
          options={[
            { value: "", label: "Selecione um conveniado" },
            ...conveniados.map((parceiro) => ({
              value: String(parceiro.id),
              label: parceiro.nome_fantasia || parceiro.razao_social,
            })),
          ]}
        />
      </Field>
    </FormModal>
  );
}
