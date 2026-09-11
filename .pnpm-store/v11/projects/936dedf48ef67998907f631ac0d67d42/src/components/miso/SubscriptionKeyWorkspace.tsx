import { useEffect, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  KeyRound,
  LockKeyhole,
  Server,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MisoKeyReference } from "@/lib/miso/agent-package";
import { createMisoKeyReference, listMisoKeyReferences } from "@/lib/miso.functions";

const MISO_PORTAL_URL = "https://data-exchange.misoenergy.org/";

export function SubscriptionKeyWorkspace({ authed }: { authed: boolean }) {
  const [references, setReferences] = useState<MisoKeyReference[]>([]);
  const [portalStarted, setPortalStarted] = useState(false);
  const [portalComplete, setPortalComplete] = useState(false);
  const [label, setLabel] = useState("");
  const [environmentVariable, setEnvironmentVariable] = useState("MISO_SUBSCRIPTION_KEY");
  const [saving, setSaving] = useState(false);
  const listReferences = useServerFn(listMisoKeyReferences);
  const createReference = useServerFn(createMisoKeyReference);

  useEffect(() => {
    if (!authed) return;
    listReferences()
      .then(setReferences)
      .catch(() => undefined);
  }, [authed, listReferences]);

  const saveReference = async () => {
    if (!label.trim()) {
      toast.error("Name this connection so an agent can identify it.");
      return;
    }
    setSaving(true);
    try {
      const reference = await createReference({
        data: { label: label.trim(), environment_variable: environmentVariable.trim() },
      });
      setReferences((current) => [reference, ...current]);
      setLabel("");
      toast.success("Key reference saved. No subscription-key value was stored.");
    } catch {
      toast.error("Sign in before saving a key reference.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_86%_0%,var(--color-accent-soft),transparent_34rem)]">
      <div className="mx-auto w-full max-w-5xl px-5 pb-20 pt-20 sm:px-8 lg:px-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1.5 text-[12px] font-medium text-muted-foreground shadow-soft">
            <KeyRound className="size-3.5 text-accent" />
            MISO-managed credentials
          </div>
          <h1 className="mt-5 text-[clamp(2.3rem,5vw,4.4rem)] font-medium leading-[0.98] tracking-[-0.05em]">
            Create the key with MISO. <span className="text-accent">Use it safely here.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
            Subscription keys are created and managed in your MISO Data Exchange account. MISO AI
            then remembers only the local environment-variable name your backend should use—never
            the key value itself.
          </p>
        </div>

        <section className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <div className="space-y-5">
            <ProvisioningStep
              number="1"
              title="Create or manage a MISO subscription"
              copy="Open the authenticated MISO Data Exchange portal. Sign in or create your MISO account, then follow its displayed subscription-key flow for the API product you need."
              complete={portalStarted}
            >
              <a
                href={MISO_PORTAL_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => setPortalStarted(true)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-[12.5px] font-medium text-primary-foreground"
              >
                Open MISO Data Exchange
                <ArrowUpRight className="size-3.5" />
              </a>
            </ProvisioningStep>

            <ProvisioningStep
              number="2"
              title="Keep the key in your backend secret manager"
              copy="Add the key in your deployment platform or local backend environment. Do not paste it into this app, a chat, source code, browser storage, or a downloaded agent file."
              complete={portalComplete}
            >
              <button
                type="button"
                onClick={() => setPortalComplete(true)}
                className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2.5 text-[12.5px] font-medium text-accent hover:bg-muted"
              >
                <CheckCircle2 className="size-3.5" />
                I stored it in my backend
              </button>
            </ProvisioningStep>

            <ProvisioningStep
              number="3"
              title="Register a safe connection reference"
              copy="This lets MISO AI’s local coding agent select the right backend variable without receiving any key material."
              complete={references.length > 0}
            >
              {authed ? (
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                  <div className="space-y-1.5">
                    <Label htmlFor="subscription-label" className="text-[11.5px]">
                      Connection name
                    </Label>
                    <Input
                      id="subscription-label"
                      value={label}
                      onChange={(event) => setLabel(event.target.value)}
                      placeholder="Production settlement"
                      className="h-10 rounded-lg text-[12.5px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="subscription-env" className="text-[11.5px]">
                      Backend environment variable
                    </Label>
                    <Input
                      id="subscription-env"
                      value={environmentVariable}
                      onChange={(event) => setEnvironmentVariable(event.target.value.toUpperCase())}
                      placeholder="MISO_SUBSCRIPTION_KEY"
                      className="h-10 rounded-lg font-mono text-[12px]"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={saving}
                    onClick={() => void saveReference()}
                    className="self-end rounded-full"
                  >
                    Save reference
                  </Button>
                </div>
              ) : (
                <p className="rounded-xl border border-dashed bg-muted/20 px-4 py-3 text-[12.5px] leading-relaxed text-muted-foreground">
                  Sign in to MISO AI to save a non-secret reference for your local coding agent.
                </p>
              )}
            </ProvisioningStep>
          </div>

          <aside className="space-y-4">
            <section className="rounded-2xl border bg-card p-5 shadow-soft">
              <p className="flex items-center gap-2 text-[13px] font-medium">
                <ShieldCheck className="size-4 text-success" />
                Credential boundary
              </p>
              <div className="mt-4 space-y-3 text-[12.5px] leading-relaxed text-muted-foreground">
                <Boundary icon={LockKeyhole} title="MISO portal" copy="Creates, rotates, and revokes the actual subscription key." />
                <Boundary icon={Server} title="Your backend" copy="Reads the key at runtime from its secret environment." />
                <Boundary icon={KeyRound} title="MISO AI" copy="Stores only a display name and environment-variable name for agent handoff." />
              </div>
            </section>

            <section className="rounded-2xl border border-accent/20 bg-accent-soft/35 p-5">
              <p className="flex items-start gap-2 text-[12.5px] font-medium text-foreground">
                <CircleAlert className="mt-0.5 size-4 shrink-0 text-accent" />
                Why the key is not created directly in MISO AI
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                MISO Data Exchange owns the account session and subscription lifecycle. Keeping that
                step in MISO prevents this app from collecting MISO account passwords or raw keys.
              </p>
            </section>

            {authed && (
              <section className="rounded-2xl border bg-card p-5 shadow-soft">
                <p className="text-[13px] font-medium">Saved agent references</p>
                {references.length ? (
                  <ul className="mt-3 space-y-2">
                    {references.map((reference) => (
                      <li key={reference.id} className="rounded-xl border bg-muted/20 px-3 py-2.5">
                        <p className="text-[12.5px] font-medium">{reference.label}</p>
                        <code className="mt-1 block text-[11.5px] text-muted-foreground">
                          {reference.environment_variable}
                        </code>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-[12px] text-muted-foreground">
                    No key references saved yet.
                  </p>
                )}
              </section>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}

function ProvisioningStep({
  number,
  title,
  copy,
  complete,
  children,
}: {
  number: string;
  title: string;
  copy: string;
  complete: boolean;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-soft sm:p-6">
      <div className="flex gap-3">
        <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${complete ? "bg-success-soft text-success" : "bg-accent-soft text-accent"}`}>
          {complete ? <CheckCircle2 className="size-3.5" /> : number}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-medium">{title}</h2>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">{copy}</p>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </section>
  );
}

function Boundary({
  icon: Icon,
  title,
  copy,
}: {
  icon: typeof LockKeyhole;
  title: string;
  copy: string;
}) {
  return (
    <div className="flex gap-2.5">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-accent" />
      <p>
        <span className="font-medium text-foreground">{title}: </span>
        {copy}
      </p>
    </div>
  );
}
