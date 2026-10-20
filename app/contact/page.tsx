"use client";

import { useState } from "react";
import Container from "@/components/layout/Container";
import { Mail, MessageSquare, Send, CheckCircle2, Globe, Heart, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: "استفسار",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <Container size="xl" className="py-10 space-y-10">
      {/* Page Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold font-arabic text-foreground">
          تواصل مع إدارة <span className="text-[var(--athar-green)]">أَثَر</span>
        </h1>
        <p className="text-muted-foreground font-arabic text-sm leading-relaxed">
          يسعدنا استقبال آرائكم، اقتراحاتكم، بلاغات تصحيح الأخطاء، أو استفساراتكم العلمية.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {/* Contact Information Cards */}
        <div className="space-y-4 lg:col-span-1">
          <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm font-arabic">البريد الإلكتروني المباشر</h3>
            <p className="text-xs text-muted-foreground font-sans dir-ltr text-right">
              rabea.elzayate@gmail.com
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm font-arabic">الموقع الرسمي للمطور</h3>
            <a
              href="https://www.rabea-shaban.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline font-sans dir-ltr block text-right"
            >
              www.rabea-shaban.com
            </a>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--athar-green)]/15 text-[var(--athar-green)] flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm font-arabic">المساهمة والاقتراحات</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-arabic">
              نرحب بملاحظاتكم القيمة لتطوير وتحسين تجربة القرآن والأذكار والمستندات الإسلامية.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[var(--athar-green)]/15 text-[var(--athar-green)] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-arabic">تم استلام رسالتكم بنجاح</h3>
              <p className="text-sm text-muted-foreground font-arabic max-w-md mx-auto leading-relaxed">
                شكراً لتواصلك معنا وحرصك على منصة أَثَر. سنقوم بمراجعة الرسالة والرد في أقرب وقت.
              </p>
              <Button
                variant="outline"
                className="mt-4 font-arabic"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: "", email: "", type: "استفسار", message: "" });
                }}
              >
                إرسال رسالة أخرى
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold font-arabic text-foreground">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  placeholder="أدخل اسمك الكريم"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/70 text-sm font-arabic focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold font-arabic text-foreground">البريد الإلكتروني</label>
                <input
                  type="email"
                  required
                  placeholder="example@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/70 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold font-arabic text-foreground">نوع الرسالة</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/70 text-sm font-arabic focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                >
                  <option value="استفسار">استفسار عام</option>
                  <option value="اقتراح">اقتراح تطوير ميزة</option>
                  <option value="تصحيح">بلاغ عن تصحيح خطأ مطبعي</option>
                  <option value="أخرى">موضوع آخر</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold font-arabic text-foreground">نص الرسالة</label>
                <textarea
                  required
                  rows={5}
                  placeholder="اكتب رسالتك أو ملاحظتك هنا..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border/70 text-sm font-arabic focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
                />
              </div>

              <Button type="submit" className="w-full font-arabic py-6 text-sm font-bold gap-2">
                <Send className="w-4 h-4" />
                <span>إرسال الرسالة الآن</span>
              </Button>
            </form>
          )}
        </div>
      </div>
    </Container>
  );
}
