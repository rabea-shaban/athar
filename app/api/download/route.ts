import { NextResponse } from "next/server";

// Permanent Cloud Persistent Counter Object ID
const PERSISTENT_COUNTER_ID = "ff808181a09d98f701a1695c95b06f93";
const PERSISTENT_API = `https://api.restful-api.dev/objects/${PERSISTENT_COUNTER_ID}`;

// In-memory cache for ultra-fast response
let cachedCount = 0;
let lastUpdated = Date.now();

async function getLivePersistentCount(): Promise<number> {
  try {
    const res = await fetch(PERSISTENT_API, { cache: "no-store" });
    if (!res.ok) return cachedCount;
    const data = await res.json();
    const count = Number(data?.data?.totalDownloads) || 0;
    cachedCount = count;
    return count;
  } catch (e) {
    return cachedCount;
  }
}

async function incrementPersistentCount(): Promise<number> {
  try {
    const current = await getLivePersistentCount();
    const newCount = current + 1;
    cachedCount = newCount;
    lastUpdated = Date.now();

    await fetch(PERSISTENT_API, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "ATHAR Download Counter",
        data: {
          totalDownloads: newCount,
          lastUpdated,
        },
      }),
    });

    return newCount;
  } catch (e) {
    cachedCount += 1;
    return cachedCount;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isStatsQuery = searchParams.get("stats") === "true";

  if (isStatsQuery) {
    const count = await getLivePersistentCount();
    return NextResponse.json({
      success: true,
      totalDownloads: count,
      lastDownload: lastUpdated,
      formattedCount: count.toLocaleString("ar-EG"),
    });
  }

  // Increment real cloud persistent download counter
  await incrementPersistentCount();

  // Redirect directly to the official APK file download
  const apkUrl = new URL("/downloads/ATHAR-v2-arm64.apk", request.url);
  return NextResponse.redirect(apkUrl.toString(), 307);
}
