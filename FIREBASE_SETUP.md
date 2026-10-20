# Firebase Push Notifications & Cloud Functions Deployment Guide for ATHAR (أَثَر)

This guide walks through configuring Firebase Cloud Messaging (FCM), Firebase Cloud Functions, and Firestore for sending Push Notifications and App Updates to ATHAR users.

---

## 1. Firebase Project Registration Details

- **Project ID**: `athar-41738`
- **Project Number / Sender ID**: `878291673178`
- **Android Package Name**: `com.athar.islamic`
- **App Nickname**: `ATHAR Android`
- **Config File Location**: `google-services.json` & `android/app/google-services.json`

---

## 2. Deploying Firestore Security Rules

1. Install Firebase CLI if not already installed:
   ```bash
   npm install -g firebase-tools
   ```
2. Login to Firebase:
   ```bash
   firebase login
   ```
3. Link local project to `athar-41738`:
   ```bash
   firebase use --add athar-41738
   ```
4. Deploy Firestore Security Rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## 3. Deploying Firebase Cloud Functions

> [!IMPORTANT]
> Deploying Node.js Cloud Functions requires upgrading Firebase project `athar-41738` from Spark (Free) plan to **Blaze (Pay-as-you-go)** plan in the Firebase Console.

1. Upgrade project plan to Blaze in [Firebase Console Billing](https://console.firebase.google.com/project/athar-41738/usage/details).
2. Navigate to the functions directory:
   ```bash
   cd functions
   npm install
   ```
3. Deploy Cloud Functions:
   ```bash
   firebase deploy --only functions
   ```

---

## 4. Setting Administrator Custom Claims

To allow an administrator user to publish notifications using their Firebase Auth ID Token:
Run a Node.js script using Firebase Admin SDK:
```javascript
const admin = require('firebase-admin');
admin.initializeApp();
admin.auth().setCustomUserClaims('ADMIN_USER_UID', { admin: true });
```

---

## 5. Sending Announcement or App Update Notifications

### Option A: Via HTTP Cloud Function Endpoint (`publishNotification`)
Send a POST request to:
`https://us-central1-athar-41738.cloudfunctions.net/publishNotification`

Header:
`Authorization: Bearer <ADMIN_FIREBASE_ID_TOKEN>`

Body Example (App Update):
```json
{
  "title": "تحديث جديد لتطبيق أَثَر 🌙",
  "body": "أطلقنا إصدارًا جديدًا يتضمن تحسينات وميزات جديدة. حدّث التطبيق الآن واستمتع بالمميزات.",
  "type": "app_update",
  "targetAudience": "all_users",
  "data": {
    "version": "1.1.0",
    "minimumVersion": "1.0.0",
    "storeUrl": "https://rabea-shaban.com/athar",
    "forceUpdate": false,
    "releaseNotes": "تحسينات جديدة على محرك الأذان وسرعة الاستجابة."
  }
}
```

### Option B: Via Firebase Console Messaging UI
1. Open [Firebase Console Messaging](https://console.firebase.google.com/project/athar-41738/notification).
2. Click **Create campaign -> Firebase Notification messages**.
3. Set Title, Text, Target Topic (`all_users`), and Custom Data keys (`type`, `version`, `storeUrl`).
4. Click **Publish**.
