import { createFileRoute } from "@tanstack/react-router";
import { useDemoStore } from "@/lib/demo-store";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DEMO_TODAY, DEMO_REVIEW_CHECKS } from "@/lib/demo-data";

export const Route = createFileRoute("/roteiro")({
  head: () => ({
    meta: [
      { title: "Revisar programação — WTT Companion" },
      { name: "description", content: "Checklist de revisão do roteiro da saída." },
      { property: "og:title", content: "Revisar programação — WTT Companion" },
      { property: "og:description", content: "Checklist de revisão do roteiro da saída." },
    ],
  }),
  component: RoteiroPage,
});

function RoteiroPage() {
  const { reviewedChecks, toggleReviewCheck, ready } = useDemoStore();
  const complete = reviewedChecks.length === DEMO_REVIEW_CHECKS.length;
  function confirmar() {
    if (!ready || !complete) return;
    toast.success("Programação revisada", {
      description: "Tudo conferido para a saída em Amsterdã.",
    });
  }

  return (
    <AppShell title="Revisar programação" subtitle="Amsterdã · Hoje">
      <section className="mb-4">
        <Card className="p-4 shadow-card">
          <h2 className="font-display text-base font-bold">Checklist da saída</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Confirme os pontos críticos antes de publicar avisos.
          </p>
        </Card>
      </section>

      <ul className="mb-5 space-y-2.5">
        {DEMO_REVIEW_CHECKS.map((c, index) => (
          <li key={c}>
            <Card className="shadow-card">
              <label
                htmlFor={`review-${index}`}
                className="flex min-h-11 cursor-pointer items-start gap-3 p-3.5"
              >
                <input
                  id={`review-${index}`}
                  type="checkbox"
                  disabled={!ready}
                  checked={reviewedChecks.includes(c)}
                  onChange={() => toggleReviewCheck(c)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
                />
                <span className="text-sm font-medium text-foreground">{c}</span>
              </label>
            </Card>
          </li>
        ))}
      </ul>

      <section className="mb-6">
        <h3 className="mb-2 font-display text-sm font-bold text-muted-foreground uppercase">
          Atividades de hoje
        </h3>
        <ol className="space-y-2">
          {DEMO_TODAY.map((item) => (
            <li key={item.id}>
              <Card className="flex items-center justify-between gap-2 p-3 shadow-card">
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.meetingPoint ?? item.city}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-primary">{item.time}</span>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <p role="status" className="mb-3 text-sm text-muted-foreground">
        {reviewedChecks.length} de {DEMO_REVIEW_CHECKS.length} itens conferidos. Marque todos para
        confirmar.
      </p>
      <Button
        disabled={!ready || !complete}
        onClick={confirmar}
        className="h-11 w-full bg-primary text-primary-foreground"
      >
        Confirmar revisão
      </Button>
    </AppShell>
  );
}
