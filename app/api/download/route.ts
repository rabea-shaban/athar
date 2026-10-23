import { NextResponse } from "next/server";

// 100% Real Live Download Counter starting strictly from 0
let globalDownloadCount = 0;
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

  // Increment real download counter on every actual user download click
  globalDownloadCount += 1;
  lastDownloadTimestamp = Date.now();

  // Redirect directly to the official APK file download
  const apkUrl = new URL("/downloads/ATHAR-v2-arm64.apk", request.url);
  return NextResponse.redirect(apkUrl.toString(), 307);
}
