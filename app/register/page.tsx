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
import { registerSchema } from "@/lib/validators/auth";
import type { z } from "zod";

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      businessName: "",
      businessType: "",
      ownerName: "",
      email: "",
      phone: "",
      password: "",
      timezone: "Asia/Kolkata",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setIsSubmitting(true);
    setServerError("");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setServerError(payload?.message || "Unable to create organization");
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell
      title="Create your organization"
      description="Register a secure workspace and create the first owner account in one step."
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="businessName">Business name</Label>
          <Input id="businessName" placeholder="Acme Clinic" {...form.register("businessName")} />
          {form.formState.errors.businessName ? (
            <p className="text-xs text-red-600">{form.formState.errors.businessName.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessType">Business type</Label>
          <Input id="businessType" placeholder="Clinic" {...form.register("businessType")} />
          {form.formState.errors.businessType ? (
            <p className="text-xs text-red-600">{form.formState.errors.businessType.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="ownerName">Owner name</Label>
          <Input id="ownerName" placeholder="Riya Sharma" {...form.register("ownerName")} />
          {form.formState.errors.ownerName ? (
            <p className="text-xs text-red-600">{form.formState.errors.ownerName.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="owner@acme.com" {...form.register("email")} />
          {form.formState.errors.email ? <p className="text-xs text-red-600">{form.formState.errors.email.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" placeholder="+91 90000 00000" {...form.register("phone")} />
          {form.formState.errors.phone ? <p className="text-xs text-red-600">{form.formState.errors.phone.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="Create a strong password" {...form.register("password")} />
          {form.formState.errors.password ? (
            <p className="text-xs text-red-600">{form.formState.errors.password.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input id="timezone" placeholder="Asia/Kolkata" {...form.register("timezone")} />
        </div>
        {serverError ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p> : null}
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating workspace..." : "Create organization"}
          {!isSubmitting ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
        </Button>
        <p className="text-center text-sm text-slate-600">
          Already have access?{" "}
          <Link href="/login" className="font-medium text-blue-700 hover:text-blue-800">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
