# WTT Companion — Painel do Guia (MVP)

## 1. Entendimento do produto
Central operacional para guias de viagens internacionais em grupo. Não substitui o WhatsApp nem o guia: organiza o dia, publica avisos e mostra as respostas dos passageiros em um único painel.

## 2. Problema principal
Informação operacional dispersa no WhatsApp. O guia não sabe, de forma confiável e rápida, quem leu o aviso e quem já está no ponto de encontro.

## 3. Análise do Supabase conectado
Inspeção realizada agora no projeto conectado (ref hhrdhapypoihvzurynia):
- Schema `public`: **0 tabelas**.
- `auth.users`: **0 usuários**.
- Nenhuma função, trigger ou bucket de storage.

Conclusão: banco vazio. Nada será excluído ou renomeado; todo o schema é novo. Decisão confirmada: operação de uma única agência (WTT), mas com `organization_id` presente desde o início para permitir multi-agência no futuro sem migração destrutiva.

## 4. Arquitetura proposta
- TanStack Start (React 19) + Tailwind v4 + shadcn/ui, pt-BR, mobile-first.
- Leitura/escrita autenticada via `createServerFn` com middleware Supabase (RLS como o usuário logado). Sem chaves no frontend.
- Ações privilegiadas (convite de guia, importação em massa, envio simulado) em server functions que verificam papel antes de usar cliente admin.
- Respostas dos passageiros: rota pública `/r/{token}` (token opaco por destinatário) + registro manual pelo guia no painel.
- Camada `whatsapp` isolada com interface `sendTemplateMessage()`; no MVP há apenas o provider `simulado` que grava log. Troca futura pela WhatsApp Business Platform oficial sem tocar na UI.

## 5. Modelo de dados sugerido
- `organizations` — nome, timezone, config básica.
- `profiles` — 1:1 com `auth.users`: nome, telefone, organization_id.
- `user_roles` (+ enum `app_role`: admin, guide) — papéis em tabela separada, lidos por função `has_role` security definer.
- `trips` — viagem/produto: nome, destino, descrição.
- `departures` — saída da viagem: datas início/fim, código, status (planejada, em andamento, concluída).
- `departure_guides` — guias designados a uma saída.
- `passengers` — pessoa: nome, telefone (E.164), e-mail, observações.
- `departure_passengers` — vínculo passageiro↔saída (status, quarto/grupo).
- `meeting_points` — pontos de encontro por saída: nome, endereço, referência, lat/long opcional.
- `itinerary_days` — dia da saída: data, cidade, resumo.
- `itinerary_items` — atividades do dia: horário, título, descrição, orientações, meeting_point_id.
- `announcements` — aviso: saída, dia/atividade relacionada, título, corpo, status (rascunho/publicado), publicado_por, publicado_em.
- `announcement_recipients` — um registro por passageiro: token público, status de envio, enviado_em, lembretes enviados.
- `passenger_responses` — resposta ligada ao destinatário ou à sessão de presença: tipo (li_entendi, a_caminho, no_ponto, preciso_ajuda), origem (link_publico/manual), criado_em.
- `checkin_sessions` — controle de presença: atividade/ponto, horário previsto, aberta/encerrada.
- `checkin_responses` — estado atual por passageiro na sessão + horário da última resposta.
- `message_deliveries` — log da camada de envio (payload renderizado, provider, resultado) para auditoria e futura troca por WhatsApp real.
- `audit_logs` — ator, ação, entidade, id, dados antes/depois, timestamp.

Todas as tabelas com `organization_id`, `created_at`, `updated_at` (trigger de atualização), `GRANT` explícito para `authenticated`/`service_role` (e `anon` apenas nas leituras estritamente públicas do link de resposta, feitas por função em vez de acesso direto às tabelas).

## 6. Relacionamentos
```text
organizations 1─n trips 1─n departures
departures 1─n departure_guides ─1 profiles
departures 1─n departure_passengers ─1 passengers
departures 1─n meeting_points
departures 1─n itinerary_days 1─n itinerary_items ─1 meeting_points
departures 1─n announcements 1─n announcement_recipients ─1 departure_passengers
announcement_recipients 1─n passenger_responses
departures 1─n checkin_sessions 1─n checkin_responses ─1 departure_passengers
```

## 7. Perfis e permissões
- Admin: tudo dentro da organização (viagens, saídas, guias, passageiros, roteiros, avisos, presença, configurações).
- Guia: apenas saídas onde está em `departure_guides` — revisar roteiro, publicar aviso, abrir/encerrar presença, ver respostas, enviar lembrete. Sem acesso a configurações da agência nem a outras saídas.
- Passageiro: sem login. Identificado por saída + telefone; responde por link tokenizado.

## 8. Políticas RLS
- Funções security definer: `has_role(uid, role)`, `current_org_id()`, `is_guide_of_departure(uid, departure_id)`.
- Para cada tabela, políticas separadas de SELECT/INSERT/UPDATE/DELETE `TO authenticated`.
- Admin: `organization_id = current_org_id() AND has_role(auth.uid(),'admin')`.
- Guia: leitura/escrita restritas por `is_guide_of_departure`; sem DELETE em cadastros; escrita permitida em avisos, presença e respostas manuais das suas saídas.
- `profiles`: cada um lê/edita o próprio; admin lê todos da org.
- `user_roles`: leitura para autenticados; escrita só admin (via server function).
- Resposta pública por token: nenhuma policy `anon` ampla — validação do token e gravação acontecem em server function/rota pública com verificação do token.
- `audit_logs` e `message_deliveries`: leitura admin; escrita apenas server-side.

