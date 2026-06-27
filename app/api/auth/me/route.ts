import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { getBackendBaseUrl } from "@/lib/backend";

export async function GET() {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: "Authentication required", data: null }, { status: 401 });
  }

  const backendResponse = await fetch(`${getBackendBaseUrl()}/api/v1/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const payload = await backendResponse.json();
  return NextResponse.json(payload, { status: backendResponse.status });
}
