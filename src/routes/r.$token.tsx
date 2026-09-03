import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCheck,
  Clock,
  Compass,
  Flag,
  Hand,
  MapPin,
  Megaphone,
  ShieldCheck,
  ShieldOff,
  ThumbsUp,
  Footprints,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DEMO_NEXT_MEETING,
  DEMO_PUBLIC_PASSENGER_ID,
  DEMO_TOKEN_PRESENCA,
  PRESENCE_LABEL,
  type CheckinState,
} from "@/lib/demo-data";
import { useDemoStore } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/r/$token")({
  head: () => ({
    meta: [
      { title: "Resposta do passageiro — WTT Companion" },
      { name: "description", content: "Página pública de resposta do passageiro." },
      { property: "og:title", content: "Resposta do passageiro — WTT Companion" },
      { property: "og:description", content: "Página pública de resposta do passageiro." },
    ],
  }),
  component: PublicResponsePage,
});

function PublicResponsePage() {
  const { token } = Route.useParams();
  const { resolveAnnouncement } = useDemoStore();
  const isAviso = !!resolveAnnouncement(token);
  const isPresenca = token === DEMO_TOKEN_PRESENCA;

  if (!isAviso && !isPresenca) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
        <Card className="max-w-sm p-6 text-center shadow-card">
          <p className="font-display text-lg font-bold">Link inválido ou indisponível</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Abra a referência pelo histórico de avisos nesta mesma aba. Ao recarregar, a
            demonstração é reiniciada.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-secondary">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 py-6">
        <div className="mb-4 flex items-center justify-center gap-2 text-primary">
          <Compass className="h-5 w-5" />
          <span className="font-display text-sm font-bold">WTT Companion</span>
        </div>

        {isAviso ? <AvisoResponse reference={token} /> : <PresencaResponse />}

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Demonstração — página pública simulada, sem dados reais.
        </p>
      </div>
    </div>
  );
}

function AvisoResponse({ reference }: { reference: string }) {
  const { confirmAnnouncement, resolveAnnouncement, ready } = useDemoStore();
  const response = resolveAnnouncement(reference);
  if (!response) return null;
  const { announcement: aviso, passenger, confirmed: done } = response;

  function confirmar() {
    if (!ready || done) return;
    confirmAnnouncement(aviso.id, passenger.id);
    toast.success("Resposta registrada na demonstração");
  }

  return (
    <Card className="overflow-hidden shadow-card">
      <div className="bg-primary px-4 py-3 text-primary-foreground">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-primary-foreground/80">
          <Megaphone className="h-3.5 w-3.5" /> Aviso do grupo
        </p>
      </div>
      <div className="space-y-3 p-4">
        <p className="text-xs text-muted-foreground">{aviso.createdAt}</p>
        <p className="text-xs text-muted-foreground">
          {passenger.name} · passageiro da demonstração
        </p>
        <h1 className="break-words [overflow-wrap:anywhere] font-display text-lg font-bold leading-tight">
          {aviso.title}
        </h1>
        <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm text-foreground">
          {aviso.body}
        </p>
        {aviso.linkedActivity && (
          <p className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium">
            <MapPin className="h-3.5 w-3.5" /> {aviso.linkedActivity}
          </p>
        )}
      </div>
      <div className="border-t border-border p-4">
        {done ? (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-onsite-soft py-3 text-onsite">
            <ThumbsUp className="h-5 w-5" />
            <span role="status" className="font-semibold">
              Confirmado na demonstração — obrigado!
            </span>
          </div>
        ) : (
          <Button
            disabled={!ready}
            className="h-12 w-full bg-primary text-primary-foreground"
            onClick={confirmar}
          >
            <CheckCheck className="mr-2 h-5 w-5" /> Li e entendi
          </Button>
        )}
      </div>
      <div className="border-t border-border p-4">
        <Link
          to="/avisos"
          className="inline-flex min-h-11 items-center text-sm font-semibold text-primary"
        >
          Voltar ao histórico de avisos
        </Link>
      </div>
    </Card>
  );
}

function PresencaResponse() {
  const { sessionOpen, registerPublic, passengerById, ready } = useDemoStore();
  const demoPassengerId = DEMO_PUBLIC_PASSENGER_ID;
  const passenger = passengerById(demoPassengerId);
  const current = passenger?.presence ?? "sem_resposta";

  function responder(state: CheckinState) {
    if (!ready || !sessionOpen) return;
    registerPublic(demoPassengerId, state);
    const msg =
      state === "no_ponto"
        ? "Você marcou: já estou no ponto."
        : state === "a_caminho"
          ? "Você marcou: estou a caminho."
          : "Na versão integrada, o guia receberá este alerta.";
    toast.success("Resposta registrada na demonstração", { description: msg });
  }

  const options: { state: CheckinState; label: string; icon: typeof Hand }[] = [
    { state: "a_caminho", label: "Estou a caminho", icon: Footprints },
    { state: "no_ponto", label: "Já estou no ponto", icon: CheckCheck },
    { state: "preciso_ajuda", label: "Preciso de ajuda", icon: Hand },
  ];

  return (
    <Card className="overflow-hidden shadow-card">
      <div className="bg-primary px-4 py-3 text-primary-foreground">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-primary-foreground/80">
          <Flag className="h-3.5 w-3.5" /> Controle de presença
        </p>
      </div>

      <div className="space-y-2 p-4">
        <p className="font-display text-lg font-bold leading-tight">{DEMO_NEXT_MEETING.activity}</p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" /> {DEMO_NEXT_MEETING.time}
        </p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" /> {DEMO_NEXT_MEETING.place}
        </p>
        <p className="text-xs text-muted-foreground">Fuso: {DEMO_NEXT_MEETING.timezone}</p>
      </div>

      {!sessionOpen ? (
        <div className="m-4 rounded-lg bg-wine-soft p-4 text-wine">
          <p className="flex items-center gap-2 font-semibold">
            <ShieldOff className="h-5 w-5" /> Controle encerrado
          </p>
          <p className="mt-1 text-sm">
            Este controle de presença já foi encerrado. Novas respostas estão bloqueadas.
          </p>
        </div>
      ) : (
        <div className="space-y-2 p-4">
          <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
            Como você está agora?
          </p>
          {options.map((opt) => {
            const Icon = opt.icon;
            const active = current === opt.state;
            return (
              <button
                key={opt.state}
                disabled={!ready || !sessionOpen}
                aria-pressed={active}
                onClick={() => responder(opt.state)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-semibold transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-accent",
                )}
              >
                <Icon className="h-5 w-5" />
                {opt.label}
                {active && <ShieldCheck className="ml-auto h-4 w-4" />}
              </button>
            );
          })}

          {current !== "sem_resposta" && (
            <p className="pt-1 text-center text-xs text-muted-foreground">
              Situação atual:{" "}
              <span className="font-semibold text-foreground">{PRESENCE_LABEL[current]}</span>
              <br />
              Você pode atualizar de “a caminho” para “no ponto”.
            </p>
          )}
        </div>
      )}

      <div className="border-t border-border p-4">
        <Link
          to="/painel"
          className="inline-flex min-h-11 items-center text-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          (Protótipo) ver painel do guia
        </Link>
      </div>
    </Card>
  );
}
