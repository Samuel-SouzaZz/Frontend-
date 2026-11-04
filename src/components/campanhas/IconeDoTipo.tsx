import { CalendarDays, Gift, Handshake, Megaphone, Ticket } from "lucide-react";
import type { CampanhaTipo } from "../../models/types";

export function IconeDoTipo({ tipo, size = 20 }: { tipo: CampanhaTipo; size?: number }) {
    if (tipo === "EVENTO_INTERNO") return <CalendarDays size={size} />;
    if (tipo === "EVENTO_PATROCINADO") return <Handshake size={size} />;
    if (tipo === "VOUCHER") return <Ticket size={size} />;
    if (tipo === "CORTESIA") return <Gift size={size} />;
    return <Megaphone size={size} />;
}
