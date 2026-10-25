import type { NextRequest } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { token, new_password } = body;
  const backendUrl = getBackendUrl();

  let res: Response;
  try {
    res = await fetch(`${backendUrl}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, new_password }),
    });
  } catch (err) {
    console.error(
      `[Auth Reset Password Proxy Error] Failed to reach backend at "${backendUrl}/auth/reset-password":`,
      err,
    );
    return Response.json({ message: "Unable to connect to the server. Please check your connection or try again later." }, { status: 502 });
  }

  const contentType = res.headers.get("content-type") ?? "";
  let data: unknown = null;
  if (contentType.includes("application/json")) {
    data = await res.json().catch(() => null);
  } else {
    await res.text().catch(() => null);
  }

  if (!res.ok) {
    if (res.status === 429) {
      return Response.json(
        { message: "Too many attempts. Please wait a moment and try again later." },
        { status: 429 },
      );
    }
    const message =
      data && typeof data === "object" && "message" in data
        ? (data as Record<string, unknown>).message
        : "Failed to reset password.";
    return Response.json({ message: Array.isArray(message) ? message.join(", ") : message }, { status: res.status });
  }

  return Response.json(data ?? { message: "Password reset successful." });
}
