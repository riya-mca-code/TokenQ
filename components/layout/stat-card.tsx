import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
        {helper ? <p className="mt-2 text-sm leading-6 text-slate-500">{helper}</p> : null}
      </CardContent>
    </Card>
  );
}
