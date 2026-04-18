import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);

  if (!session.isLoggedIn) {
    const from = encodeURIComponent(request.nextUrl.pathname);
    return NextResponse.redirect(new URL(`/login?from=${from}`, request.url));
  }
  return response;
}

export const config = {
  matcher: ["/primitiv/:path*", "/tirage", "/tirage/:path*"],
};
