import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const backendUrl = getBackendUrl();

  let res: Response;
  try {
    res = await fetch(`${backendUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error(`[Auth Register Proxy Error] Failed to reach backend at "${backendUrl}/auth/register":`, err);
    return Response.json({ message: "Unable to connect to the server. Please check your connection or try again later." }, { status: 502 });
  }

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 429) {
      return Response.json(
        { message: "Too many registration attempts. Please wait a moment and try again later." },
        { status: 429 },
      );
    }
    return Response.json(data, { status: res.status });
  }

  const cookieStore = await cookies();
  cookieStore.set("vls_token", data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return Response.json({ user: data.user });
}
