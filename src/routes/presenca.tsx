import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock,
  Hand,
  MapPin,
  Plus,
  ShieldOff,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { PresenceBadge } from "@/components/StatusBadge";
import { useDemoStore } from "@/lib/demo-store";
import {
  DEMO_NEXT_MEETING,
  DEMO_TOKEN_PRESENCA,
  PRESENCE_LABEL,
  type CheckinState,
  type Passenger,
} from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/presenca")({
  head: () => ({
    meta: [
      { title: "Controle de presença — WTT Companion" },
      {
        name: "description",
        content: "Acompanhe quem está no ponto, a caminho ou precisa de ajuda.",
      },
      { property: "og:title", content: "Controle de presença — WTT Companion" },
      {
        property: "og:description",
        content: "Acompanhe quem está no ponto, a caminho ou precisa de ajuda.",
      },
    ],
  }),
  component: PresencaPage,
});

const FILTERS = ["todos", "no_ponto", "a_caminho", "preciso_ajuda", "sem_resposta"] as const;
type Filter = (typeof FILTERS)[number];

const filterLabel: Record<Filter, string> = {
  todos: "Todos",
  no_ponto: "No ponto",
  a_caminho: "A caminho",
  preciso_ajuda: "Ajuda",
  sem_resposta: "Sem resposta",
};

