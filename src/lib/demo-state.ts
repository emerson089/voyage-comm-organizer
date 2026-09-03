import {
  DEMO_ANNOUNCEMENTS,
  DEMO_PASSENGERS,
  DEMO_PRESENCE_EVENTS,
  DEMO_PUBLIC_PASSENGER_ID,
  DEMO_REVIEW_CHECKS,
  DEMO_TOKEN_AVISO,
  type Announcement,
  type Passenger,
  type PresenceEvent,
} from "./demo-data";

export interface DemoState {
  sessionOpen: boolean;
  passengers: Passenger[];
  events: PresenceEvent[];
  lastReminderAt: string | null;
  announcements: Announcement[];
  confirmations: Record<string, string[]>;
  reviewedChecks: string[];
}

export type DemoAction =
  | { type: "presence"; event: PresenceEvent }
  | { type: "close" }
  | { type: "remind"; time: string }
  | { type: "publish"; announcement: Announcement }
  | { type: "confirm"; announcementId: string; passengerId: string }
  | { type: "review"; check: string };

export function createDemoState(): DemoState {
  return {
    sessionOpen: true,
    passengers: DEMO_PASSENGERS.map((passenger) => ({ ...passenger })),
    events: DEMO_PRESENCE_EVENTS.map((event) => ({ ...event })),
    lastReminderAt: null,
    announcements: DEMO_ANNOUNCEMENTS.map((announcement) => ({ ...announcement })),
    confirmations: Object.fromEntries(
      DEMO_ANNOUNCEMENTS.map((announcement) => [
        announcement.id,
        DEMO_PASSENGERS.slice(0, announcement.confirmed).map((passenger) => passenger.id),
      ]),
    ),
    reviewedChecks: [],
  };
}

// Referência previsível para a demo em memória; não é um token de autenticação.
export function demoAnnouncementReference(
  announcementId: string,
  passengerId = DEMO_PUBLIC_PASSENGER_ID,
) {
  return `${DEMO_TOKEN_AVISO}-${announcementId}-${passengerId}`;
}

export function resolveDemoAnnouncement(state: DemoState, reference: string) {
  const match = /^demo-aviso-(a\d+)-(p\d+)$/.exec(reference);
  // O exemplo antigo aponta explicitamente para a1, sem depender da ordem da lista.
  const announcementId = reference === DEMO_TOKEN_AVISO ? "a1" : match?.[1];
  const passengerId = reference === DEMO_TOKEN_AVISO ? DEMO_PUBLIC_PASSENGER_ID : match?.[2];
  const announcement = state.announcements.find((item) => item.id === announcementId);
  const passenger = state.passengers.find((item) => item.id === passengerId);
  if (!announcement || !passenger) return undefined;
  return {
    announcement,
    passenger,
    confirmed: state.confirmations[announcement.id]?.includes(passenger.id) ?? false,
  };
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "presence": {
      const { event } = action;
      if (!state.sessionOpen || !state.passengers.some((p) => p.id === event.passengerId))
        return state;
      return {
        ...state,
        events: [...state.events, event],
        passengers: state.passengers.map((passenger) =>
          passenger.id === event.passengerId
            ? {
                ...passenger,
                presence: event.state,
                lastEventTime: event.time,
                needsAttention: event.state === "preciso_ajuda",
              }
            : passenger,
        ),
      };
    }
    case "close":
      return state.sessionOpen ? { ...state, sessionOpen: false } : state;
    case "remind":
      return state.sessionOpen ? { ...state, lastReminderAt: action.time } : state;
    case "publish":
      if (state.announcements.some((a) => a.id === action.announcement.id)) return state;
      return {
        ...state,
        announcements: [action.announcement, ...state.announcements],
        confirmations: { ...state.confirmations, [action.announcement.id]: [] },
      };
    case "confirm": {
      const announcement = state.announcements.find((a) => a.id === action.announcementId);
      const previous = state.confirmations[action.announcementId] ?? [];
      if (
        !announcement ||
        !state.passengers.some((p) => p.id === action.passengerId) ||
        previous.includes(action.passengerId)
      )
        return state;
      const confirmed = [...previous, action.passengerId];
      return {
        ...state,
        confirmations: { ...state.confirmations, [announcement.id]: confirmed },
        announcements: state.announcements.map((a) =>
          a.id === announcement.id
            ? { ...a, confirmed: confirmed.length, pending: a.total - confirmed.length }
            : a,
        ),
      };
    }
    case "review":
      if (!DEMO_REVIEW_CHECKS.includes(action.check)) return state;
      return {
        ...state,
        reviewedChecks: state.reviewedChecks.includes(action.check)
          ? state.reviewedChecks.filter((check) => check !== action.check)
          : [...state.reviewedChecks, action.check],
      };
  }
}
