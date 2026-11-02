import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronDown, X } from "lucide-react";
import { invalidFields, ValidationContext } from "./validation";

export function Modal({
  title,
  onClose,
  children,
  wide,
  description,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  description?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ pointerId: -1, startY: 0, startScrollTop: 0 });
  const submittedFormRef = useRef<HTMLFormElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hasMoreBelow, setHasMoreBelow] = useState(false);
  const id = useId();
  const [pending, setPending] = useState<string[]>([]);

  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement;
    dialog?.showModal();
    dialog?.querySelectorAll("form").forEach((form) => {
      form.noValidate = true;
    });
    return () => {
      dialog?.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus();
    };
  }, []);

  useEffect(() => {
    const body = modalBodyRef.current;
    const content = modalContentRef.current;
    if (!body || !content) return;
    const updateScrollCue = () => {
      setHasMoreBelow(
        body.scrollTop + body.clientHeight < body.scrollHeight - 8,
      );
    };
    updateScrollCue();
    body.addEventListener("scroll", updateScrollCue, { passive: true });
    const observer = new ResizeObserver(updateScrollCue);
    observer.observe(body);
    observer.observe(content);
    return () => {
      body.removeEventListener("scroll", updateScrollCue);
      observer.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    const form = submittedFormRef.current;
    if (!pending.length || !form?.isConnected) return;
    const next = invalidFields(form);
    if (next.join("|") !== pending.join("|")) setPending(next);
  });

  function stopDragging() {
    dragRef.current.pointerId = -1;
    setDragging(false);
  }

  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? "modal-wide" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={id}
      aria-describedby={description ? `${id}-description` : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onSubmitCapture={(event) => {
        if (!(event.target instanceof HTMLFormElement)) return;
        submittedFormRef.current = event.target;
        const issues = invalidFields(event.target);
        setPending(issues);
        if (issues.length) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      <div className="modal-header">
        <div>
          <h2 id={id}>{title}</h2>
          {description && <p id={`${id}-description`}>{description}</p>}
        </div>
        <button
          className="icon-button"
          type="button"
          aria-label="Fechar janela"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      <div className="modal-scroll-region">
        <div
          ref={modalBodyRef}
          className={`modal-body${dragging ? " is-dragging" : ""}`}
          onPointerDown={(event) => {
            const body = event.currentTarget;
            const target = event.target;
            if (
              event.pointerType !== "mouse" ||
              event.button !== 0 ||
              body.scrollHeight <= body.clientHeight ||
              !(target instanceof HTMLElement) ||
              target.closest(
                "button, a, input, select, textarea, label, [contenteditable='true']",
              )
            )
              return;
            dragRef.current = {
              pointerId: event.pointerId,
              startY: event.clientY,
              startScrollTop: body.scrollTop,
            };
            body.setPointerCapture(event.pointerId);
            setDragging(true);
            event.preventDefault();
          }}
          onPointerMove={(event) => {
            if (event.pointerId !== dragRef.current.pointerId) return;
            event.currentTarget.scrollTop =
              dragRef.current.startScrollTop -
              (event.clientY - dragRef.current.startY);
            event.preventDefault();
          }}
          onPointerUp={(event) => {
            if (event.pointerId !== dragRef.current.pointerId) return;
            stopDragging();
          }}
          onPointerCancel={stopDragging}
          onLostPointerCapture={stopDragging}
        >
          <div ref={modalContentRef}>
            <ValidationContext.Provider value={pending}>
              {children}
              {pending.length > 0 && (
                <div className="validation-summary" role="alert">
                  <strong>Revise os campos abaixo:</strong>
                  <ul>
                    {pending.map((field) => (
                      <li key={field}>{field}</li>
                    ))}
                  </ul>
                </div>
              )}
            </ValidationContext.Provider>
          </div>
        </div>
        {hasMoreBelow && (
          <div className="modal-scroll-cue" aria-hidden="true">
            <ChevronDown size={15} />
            <span>Mais conteúdo abaixo</span>
          </div>
        )}
      </div>
    </dialog>
  );
}
