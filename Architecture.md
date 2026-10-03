# DARE ARQAM School System - Security & Authorization Architecture

## Overview
This document details the multi-tier role-based access control (RBAC), authentication, route guarding, and database security architecture implemented across the DARE ARQAM web application.

---

## 1. Authentication Layer (Firebase Auth)

- **Identity Engine**: Uses Firebase Authentication (`getAuth()`) as the sole authoritative source of user session identity.
- **Session Persistence**: Firebase Auth manages encrypted token restoration on client load (`onAuthStateChanged`). No raw passwords, mock tokens, or localStorage flags are trusted for authorization.
- **Session Lifecycle**:
  - **Login**: Handled via `adminLoginWithFirebase(email, password)` / `signInWithEmailAndPassword`.
  - **Logout**: Triggers `signOut(auth)`, revoking client session tokens and clearing route access immediately.

---

## 2. Authorization Layer (Firestore `admins/{uid}`)

Authentication alone does **not** grant administrative access. A secondary authorization check is strictly enforced:

### Schema: `admins/{uid}`
```json
{
  "uid": "USER_FIREBASE_AUTH_UID",
  "email": "admin@darearqam.com",
  "role": "super_admin",
  "status": "active",
  "createdAt": "ISO_TIMESTAMP",
  "updatedAt": "ISO_TIMESTAMP"
}
```

### Authorization Flow
1. User authenticates via Firebase Auth.
2. System queries Firestore document `admins/{user.uid}`.
3. System verifies `status === 'active'` and role permissions.
4. If the record does not exist or `status !== 'active'`, access to admin routes is denied immediately and the session is isolated.

---

## 3. Route Guarding (`AdminRouteGuard`)

Centralized React Route Guard (`/src/components/AdminRouteGuard.tsx`) protects every admin-only endpoint:

- `/admin`
- `/admin/dashboard`
- `/admin/students`
- `/admin/classes`
- `/admin/admissions`
- `/admin/notices`
- `/admin/events`
- `/admin/gallery`
- `/admin/attendance`
- `/admin/results`
- `/admin/documents`
- `/admin/id-card-templates`
- `/admin/academic`
- `/admin/settings`
- `/super-admin-dashboard`

### Guard Logic Sequence
1. **Restoration Check**: While Firebase Auth restores state (`authLoading`), renders a loading skeleton (`ViewLoadingSkeleton`).
2. **Unauthenticated Access**: Direct URL access or page refresh by unauthenticated visitors renders a secure lock screen with a direct login trigger.
3. **Unauthorized User**: Authenticated non-admin accounts (e.g., standard students) are blocked with a clean "Access Denied" view and forced sign-out option.
4. **Authorized Admin**: Validated active admins render the protected Admin Console.

---

## 4. Backend Database Enforcement (Firestore Security Rules)

Client-side guards are backed by declarative Firestore Security Rules (`firestore.rules`). Direct REST API calls or custom SDK scripts attempting unauthorized access are rejected at the database level with `PERMISSION_DENIED`.

## 5. Express Server-Side API Endpoint Authorization

All sensitive backend endpoints (`server.ts`) enforce server-side token validation:

- **Token Inspection**: Parses incoming `Authorization: Bearer <idToken>` headers.
- **Verification**: Evaluates user identity and role against `AUTHORIZED_ADMIN_EMAILS` server-side before executing privileged operations.
- **Protected Endpoints**:
  - `/api/cloudinary/delete` → Requires active admin Bearer token (returns `403 Forbidden` if unauthorized).
  - `/api/cloudinary/upload` → Requires valid authenticated user Bearer token.
  - `/api/branding/logo` / `/api/branding/save-logo` → Requires active admin Bearer token.
  - `/api/students` (GET list all) → Requires active admin Bearer token.
## 6. Strict User-Data Isolation

User-data privacy is enforced across the database, client services, and API layers:

- **Authoritative Identity**: The authenticated Firebase Auth UID (`request.auth.uid`) is used as the sole source of identity. Client-supplied UIDs in URL parameters or request bodies are ignored or validated against `auth.currentUser.uid`.
- **Private Student Data**: Student profiles (`students/{uid}`) and attendance records (`attendance/{docId}`) are strictly isolated to the owning student or authorized administrators.
- **IDOR Protection**: Tampering with document IDs or URL paths (e.g. `/student/OTHER_UID`) is rejected at the database level by Firestore Security Rules (`allow read: if isSignedIn() && (isOwner(studentDocId) || isAdmin())`).
## 7. Server-Side Secret Management & Zero Client Secret Exposure

- **Zero Client Secret Exposure**: Private secrets (`CLOUDINARY_API_SECRET`, service account credentials, database passwords) are stored exclusively in the server environment (`process.env`). They are never exposed in frontend source code, client environment variables (`VITE_*`), or client-side bundles.
- **Public Client Configuration**: Only standard public client configuration (`firebase-applet-config.json` containing Web API keys, auth domains, and public Cloudinary upload presets) is provided to the client bundle.
- **Server API Proxying**: All privileged operations requiring API secrets (such as Cloudinary asset deletion or server static branding writes) are proxied through authenticated server endpoints (`server.ts`).
- **Log Sanitation**: Sensitive tokens, passwords, and authorization headers are omitted from client and server logs.
- **Git Security**: Private environment files (`.env*`) and key files (`service-account*.json`, `*.pem`, `*.key`) are excluded from tracking via `.gitignore`.



