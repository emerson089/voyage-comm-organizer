# WTT Companion — Painel do Guia (MVP)

## 1. Entendimento do produto
Central operacional para guias de viagens internacionais em grupo. Não substitui o WhatsApp nem o guia: organiza o dia, publica avisos e mostra as respostas dos passageiros em um único painel.

## 2. Problema principal
Informação operacional dispersa no WhatsApp. O guia não sabe, de forma confiável e rápida, quem leu o aviso e quem já está no ponto de encontro.

## 3. Análise do Supabase conectado
Inspeção feita no projeto conectado (ref hhrdhapypoihvzurynia):
- Schema `public`: **0 tabelas**; `auth.users`: **0 usuários**; nenhuma função, trigger ou bucket.

Banco vazio: nada será excluído ou renomeado. Uma agência (WTT), mas com `organization_id` em todas as tabelas de negócio desde o início.

## 4. Arquitetura proposta
- TanStack Start (React 19) + Tailwind v4 + shadcn/ui, pt-BR, mobile-first.
- Toda leitura/escrita autenticada por `createServerFn` + middleware Supabase (RLS como o usuário). Nenhuma chave no frontend.
- Ações privilegiadas (convite de guia, importação em massa, geração de tokens, envio simulado) em server functions que verificam papel antes de usar o cliente admin.
- Respostas do passageiro: rota pública `/r/$token` validada por **hash** do token + registro manual pelo guia.
- Camada `whatsapp` isolada: interface `sendTemplateMessage()` com provider `simulado` no MVP; provider oficial (WhatsApp Business Platform) depois, sem tocar na UI.

## 5. Primeiro administrador
Sem rota pública de setup. O usuário é criado manualmente no Supabase Auth (Dashboard) e o plano entrega um script SQL idempotente, para rodar no SQL Editor, que:
1. Garante a organização WTT (`insert ... on conflict do nothing`).
2. Cria/atualiza o `profile` a partir do e-mail (`select id from auth.users where email = '...'`), falhando com mensagem clara se o usuário não existir.
3. Insere o papel `admin` em `user_roles` (`on conflict do nothing`).
Depois disso, novos usuários entram pelo fluxo de convite do próprio sistema.

## 6. Modelo de dados (revisado)
Enums: `app_role` (admin, guide), `departure_status`, `guide_role` (**lead, assistant**), `announcement_type` (**information, reminder, schedule_change, important**), `announcement_status` (draft, published, superseded), `token_purpose` (**announcement, checkin**), `token_status` (**generated, opened, responded, expired, revoked**), `announcement_response_type` (li_entendi), `checkin_state` (**a_caminho, no_ponto, preciso_ajuda** — `sem_resposta` NÃO é evento), `response_source` (public_link, manual).

