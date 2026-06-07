# LeadPilot v3 — Production Setup Guide

## Firebase Project

**Project ID:** `bamboo-tangent-x8gvj`  
**Firestore Database:** `ai-studio-273467b8-4932-4240-a2e7-945a2e0db12b`  
**Auth Domain:** `bamboo-tangent-x8gvj.firebaseapp.com`

---

## 1. Local Development

```bash
npm install
npm run dev       # starts on http://localhost:3000
```

Environment variables are in `.env`. They already contain the correct
`bamboo-tangent-x8gvj` credentials — no changes needed for local dev.

---

## 2. Deploy Security Rules (Required Before Going Live)

Security rules are in `firestore.rules` and `storage.rules`.  
They are code-complete but **have no effect until deployed**.

```bash
npm install -g firebase-tools
firebase login
firebase use bamboo-tangent-x8gvj
firebase deploy --only firestore:rules,storage
```

To also deploy the built app to Firebase Hosting:

```bash
npm run build
firebase deploy
```

---

## 3. Create the First Super Admin Account

The client app cannot create `super_admin` accounts — the Firestore rules
block it intentionally. You must create it directly in the Firebase Console.

**Steps:**
1. Have your admin person sign in through the app with Google once.
   This creates their Firebase Auth UID.
2. Open [Firebase Console](https://console.firebase.google.com) →
   select project `bamboo-tangent-x8gvj` →
   Firestore Database → `users` collection.
3. Click **+ Add document**. Set the document ID to their Firebase Auth UID
   (found in Authentication → Users → UID column).
4. Add these exact fields:

| Field | Type | Value |
|---|---|---|
| `uid` | string | `<their Firebase Auth UID>` |
| `email` | string | `admin@yourdomain.com` |
| `role` | string | `super_admin` |
| `status` | string | `active` |
| `workspaceId` | string | *(empty string)* |
| `displayName` | string | `Super Administrator` |
| `createdAt` | string | `2026-06-06T00:00:00.000Z` |

5. On their next sign-in the app detects `role: super_admin` and routes
   them directly to the Super Admin dashboard.

---

## 4. Environment Variables Reference

| Variable | Description | Required |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase API key | ✅ |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain | ✅ |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | ✅ |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket | ✅ |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID | ✅ |
| `VITE_FIREBASE_APP_ID` | App ID | ✅ |
| `VITE_FIREBASE_DATABASE_ID` | Named Firestore database ID | ✅ |
| `VITE_DEMO_MODE` | `true` to enable sandbox bypass | optional |

In AI Studio runtime all `VITE_FIREBASE_*` values are auto-injected from
`firebase-applet-config.json`. The `.env` file is used for local dev and
standalone deploys.

---

## 5. Public Lead Capture Forms

Each workspace has a public intake URL:

```
https://your-domain.com/?form=<workspaceId>
```

Submissions go to `workspaces/{workspaceId}/inbound_leads/` and are visible
to workspace owners in the Settings → Inbound Leads section (if implemented).
Unauthenticated writes are allowed by Firestore rule 8 with field validation.

---

## 6. Known Operational Notes

- **Workspace hard-delete** only removes the workspace document and clears
  `workspaceId` from member profiles. Lead subcollections remain in Firestore
  storage. To fully purge, use the Firebase Admin SDK or Firestore Console.
- **Agent invitations** are Firestore-only — no email is sent. The invited
  agent must be told to sign in with their Google account manually.
- **CSV export** uses `Blob + createObjectURL` and supports arbitrarily large
  exports with no browser size limits.
- **File uploads** are capped at 20 MB per file and restricted to images,
  PDFs, Word docs, plain text, and CSV files by `storage.rules`.
