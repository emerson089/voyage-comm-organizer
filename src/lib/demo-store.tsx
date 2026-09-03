import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEMO_PASSENGERS,
  DEMO_PRESENCE_EVENTS,
  DEMO_ANNOUNCEMENTS,
  type Announcement,
  type CheckinState,
  type Passenger,
  type PresenceEvent,
} from "./demo-data";

interface PublishResult {
  total: number;
  status: "envio_simulado";
}

interface DemoStoreValue {
  // sessão de presença
  sessionOpen: boolean;
  openSession: () => void;
  closeSession: () => void;
  // passageiros e eventos
  passengers: Passenger[];
  events: PresenceEvent[];
  passengerById: (id: string) => Passenger | undefined;
  eventsFor: (passengerId: string) => PresenceEvent[];
  registerManual: (
    passengerId: string,
    state: CheckinState,
    reason?: string,
  ) => void;
  registerPublic: (passengerId: string, state: CheckinState) => void;
  pendingPassengers: Passenger[];
  remindPending: () => Passenger[];
  lastReminderAt: string | null;
  // login estático
  signedIn: boolean;
  signIn: () => void;
  signOut: () => void;
  // avisos
  announcements: Announcement[];
  publishAnnouncement: (draft: {
    title: string;
    body: string;
    type: Announcement["type"];
    linkedActivity?: string;
  }) => PublishResult;
  // confirmação pública de aviso (demo)
  confirmAnnouncement: (announcementId: string) => void;
}

const DemoStoreContext = createContext<DemoStoreValue | null>(null);

const GUIDE_NAME = "Marina Lopes";

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [signedIn, setSignedIn] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(true);
  const [passengers, setPassengers] = useState<Passenger[]>(DEMO_PASSENGERS);
  const [events, setEvents] = useState<PresenceEvent[]>(DEMO_PRESENCE_EVENTS);
  const [lastReminderAt, setLastReminderAt] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>(DEMO_ANNOUNCEMENTS);

  const now = () =>
    new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const applyState = useCallback(
    (
      passengerId: string,
      state: CheckinState,
      source: "public_link" | "manual",
      recordedBy?: string,
      reason?: string,
    ) => {
      const event: PresenceEvent = {
        id: `e${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        passengerId,
        state,
        source,
        time: now(),
      };
      if (recordedBy !== undefined) event.recordedBy = recordedBy;
      if (reason !== undefined) event.reason = reason;
      setEvents((prev) => [...prev, event]);
      setPassengers((prev) =>
        prev.map((p) =>
          p.id === passengerId
            ? { ...p, presence: state, lastEventTime: now(), needsAttention: state === "preciso_ajuda" }
            : p,
        ),
      );
    },
    [],
  );

  const registerManual = useCallback(
    (passengerId: string, state: CheckinState, reason?: string) => {
      applyState(passengerId, state, "manual", GUIDE_NAME, reason);
    },
    [applyState],
  );

  const registerPublic = useCallback(
    (passengerId: string, state: CheckinState) => {
      if (!sessionOpen) return;
      applyState(passengerId, state, "public_link");
    },
    [applyState, sessionOpen],
  );

  const openSession = useCallback(() => setSessionOpen(true), []);
  const closeSession = useCallback(() => setSessionOpen(false), []);

  const passengerById = useCallback(
    (id: string) => passengers.find((p) => p.id === id),
    [passengers],
  );

  const eventsFor = useCallback(
    (passengerId: string) =>
      events
        .filter((e) => e.passengerId === passengerId)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [events],
  );

  const pendingPassengers = useMemo(
    () => passengers.filter((p) => p.presence === "sem_resposta"),
    [passengers],
  );

  const remindPending = useCallback(() => {
    setLastReminderAt(now());
    return passengers.filter((p) => p.presence === "sem_resposta");
  }, [passengers]);

  const signIn = useCallback(() => setSignedIn(true), []);
  const signOut = useCallback(() => setSignedIn(false), []);

  const publishAnnouncement = useCallback<DemoStoreValue["publishAnnouncement"]>(
    (draft) => {
      const id = `a${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const next: Announcement = {
        id,
        title: draft.title,
        body: draft.body,
        type: draft.type,
        status: "published",
        createdAt: `Hoje, ${now()}`,
        total: passengers.length,
        confirmed: 0,
        pending: passengers.length,
      };
      if (draft.linkedActivity !== undefined) next.linkedActivity = draft.linkedActivity;
      setAnnouncements((prev) => [next, ...prev]);
      return { total: passengers.length, status: "envio_simulado" };
    },
    [announcements.length, passengers.length],
  );

  const confirmAnnouncement = useCallback((announcementId: string) => {
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === announcementId
          ? { ...a, confirmed: Math.min(a.total, a.confirmed + 1), pending: Math.max(0, a.pending - 1) }
          : a,
      ),
    );
  }, []);

  const value: DemoStoreValue = {
    sessionOpen,
    openSession,
    closeSession,
    passengers,
    events,
    passengerById,
    eventsFor,
    registerManual,
    registerPublic,
    pendingPassengers,
    remindPending,
    lastReminderAt,
    signedIn,
    signIn,
    signOut,
    announcements,
    publishAnnouncement,
    confirmAnnouncement,
  };

  return <DemoStoreContext.Provider value={value}>{children}</DemoStoreContext.Provider>;
}

export function useDemoStore() {
  const ctx = useContext(DemoStoreContext);
  if (!ctx) throw new Error("useDemoStore deve ser usado dentro de DemoStoreProvider");
  return ctx;
}
