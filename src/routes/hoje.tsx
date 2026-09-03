import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, MapPin, CalendarDays } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import {
  DEMO_TODAY,
  DEMO_TOMORROW,
  DEMO_NEXT_MEETING,
} from "@/lib/demo-data";

export const Route = createFileRoute("/hoje")({
  head: () => ({
    meta: [
      { title: "Programação de hoje — WTT Companion" },
      { name: "description", content: "Roteiro do dia atual da saída." },
      { property: "og:title", content: "Programação de hoje — WTT Companion" },
      { property: "og:description", content: "Roteiro do dia atual da saída." },
    ],
  }),
  component: HojePage,
});

function HojePage() {
  return (
    <AppShell title="Programação de hoje" subtitle="Amsterdã · Hoje">
      <section className="mb-5">
        <Link
          to="/roteiro"
          className="mb-4 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
        >
          <CheckCircle2 className="h-4 w-4" /> Revisar programação completa
        </Link>

        <h2 className="mb-2 font-display text-base font-bold">Hoje</h2>
        <ol className="space-y-3">
          {DEMO_TODAY.map((item, idx) => (
            <li key={item.id} className="relative pl-7">
              <span className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                {idx + 1}
              </span>
              <Card className="p-3.5 shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold leading-tight text-foreground">{item.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                    <Clock className="h-3 w-3" /> {item.time}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {item.meetingPoint ?? item.city}
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium text-foreground">
                    {item.timezone}
                  </span>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <div className="mb-2 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-display text-base font-bold">Amanhã — prévia</h2>
        </div>
        <ol className="space-y-3">
          {DEMO_TOMORROW.map((item) => (
            <li key={item.id}>
              <Card className="p-3.5 opacity-80 shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold leading-tight text-foreground">{item.title}</p>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                    <Clock className="h-3 w-3" /> {item.time}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                <p className="mt-2 text-xs font-medium text-foreground">
                  {item.city}, {item.country} · {item.timezone}
                </p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        Próximo encontro: {DEMO_NEXT_MEETING.time} no {DEMO_NEXT_MEETING.place}
      </p>
    </AppShell>
  );
}
