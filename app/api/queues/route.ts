import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { proxyQueueRequest } from "./_shared";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: "Authentication required", data: null }, { status: 401 });
  }

  const backendResponse = await proxyQueueRequest("/api/v1/queues", "GET", token);
  const payload = await backendResponse.json();
  return NextResponse.json(payload, { status: backendResponse.status });
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: "Authentication required", data: null }, { status: 401 });
  }

  const body = await request.json();
  const backendResponse = await proxyQueueRequest("/api/v1/queues", "POST", token, body);
  const payload = await backendResponse.json();
  return NextResponse.json(payload, { status: backendResponse.status });
}
