import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Compass, CalendarDays, Megaphone, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEMO_TRIP } from "@/lib/demo-data";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Compass;
}

const NAV: NavItem[] = [
  { to: "/painel", label: "Painel", icon: Compass },
  { to: "/hoje", label: "Hoje", icon: CalendarDays },
  { to: "/avisos", label: "Avisos", icon: Megaphone },
  { to: "/presenca", label: "Presença", icon: MapPin },
];

function isActive(pathname: string, to: string) {
  if (to === "/hoje" && pathname === "/roteiro") return true;
  if (to === "/painel") return pathname === "/painel";
  return pathname === to || pathname.startsWith(to + "/");
}

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-screen-xl flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-primary text-primary-foreground shadow-card">
        <div className="mx-auto flex w-full max-w-screen-xl items-center gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-wine font-display text-sm font-bold text-wine-foreground">
            W
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight">
              {title ?? "WTT Companion"}
            </p>
            <p className="break-words text-xs text-primary-foreground/70">
              {subtitle ?? DEMO_TRIP.name}
            </p>
          </div>
          <nav aria-label="Navegação principal" className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary-foreground/15 text-primary-foreground"
                      : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-screen-xl flex-1 px-4 pb-28 pt-5 sm:px-6 md:pb-10">
        {children}
      </main>

      {/* Navegação inferior — mobile */}
      <nav
        aria-label="Navegação principal"
        className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur shadow-nav md:hidden"
      >
        <div className="mx-auto flex max-w-screen-xl items-stretch justify-around">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "text-primary")} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
