import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  MapPin,
  Megaphone,
  Clock,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PresenceBadge } from "@/components/StatusBadge";
import { useDemoStore } from "@/lib/demo-store";
import {
  DEMO_NEXT_MEETING,
  DEMO_TRIP,
  presenceCounts,
} from "@/lib/demo-data";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [
      { title: "Painel — WTT Companion" },
      { name: "description", content: "Visão geral da saída atual e da próxima atividade." },
      { property: "og:title", content: "Painel — WTT Companion" },
      { property: "og:description", content: "Visão geral da saída atual e da próxima atividade." },
    ],
  }),
  component: PainelPage,
});

function PainelPage() {
  const { passengers, announcements, sessionOpen } = useDemoStore();
  const counts = presenceCounts(passengers);
  const lastAnnouncement = announcements[0];
  const helpPassengers = passengers.filter((p) => p.presence === "preciso_ajuda");

  return (
    <AppShell title="Painel" subtitle={`${DEMO_TRIP.city} · ${DEMO_TRIP.country}`}>
      {/* Saída atual */}
      <section className="mb-4">
        <Card className="overflow-hidden border-0 bg-primary p-5 text-primary-foreground shadow-card">
          <div className="flex items-center gap-2 text-xs font-medium text-primary-foreground/70">
            <MapPin className="h-3.5 w-3.5" />
            Saída atual
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold">{DEMO_TRIP.departure}</h1>
          <p className="mt-0.5 text-sm text-primary-foreground/70">{DEMO_TRIP.name}</p>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-primary-foreground/60" /> Hoje, {DEMO_TRIP.city}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary-foreground/60" /> {DEMO_NEXT_MEETING.passengersTotal} passageiros
            </span>
          </div>
        </Card>
      </section>

      {/* Próxima atividade / encontro */}
      <section className="mb-4">
        <Card className="p-4 shadow-card">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-wine">
            <Clock className="h-3.5 w-3.5" /> Próximo encontro
          </div>
          <div className="mt-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-display text-xl font-bold leading-tight">
                {DEMO_NEXT_MEETING.time} · {DEMO_NEXT_MEETING.place}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {DEMO_NEXT_MEETING.activity} às {DEMO_NEXT_MEETING.activityTime} ·{" "}
                <span className="font-medium text-foreground">{DEMO_NEXT_MEETING.timezone}</span>
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              to="/hoje"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-secondary text-sm font-semibold text-secondary-foreground transition-colors hover:bg-accent"
            >
              <CalendarDays className="h-4 w-4" /> Revisar programação
            </Link>
            <Link
              to="/presenca"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
            >
              <MapPin className="h-4 w-4" /> Controle de presença
            </Link>
          </div>
        </Card>
      </section>

      {/* Resumo de presença */}
      <section className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-base font-bold">Resumo de presença</h2>
          <Link to="/presenca" className="text-xs font-semibold text-primary">
            Ver tudo
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <CountTile label="No ponto" value={counts.no_ponto} tone="onsite" />
          <CountTile label="A caminho" value={counts.a_caminho} tone="enroute" />
          <CountTile label="Precisa de ajuda" value={counts.preciso_ajuda} tone="help" />
          <CountTile label="Sem resposta" value={counts.sem_resposta} tone="nores" />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {sessionOpen ? "Sessão aberta" : "Sessão encerrada"} · {passengers.length} passageiros
        </p>
      </section>

      {/* Ajuda em destaque */}
      {helpPassengers.length > 0 && (
        <section className="mb-4">
          <Card className="border-help/30 bg-help-soft p-4 shadow-card">
            <div className="flex items-center gap-2 text-sm font-bold text-help">
              <AlertTriangle className="h-4 w-4" /> Precisa de ajuda agora
            </div>
            <ul className="mt-3 space-y-2">
              {helpPassengers.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{p.name}</span>
                  <PresenceBadge state="preciso_ajuda" />
                </li>
              ))}
            </ul>
            <Link
              to="/presenca"
              className="mt-3 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-help px-3 text-sm font-semibold text-help-foreground"
            >
              Atender <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </section>
      )}

      {/* Último aviso */}
      {lastAnnouncement && (
        <section className="mb-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-base font-bold">Último aviso</h2>
            <Link to="/avisos" className="text-xs font-semibold text-primary">
              Histórico
            </Link>
          </div>
          <Card className="p-4 shadow-card">
            <div className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground">
              <Megaphone className="h-3.5 w-3.5" /> {lastAnnouncement.createdAt}
            </div>
            <p className="font-semibold text-foreground">{lastAnnouncement.title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{lastAnnouncement.body}</p>
            <Link
              to="/avisos/novo"
              className="mt-3 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-wine px-3 text-sm font-semibold text-wine-foreground"
            >
              Publicar novo aviso
            </Link>
          </Card>
        </section>
      )}
    </AppShell>
  );
}

function CountTile({
  label,
  value,
  tone,
}: {
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
    <Card className={`p-3 shadow-card ${styles[tone]}`}>
      <p className="font-display text-2xl font-bold leading-none">{value}</p>
      <p className="mt-1 text-xs font-medium">{label}</p>
    </Card>
  );
}
