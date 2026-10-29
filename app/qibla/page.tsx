"use client";

import { useState, useEffect } from "react";
import Container from "@/components/layout/Container";
import PageHero from "@/components/layout/PageHero";
import { Compass, Navigation, MapPin, CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QiblaPage() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [qiblaDegree, setQiblaDegree] = useState<number | null>(null);
  const [compassHeading, setCompassHeading] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Kaaba Location: 21.4225° N, 39.8262° E
  const KAABA_LAT = 21.4225;
  const KAABA_LNG = 39.8262;

  useEffect(() => {
    handleGetLocation();
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg("متصفحك لا يدعم تحديد الموقع الجغرافي");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        calculateQibla(latitude, longitude);
      },
      (err) => {
        setErrorMsg("تعذر تحديد الموقع الجغرافي. يرجى السماح بالموقع لتحديد اتجاه القبلة.");
      }
    );
  };

  const calculateQibla = (lat: number, lng: number) => {
    const phiK = (KAABA_LAT * Math.PI) / 180;
    const lambdaK = (KAABA_LNG * Math.PI) / 180;
    const phi = (lat * Math.PI) / 180;
    const lambda = (lng * Math.PI) / 180;

    const q =
      (180 / Math.PI) *
      Math.atan2(
        Math.sin(lambdaK - lambda),
        Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda)
      );

    const degree = (q + 360) % 360;
    setQiblaDegree(Math.round(degree));
  };

  return (
    <div className="min-h-screen pb-20 space-y-8 text-right" dir="rtl">
      {/* ─── Unified Luxury Islamic PageHero ─── */}
      <PageHero
        breadcrumbs={[
          { label: "الرئيسية", href: "/" },
          { label: "اتجاه القبلة" },
        ]}
        title="تحديد اتجاه القبلة المشرفة"
        subtitle="بوصلة إلكترونية حية لحساب اتجاه القبلة نحو الكعبة المشرفة بمكة المكرمة بدقة فائقة من أي مكان في العالم."
        badges={[
          { label: "حساب جغرافي دقيق للكعبة المشرفة", icon: Compass, variant: "emerald" },
          { label: qiblaDegree !== null ? `${qiblaDegree}° عن الشمال الجغرافي` : "مكة المكرمة", icon: Navigation, variant: "gold" },
          { label: "تحديد الموقع الحي GPS", icon: MapPin, variant: "default" },
        ]}
        theme="emerald"
      />

      <Container size="xl" className="space-y-8">

      {/* Compass UI */}
      <div className="max-w-md mx-auto p-8 rounded-3xl bg-card border border-border/80 shadow-xs text-center space-y-6">
        <div className="relative w-64 h-64 mx-auto rounded-full border-4 border-primary/20 flex items-center justify-center bg-muted/20">
          {/* Compass Rose */}
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center transition-transform duration-300"
            style={{
              transform: `rotate(${qiblaDegree || 0}deg)`,
            }}
          >
            <div className="absolute top-2 text-xs font-bold text-[var(--athar-green)] font-arabic flex flex-col items-center">
              <span>🕋 الكعبة</span>
              <div className="w-2 h-2 rounded-full bg-[var(--athar-green)] mt-1" />
            </div>
            <Navigation className="w-16 h-16 text-[var(--athar-green)] transform -rotate-45" />
          </div>
        </div>

        {qiblaDegree !== null ? (
          <div className="space-y-1">
            <p className="text-2xl font-bold font-sans text-primary">{qiblaDegree}°</p>
            <p className="text-xs text-muted-foreground font-arabic">
              درجة الانحراف عن الشمال الجغرافي نحو مكة المكرمة
            </p>
          </div>
        ) : errorMsg ? (
          <p className="text-xs text-destructive font-arabic">{errorMsg}</p>
        ) : (
          <p className="text-xs text-muted-foreground font-arabic">جاري تحديد الموقع وحساب القبلة...</p>
        )}

        <Button onClick={handleGetLocation} variant="outline" className="font-arabic text-xs gap-2">
          <RotateCcw className="w-3.5 h-3.5" />
          <span>إعادة تحديث الموقع</span>
        </Button>
      </div>
    </Container>
    </div>
  );
}
