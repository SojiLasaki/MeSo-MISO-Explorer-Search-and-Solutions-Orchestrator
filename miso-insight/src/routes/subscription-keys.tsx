import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { SubscriptionKeyWorkspace } from "@/components/miso/SubscriptionKeyWorkspace";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/subscription-keys")({
  head: () => ({
    meta: [
      { title: "Subscription Keys — MISO AI" },
      {
        name: "description",
        content:
          "Create and manage MISO Data Exchange subscriptions securely, then register a non-secret backend reference for local agent handoff.",
      },
    ],
  }),
  component: SubscriptionKeysRoute,
});

function SubscriptionKeysRoute() {
  const { user } = useAuth();
  return (
    <>
      <Link
        to="/"
        className="fixed left-5 top-5 z-20 inline-flex items-center gap-1.5 rounded-full border bg-card/90 px-3 py-2 text-[12.5px] font-medium text-muted-foreground shadow-soft backdrop-blur transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        MISO AI
      </Link>
      <SubscriptionKeyWorkspace authed={Boolean(user)} />
    </>
  );
}
