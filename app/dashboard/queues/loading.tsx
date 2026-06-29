import { Card, CardContent } from "@/components/ui/card";

export default function QueuesLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="h-3 w-28 animate-pulse rounded-full bg-slate-200" />
        <div className="h-9 w-64 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded-full bg-slate-200" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 p-5">
              <div className="h-4 w-20 animate-pulse rounded-full bg-slate-200" />
              <div className="h-8 w-16 animate-pulse rounded-xl bg-slate-200" />
              <div className="h-4 w-28 animate-pulse rounded-full bg-slate-200" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="h-5 w-40 animate-pulse rounded-full bg-slate-200" />
            <div className="h-11 w-full animate-pulse rounded-lg bg-slate-100" />
            <div className="h-11 w-full animate-pulse rounded-lg bg-slate-100" />
            <div className="h-11 w-36 animate-pulse rounded-lg bg-slate-200" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="h-5 w-28 animate-pulse rounded-full bg-slate-200" />
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
