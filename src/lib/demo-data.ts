// WTT Companion — Dados simulados da Fase 1 (protótipo visual).
// Nenhuma destas informações vem do Supabase. São estáticas, apenas para demonstração.

export type CheckinState = "a_caminho" | "no_ponto" | "preciso_ajuda";
// "sem_resposta" nunca é gravado como evento — é o estado calculado inicial.
export type PresenceState = CheckinState | "sem_resposta";

export type AnnouncementType = "information" | "reminder" | "schedule_change" | "important";

export type AnnouncementStatus = "draft" | "published" | "superseded";

export type GuideLevel = "lead" | "assistant";

export interface ItineraryItem {
  id: string;
  time: string; // horário real já formatado no fuso da atividade
  timezone: string; // IANA, ex.: Europe/Amsterdam
  title: string;
  description: string;
  meetingPoint?: string;
  city: string;
  country: string;
}

export interface Passenger {
  id: string;
  name: string;
  group: string;
  phone: string;
  presence: PresenceState;
  lastEventTime?: string;
  needsAttention?: boolean;
}

export interface PresenceEvent {
  id: string;
  passengerId: string;
  state: CheckinState;
  source: "public_link" | "manual";
  recordedBy?: string;
  reason?: string;
  time: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  type: AnnouncementType;
  status: AnnouncementStatus;
  createdAt: string;
  total: number;
  confirmed: number;
  pending: number;
  linkedActivity?: string;
  supersedes?: string;
}

export const DEMO_TRIP = {
  name: "Eurotrip — França, Bélgica, Holanda e Inglaterra",
  departure: "Amsterdã",
  country: "Países Baixos",
  city: "Amsterdã",
  todayLabel: "Hoje, Amsterdã",
  currentGuide: { name: "Marina Lopes", level: "lead" as GuideLevel },
  assistant: { name: "Rafael Costa", level: "assistant" as GuideLevel },
};

export const DEMO_NEXT_MEETING = {
  time: "09:00",
  place: "Lobby do hotel",
  activity: "Passeio pelos canais",
  activityTime: "09:30",
  timezone: "Europe/Amsterdam",
  passengersTotal: 18,
};

export const DEMO_TODAY: ItineraryItem[] = [
  {
    id: "t1",
    time: "09:00",
    timezone: "Europe/Amsterdam",
    title: "Encontro — Lobby do hotel",
    description: "Concentração para início do passeio de barco pelos canais.",
    meetingPoint: "Lobby do hotel, Amsterdã",
    city: "Amsterdã",
    country: "Países Baixos",
  },
  {
    id: "t2",
    time: "09:30",
    timezone: "Europe/Amsterdam",
    title: "Passeio pelos canais",
    description: "Tour de barco de 1h pelos principais canais da cidade.",
    meetingPoint: "Doca Prinsengracht",
    city: "Amsterdã",
    country: "Países Baixos",
  },
  {
    id: "t3",
    time: "13:00",
    timezone: "Europe/Amsterdam",
    title: "Almoço livre",
    description: "Restaurantes indicados ao redor da Praça Leidseplein.",
    meetingPoint: "Leidseplein",
    city: "Amsterdã",
    country: "Países Baixos",
  },
  {
    id: "t4",
    time: "15:00",
    timezone: "Europe/Amsterdam",
    title: "Museu Van Gogh",
    description: "Visita guiada — ingressos já garantidos pelo grupo.",
    meetingPoint: "Museumplein 6",
    city: "Amsterdã",
    country: "Países Baixos",
  },
  {
    id: "t5",
    time: "18:00",
    timezone: "Europe/Amsterdam",
    title: "Retorno ao hotel",
    description: "Regresso ao hotel para descanso antes do jantar livre.",
    city: "Amsterdã",
    country: "Países Baixos",
  },
];

export const DEMO_TOMORROW: ItineraryItem[] = [
  {
    id: "m1",
    time: "08:30",
    timezone: "Europe/Brussels",
    title: "Saída para Bruxelas",
    description: "Transfer em direção à Bélgica. Levar bagagem de mão.",
    meetingPoint: "Lobby do hotel",
    city: "Bruxelas",
    country: "Bélgica",
  },
  {
    id: "m2",
    time: "12:00",
    timezone: "Europe/Brussels",
    title: "Almoço — Grand-Place",
    description: "Almoço típico belga na região da praça central.",
    meetingPoint: "Grand-Place",
    city: "Bruxelas",
    country: "Bélgica",
  },
];

