# WTT Companion — Roadmap

## Fase 1 — Protótipo visual (sem banco) — IMPLEMENTADA
- [x] Design tokens (azul-marinho/branco/cinza/bordô) + Manrope/Sora
- [x] AppShell mobile-first com navegação inferior + desktop
- [x] Login estático → /painel
- [x] Painel do guia (saída, próximo encontro, contadores, ajuda em destaque)
- [x] Programação de hoje + prévia de amanhã
- [x] Revisar programação (checklist)
- [x] Histórico de avisos
- [x] Criar aviso → prévia → confirmar publicação ("Links gerados — envio simulado")
- [x] Controle de presença (contadores, ajuda em destaque, lembrete pendentes)
- [x] Detalhes/histórico + registro manual de situação
- [x] Encerrar encontro com confirmação + estado bloqueado
- [x] Página pública /r/$token (aviso "Li e entendi" + presença com transição)
- [x] Supabase intocado, sem migrations, sem auth real, sem tokens reais

## Fase 2 — Banco e fluxo real — AGUARDANDO APROVAÇÃO
- [ ] Migration 1 — identidade (organizations, profiles, user_roles, has_role, RLS)
- [ ] Migration 2 — cadastros (trips, departures, departure_guides)
- [ ] Migration 3 — passageiros (passengers, departure_passengers + opt-in)
- [ ] Migration 4 — roteiro (meeting_points, itinerary_days, itinerary_items)
- [ ] Migration 5 — avisos e tokens (announcements, public_response_tokens, message_deliveries)
- [ ] Migration 6 — presença (checkin_sessions, checkin_response_events, checkin_responses)
- [ ] Migration 7 — auditoria (audit_logs)
