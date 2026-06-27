"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/lib/validators/auth";
import type { z } from "zod";

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      organizationSlug: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true);
    setServerError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setServerError(payload?.message || "Unable to sign in");
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell
      title="Sign in"
      description="Access your organization dashboard with JWT-protected credentials."
    >
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="organizationSlug">Organization slug</Label>
          <Input id="organizationSlug" placeholder="acme-clinic" {...form.register("organizationSlug")} />
          <p className="text-xs text-slate-500">Leave blank for super admin access.</p>
          {form.formState.errors.organizationSlug ? (
            <p className="text-xs text-red-600">{form.formState.errors.organizationSlug.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="admin@acme.com" {...form.register("email")} />
          {form.formState.errors.email ? <p className="text-xs text-red-600">{form.formState.errors.email.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="Enter your password" {...form.register("password")} />
          {form.formState.errors.password ? (
            <p className="text-xs text-red-600">{form.formState.errors.password.message}</p>
          ) : null}
        </div>
        {serverError ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p> : null}
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
          {!isSubmitting ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
        </Button>
        <div className="flex items-center justify-between text-sm text-slate-600">
          <Link href="/forgot-password" className="font-medium text-blue-700 hover:text-blue-800">
            Forgot password?
          </Link>
          <Link href="/register" className="font-medium text-blue-700 hover:text-blue-800">
            Register
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
