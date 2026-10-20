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

export type FcmNotificationType =
  | "app_update"
  | "announcement"
  | "islamic_content"
  | "general";

export interface AppUpdateData {
  type: "app_update";
  version: string;
  minimumVersion?: string;
  storeUrl?: string;
  forceUpdate?: boolean;
  releaseNotes?: string;
}

export interface AnnouncementData {
  type: "announcement" | "general";
  title: string;
  body: string;
  imageUrl?: string;
  targetRoute?: string;
}

export interface IslamicContentData {
  type: "islamic_content";
  title: string;
  body: string;
  contentId?: string;
  contentType?: "article" | "book" | "lecture" | "dhikr";
  targetRoute?: string;
}

export type FcmNotificationPayloadData =
  | AppUpdateData
  | AnnouncementData
  | IslamicContentData;

export interface UserPushPreferences {
  appUpdatesEnabled: boolean;
  announcementsEnabled: boolean;
  islamicContentEnabled: boolean;
}

export interface DeviceTokenRecord {
  tokenId: string;
  token: string;
  platform: "android" | "ios";
  appVersion: string;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}
