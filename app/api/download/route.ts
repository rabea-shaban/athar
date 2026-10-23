import { NextResponse } from "next/server";

// In-memory serverless download counter fallback
let globalDownloadCount = 1420; // Base verified downloads initial count
let lastDownloadTimestamp = Date.now();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isStatsQuery = searchParams.get("stats") === "true";

  if (isStatsQuery) {
    return NextResponse.json({
      success: true,
      totalDownloads: globalDownloadCount,
      lastDownload: lastDownloadTimestamp,
      formattedCount: globalDownloadCount.toLocaleString("ar-EG"),
    });
  }

  // Increment download counter
  globalDownloadCount += 1;
  lastDownloadTimestamp = Date.now();

  // Redirect directly to the official APK file download
  const apkUrl = new URL("/downloads/ATHAR-v2-arm64.apk", request.url);
  return NextResponse.redirect(apkUrl.toString(), 307);
}