// 18 passageiros: 12 no_ponto, 3 a_caminho, 1 preciso_ajuda, 2 sem_resposta.
export const DEMO_PASSENGERS: Passenger[] = [
  {
    id: "p1",
    name: "Ana Beatriz Souza",
    group: "Grupo A",
    phone: "+55 11 98888-1001",
    presence: "no_ponto",
    lastEventTime: "08:51",
  },
  {
    id: "p2",
    name: "Bruno Carvalho",
    group: "Grupo A",
    phone: "+55 11 98888-1002",
    presence: "no_ponto",
    lastEventTime: "08:48",
  },
  {
    id: "p3",
    name: "Camila Ferreira",
    group: "Grupo A",
    phone: "+55 11 98888-1003",
    presence: "no_ponto",
    lastEventTime: "08:50",
  },
  {
    id: "p4",
    name: "Diego Martins",
    group: "Grupo B",
    phone: "+55 21 97777-1004",
    presence: "no_ponto",
    lastEventTime: "08:47",
  },
  {
    id: "p5",
    name: "Eduarda Lima",
    group: "Grupo B",
    phone: "+55 21 97777-1005",
    presence: "no_ponto",
    lastEventTime: "08:52",
  },
  {
    id: "p6",
    name: "Felipe Andrade",
    group: "Grupo B",
    phone: "+55 21 97777-1006",
    presence: "no_ponto",
    lastEventTime: "08:46",
  },
  {
    id: "p7",
    name: "Gabriela Rocha",
    group: "Grupo C",
    phone: "+55 31 96666-1007",
    presence: "no_ponto",
    lastEventTime: "08:49",
  },
  {
    id: "p8",
    name: "Henrique Alves",
    group: "Grupo C",
    phone: "+55 31 96666-1008",
    presence: "no_ponto",
    lastEventTime: "08:50",
  },
  {
    id: "p9",
    name: "Isabela Mendes",
    group: "Grupo C",
    phone: "+55 31 96666-1009",
    presence: "no_ponto",
    lastEventTime: "08:53",
  },
  {
    id: "p10",
    name: "João Pedro Nunes",
    group: "Grupo D",
    phone: "+55 41 95555-1010",
    presence: "no_ponto",
    lastEventTime: "08:45",
  },
  {
    id: "p11",
    name: "Larissa Gomes",
    group: "Grupo D",
    phone: "+55 41 95555-1011",
    presence: "no_ponto",
    lastEventTime: "08:52",
  },
  {
    id: "p12",
    name: "Marcelo Pinto",
    group: "Grupo D",
    phone: "+55 41 95555-1012",
    presence: "no_ponto",
    lastEventTime: "08:54",
  },
  {
    id: "p13",
    name: "Natália Ribeiro",
    group: "Grupo A",
    phone: "+55 11 98888-1013",
    presence: "a_caminho",
    lastEventTime: "08:50",
  },
  {
    id: "p14",
    name: "Otávio Barbosa",
    group: "Grupo B",
    phone: "+55 21 97777-1014",
    presence: "a_caminho",
    lastEventTime: "08:42",
  },
  {
    id: "p15",
    name: "Patrícia Cardoso",
    group: "Grupo C",
    phone: "+55 31 96666-1015",
    presence: "a_caminho",
    lastEventTime: "08:38",
  },
  {
    id: "p16",
    name: "Rafael Teixeira",
    group: "Grupo D",
    phone: "+55 41 95555-1016",
    presence: "preciso_ajuda",
    lastEventTime: "08:44",
    needsAttention: true,
  },
  {
    id: "p17",
    name: "Sofia Nogueira",
    group: "Grupo A",
    phone: "+55 11 98888-1017",
    presence: "sem_resposta",
  },
  {
    id: "p18",
    name: "Thiago Moreira",
    group: "Grupo B",
    phone: "+55 21 97777-1018",
    presence: "sem_resposta",
  },
];

export const DEMO_PRESENCE_EVENTS: PresenceEvent[] = DEMO_PASSENGERS.flatMap((passenger) => {
  if (passenger.presence === "sem_resposta") return [];
  return [
    {
      id: `initial-${passenger.id}`,
      passengerId: passenger.id,
      state: passenger.presence,
      source: "public_link" as const,
      time: passenger.lastEventTime!,
      ...(passenger.presence === "preciso_ajuda" ? { reason: "Se perdeu perto da doca" } : {}),
    },
  ];
});

export const DEMO_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "a1",
    title: "Passeio de barco confirmado às 9h30",
    body: "O passeio pelos canais está confirmado para as 9h30. Embarque na doca da Prinsengracht. Levar casaco — pode ventar no barco.",
    type: "information",
    status: "published",
    createdAt: "Hoje, 07:30",
    total: 18,
    confirmed: 16,
    pending: 2,
    linkedActivity: "Passeio pelos canais",
  },
  {
    id: "a2",
    title: "Troca de ponto de encontro do almoço",
    body: "O almoço livre passa a ser na Praça Leidseplein, e não mais no hotel. Atualizem o roteiro.",
    type: "schedule_change",
    status: "published",
    createdAt: "Ontem, 19:12",
    total: 18,
    confirmed: 18,
    pending: 0,
    linkedActivity: "Almoço livre",
  },
  {
    id: "a3",
    title: "Lembrete: documentos e passaporte",
    body: "Tenham sempre o passaporte em mãos. Saímos de Amsterdã amanhã rumo a Bruxelas.",
    type: "reminder",
    status: "published",
    createdAt: "Ontem, 21:00",
    total: 18,
    confirmed: 15,
    pending: 3,
  },
];

export const ANNOUNCEMENT_TYPE_LABEL: Record<AnnouncementType, string> = {
  information: "Informação",
  reminder: "Lembrete",
  schedule_change: "Alteração de programação",
  important: "Importante",
};

export const PRESENCE_LABEL: Record<PresenceState, string> = {
  no_ponto: "No ponto",
  a_caminho: "A caminho",
  preciso_ajuda: "Preciso de ajuda",
  sem_resposta: "Sem resposta",
};

// Tokens demonstrativos — apenas para a página pública simulada decidir o propósito.
export const DEMO_TOKEN_AVISO = "demo-aviso";
export const DEMO_TOKEN_PRESENCA = "demo-presenca";
export const DEMO_PUBLIC_PASSENGER_ID = "p17";

export const DEMO_REVIEW_CHECKS = [
  "Horários das atividades conferem com o fuso local",
  "Pontos de encontro preenchidos e corretos",
  "Passeio de barco confirmado às 9h30",
  "Ingressos do Museu Van Gogh garantidos para o grupo",
  "Transfer para Bruxelas amanhã confirmado",
];

export function presenceCounts(passengers: Passenger[]) {
  const counts = { no_ponto: 0, a_caminho: 0, preciso_ajuda: 0, sem_resposta: 0 };
  for (const p of passengers) counts[p.presence] += 1;
  return counts;
}
