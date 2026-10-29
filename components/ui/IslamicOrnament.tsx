import React from "react";
import { cn } from "@/lib/utils";

interface IslamicStarProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Authentic 8-pointed Islamic Star (نجمة إسلامية ثمانية / ربع الحزب)
 * Replaces non-authentic AI sparkles with traditional Islamic geometric art.
 */
export function IslamicStar({ className = "w-4 h-4", ...props }: IslamicStarProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("w-4 h-4 shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect x="5.5" y="5.5" width="13" height="13" rx="1.2" />
      <rect
        x="5.5"
        y="5.5"
        width="13"
        height="13"
        rx="1.2"
        transform="rotate(45 12 12)"
      />
      <circle cx="12" cy="12" r="2.2" className="fill-background" />
    </svg>
  );
}

/**
 * Classical Islamic Section Divider (فاصل زخرفي إسلامي)
 * Features subtle side rules, diamond accents, and a central Islamic 8-pointed star.
 */
export function IslamicDivider({
  className,
  starClassName,
}: {
  className?: string;
  starClassName?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center gap-2.5 text-amber-500/80 select-none",
        className
      )}
      aria-hidden="true"
    >
      <span className="h-[1px] w-8 sm:w-14 bg-gradient-to-r from-transparent to-amber-500/50" />
      <span className="w-1.5 h-1.5 rotate-45 bg-amber-500/70 rounded-[1px]" />
      <IslamicStar className={cn("w-3.5 h-3.5 text-amber-500", starClassName)} />
      <span className="w-1.5 h-1.5 rotate-45 bg-amber-500/70 rounded-[1px]" />
      <span className="h-[1px] w-8 sm:w-14 bg-gradient-to-l from-transparent to-amber-500/50" />
    </div>
  );
}

export default IslamicDivider;
