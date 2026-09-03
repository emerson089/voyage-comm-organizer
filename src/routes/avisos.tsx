import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/avisos")({
  component: AvisosLayout,
});

function AvisosLayout() {
  return <Outlet />;
}