- `organizations` — nome, timezone padrão apenas para exibição administrativa.
- `profiles` — id = auth.users.id, organization_id, nome, telefone, ativo.
- `user_roles` — (user_id, role) único; lido por `has_role` security definer.
- `trips` — organization_id, nome, destino, descrição.
- `departures` — organization_id, trip_id, código, data início/fim, status.
- `departure_guides` — departure_id, profile_id, **guide_role (lead/assistant)**, organization_id; único por (departure_id, profile_id).
- `passengers` — organization_id, nome, telefone E.164, e-mail, notas.
- `departure_passengers` — departure_id, passenger_id, organization_id, status, grupo/quarto, **whatsapp_opt_in_at, whatsapp_opt_in_source, whatsapp_opt_out_at**.
- `meeting_points` — organization_id, departure_id (ou reutilizável por trip), nome, endereço, referência, lat/long, **timezone IANA**.
- `itinerary_days` — organization_id, departure_id, day_date, cidade, país, **timezone IANA**, resumo.
- `itinerary_items` — organization_id, itinerary_day_id, título, descrição, orientações, meeting_point_id (NULL ok), **starts_at timestamptz**, **timezone IANA** (herda do dia quando nulo), ordem.
- `announcements` — organization_id, departure_id, **itinerary_item_id NULL**, **announcement_type**, título, corpo, status (draft/published/superseded), **supersedes_announcement_id** (correção de aviso publicado), created_by, published_by, published_at.
- `public_response_tokens` — **infraestrutura comum de tokens**: id, organization_id, departure_passenger_id, `purpose` (announcement | checkin), announcement_id NULL, checkin_session_id NULL, `token_hash`, `expires_at`, `revoked_at`, `first_opened_at`, `last_opened_at`, `status`, created_at. Constraint garantindo exclusividade: purpose `announcement` exige announcement_id e proíbe checkin_session_id; purpose `checkin` exige checkin_session_id e proíbe announcement_id; nunca os dois. Token aleatório criptográfico, armazenado só como hash, nunca exposto em listas do painel.
- `announcement_recipients` — announcement_id, departure_passenger_id, organization_id, status derivado do token/resposta, reminder_count, last_reminder_at. Sem token próprio (fica em `public_response_tokens`).
- `announcement_responses` — **confirmação de aviso**: recipient_id, tipo, source (public_link/manual), recorded_by (quando manual), reason, created_at.
- `checkin_sessions` — organization_id, departure_id, **itinerary_item_id NULL**, meeting_point_id (NULL ok), scheduled_at timestamptz, **timezone IANA**, opened_by, opened_at, closed_at, closed_by.
- `checkin_response_events` — **histórico**: session_id, departure_passenger_id, state (a_caminho | no_ponto | preciso_ajuda), source, recorded_by, reason, created_at.
- `checkin_responses` — **estado atual** por (session_id, departure_passenger_id): state, last_event_id, last_response_at (mantido por trigger). Passageiro sem nenhum evento = **sem resposta** (estado calculado/inicial, nunca gravado como evento).
- `message_deliveries` — log da camada de envio: provider (simulated), payload renderizado, token_id/recipient_id, resultado, created_at.
- `audit_logs` — organization_id, actor_id, ação, entidade, entity_id, dados antes/depois, created_at.

### Validade dos tokens
- Aviso vinculado a atividade: `expires_at = starts_at + 2 horas`, calculado no fuso IANA da atividade.
- Aviso livre: 24 horas por padrão, com coluna/config de validade para permitir ajuste futuro.
- Presença: válido **somente enquanto a sessão está aberta**. Ao encerrar (`closed_at`), trigger revoga os tokens da sessão e novas respostas são rejeitadas imediatamente; a página pública informa que o controle foi encerrado.
- Token deixa de funcionar quando revogado, expirado ou com sessão encerrada. Purpose `checkin` aceita múltiplas respostas dentro da validade (permite atualizar de "a caminho" para "no ponto"); purpose `announcement` aceita a confirmação e registra `responded`.

Regras gerais: `created_at`/`updated_at` com trigger; `GRANT` explícito para `authenticated` e `service_role` em toda tabela; nenhuma policy `anon` — a rota pública de resposta passa por server function com cliente admin após validar hash do token.

### Integridade entre organizações
- `organization_id NOT NULL` em toda tabela de negócio.
- Chaves únicas compostas nos pais, ex. `unique (id, organization_id)`, e **foreign keys compostas** nos filhos (`(departure_id, organization_id) references departures(id, organization_id)`), impedindo por constraint qualquer relacionamento cruzando organizações.
- Onde a FK composta não é possível (relação indireta, ex. `itinerary_items` → `meeting_points`), trigger `before insert/update` validando a mesma organização.
- Validações temporais (ex. `expires_at > now()`) por trigger, nunca CHECK.

### Regras de negócio nas escritas
- Aviso `draft` é editável; aviso `published` é imutável (trigger bloqueia UPDATE de título/corpo/tipo). **Correção de aviso publicado**: cria novo aviso com `supersedes_announcement_id`, marca o anterior como `superseded`, gera **novos destinatários e novos tokens para todos os passageiros**, exige nova confirmação de todos e preserva integralmente o histórico anterior.
- Publicar aviso e publicar correção: apenas admin ou guia **lead** da saída.
- Guia **assistant** pode: abrir controle de presença, acompanhar respostas, registrar respostas manualmente, enviar lembrete a quem não respondeu e encerrar a sessão — todas com registro em `audit_logs`. Não pode publicar aviso oficial, publicar correção, alterar horário do roteiro nem alterar ponto de encontro.

