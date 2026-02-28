import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/admin/:path*"]
};

export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_USER || "admin";
  const pass = process.env.ADMIN_PASSWORD || "";

  // If no password set, block (force secure config in prod)
  if (!pass) {
    return new NextResponse("Admin not configured", { status: 503 });
  }

  const auth = req.headers.get("authorization");
  if (!auth) return unauthorized();

  const [scheme, encoded] = auth.split(" ");
  if (scheme !== "Basic" || !encoded) return unauthorized();

  const decoded = atob(encoded);
  const [u, p] = decoded.split(":");

  if (u === user && p === pass) return NextResponse.next();
  return unauthorized();
}

function unauthorized() {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Gulab House Admin"' }
  });
}