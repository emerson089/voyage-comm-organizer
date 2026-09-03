import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DEMO_TODAY } from "@/lib/demo-data";

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

const CHECKS = [
  "Horários das atividades conferem com o fuso local",
  "Pontos de encontro preenchidos e corretos",
  "Passeio de barco confirmado às 9h30",
  "Ingressos do Museu Van Gogh garantidos para o grupo",
  "Transfer para Bruxelas amanhã confirmado",
];

function RoteiroPage() {
  function confirmar() {
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
        {CHECKS.map((c) => (
          <li key={c}>
            <Card className="flex items-start gap-3 p-3.5 shadow-card">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-onsite" />
              <span className="text-sm font-medium text-foreground">{c}</span>
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
                  <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.meetingPoint ?? item.city}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-primary">{item.time}</span>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <Button onClick={confirmar} className="h-11 w-full bg-primary text-primary-foreground">
        Confirmar revisão
      </Button>
    </AppShell>
  );
}
