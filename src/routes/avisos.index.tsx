import { createFileRoute, Link } from "@tanstack/react-router";
import { Megaphone, Plus, CheckCheck, Clock3 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { AnnouncementTypeBadge, AnnouncementStatusBadge } from "@/components/StatusBadge";
import { DEMO_PUBLIC_PASSENGER_ID } from "@/lib/demo-data";
import { demoAnnouncementReference } from "@/lib/demo-state";
import { useDemoStore } from "@/lib/demo-store";

export const Route = createFileRoute("/avisos/")({
  head: () => ({
    meta: [
      { title: "Avisos — WTT Companion" },
      { name: "description", content: "Histórico de avisos publicados na saída." },
      { property: "og:title", content: "Avisos — WTT Companion" },
      { property: "og:description", content: "Histórico de avisos publicados na saída." },
    ],
  }),
  component: AvisosIndexPage,
});

function AvisosIndexPage() {
  const { announcements } = useDemoStore();

  return (
    <AppShell title="Avisos" subtitle="Histórico da saída">
      <section className="mb-4">
        <Link
          to="/avisos/novo"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-wine font-semibold text-wine-foreground"
        >
          <Plus className="h-4 w-4" /> Publicar novo aviso
        </Link>
      </section>

      <ul className="space-y-3">
        {announcements.map((a) => {
          const progress = a.total > 0 ? Math.round((a.confirmed / a.total) * 100) : 0;
          return (
            <li key={a.id}>
              <Card className="p-4 shadow-card">
                <div className="flex flex-wrap items-center gap-2">
                  <AnnouncementTypeBadge type={a.type} />
                  <AnnouncementStatusBadge status={a.status} />
                  <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 className="h-3 w-3" /> {a.createdAt}
                  </span>
                </div>
                <p className="mt-2.5 break-words [overflow-wrap:anywhere] font-semibold text-foreground">
                  {a.title}
                </p>
                <details className="mt-1">
                  <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold text-primary">
                    Ver mensagem completa
                  </summary>
                  <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm text-muted-foreground">
                    {a.body}
                  </p>
                </details>

                {a.linkedActivity && (
                  <p className="mt-2 text-xs font-medium text-primary">
                    Atividade: {a.linkedActivity}
                  </p>
                )}

                <Link
                  to="/r/$token"
                  params={{ token: demoAnnouncementReference(a.id, DEMO_PUBLIC_PASSENGER_ID) }}
                  className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-primary"
                >
                  Abrir resposta simulada
                </Link>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 font-medium text-muted-foreground">
                      <CheckCheck className="h-3.5 w-3.5" /> {a.confirmed}/{a.total} confirmaram
                    </span>
                    <span className="font-semibold text-foreground">{progress}%</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {a.pending > 0 ? `${a.pending} pendente(s)` : "Todos confirmaram"}
                  </p>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>

      <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <Megaphone className="h-3.5 w-3.5" /> Demonstração — nenhum envio real foi feito.
      </p>
    </AppShell>
  );
}
