export function Suggestion({ text, onSelect }: { text: string; onSelect: (text: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(text)}
      className="rounded-full border border-transparent px-3 py-1.5 text-[13.5px] text-muted-foreground transition-colors hover:border-border hover:bg-card hover:text-foreground"
    >
      {text}
    </button>
  );
}
