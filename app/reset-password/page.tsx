"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordSchema } from "@/lib/validators/auth";
import type { z } from "zod";

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [serverError, setServerError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    setIsSubmitting(true);
    setServerError("");

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setServerError(payload?.message || "Unable to reset password");
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell
      title="Reset password"
      description="Set a new password and continue to your private dashboard."
    >
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="token">Reset token</Label>
          <Input id="token" placeholder="Paste token from your email" {...form.register("token")} />
          {form.formState.errors.token ? <p className="text-xs text-red-600">{form.formState.errors.token.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" placeholder="Create a strong password" {...form.register("password")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Repeat the password"
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword ? (
            <p className="text-xs text-red-600">{form.formState.errors.confirmPassword.message}</p>
          ) : null}
        </div>
        {serverError ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p> : null}
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Reset password"}
          {!isSubmitting ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
        </Button>
        <p className="text-center text-sm text-slate-600">
          Return to{" "}
          <Link href="/login" className="font-medium text-blue-700 hover:text-blue-800">
            sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
