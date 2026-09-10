import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { ChatInput } from "./ChatInput";
import { Message, type ChatMessage } from "./Message";
import { RequestProcessor } from "./RequestProcessor";
import { Suggestion } from "./Suggestion";
import { askMiso, getConversation } from "@/lib/miso.functions";
import { isNewTopic, snapshotFromResponse } from "@/lib/miso/conversation";
import { setLastResponse } from "@/lib/miso/session-store";
import type { MisoResponse } from "@/lib/miso/types";

const DEFAULT_SUGGESTIONS = [
  "What was the actual load yesterday?",
  "Show me today's market prices.",
  "Find the latest market report.",
  "Give me the API for actual load data.",
  "What were the power results for Indiana?",
];

export function ChatInterface({
  authed,
  conversationId,
  onConversationStarted,
  onRequireAuth,
  onLatestResponse,
  starterApi,
  resumeQuestion,
}: {
  authed: boolean;
  conversationId: string | null;
  onConversationStarted: (id: string) => void;
  onRequireAuth: (pendingQuestion: string) => void;
  onLatestResponse?: (response: MisoResponse | null) => void;
  starterApi?: { sourceId: string; name: string } | null;
  resumeQuestion?: string | null;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const conversationIdRef = useRef(conversationId);
  const lastTurnRef = useRef<MisoResponse | null>(null);
  const lastSuccessRef = useRef<MisoResponse | null>(null);
  const navigate = useNavigate();

  conversationIdRef.current = conversationId;

  const ask = useServerFn(askMiso);
  const loadConversation = useServerFn(getConversation);

  useEffect(() => {
    let cancelled = false;
    if (!conversationId || !authed) {
      setMessages([]);
      lastTurnRef.current = null;
      lastSuccessRef.current = null;
      onLatestResponse?.(null);
      return;
    }
    loadConversation({ data: { id: conversationId } })
      .then((rows) => {
        if (cancelled) return;
        const mapped = rows.map((r) => ({
          id: r.id,
          role: r.role as "user" | "assistant",
          content: r.content,
          ...(r.payload ? { response: r.payload as unknown as MisoResponse } : {}),
        }));
        setMessages(mapped);
        const withResponse = mapped.filter((m) => m.response);
        const last = withResponse.at(-1)?.response ?? null;
        const lastOk =
          [...withResponse].reverse().find((m) => m.response?.execution.status === "success")
            ?.response ?? null;
        lastTurnRef.current = last;
        lastSuccessRef.current = lastOk;
        onLatestResponse?.(last);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [conversationId, authed, loadConversation, onLatestResponse]);

  useEffect(() => {
    if (!starterApi || conversationId || resumeQuestion) return;
    setValue(`Use ${starterApi.name} to `);
  }, [conversationId, resumeQuestion, starterApi]);

  useEffect(() => {
    if (!resumeQuestion || conversationId) return;
    setValue(resumeQuestion);
  }, [conversationId, resumeQuestion]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, busy]);

  const send = useCallback(
    async (question: string, parameterOverrides?: Record<string, string>) => {
      const trimmed = question.trim();
      if (!trimmed || busy) return;
      const requestQuestion =
        starterApi && !trimmed.toLowerCase().includes(starterApi.name.toLowerCase())
          ? `${starterApi.name}: ${trimmed}`
          : trimmed;
      if (!authed) {
        onRequireAuth(requestQuestion);
        return;
      }

      setValue("");
      setMessages((prev) => [
        ...prev,
        { id: `local_${Date.now()}`, role: "user", content: trimmed },
      ]);
      setBusy(true);

      if (isNewTopic(requestQuestion)) lastSuccessRef.current = null;

      try {
        const lastFromUi = lastTurnRef.current;
        const result = await ask({
          data: {
            question: requestQuestion,
            conversation_id: conversationIdRef.current,
            ...(lastFromUi ? { last_turn: snapshotFromResponse(lastFromUi) } : {}),
            ...(lastSuccessRef.current
              ? { last_success: snapshotFromResponse(lastSuccessRef.current) }
              : {}),
            ...(parameterOverrides ? { parameter_overrides: parameterOverrides } : {}),
          },
        });
        conversationIdRef.current = result.conversation_id;
        if (!conversationId) onConversationStarted(result.conversation_id);
        lastTurnRef.current = result.response;
        if (result.response.execution.status === "success") {
          lastSuccessRef.current = result.response;
        }
        setLastResponse(result.response);
        onLatestResponse?.(result.response);
        setMessages((prev) => [
          ...prev,
          {
            id: result.response.request_id,
            role: "assistant",
            content: result.response.title ?? result.response.answer,
            response: result.response,
          },
        ]);
      } catch {
        toast.error("Something interrupted that request. Please try again.");
      } finally {
        setBusy(false);
      }
    },
    [
      ask,
      authed,
      busy,
      conversationId,
      onConversationStarted,
      onRequireAuth,
      onLatestResponse,
      starterApi,
    ],
  );

  const empty = messages.length === 0;
  const suggestions = starterApi
    ? [
        "show yesterday's data",
        "make a chart",
        "give me a backend integration plan",
        "explain every required parameter",
      ]
    : DEFAULT_SUGGESTIONS;

  if (empty) {
    return (
      <div className="mx-auto flex w-full max-w-2xl min-h-0 flex-1 flex-col justify-center overflow-y-auto px-5 pb-20 pt-10">
        <div className="animate-rise text-center">
          <h2 className="text-[clamp(1.9rem,5vw,2.75rem)] font-medium leading-tight tracking-tight">
            {starterApi ? "What would you like to do with this?" : "What can I help you find?"}
          </h2>
          {starterApi && (
            <p className="mx-auto mt-3 max-w-xl text-[13.5px] leading-relaxed text-muted-foreground">
              You selected <span className="font-medium text-foreground">{starterApi.name}</span>.
              Your request will stay tied to this API.
            </p>
          )}
        </div>
        <div className="animate-rise mt-8">
          <ChatInput
            value={value}
            onChange={setValue}
            onSubmit={() => void send(value)}
            disabled={busy}
            autoFocus
          />
        </div>
        <div className="animate-fade mt-6 flex flex-wrap justify-center gap-1.5">
          {suggestions.map((s) => (
            <Suggestion
              key={s}
              text={s}
              onSelect={(t) =>
                void send(starterApi ? `Use ${starterApi.name} to ${t}` : t)
              }
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl space-y-8 px-5 py-10">
          {messages.map((m) => (
            <Message
              key={m.id}
              message={m}
              onFix={(q) => void send(q)}
              onEdit={() => navigate({ to: "/canvas" })}
              onRetry={(question, overrides) => void send(question, overrides)}
              onSubmitParameters={(question, overrides) => void send(question, overrides)}
            />
          ))}
          {busy && <RequestProcessor />}
          <div ref={bottomRef} />
        </div>
      </div>
      <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pb-5 pt-3">
        <div className="mx-auto w-full max-w-2xl px-5">
          <ChatInput
            value={value}
            onChange={setValue}
            onSubmit={() => void send(value)}
            disabled={busy}
            placeholder="Ask a follow-up..."
          />
        </div>
      </div>
    </div>
  );
}
