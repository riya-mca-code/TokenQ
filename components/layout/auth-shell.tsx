import type { ReactNode } from "react";
import { BrandMark } from "./brand-mark";

export function AuthShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden rounded-3xl border border-border bg-[linear-gradient(180deg,rgba(37,99,235,0.08),rgba(255,255,255,0.95))] p-8 shadow-soft lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-6">
            <BrandMark />
            <div className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">TokenQ</p>
              <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-slate-900">
                Multi-tenant queue management built for real organizations.
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-600">
                Register your organization, lock data to a workspace, and keep operations isolated from day one.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">JWT Auth</div>
            <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">Org Isolation</div>
            <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">Role Access</div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-border bg-white p-6 shadow-soft sm:p-8">
            <div className="mb-8 space-y-2">
              <BrandMark className="mb-3" />
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
              <p className="text-sm leading-6 text-slate-600">{description}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
