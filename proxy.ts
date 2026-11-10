import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== "/downloads/ATHAR.apk") {
    return NextResponse.next();
  }

  const destination = request.nextUrl.clone();
  destination.pathname = "/downloads/Athar.apk";
  return NextResponse.redirect(destination, 308);
}

export const config = {
  matcher: "/downloads/:path*",
};