# DARE ARQAM School System - Firestore Security Rules Documentation

## Overview
This document specifies the Firestore Security Rules (`firestore.rules`) deployed to the Cloud Firestore project.

---

## Declarative Security Rules (`firestore.rules`)

```solidity
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Global Authentication & Authorization Primitives
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    function hasNoPassword() {
      return !('password' in request.resource.data) && !('passwordHash' in request.resource.data);
    }

    function isAdmin() {
      return isSignedIn() && (
        request.auth.token.email in [
          'darearqam@mardan.com',
          'hasnainbuilds724656@gmail.com',
          'hasnainqadir724657@gmail.com',
          'hasnainqadir627694@gmail.com',
          'admin@darearqam.com',
          'principal@darearqam.com'
        ] ||
        (exists(/databases/$(database)/documents/admins/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.status != 'inactive') ||
        (exists(/databases/$(database)/documents/adminUsers/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/adminUsers/$(request.auth.uid)).data.status != 'inactive')
      );
    }

    // System & Backend Health Diagnostics (Public write/read for health checks)
    match /system/{docId} {
      allow read, write: if true;
    }

    // 1. Official Notices & Circulars (Publicly readable; Directorate managed)
    match /notices/{noticeId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 2. Examination Results (Publicly readable; Controller managed)
    match /results/{resultId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 3. Student Profiles (STRICT USER DATA ISOLATION: Owner Student or Admin ONLY)
    match /students/{studentDocId} {
      allow read: if isSignedIn() && (isOwner(studentDocId) || isAdmin());
      allow create: if isSignedIn() && (isOwner(studentDocId) || isAdmin()) && hasNoPassword();
      allow update: if (
        (isOwner(studentDocId) &&
         request.resource.data.uid == resource.data.uid &&
         !request.resource.data.diff(resource.data).affectedKeys().hasAny(['rollNumber', 'className', 'studentId', 'uid', 'status', 'role', 'isAdmin', 'permissions'])) ||
        isAdmin()
      ) && hasNoPassword();
      allow delete: if isAdmin();
    }

    // 4. Admission Applications (Public submit; Owner applicant or Admin read)
    match /admissions_applications/{appId} {
      allow create: if true && hasNoPassword();
      allow read: if isAdmin() || (isSignedIn() && resource.data.applicantUid == request.auth.uid);
      allow update, delete: if isAdmin();
    }

    // 5. Public Contact Inquiries (Public submit; Owner sender or Admin read)
    match /inquiries/{inquiryDocId} {
      allow create: if true && hasNoPassword();
      allow read: if isAdmin() || (isSignedIn() && resource.data.senderUid == request.auth.uid);
      allow update, delete: if isAdmin();
    }

    // 6. Events & Downloads (Public read; Admin write)
    match /events/{eventId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /documents/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 7. System Settings & Branding (Public read; Admin write)
    match /settings/{settingId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /pages/{pageId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 8. Gallery Slides (Public read; Admin write)
    match /gallery_slides/{slideId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 9. ID Card Templates (Public read; Admin write)
    match /idCardTemplates/{templateId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 10. Administrative User Roles & Audit Logs (Protected)
    match /admins/{adminId} {
      allow read: if isSignedIn() && (request.auth.uid == adminId || isAdmin());
      allow write: if isAdmin();
    }
    match /adminLogs/{logId} {
      allow read, write: if isAdmin();
    }
  }
}
```