## 7. Relacionamentos
```text
organizations 1─n trips 1─n departures
departures 1─n departure_guides ─1 profiles      (guide_role: lead | assistant)
departures 1─n departure_passengers ─1 passengers
departures 1─n meeting_points
departures 1─n itinerary_days 1─n itinerary_items ─0..1 meeting_points
departures 1─n announcements ─0..1 itinerary_items
announcements 0..1─1 announcements               (supersedes_announcement_id)
announcements 1─n announcement_recipients ─1 departure_passengers
announcement_recipients 1─n announcement_responses
departure_passengers 1─n public_response_tokens ─0..1 announcements
                                               ─0..1 checkin_sessions
public_response_tokens 1─n message_deliveries
departures 1─n checkin_sessions ─0..1 itinerary_items / meeting_points
checkin_sessions 1─n checkin_response_events ─1 departure_passengers
checkin_sessions 1─n checkin_responses (estado atual, 1 por passageiro)
```

## 8. Perfis, permissões e RLS
Funções security definer: `has_role(uid, role)`, `current_org_id()`, `is_guide_of_departure(uid, departure_id)`, `is_lead_guide(uid, departure_id)`.

Políticas separadas por operação, sempre `TO authenticated`:
- **Admin** (`has_role(auth.uid(),'admin') and organization_id = current_org_id()`): SELECT/INSERT/UPDATE/DELETE em todas as tabelas de negócio.
- **Guia (lead e assistant)**: SELECT em `trips`/`departures`/`departure_passengers`/`passengers` (via saída)/`meeting_points`/`itinerary_*`/`announcements`/`announcement_recipients`/`announcement_responses`/`checkin_*` restrito por `is_guide_of_departure`. Sem DELETE em cadastros.
- **Guia lead**: INSERT/UPDATE em `announcements` (incluindo publicar e publicar correção) e em `itinerary_items`/`meeting_points` da sua saída; UPDATE de `announcements` só enquanto `draft`.
- **Guia assistant**: INSERT/UPDATE de `announcements` apenas com `status = 'draft'`; INSERT/UPDATE em `checkin_sessions` (abrir e encerrar), INSERT em `checkin_response_events` e `announcement_responses` (source manual) da sua saída; sem UPDATE em `itinerary_items` e `meeting_points`.
- `profiles`: cada um lê/atualiza o próprio; admin lê/edita todos da org.
- `user_roles`: SELECT para autenticados da org; escrita apenas por server function admin.
- `public_response_tokens`: **nenhuma policy para o cliente** — leitura/escrita apenas server-side; o painel nunca projeta `token_hash`. Reenvio gera novo token e revoga o anterior.
- `audit_logs`, `message_deliveries`: SELECT admin; INSERT apenas server-side.
- Passageiro (`anon`): **sem policy alguma**. `/r/$token` resolve via server function que confere hash, propósito, validade, revogação e estado da sessão antes de gravar a resposta.

## 9. Rotas e telas
Públicas: `/` (login), `/r/$token` (resposta do passageiro), `/convite` (definir senha).
Autenticadas: `/painel`, `/viagens`, `/viagens/$id`, `/saidas/$id`, `/saidas/$id/passageiros`, `/saidas/$id/roteiro`, `/saidas/$id/hoje`, `/saidas/$id/avisos`, `/saidas/$id/avisos/novo`, `/saidas/$id/presenca/$sessionId`, `/guias`, `/configuracoes`, `/auditoria`.

## 10. Componentes principais
`AppShell` mobile-first com navegação inferior; `CartaoProgramacaoHoje`; `ProximaAtividade` (com fuso da atividade); `EditorAviso` + `PreviaMensagem` (template com variáveis); `ListaDestinatarios` com filtro "sem resposta"; `PainelPresenca` (contadores no ponto / a caminho / precisa ajuda / sem resposta + histórico por passageiro); `RegistrarRespostaManual` (motivo opcional); `ImportadorPassageiros` (CSV + colar planilha, validação E.164, pré-visualização); `BadgeStatusResposta`; `TabelaAuditoria`.

## 11. Fluxos do administrador
Criar viagem → criar saída → cadastrar guias e designar como lead/assistant → importar passageiros e registrar opt-in → montar roteiro por dia com cidade, fuso e pontos de encontro → acompanhar avisos, presença e auditoria de todas as saídas.

## 12. Fluxos do guia
Painel → saída atual, cidade, data, próxima atividade no fuso local, nº de passageiros, último aviso, pendentes → "Revisar programação" → "Publicar aviso" (lead; prévia, publicação, geração de links por passageiro) → "Abrir controle de presença" → acompanhar respostas → "Lembrar quem não respondeu" → "Encerrar encontro". Correção de aviso publicado = novo aviso vinculado ao anterior.

