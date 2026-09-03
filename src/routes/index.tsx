import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Compass, Lock } from "lucide-react";
import { useDemoStore } from "@/lib/demo-store";
import { DEMO_TRIP } from "@/lib/demo-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Entrar — WTT Companion" },
      { name: "description", content: "Acesso do guia ao painel operacional WTT Companion." },
      { property: "og:title", content: "Entrar — WTT Companion" },
      {
        property: "og:description",
        content: "Acesso do guia ao painel operacional WTT Companion.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, ready } = useDemoStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("renato@wtt.com.br");
  const [password, setPassword] = useState("••••••••");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    signIn();
    navigate({ to: "/painel" });
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-primary px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-wine text-wine-foreground shadow-card">
            <Compass className="h-7 w-7" />
          </div>
          <h1 className="font-display text-2xl font-bold text-primary-foreground">WTT Companion</h1>
          <p className="mt-1 text-sm text-primary-foreground/70">Painel operacional do guia</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card p-5 shadow-card"
        >
          <p className="mb-4 text-xs font-medium text-muted-foreground">{DEMO_TRIP.name}</p>

          <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-foreground">
            E-mail
          </label>
          <input
            id="login-email"
            name="email"
            autoComplete="username"
            disabled={!ready}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />

          <label
            htmlFor="login-password"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Senha
          </label>
          <input
            id="login-password"
            name="password"
            autoComplete="current-password"
            disabled={!ready}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-5 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />

          <button
            type="submit"
            disabled={!ready}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-wine font-semibold text-wine-foreground transition-colors hover:opacity-90"
          >
            <Lock className="h-4 w-4" />
            {ready ? "Entrar" : "Carregando demonstração…"}
          </button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Protótipo — login estático. Nenhuma credencial é verificada.
          </p>
        </form>
      </div>
    </div>
  );
}
