"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Moon,
  Sun,
  Menu,
  Search,
  Home,
  BookOpen,
  BookText,
  Headphones,
  Radio,
  Heart,
  RotateCcw,
  Scroll,
  GraduationCap,
  Library,
  ChevronLeft,
  LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Container from "@/components/layout/Container";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navLinks: NavItem[] = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/quran", label: "القرآن", icon: BookOpen },
  { href: "/tafsir", label: "التفسير", icon: BookText },
  { href: "/quran-search", label: "البحث", icon: Search },
  { href: "/listen", label: "الاستماع", icon: Headphones },
  { href: "/radio", label: "الإذاعة", icon: Radio },
  { href: "/adhkar", label: "الأذكار", icon: Heart },
  { href: "/tasbeeh", label: "التسابيح", icon: RotateCcw },
  { href: "/hadith", label: "الحديث", icon: Scroll },
  { href: "/lectures", label: "الشروحات", icon: GraduationCap },
  { href: "/library", label: "المكتبة", icon: Library },
];

export default function Navbar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("athar-theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("athar-theme", next ? "dark" : "light");
  }

  const isLinkActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-all">
      <Container size="2xl" className="flex h-[72px] sm:h-[80px] items-center justify-between py-1">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0 group py-0.5" aria-label="الرئيسية">
          <div className="relative h-14 w-14 sm:h-16 sm:w-16 md:h-17 md:w-17 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <Image
              src="/logo.png"
              alt="أَثَر — منصة المعرفة الإسلامية"
              width={76}
              height={76}
              className="w-full h-full object-contain filter drop-shadow-xs"
              priority
            />
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = isLinkActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-sm font-arabic whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-[var(--athar-green)]/15 text-[var(--athar-green)] font-bold shadow-2xs"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link href="/quran-search">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <Search className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-primary">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="xl:hidden text-muted-foreground" />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[290px] sm:w-[330px] p-0 flex flex-col h-full bg-card/95 backdrop-blur-md border-s border-border/70 overflow-hidden"
            >
              {/* Drawer Header with Logo */}
              <div className="pt-7 pb-4 px-6 border-b border-border/50 flex flex-col items-center justify-center text-center bg-muted/20 shrink-0">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="/logo.png"
                    alt="أَثَر — منصة المعرفة الإسلامية"
                    width={72}
                    height={72}
                    className="w-full h-full object-contain filter drop-shadow-xs"
                    priority
                  />
                </div>
                <span className="text-xs text-muted-foreground font-arabic">منصة المعرفة والعلوم الإسلامية</span>
              </div>

              {/* Drawer Links List */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = isLinkActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-arabic font-medium transition-all duration-150 group",
                        isActive
                          ? "bg-[var(--athar-green)]/15 text-[var(--athar-green)] font-bold shadow-2xs"
                          : "text-foreground/80 hover:bg-muted/70 hover:text-foreground active:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0",
                            isActive
                              ? "bg-[var(--athar-green)] text-white shadow-2xs"
                              : "bg-muted text-muted-foreground group-hover:text-foreground group-hover:bg-muted/80"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{link.label}</span>
                      </div>
                      <ChevronLeft
                        className={cn(
                          "w-4 h-4 transition-transform opacity-30 group-hover:opacity-100 group-hover:-translate-x-0.5 shrink-0",
                          isActive && "opacity-100 text-[var(--athar-green)]"
                        )}
                      />
                    </Link>
                  );
                })}
              </div>

              {/* Drawer Footer */}
              <div className="p-3 border-t border-border/50 bg-muted/20 flex items-center justify-between gap-2 shrink-0">
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors font-arabic py-1.5 px-3 rounded-xl bg-card border border-border/60 hover:bg-muted shadow-2xs cursor-pointer"
                >
                  {dark ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-primary" />}
                  <span>{dark ? "الوضع النهاري" : "الوضع الليلي"}</span>
                </button>
                <span className="text-[11px] text-muted-foreground/70 font-arabic">أَثَر • صدقة جارية</span>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}
