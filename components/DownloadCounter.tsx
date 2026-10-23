"use client";

import React, { useEffect, useState } from "react";
import { Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DownloadButtonWithCounter() {
  const [downloadCount, setDownloadCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/download?stats=true")
      .then((res) => res.json())
      .then((data) => {
        if (data?.totalDownloads) {
          setDownloadCount(data.totalDownloads);
        }
      })
      .catch(() => {});
  }, []);

  const handleDownloadClick = () => {
    if (downloadCount !== null) {
      setDownloadCount(downloadCount + 1);
    }
  };

  return (
    <div className="space-y-3">
      <a
        href="/api/download"
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleDownloadClick}
      >
        <Button className="w-full font-arabic text-xs font-bold gap-2 py-5 bg-[var(--athar-green)] hover:bg-[var(--athar-green-dark)] text-white shadow-sm">
          <Download className="w-4 h-4" />
          <span>تنزيل APK مباشر</span>
        </Button>
      </a>

      {downloadCount !== null && (
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--athar-green)] font-bold font-arabic bg-[var(--athar-green)]/10 py-1.5 px-3 rounded-xl border border-[var(--athar-green)]/20">
          <Sparkles className="w-3 h-3" />
          <span>إجمالي التنزيلات المباشرة: {downloadCount.toLocaleString("ar-EG")} تنزيل</span>
        </div>
      )}
    </div>
  );
}
