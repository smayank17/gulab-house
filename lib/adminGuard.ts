import { NextRequest, NextResponse } from "next/server";

/**
 * HTTP Basic Auth guard for admin API routes.
 * Returns a Response when unauthorized; otherwise returns null to continue.
 */
export function adminGuard(req: NextRequest): Response | null {
  const user = process.env.ADMIN_USER || "admin";
  const pass = process.env.ADMIN_PASSWORD || "change-me";

  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Basic ")) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Admin"' } }
    );
  }

  const token = auth.slice("Basic ".length);
  const decoded = Buffer.from(token, "base64").toString("utf8");
  const sep = decoded.indexOf(":");
  const u = sep >= 0 ? decoded.slice(0, sep) : "";
  const p = sep >= 0 ? decoded.slice(sep + 1) : "";

  if (u !== user || p !== pass) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Admin"' } }
    );
  }

  return null;
}