"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import Container from "@/components/layout/Container";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BadgeItem {
  label: string;
  icon?: LucideIcon;
  variant?: "gold" | "emerald" | "default";
}

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  count?: number | string;
}

export interface PageHeroProps {
  /** Breadcrumb items for top navigation pill */
  breadcrumbs?: BreadcrumbItem[];
  /** Single top pill label if breadcrumb is not used */
  badge?: string;
  badgeIcon?: LucideIcon;
  /** Main page title in large Arabic typography */
  title: string;
  /** Subtitle or introductory paragraph */
  subtitle?: string;
  /** Bottom metadata badges row (like Program details) */
  badges?: BadgeItem[];
  /** Top-level interactive switcher tabs (like Quran & Programs) */
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  /** Custom extra content slot (e.g. quick search, reading resume banner) */
  children?: React.ReactNode;
  /** Visual color theme gradient (default: emerald) */
  theme?: "emerald" | "navy" | "teal" | "dark";
  /** Whether to show the bottom golden star ornament */
  showOrnament?: boolean;
}

export default function PageHero({
  breadcrumbs,
  badge,
  badgeIcon: BadgeIcon,
  title,
  subtitle,
  badges,
  tabs,
  activeTab,
  onTabChange,
  children,
  theme = "emerald",
  showOrnament = true,
}: PageHeroProps) {
  // Theme gradients
  const themeBg = {
    emerald:
      "bg-[#051c14] bg-[radial-gradient(#0e4732_1px,transparent_1px)] border-emerald-900/50",
    navy:
      "bg-[#06141f] bg-[radial-gradient(#14364e_1px,transparent_1px)] border-cyan-900/50",
    teal:
      "bg-[#051b1e] bg-[radial-gradient(#0e4045_1px,transparent_1px)] border-teal-900/50",
    dark:
      "bg-[#0a0f12] bg-[radial-gradient(#202830_1px,transparent_1px)] border-slate-800",
  }[theme];

  return (
    <>
      <section
        className={cn(
          "relative overflow-hidden [background-size:24px_24px] text-white border-b py-12 md:py-16 text-center select-none",
          themeBg
        )}
      >
        {/* Ambient atmospheric glows */}
        <div className="pointer-events-none absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

        <Container size="2xl" className="relative z-10 space-y-4">
          {/* ─── Breadcrumb or Top Badge Pill ─── */}
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <nav className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-emerald-200/90 font-arabic shadow-xs">
              {breadcrumbs.map((item, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span className="opacity-50 text-[10px]">/</span>}
                    {item.href && !isLast ? (
                      <Link
                        href={item.href}
                        className="hover:text-white transition-colors"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span
                        className={cn(
                          isLast ? "text-amber-300 font-semibold" : "text-white/80"
                        )}
                      >
                        {item.label}
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          ) : badge ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-emerald-200/90 font-arabic shadow-xs">
              {BadgeIcon && <BadgeIcon className="h-3.5 w-3.5 text-amber-300" />}
              <span>{badge}</span>
            </div>
          ) : null}

          {/* ─── Big Arabic Title ─── */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-arabic tracking-tight text-white leading-tight drop-shadow-sm">
            {title}
          </h1>

          {/* ─── Subtitle Description ─── */}
          {subtitle && (
            <p className="text-xs sm:text-sm md:text-base text-emerald-100/80 font-arabic max-w-3xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}

          {/* ─── Metadata Badges Row (Image 2 style) ─── */}
          {badges && badges.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 text-xs font-arabic">
              {badges.map((b, i) => {
                const Icon = b.icon;
                const variantClasses = {
                  gold: "bg-amber-500/20 text-amber-300 border-amber-400/30",
                  emerald: "bg-emerald-600/30 text-emerald-200 border-emerald-500/30 font-semibold",
                  default: "bg-white/10 text-white/95 border-white/15",
                }[b.variant || "default"];

                return (
                  <span
                    key={i}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full backdrop-blur-md border shadow-xs",
                      variantClasses
                    )}
                  >
                    {Icon && <Icon className="h-3.5 w-3.5 text-amber-300 shrink-0" />}
                    <span>{b.label}</span>
                  </span>
                );
              })}
            </div>
          )}

          {/* ─── Interactive Tabs Switcher (Image 1 style) ─── */}
          {tabs && tabs.length > 0 && (
            <div className="flex items-center justify-center gap-2.5 pt-4 flex-wrap">
              {tabs.map((tab) => {
                const isSelected = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onTabChange && onTabChange(tab.id)}
                    className={cn(
                      "px-5 sm:px-6 py-2.5 rounded-2xl font-arabic text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-xs select-none active:scale-[0.98]",
                      isSelected
                        ? "bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300/40 scale-[1.02]"
                        : "bg-white/10 hover:bg-white/15 text-white/90 border border-white/15"
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className={cn(
                          "text-[11px] px-1.5 py-0.5 rounded-full font-mono",
                          isSelected
                            ? "bg-amber-950/20 text-slate-950"
                            : "bg-white/15 text-white"
                        )}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* ─── Extra Slot (e.g. Quick search, reading marker banner) ─── */}
          {children && <div className="pt-2">{children}</div>}
        </Container>
      </section>

      {/* ─── Golden Islamic Star Ornament Below Hero ─── */}
      {showOrnament && (
        <div className="pt-6 pb-2 text-center select-none" aria-hidden="true">
          <div className="inline-flex items-center justify-center gap-2 text-amber-500/80">
            <span className="text-xs">✦</span>
            <span className="text-base font-bold">❖</span>
            <span className="text-xs">✦</span>
          </div>
        </div>
      )}
    </>
  );
}