## 9. Rotas e telas
Públicas: `/` (login/entrada), `/r/$token` (resposta do passageiro), `/convite` (definição de senha).
Autenticadas (`_authenticated/`): `/painel` (dashboard por perfil), `/viagens`, `/viagens/$id`, `/saidas/$id` (visão geral), `/saidas/$id/passageiros`, `/saidas/$id/roteiro`, `/saidas/$id/hoje`, `/saidas/$id/avisos` (histórico), `/saidas/$id/avisos/novo` (criar + pré-visualizar), `/saidas/$id/presenca/$sessionId`, `/guias`, `/configuracoes`.

## 10. Componentes principais
`AppShell` mobile-first com navegação inferior; `CartaoProgramacaoHoje`; `ProximaAtividade`; `EditorAviso` + `PreviaMensagem` (renderiza o template como bolha de WhatsApp); `ListaDestinatarios` com filtro "sem resposta"; `PainelPresenca` com contadores (no ponto / a caminho / precisa ajuda / sem resposta); `ImportadorPassageiros` (CSV + colar planilha, com pré-visualização e validação de telefone); `BadgeStatusResposta`; `TabelaAuditoria`.

## 11. Fluxos do administrador
Criar viagem → criar saída → cadastrar guias e designar → importar passageiros (CSV ou colar) → montar roteiro por dia com atividades e pontos de encontro → acompanhar avisos e presença de todas as saídas.

## 12. Fluxos do guia
Abrir painel → ver saída atual, cidade, data, próxima atividade/horário/local, nº de passageiros, último aviso, pendentes → "Revisar programação" → "Publicar aviso" (pré-visualiza, publica, envio simulado gera link por passageiro) → "Abrir controle de presença" → acompanhar respostas em tempo real → "Lembrar quem não respondeu" → "Encerrar encontro".

## 13. Estratégia WhatsApp (futuro)
Interface única no servidor: `sendMessage({ to, template, variables })`. Providers: `SimulatedProvider` (MVP: grava em `message_deliveries` e gera link de resposta) e, depois, `WhatsAppCloudProvider` (WhatsApp Business Platform oficial, templates aprovados, credenciais em secrets). Rota `/api/public/webhooks/whatsapp` já prevista com verificação de assinatura para receber respostas reais. Sem Z-API/Evolution.

## 14. Fases do desenvolvimento
1. **Base visual + design system**: tokens azul-marinho/branco/cinza/bordô, tipografia, AppShell, tela de login (sem backend).
2. **Migração 1 + auth**: organizations, profiles, user_roles, funções e RLS; login e-mail/senha, convite de guia pelo admin, gate `_authenticated`, dashboard vazio por perfil.
3. **Migração 2 + cadastros**: trips, departures, departure_guides; CRUD admin de viagens/saídas/guias.
4. **Migração 3 + passageiros**: passengers, departure_passengers; lista, cadastro manual e importação (CSV + colar).
5. **Migração 4 + roteiro**: meeting_points, itinerary_days, itinerary_items; editor de roteiro e tela "Programação de hoje".
6. **Migração 5 + avisos**: announcements, announcement_recipients, message_deliveries, passenger_responses; criar, pré-visualizar, publicar, envio simulado, link público de resposta, histórico, lembretes.
7. **Migração 6 + presença**: checkin_sessions, checkin_responses; painel de presença com contadores, registro manual, lembrete e encerramento.
8. **Auditoria e ajustes**: audit_logs nas ações críticas, tela de auditoria, revisão de RLS com o linter, polimento mobile e SEO/metadados.

## 15. Critérios de conclusão por fase
Cada fase só termina quando: build sem erros; migração aplicada e linter de segurança revisado; um admin e um guia de teste conseguem executar o fluxo da fase ponta a ponta na preview; guia não consegue ver dados de saída à qual não foi designado (testado); textos em pt-BR e telas usáveis em 375px de largura.

## 16. Riscos técnicos
- Complexidade das políticas RLS com dois perfis e escopo por saída — mitigar com funções security definer e testes de acesso cruzado.
- Normalização de telefones na importação (E.164, duplicatas) — validação e pré-visualização antes de gravar.
- Link público de resposta: risco de enumeração — tokens longos aleatórios, sem dados sensíveis na página, rate limiting simples.
- Divergência entre a prévia simulada e os templates aprovados do WhatsApp — modelar mensagem já como template com variáveis.
- Fuso horário nas viagens internacionais — armazenar em UTC, exibir no timezone da saída.

## 17. Perguntas em aberto
1. Quem cria o primeiro admin da WTT — posso deixar uma rota de setup inicial protegida por senha única?
2. Uma saída pode ter mais de um guia atuando simultaneamente (guia líder + auxiliar)?
3. O aviso é sempre vinculado a uma atividade do roteiro, ou também existe aviso livre?
4. Os passageiros podem responder mais de uma vez (ex.: "a caminho" depois "no ponto") — mantenho histórico e status atual?
5. O controle de presença é sempre criado a partir de uma atividade do roteiro, ou o guia pode abrir um ad hoc?
