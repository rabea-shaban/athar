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

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const ALLOWED_TYPES = ["app_update", "announcement", "islamic_content", "general"];
const ALLOWED_TOPICS = ["all_users", "announcements", "islamic_content"];
const RESERVED_DATA_KEYS = ["from", "notification", "message_id", "collapse_key"];
const STALE_CAMPAIGN_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Verifies Firebase Auth ID Token and requires decodedToken.admin === true
 */
async function verifyAdminAuthToken(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return { authorized: false, reason: "Missing Bearer authorization token" };
  }

  const idToken = authHeader.split("Bearer ")[1]?.trim();
  if (!idToken) {
    return { authorized: false, reason: "Empty ID token" };
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (decodedToken.admin === true) {
      return { authorized: true, uid: decodedToken.uid };
    }
    return { authorized: false, reason: "Account lacks admin custom claim" };
  } catch (error) {
    return { authorized: false, reason: "Invalid or expired Firebase Auth ID token" };
  }
}

/**
 * Validates and converts payload data object into valid string key-value pairs
 */
function validateAndSanitizeDataPayload(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { valid: true, sanitized: {} };
  }

  const keys = Object.keys(data);
  if (keys.length > 10) {
    return { valid: false, reason: "Data payload exceeds maximum allowed 10 keys" };
  }

  const sanitized = {};
  for (const key of keys) {
    if (RESERVED_DATA_KEYS.includes(key.toLowerCase())) {
      return { valid: false, reason: `Data payload contains reserved key: ${key}` };
    }

    const value = data[key];
    if (typeof value === "object" && value !== null) {
      sanitized[key] = JSON.stringify(value);
    } else if (value !== undefined && value !== null) {
      sanitized[key] = String(value);
    }
  }

  // Ensure total payload size is under 4KB (4096 bytes)
  const jsonStr = JSON.stringify(sanitized);
  if (Buffer.byteLength(jsonStr, "utf8") > 4000) {
    return { valid: false, reason: "Data payload exceeds FCM size limit (4000 bytes)" };
  }

  return { valid: true, sanitized };
}

/**
 * Secure Cloud Function HTTP Endpoint for Admin Publishing
 */
