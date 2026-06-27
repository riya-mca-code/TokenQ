import { ResetPasswordForm } from "@/components/forms/reset-password-form";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: {
    token?: string;
  };
}) {
  return <ResetPasswordForm token={searchParams?.token || ""} />;
}
