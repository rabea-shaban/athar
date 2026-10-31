"use client";

import React, { useRef, useMemo } from "react";
import { PDFViewer, PDFViewerRef } from "@embedpdf/react-pdf-viewer";
import { ReadingTheme } from "./types";

interface EmbedPdfViewerInnerProps {
  pdfUrl: string;
  themeMode: ReadingTheme;
  onPageChange?: (page: number, total: number) => void;
  className?: string;
}

export default function EmbedPdfViewerInner({
  pdfUrl,
  themeMode,
  onPageChange,
  className,
}: EmbedPdfViewerInnerProps) {
  const viewerRef = useRef<PDFViewerRef>(null);

  const themeConfig = useMemo(() => {
    if (themeMode === "dark") {
      return {
        preference: "dark" as const,
        dark: {
          background: {
            app: "#0A1510",
            surface: "#0E1E17",
            surfaceAlt: "#142920",
            elevated: "#173026",
            overlay: "rgba(0, 0, 0, 0.75)",
            input: "#12251D",
          },
          foreground: {
            primary: "#F8F6EF",
            secondary: "#C2BEB4",
            muted: "#8E9992",
            disabled: "#536158",
            onAccent: "#FFFFFF",
          },
          border: {
            default: "#1E3A2C",
            subtle: "#142B20",
            strong: "#C9A227",
          },
          accent: {
            primary: "#10B981",
            primaryHover: "#059669",
            primaryActive: "#047857",
            primaryLight: "#064E35",
            primaryForeground: "#FFFFFF",
          },
          interactive: {
            hover: "#142920",
            active: "#1E3A2C",
            selected: "#173026",
            focus: "#10B981",
            focusRing: "#C9A227",
          },
        },
      };
    }

    if (themeMode === "green") {
      return {
        preference: "light" as const,
        light: {
          background: {
            app: "#EDF5F1",
            surface: "#FFFFFF",
            surfaceAlt: "#E1EFE8",
            elevated: "#FFFFFF",
            overlay: "rgba(6, 78, 53, 0.4)",
            input: "#FFFFFF",
          },
          foreground: {
            primary: "#122B20",
            secondary: "#3A5C4E",
            muted: "#668577",
            disabled: "#A4B8AF",
            onAccent: "#FFFFFF",
          },
          border: {
            default: "#CCE2D7",
            subtle: "#DDF0E6",
            strong: "#064E35",
          },
          accent: {
            primary: "#064E35",
            primaryHover: "#0B6245",
            primaryActive: "#043624",
            primaryLight: "#D9EFE3",
            primaryForeground: "#FFFFFF",
          },
          interactive: {
            hover: "#E1EFE8",
            active: "#CCE2D7",
            selected: "#D9EFE3",
            focus: "#064E35",
            focusRing: "#C9A227",
          },
        },
      };
    }

    // Default: Light Ivory (#F8F6EF & #FFFFFF with Deep Green & Gold)
    return {
      preference: "light" as const,
      light: {
        background: {
          app: "#F8F6EF",
          surface: "#FFFFFF",
          surfaceAlt: "#F2EFE8",
          elevated: "#FFFFFF",
          overlay: "rgba(6, 78, 53, 0.4)",
          input: "#FFFFFF",
        },
        foreground: {
          primary: "#202820",
          secondary: "#77776D",
          muted: "#8C8C80",
          disabled: "#B4B0A5",
          onAccent: "#FFFFFF",
        },
        border: {
          default: "#E8E3D8",
          subtle: "#F0ECE3",
          strong: "#C9A227",
        },
        accent: {
          primary: "#064E35",
          primaryHover: "#0B6245",
          primaryActive: "#043624",
          primaryLight: "#E8F4EE",
          primaryForeground: "#FFFFFF",
        },
        interactive: {
          hover: "#F2EFE8",
          active: "#E8E3D8",
          selected: "#E8F4EE",
          focus: "#064E35",
          focusRing: "#C9A227",
        },
      },
    };
  }, [themeMode]);

  const absoluteWasmUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/embedpdf/pdfium.wasm`
      : "/embedpdf/pdfium.wasm";

  const absolutePdfUrl =
    typeof window !== "undefined" && pdfUrl.startsWith("/")
      ? `${window.location.origin}${pdfUrl}`
      : pdfUrl;

  return (
    <div className={`w-full h-full relative ${className || ""}`}>
      <PDFViewer
        ref={viewerRef}
        config={{
          src: absolutePdfUrl,
          wasmUrl: absoluteWasmUrl,
          tabBar: "never",
          disabledCategories: [
            "annotation",
            "redaction",
            "form",
            "signature",
            "stamp",
          ],
          theme: themeConfig,
        }}
        style={{ width: "100%", height: "100%" }}
        onReady={async (registry) => {
          try {
            // Subscribe to scroll / page events if supported
            const scrollPlugin = registry.getPlugin("scroll") as any;
            if (scrollPlugin && scrollPlugin.onPageChange && onPageChange) {
              scrollPlugin.onPageChange((event: any) => {
                if (event && typeof event.pageIndex === "number") {
                  onPageChange(event.pageIndex + 1, event.totalPages || 100);
                }
              });
            }
          } catch {
            // Non-critical hook setup error
          }
        }}
      />
    </div>
  );
}
