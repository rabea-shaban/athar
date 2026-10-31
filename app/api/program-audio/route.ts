import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In-memory cache for audio stream URLs (valid for 1 hour)
const streamCache = new Map<string, { url: string; expiresAt: number; duration?: number }>();

const INVIDIOUS_INSTANCES = [
  "https://yt.chocolatemoo53.com",
  "https://invidious.nerdvpn.de",
  "https://inv.nadeko.net",
  "https://invidious.tiekoetter.com",
];

export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get("id");
  const directUrl = req.nextUrl.searchParams.get("url");

  // If a direct audio stream URL was already supplied
  if (directUrl && directUrl.startsWith("http")) {
    return NextResponse.json({
      success: true,
      streamUrl: directUrl,
      source: "direct",
    });
  }

  if (!videoId) {
    return NextResponse.json(
      { success: false, error: "Missing video id" },
      { status: 400 }
    );
  }

  // Check cache
  const cached = streamCache.get(videoId);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({
      success: true,
      streamUrl: cached.url,
      duration: cached.duration,
      source: "cache",
    });
  }

  // Fetch audio stream from Invidious instances
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const response = await fetch(`${instance}/api/v1/videos/${videoId}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(4500),
      });

      if (!response.ok) continue;

      const data = await response.json();
      const adaptiveFormats = data.adaptiveFormats || [];

      // Prioritize m4a/mp4 audio formats for maximum mobile browser compatibility
      const audioFormats = adaptiveFormats
        .filter((f: any) => f.type?.includes("audio") && Boolean(f.url))
        .sort((a: any, b: any) => {
          const aIsM4a = a.type?.includes("mp4") || a.container === "m4a";
          const bIsM4a = b.type?.includes("mp4") || b.container === "m4a";
          if (aIsM4a && !bIsM4a) return -1;
          if (!aIsM4a && bIsM4a) return 1;
          return (b.bitrate || 0) - (a.bitrate || 0);
        });

      if (audioFormats.length > 0 && audioFormats[0].url) {
        const streamUrl = audioFormats[0].url;
        const duration = Number(data.lengthSeconds) || undefined;

        // Cache for 1 hour
        streamCache.set(videoId, {
          url: streamUrl,
          duration,
          expiresAt: Date.now() + 60 * 60 * 1000,
        });

        return NextResponse.json({
          success: true,
          streamUrl,
          duration,
          source: instance,
        });
      }
    } catch {
      // Continue to next instance
    }
  }

  return NextResponse.json(
    {
      success: false,
      error: "Unable to retrieve audio stream from upstream providers",
    },
    { status: 502 }
  );
}
