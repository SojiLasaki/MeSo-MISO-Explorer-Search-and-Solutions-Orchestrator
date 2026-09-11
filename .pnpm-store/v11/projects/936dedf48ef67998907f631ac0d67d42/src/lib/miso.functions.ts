import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { EXTERNAL_USER_PERSONAS } from "./miso/integration-lab";
import type { MisoKeyReference } from "./miso/agent-package";
import type { MisoResponse } from "./miso/types";

const TurnContext = z.object({
  source_id: z.string().optional(),
  dataset: z.string().optional(),
  parameters: z.record(z.string()).default({}),
  status: z.string().optional(),
  intent: z.string().optional(),
  missing: z.array(z.object({ name: z.string(), question: z.string() })).optional(),
  options: z
    .array(z.object({ dataset: z.string(), description: z.string(), source_id: z.string() }))
    .optional(),
});

const AskInput = z.object({
  question: z.string().min(1).max(2000),
  conversation_id: z.string().uuid().nullable().optional(),
  last_turn: TurnContext.optional(),
  last_success: TurnContext.optional(),
  parameter_overrides: z.record(z.string()).optional(),
});

export interface AskResult {
  conversation_id: string;
  response: MisoResponse;
}

const IntegrationSimulationInput = z.object({
  persona: z.enum(
    EXTERNAL_USER_PERSONAS.map((persona) => persona.id) as [
      (typeof EXTERNAL_USER_PERSONAS)[number]["id"],
      ...(typeof EXTERNAL_USER_PERSONAS)[number]["id"][],
    ],
  ),
  mode: z.enum(["success", "http_505"]),
});

/**
 * Public, deterministic preflight for the integration lab. It uses no account
 * data, credentials, or live MISO calls, so prospective users can safely see
 * the backend flow before they connect their own environment.
 */
export const runIntegrationSimulation = createServerFn({ method: "POST" })
  .validator(IntegrationSimulationInput)
  .handler(async ({ data }) => {
    const { runIntegrationSimulation: run } = await import("./miso/integration-simulator.server");
    return run(data.persona, data.mode);
  });

/** Runs the full orchestration pipeline and persists the exchange.
 *  This is the chat/query endpoint (TanStack server function equivalent of POST /api/miso/query).
 */
export const askMiso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(AskInput)
  .handler(async ({ data, context }): Promise<AskResult> => {
    const { supabase, userId } = context;
    const { runMisoRequest } = await import("./miso/orchestrator.server");

    let conversationId = data.conversation_id ?? null;
    let history: string[] = [];

    if (conversationId) {
      const { data: prior } = await supabase
        .from("messages")
        .select("role, content, payload")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(10);
      const { historyFromMessages } = await import("./miso/conversation");
      history = historyFromMessages(prior ?? []);
    } else {
      const title = data.question.length > 60 ? `${data.question.slice(0, 57)}...` : data.question;
      const { data: created, error } = await supabase
        .from("conversations")
        .insert({ user_id: userId, title })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      conversationId = created.id;
    }

    await supabase.from("messages").insert({
      conversation_id: conversationId,
      user_id: userId,
      role: "user",
      content: data.question,
    });

    const response = await runMisoRequest(data.question, history, new Date(), {
      ...(data.last_turn ? { lastTurn: data.last_turn } : {}),
      ...(data.last_success ? { lastSuccess: data.last_success } : {}),
      ...(data.parameter_overrides ? { parameterOverrides: data.parameter_overrides } : {}),
    });

    await supabase.from("messages").insert({
      conversation_id: conversationId,
      user_id: userId,
      role: "assistant",
      content: response.title ?? response.answer,
      payload: JSON.parse(JSON.stringify(response)),
    });

    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return { conversation_id: conversationId!, response };
  });

export const resolveMiso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      message: z.string().min(1).max(2000),
      conversation_id: z.string().uuid().nullable().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { resolveMisoQuery } = await import("./miso/resolver");
    const { historyFromMessages } = await import("./miso/conversation");
    let history: string[] = [];
    if (data.conversation_id) {
      const { data: prior } = await context.supabase
        .from("messages")
        .select("role, content, payload")
        .eq("conversation_id", data.conversation_id)
        .order("created_at", { ascending: true })
        .limit(10);
      history = historyFromMessages(prior ?? []);
    }
    return resolveMisoQuery(data.message, { history });
  });

/** Re-runs a plan with edited parameters (used by Canvas). */
export const rerunMisoRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      question: z.string().min(1),
      conversation_id: z.string().uuid().nullable().optional(),
    }),
  )
  .handler(async ({ data }): Promise<MisoResponse> => {
    const { runMisoRequest } = await import("./miso/orchestrator.server");
    return runMisoRequest(data.question, []);
  });

export const listConversations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("conversations")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("messages")
      .select("id, role, content, payload, created_at")
      .eq("conversation_id", data.id)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const deleteConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await context.supabase.from("conversations").delete().eq("id", data.id);
    return { ok: true };
  });

/** The frontend only ever learns WHETHER MISO access is available. */
export const getMisoAccessStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("profiles")
      .select("miso_access_granted, display_name")
      .eq("id", context.userId)
      .maybeSingle();
    const { hasLiveMisoCredentials } = await import("./miso/client.server");
    return {
      connected: data?.miso_access_granted ?? true,
      mode: hasLiveMisoCredentials() ? ("live" as const) : ("simulated" as const),
      display_name: data?.display_name ?? null,
      checked_at: new Date().toISOString(),
    };
  });

const KeyReferenceInput = z.object({
  label: z.string().trim().min(1).max(80),
  environment_variable: z
    .string()
    .trim()
    .regex(/^[A-Z][A-Z0-9_]{2,63}$/, "Use an uppercase environment-variable name."),
});

/** Lists non-secret aliases for the user's local agent. Raw subscription keys
 * are intentionally never accepted or returned by this application. */
export const listMisoKeyReferences = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MisoKeyReference[]> => {
    const { data, error } = await context.supabase
      .from("miso_key_references")
      .select("id, label, environment_variable, status, created_at, updated_at")
      .eq("user_id", context.userId)
      .eq("status", "active")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as MisoKeyReference[];
  });

export const createMisoKeyReference = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(KeyReferenceInput)
  .handler(async ({ data, context }): Promise<MisoKeyReference> => {
    const { data: created, error } = await context.supabase
      .from("miso_key_references")
      .insert({
        user_id: context.userId,
        label: data.label,
        environment_variable: data.environment_variable,
      })
      .select("id, label, environment_variable, status, created_at, updated_at")
      .single();
    if (error) throw new Error(error.message);
    return created as MisoKeyReference;
  });

const PrefsSchema = z.object({
  output_format: z.string(),
  units: z.string(),
  region: z.string(),
  always_show_api: z.boolean(),
});

export const getPreferences = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_preferences")
      .select("output_format, units, region, always_show_api")
      .eq("user_id", context.userId)
      .maybeSingle();
    return data ?? { output_format: "auto", units: "MW", region: "MISO", always_show_api: false };
  });

export const savePreferences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(PrefsSchema)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("user_preferences")
      .upsert({ user_id: context.userId, ...data, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
