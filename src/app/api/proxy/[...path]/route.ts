import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

async function proxyRequest(method: string, path: string, request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("vls_token")?.value;

  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const contentType = request.headers.get("content-type");
  const isMultipart = Boolean(contentType?.includes("multipart/form-data"));
  if (contentType && !isMultipart) {
    headers.set("Content-Type", contentType);
  }

  const init: RequestInit = { method, headers };

  if (method !== "GET" && method !== "HEAD") {
    if (isMultipart) {
      init.body = await request.formData();
    } else {
      init.body = await request.text();
    }
  }

  const backendBase = getBackendUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const targetUrl = new URL(`${backendBase}${normalizedPath}`);
  targetUrl.search = request.nextUrl.search;

  let res: Response;
  try {
    res = await fetch(targetUrl.toString(), init);
  } catch (err) {
    console.error(`[API Proxy Error] Failed to proxy ${method} to "${targetUrl.toString()}":`, err);
    return new Response(
      JSON.stringify({
        message: "Unable to connect to the server. Please check your connection or try again later.",
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const resHeaders = new Headers();
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    resHeaders.set("set-cookie", setCookie);
  }
  const resContentType = res.headers.get("content-type");
  if (resContentType) {
    resHeaders.set("content-type", resContentType);
  }

  const body = await res.arrayBuffer();

  return new Response(body, {
    status: res.status,
    statusText: res.statusText,
    headers: resHeaders,
  });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest("GET", path.join("/"), request);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest("POST", path.join("/"), request);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest("PUT", path.join("/"), request);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest("PATCH", path.join("/"), request);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest("DELETE", path.join("/"), request);
}
