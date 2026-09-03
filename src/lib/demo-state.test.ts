import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEMO_REVIEW_CHECKS,
  presenceCounts,
  type Announcement,
  type PresenceEvent,
} from "./demo-data";
import {
  createDemoState,
  demoAnnouncementReference,
  demoReducer,
  resolveDemoAnnouncement,
} from "./demo-state";

const announcement = (id: string): Announcement => ({
  id,
  title: `Aviso ${id}`,
  body: `Mensagem específica de ${id}`,
  type: "information",
  status: "published",
  createdAt: "Hoje, 09:00",
  total: 18,
  confirmed: 0,
  pending: 18,
});

const event = (source: PresenceEvent["source"], time = "09:00"): PresenceEvent => ({
  id: `test-${source}-${time}`,
  passengerId: "p17",
  state: "no_ponto",
  source,
  time,
});

test("os 18 passageiros têm situação compatível com seu último evento", () => {
  const state = createDemoState();
  assert.deepEqual(presenceCounts(state.passengers), {
    no_ponto: 12,
    a_caminho: 3,
    preciso_ajuda: 1,
    sem_resposta: 2,
  });
  for (const passenger of state.passengers) {
    const history = state.events.filter((item) => item.passengerId === passenger.id);
    if (passenger.presence === "sem_resposta") assert.equal(history.length, 0);
    else {
      assert.equal(history.at(-1)?.state, passenger.presence);
      assert.equal(history.at(-1)?.time, passenger.lastEventTime);
    }
  }
});

test("referências resolvem o aviso e passageiro corretos independentemente da ordem", () => {
  let state = createDemoState();
  for (const id of ["a4", "a5"])
    state = demoReducer(state, { type: "publish", announcement: announcement(id) });
  const target = resolveDemoAnnouncement(state, demoAnnouncementReference("a4", "p17"));
  assert.equal(target?.announcement.title, "Aviso a4");
  assert.equal(target?.announcement.body, "Mensagem específica de a4");
  assert.equal(target?.passenger.id, "p17");
  assert.equal(resolveDemoAnnouncement(state, "demo-aviso")?.announcement.id, "a1");
  assert.equal(resolveDemoAnnouncement(state, "demo-aviso-a999-p17"), undefined);
  assert.equal(resolveDemoAnnouncement(state, "demo-aviso-a4-p999"), undefined);
  assert.equal(resolveDemoAnnouncement(state, "referencia-desconhecida"), undefined);
});

test("a confirmação é única por passageiro e aviso e não altera outros avisos", () => {
  let state = createDemoState();
  state = demoReducer(state, { type: "publish", announcement: announcement("a4") });
  state = demoReducer(state, { type: "publish", announcement: announcement("a5") });
  const action = { type: "confirm" as const, announcementId: "a4", passengerId: "p17" };
  state = demoReducer(state, action);
  assert.equal(demoReducer(state, action), state);
  assert.equal(state.announcements.find((a) => a.id === "a4")?.confirmed, 1);
  assert.equal(state.announcements.find((a) => a.id === "a5")?.confirmed, 0);
  assert.equal(state.announcements.find((a) => a.id === "a1")?.confirmed, 16);
  state = demoReducer(state, { ...action, passengerId: "p18" });
  assert.equal(state.announcements.find((a) => a.id === "a4")?.confirmed, 2);
  state = demoReducer(state, { ...action, announcementId: "a5" });
  assert.equal(state.announcements.find((a) => a.id === "a5")?.confirmed, 1);
  assert.equal(demoReducer(state, { ...action, passengerId: "p999" }), state);
  assert.equal(resolveDemoAnnouncement(state, demoAnnouncementReference("a4"))?.confirmed, true);
});

test("encerramento bloqueia resposta pública, manual e lembrete mesmo com ação atrasada", () => {
  let state = createDemoState();
  state = demoReducer(state, { type: "remind", time: "08:59" });
  state = demoReducer(state, { type: "close" });
  for (const source of ["manual", "public_link"] as const) {
    assert.equal(demoReducer(state, { type: "presence", event: event(source) }), state);
  }
  assert.equal(demoReducer(state, { type: "remind", time: "09:30" }), state);
  assert.equal(demoReducer(state, { type: "close" }), state);
  assert.equal(state.lastReminderAt, "08:59");
  assert.equal(state.passengers.find((p) => p.id === "p17")?.presence, "sem_resposta");
});

test("a sequência de respostas e o estado de ajuda permanecem coerentes na virada de dia", () => {
  let state = createDemoState();
  state = demoReducer(state, {
    type: "presence",
    event: { ...event("public_link", "23:59"), state: "a_caminho" },
  });
  state = demoReducer(state, {
    type: "presence",
    event: { ...event("public_link", "00:00"), state: "preciso_ajuda" },
  });
  assert.equal(state.passengers.find((p) => p.id === "p17")?.needsAttention, true);
  state = demoReducer(state, { type: "presence", event: event("manual", "00:01") });
  assert.deepEqual(
    state.events.filter((e) => e.passengerId === "p17").map((e) => e.time),
    ["23:59", "00:00", "00:01"],
  );
  assert.equal(state.passengers.find((p) => p.id === "p17")?.needsAttention, false);
  assert.equal(state.passengers.find((p) => p.id === "p17")?.lastEventTime, "00:01");
});

test("checklist pode ser marcado e desmarcado e uma nova demo começa vazia", () => {
  let state = createDemoState();
  for (const check of DEMO_REVIEW_CHECKS) state = demoReducer(state, { type: "review", check });
  assert.equal(state.reviewedChecks.length, DEMO_REVIEW_CHECKS.length);
  state = demoReducer(state, { type: "review", check: DEMO_REVIEW_CHECKS[0]! });
  assert.equal(state.reviewedChecks.length, DEMO_REVIEW_CHECKS.length - 1);
  assert.deepEqual(createDemoState().reviewedChecks, []);
});
