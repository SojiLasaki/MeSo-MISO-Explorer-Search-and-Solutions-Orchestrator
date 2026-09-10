import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Download, ExternalLink, KeyRound, Laptop, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createLocalAgentScript, type MisoKeyReference } from "@/lib/miso/agent-package";
import { createMisoKeyReference, listMisoKeyReferences } from "@/lib/miso.functions";
import type { ApiRequestSpec } from "@/lib/miso/types";

export function LocalAgentDialog({
  api,
  open,
  onOpenChange,
}: {
  api: ApiRequestSpec;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [references, setReferences] = useState<MisoKeyReference[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [label, setLabel] = useState("");
  const [environmentVariable, setEnvironmentVariable] = useState("MISO_SUBSCRIPTION_KEY");
  const [saving, setSaving] = useState(false);
  const loadReferences = useServerFn(listMisoKeyReferences);
  const createKeyReference = useServerFn(createMisoKeyReference);

  useEffect(() => {
    if (!open) {
      setConfirmed(false);
      return;
    }
    loadReferences()
      .then((items) => {
        setReferences(items);
        setSelectedId((current) => current || items[0]?.id || "");
      })
      .catch(() => undefined);
  }, [loadReferences, open]);

  const saveReference = async () => {
    if (!label.trim()) {
      toast.error("Give this key reference a label.");
      return;
    }
    setSaving(true);
    try {
      const reference = await createKeyReference({
        data: { label: label.trim(), environment_variable: environmentVariable.trim() },
      });
      setReferences((items) => [reference, ...items]);
      setSelectedId(reference.id);
      setLabel("");
      toast.success("Credential reference saved. No key value was stored.");
    } catch {
      toast.error("Couldn't save that credential reference.");
    } finally {
      setSaving(false);
    }
  };

  const download = () => {
    const selected = references.find((reference) => reference.id === selectedId);
    const script = createLocalAgentScript(api, selected);
    const blob = new Blob([script], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "miso-backend-agent.mjs";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success("Local agent downloaded. Review it before running.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(720px,92vh)] overflow-y-auto rounded-2xl sm:max-w-lg">
        {!confirmed ? (
          <>
            <DialogHeader>
              <span className="mb-2 flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Bot className="size-5" />
              </span>
              <DialogTitle className="text-[21px] font-medium tracking-tight">
                Would you like an AI agent to make the backend changes locally?
              </DialogTitle>
              <DialogDescription className="text-[13.5px] leading-relaxed">
                It downloads a local TypeScript agent with this approved endpoint and every resolved
                parameter. You run it in your own backend repository and review its changes before
                deployment.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <Button className="rounded-xl" onClick={() => setConfirmed(true)}>
                Yes, set up the agent
              </Button>
              <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
                No, use the code examples
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <span className="mb-2 flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Laptop className="size-5" />
              </span>
              <DialogTitle className="text-[21px] font-medium tracking-tight">
                Local agent setup
              </DialogTitle>
              <DialogDescription className="text-[13.5px] leading-relaxed">
                The download contains an implementation plan, not a subscription key. Your key
                remains in your MISO account and is read only by your backend at runtime.
              </DialogDescription>
            </DialogHeader>

            <section className="mt-2 rounded-xl border bg-muted/25 p-4">
              <div className="flex gap-2.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
                <div>
                  <p className="text-[13px] font-medium">Secret-safe handoff</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                    The site never receives, displays, stores, or downloads subscription-key
                    material. The agent only receives the selected environment-variable name.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Label className="text-[13px]">Credential reference for this agent</Label>
                <a
                  href="https://data-exchange.misoenergy.org/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11.5px] font-medium text-accent hover:underline"
                >
                  Create key in MISO Data Exchange <ExternalLink className="size-3" />
                </a>
              </div>
              {references.length > 0 ? (
                <select
                  value={selectedId}
                  onChange={(event) => setSelectedId(event.target.value)}
                  className="h-10 w-full rounded-lg border bg-background px-3 text-[13px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
                >
                  {references.map((reference) => (
                    <option key={reference.id} value={reference.id}>
                      {reference.label} · {reference.environment_variable}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="rounded-lg border border-dashed px-3 py-2.5 text-[12px] text-muted-foreground">
                  No saved references yet. Create your MISO key in the official portal, then add a
                  non-secret local alias below.
                </p>
              )}
            </section>

            <section className="mt-4 rounded-xl border p-4">
              <div className="flex items-center gap-2">
                <KeyRound className="size-4 text-accent" />
                <p className="text-[13px] font-medium">Add a local key reference</p>
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                This saves only a label and environment-variable name for your signed-in account.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="key-reference-label" className="text-[11.5px]">
                    Label
                  </Label>
                  <Input
                    id="key-reference-label"
                    value={label}
                    onChange={(event) => setLabel(event.target.value)}
                    placeholder="Production MISO"
                    className="h-9 rounded-lg text-[12.5px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="key-reference-env" className="text-[11.5px]">
                    Local environment variable
                  </Label>
                  <Input
                    id="key-reference-env"
                    value={environmentVariable}
                    onChange={(event) => setEnvironmentVariable(event.target.value.toUpperCase())}
                    placeholder="MISO_SUBSCRIPTION_KEY"
                    className="h-9 rounded-lg font-mono text-[12px]"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 rounded-full"
                disabled={saving}
                onClick={() => void saveReference()}
              >
                Save reference
              </Button>
            </section>

            <section className="mt-4 rounded-xl border bg-muted/20 p-4">
              <p className="text-[12px] font-medium">This agent will receive</p>
              <ul className="mt-2 space-y-1 text-[12px] text-muted-foreground">
                <li>
                  • {api.method} request plan for {api.name}
                </li>
                <li>
                  • {api.parameters.length} resolved parameter
                  {api.parameters.length === 1 ? "" : "s"}
                </li>
                <li>• Pagination, retry, and MISO time-basis instructions</li>
              </ul>
            </section>

            <Button className="mt-5 w-full gap-2 rounded-full" onClick={download}>
              <Download className="size-4" />
              Download local agent
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
