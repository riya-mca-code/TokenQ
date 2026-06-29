import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { proxyQueueRequest } from "../_shared";

type RouteContext = {
  params: Promise<{ queueId: string }>;
};

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ success: false, message: "Authentication required", data: null }, { status: 401 });
  }

  const { queueId } = await context.params;
  const body = await request.json();
  const backendResponse = await proxyQueueRequest(`/api/v1/queues/${queueId}`, "PUT", token, body);
  const payload = await backendResponse.json();
  return NextResponse.json(payload, { status: backendResponse.status });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ success: false, message: "Authentication required", data: null }, { status: 401 });
  }

  const { queueId } = await context.params;
  const backendResponse = await proxyQueueRequest(`/api/v1/queues/${queueId}`, "DELETE", token);
  const payload = await backendResponse.json();
  return NextResponse.json(payload, { status: backendResponse.status });
}
