# Como o portal conversa com a API

A API é o repositório [fcv-backend](https://github.com/joaovictorcascardo/fcv-backend). O endereço dela vem de `VITE_API_URL`
(no `.env.local`). Todas as chamadas ficam em `src/services/api.ts`.

## Login e sessão

- `POST /auth/login` com e-mail e senha. O portal só aceita contas ativas com escopo `FCV` (administrador ou operador).
- O token vai no cabeçalho `Authorization: Bearer <token>` de todas as chamadas e fica no `sessionStorage` (some ao fechar a
  aba).
- Ao abrir o portal de novo, `GET /auth/eu` confere se o token ainda vale. Qualquer resposta `401` desconecta.
- Esqueci a senha: `POST /auth/esqueci-senha` (a resposta é sempre a mesma mensagem, sem o código) e depois `POST
/auth/redefinir-senha` com e-mail, código e nova senha (mínimo 6 caracteres).

## Rotas usadas

| Rota                                                 | Tela                                                                                     |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `/usuarios`, `/perfis`                               | Perfis e usuários. Criar, alterar e excluir é só do administrador (a API também confere) |
| `/colaboradores`                                     | Colaboradores e detalhe do colaborador                                                   |
| `/conveniados`                                       | Conveniados, detalhe e aprovação do parceiro                                             |
| `/beneficios`, `/ofertas`                            | Benefícios e onde cada um é aceito                                                       |
| `/campanhas`, `/itens-campanha`, `/ofertas-campanha` | Campanhas e eventos, Calendário                                                          |
| `/utilizacoes`                                       | Utilizações, Dashboard, Relatórios, Pendências e o sino de avisos                        |

Ao entrar, o portal faz `GET` de todas as listas de uma vez e guarda em memória (`PortalContext`). Filtros, busca, paginação,
Dashboard, Relatórios, Calendário e Pendências são calculados no próprio portal com essas listas. A API não tem rota de dashboard nem de pendências.

## Como cada ação vira chamada

| Ação na tela                              | Chamada                                                                                             |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Cadastrar                                 | `POST /<rota>`                                                                                      |
| Editar                                    | `PUT /<rota>/:id` só com os campos alterados                                                        |
| Inativar, descontinuar, cancelar campanha | `PUT` mudando o `status`. Nada é apagado, o histórico continua                                      |
| Aprovar parceiro                          | `PUT /conveniados/:id` com `status: ATIVO`                                                          |
| Estornar utilização                       | `PUT /utilizacoes/:id` com o motivo em `observacoes` e depois `DELETE /utilizacoes/:id` (a API muda |
| APROVADA para ESTORNADA)                  |

## O que depende da API (pedidos ao grupo da API)

1. **Estorno em uma chamada só.** Hoje são duas. Se a segunda falhar, fica o motivo sem o estorno. O certo é o `DELETE` aceitar
   o motivo.
2. **Cancelar campanha não desativa os itens dela.** A API precisa fazer isso junto.
3. **Permissões dos perfis.** A lista de permissões é salva, mas ninguém confere. Hoje só vale a diferença entre administrador e
   operador.
4. **Auditoria.** O protótipo tem a tela, mas não existe tabela nem rota na API.
5. **Listas grandes.** O portal busca tudo de uma vez. Com muitos registros, vai precisar usar a paginação da API (`?
pagina=&limite=`).

## Testar com a API

1. Ligue a API num banco de teste (nunca no banco da apresentação) e rode o `db:reset` dela.
2. Ligue o portal com `npm run dev` e entre com `admin@fcv.org.br` / `123456`.
3. Para ver a visão do operador, entre com `operador@fcv.org.br` / `123456`: Perfis e usuários fica bloqueado.
