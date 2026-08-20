export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6 min-w-0">
      <h1 className="text-2xl font-semibold tracking-tight text-balance md:text-[1.75rem]">{title}</h1>
      {subtitle && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">{subtitle}</p>}
    </div>
  );
}
