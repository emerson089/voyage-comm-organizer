import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
  DEMO_ANNOUNCEMENTS,
  DEMO_NEXT_MEETING,
  DEMO_TOKEN_AVISO,
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
  const isAviso = token === DEMO_TOKEN_AVISO;
  const isPresenca = token === DEMO_TOKEN_PRESENCA;

  if (!isAviso && !isPresenca) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
        <Card className="max-w-sm p-6 text-center shadow-card">
          <p className="font-display text-lg font-bold">Link inválido ou expirado</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Este link não é mais válido. Solicite um novo ao guia.
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

        {isAviso ? <AvisoResponse /> : <PresencaResponse />}

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Demonstração — página pública simulada, sem dados reais.
        </p>
      </div>
    </div>
  );
}

function AvisoResponse() {
  const { confirmAnnouncement } = useDemoStore();
  const aviso = DEMO_ANNOUNCEMENTS[0]!;
  const [done, setDone] = useState(false);

  function confirmar() {
    confirmAnnouncement(aviso.id);
    setDone(true);
    toast.success("Confirmação registrada", { description: "Obrigado! O guia foi avisado." });
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
        <h1 className="font-display text-lg font-bold leading-tight">{aviso.title}</h1>
        <p className="whitespace-pre-wrap text-sm text-foreground">{aviso.body}</p>
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
            <span className="font-semibold">Confirmado — obrigado!</span>
          </div>
        ) : (
          <Button className="h-12 w-full bg-primary text-primary-foreground" onClick={confirmar}>
            <CheckCheck className="mr-2 h-5 w-5" /> Li e entendi
          </Button>
        )}
      </div>
    </Card>
  );
}

function PresencaResponse() {
  const { sessionOpen, registerPublic } = useDemoStore();
  const demoPassengerId = "p17"; // passageiro "sem resposta" para demonstrar a transição
  const { passengerById } = useDemoStore();
  const passenger = passengerById(demoPassengerId);
  const [current, setCurrent] = useState<CheckinState | "sem_resposta">(
    passenger?.presence ?? "sem_resposta",
  );

  function responder(state: CheckinState) {
    if (!sessionOpen) return;
    registerPublic(demoPassengerId, state);
    setCurrent(state);
    const msg =
      state === "no_ponto"
        ? "Você marcou: já estou no ponto."
        : state === "a_caminho"
          ? "Você marcou: estou a caminho."
          : "Você pediu ajuda. O guia foi avisado.";
    toast.success("Resposta enviada", { description: msg });
  }

  const options: { state: CheckinState; label: string; icon: typeof Hand; tone: string }[] = [
    { state: "a_caminho", label: "Estou a caminho", icon: Footprints, tone: "enroute" },
    { state: "no_ponto", label: "Já estou no ponto", icon: CheckCheck, tone: "onsite" },
    { state: "preciso_ajuda", label: "Preciso de ajuda", icon: Hand, tone: "help" },
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
        <p className="text-xs text-muted-foreground">
          Fuso: {DEMO_NEXT_MEETING.timezone}
        </p>
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
              Situação atual: <span className="font-semibold text-foreground">{PRESENCE_LABEL[current]}</span>
              <br />Você pode atualizar de “a caminho” para “no ponto”.
            </p>
          )}
        </div>
      )}

      <div className="border-t border-border p-4">
        <Link
          to="/painel"
          className="text-center text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          (Protótipo) ver painel do guia
        </Link>
      </div>
    </Card>
  );
}
