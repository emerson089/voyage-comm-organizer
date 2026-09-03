import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Link2,
  Send,
  Eye,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnnouncementTypeBadge } from "@/components/StatusBadge";
import { useDemoStore } from "@/lib/demo-store";
import {
  ANNOUNCEMENT_TYPE_LABEL,
  DEMO_NEXT_MEETING,
  DEMO_TOKEN_AVISO,
  type AnnouncementType,
} from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/avisos/novo")({
  head: () => ({
    meta: [
      { title: "Novo aviso — WTT Companion" },
      { name: "description", content: "Criar e pré-visualizar um aviso antes de publicar." },
      { property: "og:title", content: "Novo aviso — WTT Companion" },
      { property: "og:description", content: "Criar e pré-visualizar um aviso antes de publicar." },
    ],
  }),
  component: NovoAvisoPage,
});

type Step = "editor" | "preview" | "confirmado";

const ACTIVITIES = [
  "Nenhum (aviso livre)",
  "Encontro — Lobby do hotel",
  "Passeio pelos canais",
  "Almoço livre",
  "Museu Van Gogh",
];

function NovoAvisoPage() {
  const { publishAnnouncement } = useDemoStore();
  const [step, setStep] = useState<Step>("editor");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<AnnouncementType>("information");
  const [activity, setActivity] = useState<string>("Passeio pelos canais");
  const [published, setPublished] = useState<{ total: number } | null>(null);

  const linkedActivity = activity !== ACTIVITIES[0] ? activity : undefined;
  const validity = useMemo(() => {
    if (linkedActivity) return "Até 2h após o início da atividade (fuso Europe/Amsterdam)";
    return "24 horas (validade padrão)";
  }, [linkedActivity]);

  function abrirPrevia() {
    if (!title.trim() || !body.trim()) {
      toast.error("Preencha título e mensagem");
      return;
    }
    setStep("preview");
  }

  function confirmarPublicacao() {
    const payload: {
      title: string;
      body: string;
      type: AnnouncementType;
      linkedActivity?: string;
    } = {
      title: title.trim(),
      body: body.trim(),
      type,
    };
    if (linkedActivity !== undefined) payload.linkedActivity = linkedActivity;
    const res = publishAnnouncement(payload);
    setPublished({ total: res.total });
    setStep("confirmado");
    toast.success("Aviso publicado", {
      description: "Links gerados — envio simulado.",
    });
  }

  function recomecar() {
    setTitle("");
    setBody("");
    setType("information");
    setActivity(ACTIVITIES[2]);
    setPublished(null);
    setStep("editor");
  }

  return (
    <AppShell title="Novo aviso" subtitle="Criar e publicar">
      <div className="mb-4">
        <Link
          to="/avisos"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar aos avisos
        </Link>
      </div>

      {/* Indicador de etapa */}
      <div className="mb-5 flex items-center gap-2 text-xs font-semibold">
        <StepDot active={step === "editor"} done={step !== "editor"} label="1. Conteúdo" />
        <span className="h-px flex-1 bg-border" />
        <StepDot active={step === "preview"} done={step === "confirmado"} label="2. Prévia" />
        <span className="h-px flex-1 bg-border" />
        <StepDot active={step === "confirmado"} done={step === "confirmado"} label="3. Publicação" />
      </div>

      {step === "editor" && (
        <div className="space-y-4">
          <Card className="space-y-4 p-4 shadow-card">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Tipo de aviso</label>
              <Select value={type} onValueChange={(v) => setType(v as AnnouncementType)}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ANNOUNCEMENT_TYPE_LABEL) as AnnouncementType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {ANNOUNCEMENT_TYPE_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Atividade vinculada</label>
              <Select value={activity} onValueChange={setActivity}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITIES.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1.5 text-xs text-muted-foreground">{validity}</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Título</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex.: Passeio de barco confirmado"
                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Mensagem</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                placeholder="Escreva o aviso que os passageiros vão receber…"
                className="w-full rounded-lg border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <Button onClick={abrirPrevia} className="h-11 w-full">
              <Eye className="mr-2 h-4 w-4" /> Pré-visualizar aviso
            </Button>
          </Card>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-4">
          <Card className="overflow-hidden shadow-card">
            <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
              <span className="text-xs font-medium text-primary-foreground/70">Prévia da mensagem</span>
              <AnnouncementTypeBadge type={type} />
            </div>
            <div className="space-y-3 p-4">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Atividade</p>
                <p className="text-sm font-medium">{linkedActivity ?? "Aviso livre (sem atividade)"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Título</p>
                <p className="font-display text-lg font-bold">{title}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Mensagem</p>
                <p className="whitespace-pre-wrap text-sm text-foreground">{body}</p>
              </div>
              <p className="text-xs text-muted-foreground">Validade: {validity}</p>
            </div>
          </Card>

          <div className="rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
            <Info className="mb-1 inline h-3.5 w-3.5" /> 18 passageiros receberão este aviso. Após
            publicar, o conteúdo não poderá ser alterado silenciosamente — correções geram um novo
            aviso vinculado a este.
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Button variant="outline" className="h-11" onClick={() => setStep("editor")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Editar
            </Button>
            <Button className="h-11 bg-wine text-wine-foreground hover:opacity-90" onClick={confirmarPublicacao}>
              <Send className="mr-2 h-4 w-4" /> Confirmar publicação
            </Button>
          </div>
        </div>
      )}

      {step === "confirmado" && published && (
        <div className="space-y-4">
          <Card className="p-6 text-center shadow-card">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-onsite-soft">
              <CheckCircle2 className="h-7 w-7 text-onsite" />
            </div>
            <h2 className="font-display text-xl font-bold">Aviso publicado</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Links gerados — <span className="font-semibold text-foreground">envio simulado</span> para{" "}
              {published.total} passageiros.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Nenhum status de entregue ou lido pelo WhatsApp neste protótipo.
            </p>

            <div className="mt-5 rounded-lg border border-dashed border-border bg-muted/40 p-4 text-left">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Link2 className="h-3.5 w-3.5" /> Link público de demonstração
              </p>
              <Link
                to="/r/$token"
                params={{ token: DEMO_TOKEN_AVISO }}
                className="mt-1.5 inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground"
              >
                Abrir página do passageiro
              </Link>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Em produção, cada passageiro recebe um link individual com token único. Aqui é um
                exemplo demonstrativo.
              </p>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-2.5">
            <Button variant="outline" className="h-11" onClick={recomecar}>
              Novo aviso
            </Button>
            <Link
              to="/avisos"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
            >
              Ver histórico
            </Link>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function StepDot({
  active,
  done,
  label,
}: {
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
        active && "bg-primary text-primary-foreground",
        done && !active && "bg-onsite-soft text-onsite",
        !active && !done && "text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}
