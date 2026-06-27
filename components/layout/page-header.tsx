import { Badge } from "@/components/ui/badge";

export function PageHeader({
  eyebrow,
  title,
  description,
  badge,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{eyebrow}</p> : null}
        {badge ? <Badge variant="primary">{badge}</Badge> : null}
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
      <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
    </div>
  );
}
