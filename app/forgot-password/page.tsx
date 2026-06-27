"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema } from "@/lib/validators/auth";
import type { z } from "zod";

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
      organizationSlug: "",
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setIsSubmitting(true);
    setServerError("");
    setSuccessMessage("");

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setServerError(payload?.message || "Unable to process request");
      return;
    }

    setSuccessMessage("If the account exists, a reset link has been sent.");
  }

  return (
    <AuthShell
      title="Forgot password"
      description="Request a password reset for your organization account."
    >
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="organizationSlug">Organization slug</Label>
          <Input id="organizationSlug" placeholder="acme-clinic" {...form.register("organizationSlug")} />
          <p className="text-xs text-slate-500">Optional when the email is unique to one organization.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="admin@acme.com" {...form.register("email")} />
        </div>
        {serverError ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p> : null}
        {successMessage ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</p> : null}
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending link..." : "Send reset link"}
          {!isSubmitting ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
        </Button>
        <p className="text-center text-sm text-slate-600">
          Back to{" "}
          <Link href="/login" className="font-medium text-blue-700 hover:text-blue-800">
            sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
