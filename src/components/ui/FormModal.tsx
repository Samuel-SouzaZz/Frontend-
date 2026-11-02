import type { FormEvent, ReactNode } from "react";
import { Modal } from "./Modal";
import { FormError } from "./FormError";

type FormModalProps = {
  title: string;
  description?: string;
  wide?: boolean;
  submitting: boolean;
  submitLabel: string;
  submittingLabel?: string;
  submitDisabled?: boolean;
  error?: string;
  grid?: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
};

export function FormModal({
  title,
  description,
  wide,
  submitting,
  submitLabel,
  submittingLabel = "Salvando...",
  submitDisabled = false,
  error,
  grid = true,
  onClose,
  onSubmit,
  children,
}: FormModalProps) {
  const close = () => {
    if (!submitting) onClose();
  };
  return (
    <Modal title={title} description={description} wide={wide} onClose={close}>
      <form onSubmit={onSubmit} className={grid ? "form-grid" : undefined}>
        {children}
        <FormError message={error} />
        <div className="modal-footer full-width">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={submitting}
            onClick={close}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || submitDisabled}
          >
            {submitting ? submittingLabel : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
