import { NextRequest, NextResponse } from "next/server";
import { attachSessionCookie, forwardJson } from "../_shared";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const backendResponse = await forwardJson("/api/v1/auth/login", body);
  const payload = await backendResponse.json();
  const response = NextResponse.json(payload, { status: backendResponse.status });

  if (backendResponse.ok && payload?.data?.token) {
    attachSessionCookie(response, payload.data.token);
  }

  return response;
}
