import { Card, CardContent } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
        <div className="h-9 w-2/3 max-w-md animate-pulse rounded-xl bg-slate-200" />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded-full bg-slate-200" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
            <div className="h-8 w-20 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
            <div className="h-8 w-20 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
            <div className="h-8 w-28 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="h-5 w-40 animate-pulse rounded-full bg-slate-200" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="h-5 w-32 animate-pulse rounded-full bg-slate-200" />
            <div className="space-y-3">
              <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
