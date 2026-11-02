import RelatoriosView from "../components/relatorios/RelatoriosView";
import { useRelatoriosVM } from "../viewmodels/useRelatoriosVM";

export default function Relatorios() {
  return <RelatoriosView {...useRelatoriosVM()} />;
}