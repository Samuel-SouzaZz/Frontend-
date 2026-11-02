import { Shield, ShieldCheck, UserCheck, Users } from "lucide-react";
import { StatCard, StatsGrid } from "../ui";
import type { Perfil, Usuario } from "../../models/types";

type PerfisStatsProps = {
  perfis: Perfil[];
  usuarios: Usuario[];
  profileFor: (id: number) => Perfil | undefined;
};

export function PerfisStats({ perfis, usuarios, profileFor }: PerfisStatsProps) {
  const perfisAtivos = perfis.filter((item) => item.status === "ATIVO").length;
  const usuariosAtivos = usuarios.filter((item) => item.status === "ATIVO").length;
  const contasFcv = usuarios.filter(
    (item) => profileFor(item.perfil_id)?.escopo === "FCV",
  ).length;
  return (
    <StatsGrid>
      <StatCard
        label="Perfis de acesso"
        value={perfis.length}
        icon={<Shield size={21} />}
        detail="Escopos e permissões definidos"
      />
      <StatCard
        label="Perfis ativos"
        value={perfisAtivos}
        icon={<ShieldCheck size={21} />}
        tone="green"
        detail="Disponíveis para novas contas"
      />
      <StatCard
        label="Usuários ativos"
        value={usuariosAtivos}
        icon={<UserCheck size={21} />}
        tone="purple"
        detail="Contas com status ativo"
      />
      <StatCard
        label="Contas da equipe FCV"
        value={contasFcv}
        icon={<Users size={21} />}
        tone="amber"
        detail="Acesso ao portal web"
      />
    </StatsGrid>
  );
}
