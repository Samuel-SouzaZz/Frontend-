
# Portal web FCV

Portal da equipe da Fundação Cristiano Varella para gerenciar benefícios, conveniados, campanhas e o uso dos benefícios pelos colaboradores. Feito em React 19, TypeScript, Vite e CSS.

O portal só mostra e altera dados pela API, que fica em outro repositório: [fcv-backend](https://github.com/joaovictorcascardo/fcv-backend). Sem a API ligada, o login não funciona.

## Rodar na máquina

Precisa do Node.js 22 ou mais novo.

1. Ligue a API seguindo o README do `fcv-backend`. Ela fica em `http://localhost:3333`.
2. Neste repositório, copie o arquivo `.env.example` para `.env.local`. Ele já aponta para a API local:

   ```
   VITE_API_URL=http://localhost:3333/api/v1
   ```

3. Instale e ligue o portal:

   ```bash
   npm install
   npm run dev
   ```

4. Abra `http://127.0.0.1:5173` e entre com `admin@fcv.org.br` e senha `123456` (conta de teste da API).

Se mudar o `.env.local`, pare o `npm run dev` e ligue de novo.

## Telas

| Tela | Endereço | O que faz |
| --- | --- | --- |
| Login | `/login` | Entrar e recuperar a senha |
| Dashboard | `/` | Resumo das utilizações e atalhos para Pendências e Calendário |
| Colaboradores | `/colaboradores` | Lista, cadastro, edição e inativação |
| Detalhe do colaborador | `/colaboradores/:id` | Histórico de uso, dados e números do colaborador |
| Benefícios | `/beneficios` | Cadastro, regras de uso e onde cada benefício é aceito |
| Conveniados | `/conveniados` | Lista, cadastro, edição e inativação dos parceiros |
| Detalhe do conveniado | `/conveniados/:id` | Histórico, benefícios oferecidos e aprovação do parceiro |
| Utilizações | `/utilizacoes` | Histórico com filtros e estorno com motivo |
| Campanhas e eventos | `/campanhas` | Campanhas, eventos, itens e parceiros |
| Calendário | `/calendario` | Campanhas e eventos de cada dia do mês |
| Pendências | `/pendencias` | O que precisa de atenção: parceiros em análise, utilizações paradas, cadastros incompletos |
| Relatórios | `/relatorios` | Indicadores por período e exportação em CSV |
| Perfis e usuários | `/perfis` | Contas e perfis de acesso (só administrador) |
| Meu perfil | `/meu-perfil` | Dados da conta conectada |

## Organização (MVVM)

| Pasta | O que tem |
| --- | --- |
| `src/models/` | Tipos e funções puras: formatação, filtros, cálculos (período, calendário, pendências) |
| `src/viewmodels/` | Estado e regras de cada tela (`useXxxVM`), sessão e dados carregados da API |
| `src/pages/` | Uma página por rota. Só desenha o que o ViewModel entrega |
| `src/components/` | Peças reaproveitadas: `ui/` (tabela, modal, campo, selo), `detail/` (páginas de detalhe) e uma pasta por assunto |
| `src/services/` | Chamadas HTTP para a API |
| `src/hooks/` | Hooks comuns: filtros na URL, paginação, ações com carregamento |
| `src/styles/` | CSS por área |
| `tests/` | Testes das funções de `models` |

## Comandos

| Comando | Pra que serve |
| --- | --- |
| `npm run dev` | Liga o portal em modo de desenvolvimento |
| `npm test` | Roda os testes |
| `npm run build` | Confere o TypeScript e gera a versão final em `dist/` |

Antes de cada commit: `npm test` e `npm run build` sem erro.

Mais detalhes de como o portal conversa com a API em [docs/INTEGRACAO.md](docs/INTEGRACAO.md).
