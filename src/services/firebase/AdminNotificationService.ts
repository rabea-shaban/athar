/**
 * ATHAR — أَثَر
 * Islamic Knowledge & Guidance Platform
 *
 * Copyright (c) 2026 Rabea Shaban.
 * All rights reserved.
 *
 * Contact: rabea.elzayate@gmail.com
 * Website: https://rabea-shaban.com/
 */

import { FcmNotificationType, FcmNotificationPayloadData } from "../../types/fcm";

export interface PublishNotificationParams {
  title: string;
  body: string;
  type: FcmNotificationType;
  targetAudience?: "all_users" | "announcements" | "islamic_content";
  data?: FcmNotificationPayloadData;
  idToken: string;
  idempotencyKey?: string;
}

export class AdminNotificationService {
  private static functionEndpoint =
    "https://us-central1-athar-41738.cloudfunctions.net/publishNotification";

  static async publishAnnouncement(params: PublishNotificationParams): Promise<{
    success: boolean;
    message: string;
  }> {
    if (!params.idToken || typeof params.idToken !== "string") {
      return {
        success: false,
        message: "تتطلب عملية النشر تسجيل الدخول بحساب مسؤول مصرح له (ID Token)",
      };
    }

    try {
      const response = await fetch(this.functionEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${params.idToken}`,
        },
        body: JSON.stringify({
          title: params.title,
          body: params.body,
          type: params.type,
          targetAudience: params.targetAudience || "all_users",
          data: params.data || {},
          idempotencyKey: params.idempotencyKey,
        }),
      });

      const result = await response.json();
      return {
        success: response.ok && result.success,
        message: result.message || (response.ok ? "تم نشر التنبيه بنجاح" : "تعذر نشر التنبيه"),
      };
    } catch (e: any) {
      console.warn("[AdminNotification] Publish error:", e);
      return {
        success: false,
        message: e?.message || "تعذر الاتصال بخادم التنبيهات",
      };
    }
  }
}