exports.publishNotification = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  // 1. Strict Administrator Authentication & Authorization
  const authResult = await verifyAdminAuthToken(req);
  if (!authResult.authorized) {
    return res.status(403).json({ success: false, message: `Forbidden: ${authResult.reason}` });
  }

  try {
    const { title, body, type, targetAudience, data, idempotencyKey } = req.body;

    // 2. Title and Body Validation
    if (!title || typeof title !== "string" || title.trim().length === 0 || title.length > 120) {
      return res.status(400).json({ success: false, message: "Title must be a non-empty string up to 120 characters" });
    }

    if (!body || typeof body !== "string" || body.trim().length === 0 || body.length > 500) {
      return res.status(400).json({ success: false, message: "Body must be a non-empty string up to 500 characters" });
    }

    // 3. Notification Type Whitelist
    const notificationType = type || "general";
    if (!ALLOWED_TYPES.includes(notificationType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Allowed types: ${ALLOWED_TYPES.join(", ")}`,
      });
    }

    // 4. Topic Whitelist (Rejects invalid target topics instead of silently converting)
    const topic = targetAudience || "all_users";
    if (!ALLOWED_TOPICS.includes(topic)) {
      return res.status(400).json({
        success: false,
        message: `Invalid target topic. Allowed topics: ${ALLOWED_TOPICS.join(", ")}`,
      });
    }

    // 5. Data Payload Validation
    const dataResult = validateAndSanitizeDataPayload(data);
    if (!dataResult.valid) {
      return res.status(400).json({ success: false, message: dataResult.reason });
    }

    // 6. Idempotency Key Validation
    if (idempotencyKey && (typeof idempotencyKey !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(idempotencyKey))) {
      return res.status(400).json({
        success: false,
        message: "Idempotency key must be an alphanumeric string up to 64 characters",
      });
    }

    const campaignId = idempotencyKey ? `campaign_${idempotencyKey}` : `campaign_${Date.now()}`;
    const campaignRef = admin.firestore().collection("notificationCampaigns").doc(campaignId);

    // 7. Atomic Transaction for Campaign Idempotency & Stale Recovery
    let executeSend = false;

    await admin.firestore().runTransaction(async (transaction) => {
      const doc = await transaction.get(campaignRef);

      if (doc.exists) {
        const existingData = doc.data();

        if (existingData.status === "completed") {
          executeSend = false;
          return;
        }

        if (existingData.status === "sending") {
          const createdAt = existingData.createdAt ? existingData.createdAt.toMillis() : 0;
          const isStale = Date.now() - createdAt > STALE_CAMPAIGN_TIMEOUT_MS;

          if (!isStale) {
            throw new Error("CAMPAIGN_IN_PROGRESS");
          }
        }
      }

      transaction.set(
        campaignRef,
        {
          title: title.trim(),
          body: body.trim(),
          type: notificationType,
          targetAudience: topic,
          status: "sending",
          createdBy: authResult.uid,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      executeSend = true;
    });

    if (!executeSend) {
      const existingDoc = await campaignRef.get();
      return res.status(200).json({
        success: true,
        message: "Notification campaign already completed (Idempotent response)",
        campaignId,
        fcmMessageId: existingDoc.data()?.fcmMessageId || null,
      });
    }

    // 8. Send FCM Notification via Admin SDK
    const fcmPayload = {
      notification: {
        title: title.trim(),
        body: body.trim(),
      },
      data: {
        type: notificationType,
        ...dataResult.sanitized,
      },
      topic,
    };

    const response = await admin.messaging().send(fcmPayload);

    await campaignRef.update({
      status: "completed",
      fcmMessageId: response,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({
      success: true,
      message: "Notification published successfully",
      campaignId,
      fcmMessageId: response,
    });
  } catch (error) {
    if (error.message === "CAMPAIGN_IN_PROGRESS") {
      return res.status(409).json({
        success: false,
        message: "Notification campaign is currently in progress",
      });
    }

    functions.logger.error("[PublishNotificationError]", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while publishing the notification",
    });
  }
});

/**
 * Firestore Document Trigger for Sending Notifications on Document Creation
 */
exports.onNotificationCreated = functions.firestore
  .document("notifications/{notificationId}")
  .onCreate(async (snap, context) => {
    const notificationRef = snap.ref;

    try {
      let shouldSend = false;
      let notificationData = null;

      // Atomic Transaction for Idempotency
      await admin.firestore().runTransaction(async (transaction) => {
        const doc = await transaction.get(notificationRef);
        if (!doc.exists) return;

        notificationData = doc.data();
        if (
          notificationData.status === "sent" ||
          notificationData.status === "processing" ||
          notificationData.status === "failed"
        ) {
          return;
        }

        transaction.update(notificationRef, { status: "processing" });
        shouldSend = true;
      });

      if (!shouldSend || !notificationData) return;

      // Strict Document Payload & Topic Validation (Stop processing immediately if invalid!)
      if (
        !notificationData.title ||
        typeof notificationData.title !== "string" ||
        !notificationData.body ||
        typeof notificationData.body !== "string"
      ) {
        await notificationRef.update({
          status: "failed",
          error: "Invalid document payload: Title and body must be non-empty strings",
        });
        return;
      }

      if (
        notificationData.targetAudience &&
        !ALLOWED_TOPICS.includes(notificationData.targetAudience)
      ) {
        await notificationRef.update({
          status: "failed",
          error: `Invalid target topic: ${notificationData.targetAudience}`,
        });
        return;
      }

      const topic = notificationData.targetAudience || "all_users";
      const notificationType = ALLOWED_TYPES.includes(notificationData.type)
        ? notificationData.type
        : "general";

      const dataResult = validateAndSanitizeDataPayload(notificationData.data);
      if (!dataResult.valid) {
        await notificationRef.update({
          status: "failed",
          error: dataResult.reason,
        });
        return;
      }

      const fcmPayload = {
        notification: {
          title: notificationData.title.trim().slice(0, 120),
          body: notificationData.body.trim().slice(0, 500),
        },
        data: {
          type: notificationType,
          ...dataResult.sanitized,
        },
        topic,
      };

      const response = await admin.messaging().send(fcmPayload);

      await notificationRef.update({
        status: "sent",
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        fcmMessageId: response,
      });
    } catch (e) {
      functions.logger.error("[NotificationTriggerError]", e);
      await notificationRef.update({
        status: "failed",
        error: "FCM delivery failed",
      });
    }
  });
