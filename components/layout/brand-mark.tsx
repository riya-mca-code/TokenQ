import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
        <ShieldCheck className="h-5 w-5" />
      </div>
      <div>
        <div className="text-sm font-semibold tracking-tight text-slate-900">TokenQ</div>
        <div className="text-xs text-slate-500">Queue management SaaS</div>
      </div>
    </div>
  );
}
