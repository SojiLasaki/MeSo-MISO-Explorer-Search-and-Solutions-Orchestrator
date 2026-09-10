import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, FileText, KeyRound, MessageCircle, Plus, Wrench } from "lucide-react";

import { DataExchangeHome } from "@/components/miso/DataExchangeHome";
import { PreferencesDialog } from "@/components/miso/PreferencesDialog";
import { UserMenu } from "@/components/miso/UserMenu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import type { CatalogOperation } from "@/lib/miso/catalog";
import { getMisoAccessStatus } from "@/lib/miso.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MISO AI — Ask for the information, we'll find the MISO data" },
      {
        name: "description",
        content:
          "MISO AI is a natural-language interface to MISO load, prices, generation, market reports and APIs. Just ask — no endpoints or terminology required.",
      },
      { property: "og:title", content: "MISO AI — Find MISO data without learning how to find it" },
      {
        property: "og:description",
        content:
          "Ask for MISO load, market prices, generation, reports or API requests in plain language.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [misoConnected, setMisoConnected] = useState(false);
  const [misoMode, setMisoMode] = useState<"live" | "simulated" | null>(null);
  const [misoCheckedAt, setMisoCheckedAt] = useState<string | null>(null);
  const [prefsOpen, setPrefsOpen] = useState(false);
  /**
   * There is one user-facing assistant path. Redirect instead of opening the
   * legacy server-function drawer so requests always reach the local Django
   * agent and its verification/error workflow.
   */
  const openChat = useCallback((operation?: CatalogOperation) => {
    // Preserve the exact catalog item the visitor selected. The agent route
    // uses this ID to hydrate its context from structured metadata instead of
    // treating an API-level Ask AI action as a blank, generic chat.
    void navigate({
      to: "/integration-lab",
      search: operation ? { api: operation.source_id } : {},
    });
  }, [navigate]);

  const fetchAccess = useServerFn(getMisoAccessStatus);
  const refreshAccess = useCallback(() => {
    if (!user) return;
    fetchAccess()
      .then((status) => {
        setMisoConnected(status.connected);
        setMisoMode(status.mode);
        setMisoCheckedAt(status.checked_at);
      })
      .catch(() => undefined);
  }, [fetchAccess, user]);

  useEffect(() => {
    if (!user) {
      setMisoConnected(false);
      setMisoMode(null);
      setMisoCheckedAt(null);
      return;
    }
    refreshAccess();
    const interval = window.setInterval(refreshAccess, 30_000);
    return () => window.clearInterval(interval);
  }, [refreshAccess, user]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="flex h-screen min-h-0 min-w-0 flex-1 flex-col">
        <header className="z-10 flex shrink-0 items-center justify-between gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur-xl md:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <div className="min-w-0">
              <p className="truncate text-[14.5px] font-medium tracking-tight">MISO AI</p>
              <p className="hidden truncate text-[12.5px] text-muted-foreground sm:block">
                Find MISO data without learning how to find it.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && misoConnected && (
              <span className="hidden items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-[12px] text-muted-foreground sm:inline-flex">
                <Check className="size-3 text-success" />
                MISO API Access
              </span>
            )}
            {user && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="New request"
                onClick={() => openChat()}
                className="md:hidden"
              >
                <Plus className="size-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => openChat()}
              className="hidden gap-2 rounded-full sm:inline-flex"
            >
              <MessageCircle className="size-3.5" />
              Ask MISO AI
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden gap-2 rounded-full md:inline-flex"
            >
              <Link to="/reports">
                <FileText className="size-3.5" />
                Reports
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden gap-2 rounded-full lg:inline-flex"
            >
              <Link to="/subscription-keys">
                <KeyRound className="size-3.5" />
                Keys
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden gap-2 rounded-full lg:inline-flex"
            >
              <Link to="/integration-lab">
                <Wrench className="size-3.5" />
                Integration lab
              </Link>
            </Button>
            {loading ? null : user ? (
              <UserMenu
                email={user.email ?? ""}
                misoConnected={misoConnected}
                onSignOut={() => void signOut()}
                onPreferences={() => setPrefsOpen(true)}
              />
            ) : (
              <Button asChild size="sm" className="rounded-full">
                <Link to="/auth">Sign in</Link>
              </Button>
            )}
          </div>
        </header>

        <DataExchangeHome
          onOpenChat={openChat}
          liveStatus={
            misoMode && misoCheckedAt
              ? { mode: misoMode, checkedAt: misoCheckedAt, connected: misoConnected }
              : undefined
          }
        />
      </div>

      <PreferencesDialog open={prefsOpen} onOpenChange={setPrefsOpen} />
    </div>
  );
}