function PresencaPage() {
  const { passengers, sessionOpen, closeSession, ready, remindPending, lastReminderAt } =
    useDemoStore();
  const canManage = ready && sessionOpen;
  const [filter, setFilter] = useState<Filter>("todos");
  const [selected, setSelected] = useState<Passenger | null>(null);
  const [manualState, setManualState] = useState<CheckinState | null>(null);
  const [reason, setReason] = useState("");
  const [showClose, setShowClose] = useState(false);
  const [reminderList, setReminderList] = useState<Passenger[] | null>(null);

  const counts = useMemo(() => {
    const c = { no_ponto: 0, a_caminho: 0, preciso_ajuda: 0, sem_resposta: 0 };
    for (const p of passengers) c[p.presence] += 1;
    return c;
  }, [passengers]);

  const helpPassengers = passengers.filter((p) => p.presence === "preciso_ajuda");
  const filtered = passengers.filter((p) => filter === "todos" || p.presence === filter);

  function abrirManual(p: Passenger) {
    setSelected(p);
    setManualState(null);
    setReason("");
  }

  function salvarManual() {
    if (!canManage || !selected || !manualState) return;
    registerManual(selected.id, manualState, reason.trim() || undefined);
    toast.success("Situação registrada", {
      description: `${selected.name}: ${PRESENCE_LABEL[manualState]}`,
    });
    setSelected(null);
  }

  const { registerManual, eventsFor } = useDemoStore();

  function lembrarPendentes() {
    if (!canManage) return;
    const list = remindPending();
    setReminderList(list);
    toast.info("Lembrete preparado", {
      description: `${list.length} passageiro(s) sem resposta.`,
    });
  }

  function confirmarEncerramento() {
    if (!canManage) return;
    closeSession();
    setShowClose(false);
    toast.success("Encontro encerrado", {
      description: "Respostas, registros manuais e lembretes ficam bloqueados.",
    });
  }

  return (
    <AppShell title="Controle de presença" subtitle="Passeio pelos canais">
      {/* Cabeçalho do encontro */}
      <Card className="mb-4 p-4 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 break-words [overflow-wrap:anywhere]">
            <p className="text-xs font-semibold uppercase tracking-wide text-wine">Encontro</p>
            <p className="mt-0.5 font-display text-lg font-bold leading-tight">
              {DEMO_NEXT_MEETING.time} · {DEMO_NEXT_MEETING.place}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {DEMO_NEXT_MEETING.activity} · {DEMO_NEXT_MEETING.timezone}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
              sessionOpen ? "bg-onsite-soft text-onsite" : "bg-nores-soft text-nores",
            )}
          >
            {sessionOpen ? "Sessão aberta" : "Encerrada"}
          </span>
        </div>
      </Card>

      {/* Ajuda em destaque */}
      {helpPassengers.length > 0 && (
        <Card className="mb-4 border-help/30 bg-help-soft p-4 shadow-card">
          <div className="flex items-center gap-2 text-sm font-bold text-help">
            <AlertTriangle className="h-4 w-4" /> Precisa de ajuda agora
          </div>
          <ul className="mt-2.5 space-y-1.5">
            {helpPassengers.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => abrirManual(p)}
                  className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg bg-card px-3 py-2 text-left"
                >
                  <span className="text-sm font-medium text-foreground">{p.name}</span>
                  <PresenceBadge state="preciso_ajuda" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Contadores */}
      <div className="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <StatTile
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="No ponto"
          value={counts.no_ponto}
          tone="onsite"
        />
        <StatTile
          icon={<Clock className="h-4 w-4" />}
          label="A caminho"
          value={counts.a_caminho}
          tone="enroute"
        />
        <StatTile
          icon={<Hand className="h-4 w-4" />}
          label="Precisa de ajuda"
          value={counts.preciso_ajuda}
          tone="help"
        />
        <StatTile
          icon={<MapPin className="h-4 w-4" />}
          label="Sem resposta"
          value={counts.sem_resposta}
          tone="nores"
        />
      </div>

      {/* Filtros */}
      <div className="mb-3 flex flex-wrap gap-2 pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={cn(
              "min-h-11 shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition-colors",
              filter === f
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {filterLabel[f]}
          </button>
        ))}
      </div>

      {/* Ações */}
      <div className="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <Button variant="outline" className="h-11" onClick={lembrarPendentes} disabled={!canManage}>
          <BellRing className="mr-2 h-4 w-4" /> Lembrar pendentes
        </Button>
        <Button
          disabled={!canManage}
          className="h-11 bg-wine text-wine-foreground hover:opacity-90"
          onClick={() => setShowClose(true)}
        >
          <ShieldOff className="mr-2 h-4 w-4" />{" "}
          {sessionOpen ? "Encerrar encontro" : "Encontro encerrado"}
        </Button>
      </div>

      <Link
        to="/r/$token"
        params={{ token: DEMO_TOKEN_PRESENCA }}
        className="mb-4 inline-flex min-h-11 items-center text-sm font-semibold text-primary"
      >
        Abrir página pública de presença
      </Link>

      {reminderList && (
        <Card className="mb-4 border-dashed bg-muted/50 p-3.5 shadow-card">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground">
              Lembrete preparado · {reminderList.length} passageiro(s)
            </p>
            <button
              aria-label="Fechar lembrete"
              onClick={() => setReminderList(null)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {reminderList.length === 0 ? (
            <p className="text-sm text-foreground">Ninguém pendente. 🎉</p>
          ) : (
            <ul className="space-y-1.5">
              {reminderList.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{p.name}</span>
                  <span className="text-xs text-muted-foreground">envio simulado</span>
                </li>
              ))}
            </ul>
          )}
          {lastReminderAt && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Último lembrete às {lastReminderAt}
            </p>
          )}
        </Card>
      )}

      {!sessionOpen && (
        <Card className="mb-4 border-wine/30 bg-wine-soft p-3.5 text-wine shadow-card">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <ShieldOff className="h-4 w-4" /> Controle encerrado
          </p>
          <p className="mt-0.5 text-xs text-wine/80">
            Novas respostas, registros manuais e lembretes estão bloqueados. O histórico permanece
            disponível para consulta.
          </p>
        </Card>
      )}

      {/* Lista de passageiros */}
      {filtered.length === 0 && (
        <p
          role="status"
          className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground"
        >
          Nenhum passageiro neste filtro.
        </p>
      )}
      <ul className="space-y-2">
        {filtered.map((p) => (
          <li key={p.id}>
            <button
              onClick={() => abrirManual(p)}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 text-left shadow-card transition-colors hover:bg-accent"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                  {p.name.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold leading-tight text-foreground">
                    {p.name}
                  </p>
                  <p className="break-words text-xs leading-snug text-muted-foreground">
                    {p.group} {p.lastEventTime ? `· última ${p.lastEventTime}` : ""}
                  </p>
                </div>
              </div>
              <PresenceBadge state={p.presence} />
            </button>
          </li>
        ))}
      </ul>

      {/* Dialog de detalhes + registro manual */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogDescription>
              {selected?.group} · {selected?.phone}
            </DialogDescription>
          </DialogHeader>

          <div
            role="region"
            aria-label="Histórico e registro manual"
            tabIndex={0}
            className="min-h-0 overflow-y-auto overscroll-contain pr-1 focus-visible:outline-2 focus-visible:outline-ring"
          >
            {/* Histórico */}
            <div className="mb-3">
              <p className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">
                Histórico
              </p>
              {selected ? <HistoryList events={eventsFor(selected.id)} /> : null}
            </div>

            {!sessionOpen && (
              <p
                role="status"
                className="mb-3 rounded-lg bg-wine-soft p-3 text-sm font-medium text-wine"
              >
                Encontro encerrado. Registro manual bloqueado.
              </p>
            )}
            {/* Registro manual */}
            <fieldset disabled={!canManage} className="min-w-0 disabled:opacity-60">
              <legend className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                Registrar situação manualmente
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {(["a_caminho", "no_ponto", "preciso_ajuda"] as CheckinState[]).map((s) => (
                  <button
                    key={s}
                    aria-pressed={manualState === s}
                    onClick={() => setManualState(s)}
                    className={cn(
                      "min-h-11 rounded-lg border px-2 py-2.5 text-xs font-semibold transition-colors",
                      manualState === s
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground",
                    )}
                  >
                    {PRESENCE_LABEL[s]}
                  </button>
                ))}
              </div>
              <label htmlFor="manual-reason" className="mt-3 block text-sm font-medium">
                Motivo (opcional)
              </label>
              <input
                id="manual-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Motivo (opcional)"
                className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </fieldset>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Cancelar
            </Button>
            <Button
              className="bg-primary text-primary-foreground"
              disabled={!canManage || !manualState}
              onClick={salvarManual}
            >
              <Plus className="mr-1.5 h-4 w-4" /> Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de encerramento */}
      <Dialog open={showClose} onOpenChange={setShowClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Encerrar encontro?</DialogTitle>
            <DialogDescription>
              Após encerrar, respostas públicas, registros manuais e lembretes serão bloqueados. O
              histórico será preservado nesta demonstração.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClose(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-wine text-wine-foreground hover:opacity-90"
              disabled={!canManage}
              onClick={confirmarEncerramento}
            >
              Encerrar agora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function StatTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "onsite" | "enroute" | "help" | "nores";
}) {
  const styles: Record<typeof tone, string> = {
    onsite: "bg-onsite-soft text-onsite",
    enroute: "bg-enroute-soft text-enroute",
    help: "bg-help-soft text-help",
    nores: "bg-nores-soft text-nores",
  };
  return (
    <Card className={`flex items-center gap-3 p-3 shadow-card ${styles[tone]}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-card/60">{icon}</span>
      <div>
        <p className="font-display text-xl font-bold leading-none">{value}</p>
        <p className="mt-0.5 text-xs font-medium">{label}</p>
      </div>
    </Card>
  );
}

function HistoryList({
  events,
}: {
  events: ReturnType<ReturnType<typeof useDemoStore>["eventsFor"]>;
}) {
  if (events.length === 0) {
    return (
      <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
        Nenhuma resposta registrada nesta demonstração.
      </p>
    );
  }
  return (
    <ul className="space-y-1.5">
      {events.map((e) => (
        <li
          key={e.id}
          className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2"
        >
          <div className="min-w-0 break-words [overflow-wrap:anywhere]">
            <p className="text-sm font-semibold text-foreground">{PRESENCE_LABEL[e.state]}</p>
            <p className="text-xs text-muted-foreground">
              {e.source === "manual" ? `Manual · ${e.recordedBy}` : "Pelo link da demonstração"}{" "}
              {e.reason ? `· ${e.reason}` : ""}
            </p>
          </div>
          <span className="shrink-0 text-xs font-medium text-foreground">{e.time}</span>
        </li>
      ))}
    </ul>
  );
}
