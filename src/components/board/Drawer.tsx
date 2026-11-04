import { createContext, useEffect, useRef, useState, type ReactNode } from "react";

export const DrawerContext = createContext<(() => void) | null>(null);
import { X } from "lucide-react";

export function Drawer({
  titulo,
  onFechar,
  children,
  rodape,
  protegido = false,
  janela = false,
}: {
  titulo: string;
  onFechar: () => void;
  children: ReactNode;
  rodape?: ReactNode;
  protegido?: boolean;
  janela?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [perguntando, setPerguntando] = useState(false);
  const pedirFechar = () => (protegido ? setPerguntando(true) : onFechar());

  useEffect(() => {
    const dialog = ref.current;
    const anterior = document.activeElement;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      dialog?.close();
      if (anterior instanceof HTMLElement && anterior.isConnected) anterior.focus();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className={janela ? "drawer drawer-janela" : "drawer"}
      aria-label={titulo}
      onCancel={(event) => {
        event.preventDefault();
        pedirFechar();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) pedirFechar();
      }}
    >
      <div className="drawer-panel">
        <button type="button" className="drawer-close" aria-label="Fechar" onClick={pedirFechar}>
          <X size={20} />
        </button>
        {perguntando && (
          <div className="drawer-discard" role="alertdialog" aria-label="Descartar alterações">
            <p>Sair sem salvar? O que você preencheu será perdido.</p>
            <div>
              <button type="button" className="btn btn-secondary" autoFocus onClick={() => setPerguntando(false)}>
                Continuar editando
              </button>
              <button type="button" className="btn btn-danger" onClick={onFechar}>
                Sair sem salvar
              </button>
            </div>
          </div>
        )}
        <DrawerContext.Provider value={pedirFechar}>
          <div className="drawer-body">{children}</div>
        </DrawerContext.Provider>
        {rodape && <div className="drawer-footer">{rodape}</div>}
      </div>
    </dialog>
  );
}

export function BoardColumn({
  titulo,
  cor,
  total,
  vazio,
  children,
  rodape,
}: {
  titulo: string;
  cor: "amarelo" | "verde" | "cinza";
  total: number;
  vazio: string;
  children: ReactNode;
  rodape?: ReactNode;
}) {
  const soBotao = total === 0 && rodape;
  return (
    <section className="board-col" aria-label={`${titulo}: ${total}`}>
      <header className="board-col-head">
        <h2>
          <span className={`board-dot board-dot-${cor}`} aria-hidden="true" />
          {titulo}
        </h2>
        <span className="board-count">{total}</span>
      </header>
      <div className="board-cards">
        {soBotao ? null : total === 0 ? <p className="board-empty">{vazio}</p> : children}
      </div>
      {rodape}
    </section>
  );
}

export function Selo({ tom, children }: { tom: "verde" | "amarelo" | "cinza" | "vermelho" | "azul"; children: ReactNode }) {
  return <span className={`selo selo-${tom}`}>{children}</span>;
}
