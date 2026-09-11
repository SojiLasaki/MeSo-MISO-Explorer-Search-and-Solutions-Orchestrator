/** Pure formatting helpers for semantic visualizations. */

export function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.replace(/,/g, "").trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function formatNumber(value: number, maximumFractionDigits = 0): string {
  return value.toLocaleString("en-US", { maximumFractionDigits });
}

export function formatMeasure(value: number, unit?: string, maximumFractionDigits = 0): string {
  const formatted = formatNumber(value, maximumFractionDigits);
  return unit ? `${formatted} ${unit}` : formatted;
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

/**
 * Format MISO-style timestamps without inventing a different calendar day.
 * Keeps wall-clock strings like "2026-09-10 10:25:00 PM" readable.
 */
export function formatIntervalLabel(raw: unknown): string {
  if (raw == null) return "—";
  const text = String(raw).trim();
  if (!text) return "—";

  // Already a friendly MISO public string: "2026-09-10 10:25:00 PM"
  const misoWall = text.match(
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)$/i,
  );
  if (misoWall) {
    const [, y, m, d, hh, mm, , ap] = misoWall;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[Number(m) - 1] ?? m;
    return `${month} ${Number(d)}, ${y}, ${Number(hh)}:${mm} ${ap.toUpperCase()} EST`;
  }

  // ISO-like with T
  const iso = Date.parse(text);
  if (!Number.isNaN(iso) && (text.includes("T") || text.endsWith("Z"))) {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  // RefId style: "10-Sep-2026 - Interval 10:25 EST"
  const ref = text.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4}).*?(\d{1,2}:\d{2})/);
  if (ref) {
    return `${ref[2]} ${Number(ref[1])}, ${ref[3]}, ${ref[4]} EST`;
  }

  return text;
}
