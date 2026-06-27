import { NextRequest, NextResponse } from "next/server";
import { forwardJson } from "../_shared";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const backendResponse = await forwardJson("/api/v1/auth/forgot-password", body);
  const payload = await backendResponse.json();
  return NextResponse.json(payload, { status: backendResponse.status });
}
