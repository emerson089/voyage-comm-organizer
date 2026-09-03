import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  DEMO_ANNOUNCEMENTS,
  DEMO_NEXT_MEETING,
  type Announcement,
  type CheckinState,
  type PresenceEvent,
} from "./demo-data";
import {
  createDemoState,
  demoAnnouncementReference,
  demoReducer,
  resolveDemoAnnouncement,
} from "./demo-state";

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

function useDemoValue() {
  const [state, dispatch] = useReducer(demoReducer, undefined, createDemoState);
  const [signedIn, setSignedIn] = useState(false);
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
  const nextAnnouncement = useRef(DEMO_ANNOUNCEMENTS.length + 1);
  const nextEvent = useRef(1);
  const now = () =>
    new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: DEMO_NEXT_MEETING.timezone,
    });

  function registerPresence(
    passengerId: string,
    presence: CheckinState,
    source: PresenceEvent["source"],
    reason?: string,
  ) {
    if (!ready || !state.sessionOpen) return;
    dispatch({
      type: "presence",
      event: {
        id: `demo-event-${nextEvent.current++}`,
        passengerId,
        state: presence,
        source,
        time: now(),
        ...(source === "manual" ? { recordedBy: "Marina Lopes" } : {}),
        ...(reason ? { reason } : {}),
      },
    });
  }

  function publishAnnouncement(
    draft: Pick<Announcement, "title" | "body" | "type" | "linkedActivity">,
  ) {
    const id = `a${nextAnnouncement.current++}`;
    dispatch({
      type: "publish",
      announcement: {
        ...draft,
        id,
        status: "published",
        createdAt: `Hoje, ${now()}`,
        total: state.passengers.length,
        confirmed: 0,
        pending: state.passengers.length,
      },
    });
    return {
      total: state.passengers.length,
      reference: demoAnnouncementReference(id),
      status: "envio_simulado" as const,
    };
  }

  function remindPending() {
    if (!ready || !state.sessionOpen) return [];
    dispatch({ type: "remind", time: now() });
    return state.passengers.filter((passenger) => passenger.presence === "sem_resposta");
  }

  return {
    ...state,
    ready,
    signedIn,
    signIn: useCallback(() => setSignedIn(true), []),
    signOut: useCallback(() => setSignedIn(false), []),
    closeSession: () => dispatch({ type: "close" }),
    passengerById: (id: string) => state.passengers.find((passenger) => passenger.id === id),
    // A ordem de inserção preserva a sequência inclusive na virada de dia.
    eventsFor: (id: string) => state.events.filter((event) => event.passengerId === id),
    registerManual: (id: string, presence: CheckinState, reason?: string) =>
      registerPresence(id, presence, "manual", reason),
    registerPublic: (id: string, presence: CheckinState) =>
      registerPresence(id, presence, "public_link"),
    pendingPassengers: state.passengers.filter(
      (passenger) => passenger.presence === "sem_resposta",
    ),
    remindPending,
    publishAnnouncement,
    resolveAnnouncement: (reference: string) => resolveDemoAnnouncement(state, reference),
    confirmAnnouncement: (announcementId: string, passengerId: string) =>
      dispatch({ type: "confirm", announcementId, passengerId }),
    toggleReviewCheck: (check: string) => dispatch({ type: "review", check }),
  };
}

const DemoStoreContext = createContext<ReturnType<typeof useDemoValue> | null>(null);

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  return <DemoStoreContext.Provider value={useDemoValue()}>{children}</DemoStoreContext.Provider>;
}

export function useDemoStore() {
  const ctx = useContext(DemoStoreContext);
  if (!ctx) throw new Error("useDemoStore deve ser usado dentro de DemoStoreProvider");
  return ctx;
}
