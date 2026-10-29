"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeIcon?: LucideIcon;
  align?: "center" | "right";
  className?: string;
  actionSlot?: React.ReactNode;
}

export default function SectionHeading({
  title,
  subtitle,
  badge,
  badgeIcon: BadgeIcon,
  align = "center",
  className,
  actionSlot,
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div
      className={cn(
        "space-y-3 mb-8",
        isCenter ? "text-center max-w-2xl mx-auto" : "text-right",
        className
      )}
    >
      {/* Optional Badge */}
      {badge && (
        <div
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-arabic bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 shadow-xs",
            isCenter ? "mx-auto" : ""
          )}
        >
          {BadgeIcon && <BadgeIcon className="h-3.5 w-3.5" />}
          <span>{badge}</span>
        </div>
      )}

      {/* Main Title */}
      <div className={cn("flex items-center gap-3", isCenter ? "justify-center" : "justify-between")}>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-arabic text-foreground tracking-tight">
          {title}
        </h2>
        {actionSlot && <div className="shrink-0">{actionSlot}</div>}
      </div>

      {/* Golden Geometric Divider with Diamond */}
      <div
        className={cn(
          "flex items-center gap-3 text-amber-500/80 select-none py-0.5",
          isCenter ? "justify-center" : "justify-start"
        )}
        aria-hidden="true"
      >
        <span className="w-12 h-px bg-gradient-to-r from-transparent to-amber-500/60" />
        <span className="text-xs">◆</span>
        <span className="w-12 h-px bg-gradient-to-l from-transparent to-amber-500/60" />
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs sm:text-sm text-muted-foreground font-arabic leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
