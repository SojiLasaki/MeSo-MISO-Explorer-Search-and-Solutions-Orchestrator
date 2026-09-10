import type { AccessRequest } from "@/lib/miso/types";

export function AccessRequestCard({ request }: { request: AccessRequest }) {
  const href = request.recipient
    ? `mailto:${request.recipient}?subject=${encodeURIComponent(request.subject ?? "MISO access request")}&body=${encodeURIComponent(request.body ?? "")}`
    : undefined;
  return (
    <div className="rounded-xl border border-dashed bg-muted/35 p-4">
      <p className="text-[13px] font-medium">Access request email generated</p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{request.timeline}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {href ? <a href={href} className="rounded-full border bg-card px-3 py-1.5 text-[12px] font-medium">Open email draft</a> : <span className="rounded-full border bg-card px-3 py-1.5 text-[12px]">Copy the request to your MISO contact</span>}
      </div>
    </div>
  );
}
