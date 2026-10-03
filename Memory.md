# DARE ARQAM Project Memory & Established Decisions

## 1. Institutional Identity
- **Project Name**: DARE ARQAM (Katlang Campus)
- **Tagline**: Excellence in Islamic Character & Modern Academic Education
- **Established Year**: 1998
- **Affiliation**: Recognized by BISE (Board of Intermediate & Secondary Education)

---

## 2. Core Architecture Decisions

### A. Firebase Cloud Backend
- **Project ID**: `dare-arqam-a9d8e`
- **Auth Domain**: `dare-arqam-a9d8e.firebaseapp.com`
- **Storage Bucket**: `dare-arqam-a9d8e.firebasestorage.app`
- **Single Source of Truth**: All dynamic portal content (branding, hero banners, principal portraits, circulars, gallery items, student records, ID card templates) is persisted in Firestore and Firebase Storage.
- **Multi-Device Real-Time Sync**: Firestore `onSnapshot` listeners ensure instant synchronization across all connected visitor and administrator devices without manual builds.

### B. Visual Design Constitution
- **Theme**: Classic Royal Institutional Heraldry with Modern Golden Neon Illumination.
- **Palette**: Royal Navy (`#171852`, `#10113D`, `#20216B`) accented by Rich Metallic Gold (`#FFF000`, `#F5D900`, `#D4AF37`) and clean parchment backgrounds (`#F8FAFC`).
- **Heraldic Ornamentation**: Symmetrical round crest framing, Urdu calligraphy motto ("بہترین آخرت" and "خوبصورت دنیا"), double-line gold borders, and dignified serif typography.
- **Icon Language**: One-word, high-contrast action buttons and navigation tiles paired with Lucide React icons.
- **Neon Accents**: Golden glowing halos placed on the central institutional emblem, primary call-to-action buttons, and the Principal's Address card.

### C. Deep Linking & URL Routing
- **Routing Paradigm**: HTML5 History API client-side routing via `/src/services/routerService.ts`.
- **Clean URLs**: Clean canonical paths (e.g. `/`, `/login`, `/register`, `/admissions`, `/academics`, `/student-portal`, `/results`, `/gallery`, `/events`, `/notices`, `/contact`, `/verify-student`).
- **Browser History**: Full support for Back/Forward navigation on mobile and desktop without page reloads.
- **Production SPA Fallback**: Express server (`server.ts`) returns `index.html` for all valid frontend paths to support direct URL entries and page refreshes.

### D. Student ID Card & Permanent QR System
- **Dual-Sided Templates**: Front and Back configurable canvas templates (`id_card_templates`) supporting customized element coordinates $(x, y, w, h)$, font styles, colors, and visibility.
- **Cryptographic QR Tokens**: Tokens are generated with `dast_` prefixes, encoding zero student PII directly in the QR string.
- **Deep-Link Verification**: Tokens link directly to `/verify-student?token=dast_...` which queries the indexed `qr_tokens/{tokenId}` Firestore collection and server `/api/students/verify-qr/:tokenId` for instantaneous status resolution (`active` | `revoked`).
- **Resilient Multi-Store Persistence**:
  - Student registration immediately authenticates via Firebase Auth.
  - Profile dossier writes to Firestore `students/{uid}` and is backed up to server `/api/students/profile` (`data/students.json`).
  - Seamlessly handles existing accounts without crashing and syncs immediately to Admin Classes and the Student Portal.
- **E-Attendance Readiness**: Token architecture is structured for automated gate-scanner integration, daily logging (`attendance_records`), and fast entry verification.

### E. Directorate Admin Panel
- **Purpose**: Comprehensive executive control center for school administration.
- **Modules**:
  1. **Branding Manager**: Logo, favicon, campus cover banner, leadership portraits, and social media settings.
  2. **ID Card Template Manager**: Live canvas editor for Front and Back institutional ID cards.
  3. **Class & Section Manager**: Class enrollment, fee configuration, and subject allocations.
  4. **Homepage Gallery Manager**: Multi-image batch upload with Firebase Storage integration.
  5. **Notice Board & Results Publisher**: Circular distribution and examination gazette management.

### F. Student Portal
- **Purpose**: Dedicated portal for registered students and parents.
- **Features**: Real-time attendance percentage, academic examination transcripts, digital dual-sided ID card access, and personalized school notifications.

### G. Media & Storage Architecture
- **Firebase Storage**: Primary storage engine for uploaded images, circular PDFs, and templates.
- **Cloudinary Server Proxy**: Configured in `server.ts` with server-side secrets (`ehc1fewm`) for optimized CDN redundancy and media transformations.
- **Multi-Target Disk Sync**: Server-side disk caching updates `public/branding/logo.png`, `public/favicon.png`, and `public/og-image.png` whenever the administrator updates the institutional logo.

---

## 3. Maintenance Protocol
1. Read `Architecture.md` to understand system architecture.
2. Follow `Rules.md` for quality and security rules.
3. Consult `Memory.md` to preserve existing design choices and technical decisions.
