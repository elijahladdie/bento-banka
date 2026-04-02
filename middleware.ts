import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];
const ROLE_ROUTES: Record<string, string> = {
  "/client": "client",
  "/cashier": "cashier",
  "/manager": "manager",
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("banka_token")?.value;

  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    if (token && (pathname === "/login" || pathname === "/signup")) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userRole: string = payload.role ?? "client";
        return NextResponse.redirect(new URL(`/${userRole}/dashboard`, req.url));
      } catch {
        return NextResponse.redirect(new URL("/client/dashboard", req.url));
      }
    }
    return NextResponse.next();
  }

  if (!token && !PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userRole: string = payload.role;
    for (const [path, role] of Object.entries(ROLE_ROUTES)) {
      if (pathname.startsWith(path) && userRole !== role) {
        return NextResponse.redirect(new URL(`/${userRole}/dashboard`, req.url));
      }
    }
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|fonts|images|favicon.ico).*)"],
};
