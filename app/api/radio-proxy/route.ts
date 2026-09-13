import { type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return new Response("Missing url param", { status: 400 });
  }

  // Only allow qurango.net streams
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new Response("Invalid url", { status: 400 });
  }

  if (!parsed.hostname.endsWith("qurango.net")) {
    return new Response("Forbidden", { status: 403 });
  }

  const upstream = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Icy-MetaData": "1",
    },
  });

  const contentType = upstream.headers.get("content-type") ?? "audio/mpeg";

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
