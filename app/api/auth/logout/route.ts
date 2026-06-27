import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { clearSessionCookie, forwardJson } from "../_shared";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    await forwardJson("/api/v1/auth/logout", {}, token);
  }

  const response = NextResponse.json({ success: true, message: "Logged out successfully", data: {} }, { status: 200 });
  clearSessionCookie(response);
  return response;
}
