import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/stafflogin",
  "/forgot-password",
  "/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/google",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
];

const ROLE_DASHBOARDS: Record<string, string> = {
  ADMIN: "/AdminDashboard",
  COORDINATOR: "/CoordinatorDashboard",
  GRANTOR: "/grantDashboard",
  SCHOLAR: "/scholardashboard",
  APPLICANT: "/ApplicantsApplication",
};

interface JwtPayload {
  sub?: number;
  email?: string;
  role?: string;
  exp?: number;
}

function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = atob(base64);
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

function isRouteAllowedForRole(pathname: string, role: string): boolean {
  const upper = role.toUpperCase();

  // Shared Staff routes
  if (
    pathname.startsWith("/GradingSystems") ||
    pathname.startsWith("/Schools") ||
    pathname.startsWith("/AcademicPrograms")
  ) {
    return upper === "ADMIN" || upper === "COORDINATOR" || upper === "GRANTOR";
  }

  // Admin routes
  if (pathname.startsWith("/Admin") || pathname.startsWith("/AuditLogs") || pathname.startsWith("/GlobalSettings")) {
    return upper === "ADMIN";
  }

  // Coordinator routes
  if (pathname.startsWith("/Coordinator")) {
    return upper === "COORDINATOR";
  }

  // Grantor routes
  if (pathname.startsWith("/grant")) {
    return upper === "GRANTOR";
  }

  // Scholar routes
  if (
    pathname.startsWith("/scholar") ||
    pathname.startsWith("/Scholar") ||
    pathname.startsWith("/scho") ||
    pathname.startsWith("/Scho")
  ) {
    return upper === "SCHOLAR";
  }

  // Applicant routes
  if (pathname.startsWith("/Applicants") || pathname.startsWith("/Applicant")) {
    return upper === "APPLICANT";
  }

  return true;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let API requests through directly
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("vls_token")?.value;
  const payload = token ? parseJwtPayload(token) : null;
  const isExpired = payload?.exp ? Date.now() >= payload.exp * 1000 : false;

  // If token is invalid or expired
  if (token && (!payload || isExpired)) {
    const loginUrl = new URL("/login", request.url);
    if (!isPublicRoute(pathname)) {
      loginUrl.searchParams.set("from", pathname);
    }
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("vls_token");
    return response;
  }

  const role = payload?.role?.toUpperCase();
  const userDashboard = role ? ROLE_DASHBOARDS[role] : null;

  // If authenticated user visits public landing or auth pages, send them to their dashboard
  if (
    userDashboard &&
    (pathname === "/" || pathname === "/login" || pathname === "/signup" || pathname === "/stafflogin")
  ) {
    return NextResponse.redirect(new URL(userDashboard, request.url));
  }

  // Unauthenticated access
  if (!token) {
    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route segregation
  if (role && !isRouteAllowedForRole(pathname, role)) {
    const target = userDashboard ?? "/login";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
