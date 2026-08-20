export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="glass rounded-ss px-6 py-12 text-center shadow-card">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-line bg-primary/10 text-sm font-semibold text-primary">
        —
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">{hint}</p>
    </div>
  );
}
