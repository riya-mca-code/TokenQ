import Link from "next/link";
import { ArrowRight, LockKeyhole, Sparkles, Users, Workflow, ShieldCheck, ServerCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

const features = [
  {
    icon: LockKeyhole,
    title: "JWT authentication",
    description: "Secure login and organization-scoped access with protected private routes.",
  },
  {
    icon: Users,
    title: "Multi-tenant isolation",
    description: "Every organization owns its own users, workspace, and dashboard context.",
  },
  {
    icon: Workflow,
    title: "Default workspace",
    description: "Organization registration creates a ready-to-use workspace and branding baseline.",
  },
  {
    icon: ShieldCheck,
    title: "Role middleware",
    description: "Backend authorization enforces admin and staff access rules consistently.",
  },
  {
    icon: ServerCog,
    title: "Production structure",
    description: "Next.js App Router frontend and TypeScript Express backend share one repo cleanly.",
  },
  {
    icon: Sparkles,
    title: "Light SaaS UI",
    description: "A mobile-first interface designed for fast daily use on phone and desktop.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main>
        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                Production-ready queue management for multi-tenant teams
              </div>
              <div className="space-y-5">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  Run every organization from one isolated queue platform.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                  TokenQ gives businesses their own secure workspace, role-based access, and a clean dashboard built
                  for daily operations.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/register">
                    Create organization
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {["Next.js App Router", "Express + Mongoose", "Socket.IO ready"].map((item) => (
                  <div key={item} className="rounded-2xl border border-border bg-white px-4 py-3 text-sm text-slate-600 shadow-soft">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <Card className="relative overflow-hidden">
              <CardHeader>
                <CardTitle>Organization dashboard</CardTitle>
                <CardDescription>Clean status overview, branding, and secure access.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-border bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">Current workspace</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">Main Workspace</p>
                  <p className="mt-1 text-sm text-slate-600">Default workspace created on registration.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">Role access</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">Admin + Staff</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">Isolation</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">By organizationId</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="features" className="border-t border-border bg-white">
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-10 space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Features</p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Foundation built for the next milestones</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="h-full">
                    <CardHeader>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="mt-2">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