## 13. Estratégia WhatsApp (futuro)
Interface `sendMessage({ to, template, variables })`. MVP: `SimulatedProvider` grava em `message_deliveries` e gera link tokenizado (status `generated` → `opened` → `responded`). Depois: `WhatsAppCloudProvider` oficial com templates aprovados e credenciais em secrets, e rota `/api/public/webhooks/whatsapp` com verificação de assinatura, momento em que passam a existir `sent`, `delivered`, `read`. Sem Z-API/Evolution. Opt-in registrado em `departure_passengers` já no MVP.

## 14. Fases e migrations
1. **Base visual** (sem banco): tokens azul-marinho/branco/cinza/bordô, tipografia, AppShell, tela de login estática.
2. **Migration 1 — identidade**: enums `app_role`; `organizations`, `profiles`, `user_roles`, funções `has_role`/`current_org_id`, trigger `updated_at`, RLS. + login e-mail/senha, gate `_authenticated`, convite de guia por admin, painel vazio por perfil, script SQL do primeiro admin.
3. **Migration 2 — cadastros**: enums `departure_status`, `guide_role`; `trips`, `departures`, `departure_guides`, funções `is_guide_of_departure`/`is_lead_guide`, FKs compostas, RLS. + CRUD de viagens, saídas e designação de guias.
4. **Migration 3 — passageiros**: `passengers`, `departure_passengers` (com campos de opt-in), RLS. + lista, cadastro manual, importação CSV e colar planilha.
5. **Migration 4 — roteiro**: `meeting_points`, `itinerary_days`, `itinerary_items` (timezone IANA, timestamptz), triggers de integridade organizacional. + editor de roteiro e "Programação de hoje".
6. **Migration 5 — avisos**: enums de aviso e destinatário; `announcements` (com `supersedes_announcement_id` e trigger de imutabilidade), `announcement_recipients` (token_hash/expires_at/revoked_at/used_at), `announcement_responses`, `message_deliveries`. + criar, pré-visualizar, publicar (lead), envio simulado, link público `/r/$token`, histórico, lembretes.
7. **Migration 6 — presença**: `checkin_sessions`, `checkin_response_events`, `checkin_responses` + trigger de estado atual. + painel de presença, registro manual com motivo, lembrete a quem não respondeu, encerrar encontro.
8. **Migration 7 — auditoria** e ajustes: `audit_logs`, gravação nas ações críticas, tela de auditoria, revisão pelo linter de segurança, polimento mobile e metadados.
9. **Backlog pós-MVP**: ação "Duplicar saída e roteiro" (copia dias, atividades, orientações e pontos de encontro reutilizáveis; **não** copia passageiros, respostas, avisos publicados, presenças ou logs); integração oficial do WhatsApp.

## 15. Critérios de conclusão por fase
Build sem erros; migração aplicada e linter de segurança revisado; admin, guia lead e guia assistant de teste executam o fluxo da fase ponta a ponta na preview; guia não vê dados de saída à qual não foi designado; auxiliar não consegue publicar aviso; tentativa de relacionar registros de organizações diferentes é rejeitada pelo banco; textos em pt-BR e telas usáveis em 375px.

## 16. Riscos técnicos
- Complexidade das RLS com dois papéis + níveis de guia — mitigado por funções security definer e testes de acesso cruzado.
- FKs compostas exigem chaves únicas em todos os pais — modelar desde a primeira migration para evitar retrabalho.
- Fusos por atividade: risco de exibir horário errado — armazenar `timestamptz` + timezone IANA e formatar sempre com o fuso da atividade.
- Token por hash: link só é exibido uma vez; garantir cópia/reenvio gerando novo token e revogando o anterior.
- Normalização de telefones e duplicatas na importação — validação e pré-visualização antes de gravar.
- Divergência entre prévia e templates oficiais aprovados — modelar mensagem como template com variáveis desde já.

## 17. Perguntas restantes (não bloqueiam a Fase 1)
1. Prazo padrão de validade do link de resposta (ex. 24h ou até o fim da atividade)?
2. Guia auxiliar pode abrir controle de presença ou apenas acompanhar um já aberto? (Plano atual: pode abrir.)
3. Ao corrigir um aviso publicado, o novo aviso deve reenviar link a todos ou apenas a quem ainda não confirmou?
