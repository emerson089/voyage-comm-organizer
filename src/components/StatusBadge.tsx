import { cn } from "@/lib/utils";
import {
  ANNOUNCEMENT_TYPE_LABEL,
  PRESENCE_LABEL,
  type AnnouncementStatus,
  type AnnouncementType,
  type PresenceState,
} from "@/lib/demo-data";

const presenceStyles: Record<PresenceState, string> = {
  no_ponto: "bg-onsite-soft text-onsite border-onsite/30",
  a_caminho: "bg-enroute-soft text-enroute border-enroute/30",
  preciso_ajuda: "bg-help-soft text-help border-help/30",
  sem_resposta: "bg-nores-soft text-nores border-nores/30",
};

const presenceDot: Record<PresenceState, string> = {
  no_ponto: "bg-onsite",
  a_caminho: "bg-enroute",
  preciso_ajuda: "bg-help",
  sem_resposta: "bg-nores",
};

export function PresenceBadge({ state, className }: { state: PresenceState; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        presenceStyles[state],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", presenceDot[state])} />
      {PRESENCE_LABEL[state]}
    </span>
  );
}

export function PresenceDot({ state, className }: { state: PresenceState; className?: string }) {
  return <span className={cn("inline-block h-2.5 w-2.5 rounded-full", presenceDot[state], className)} />;
}

const typeStyles: Record<AnnouncementType, string> = {
  information: "bg-primary/10 text-primary border-primary/20",
  reminder: "bg-enroute-soft text-enroute border-enroute/30",
  schedule_change: "bg-wine-soft text-wine border-wine/30",
  important: "bg-help-soft text-help border-help/30",
};

export function AnnouncementTypeBadge({ type }: { type: AnnouncementType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        typeStyles[type],
      )}
    >
      {ANNOUNCEMENT_TYPE_LABEL[type]}
    </span>
  );
}

const statusStyles: Record<AnnouncementStatus, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  published: "bg-onsite-soft text-onsite border-onsite/30",
  superseded: "bg-nores-soft text-nores border-nores/30",
};

const statusLabel: Record<AnnouncementStatus, string> = {
  draft: "Rascunho",
  published: "Publicado",
  superseded: "Substituído",
};

export function AnnouncementStatusBadge({ status }: { status: AnnouncementStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        statusStyles[status],
      )}
    >
      {statusLabel[status]}
    </span>
  );
}
