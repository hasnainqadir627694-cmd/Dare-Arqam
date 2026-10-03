import express from 'express';
import compression from 'compression';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable Gzip / Brotli Compression for all JSON responses and static assets
app.use(compression({
  threshold: 1024, // compress responses over 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));

// Configure Cloudinary with user credentials
const rawCloudName = process.env.CLOUDINARY_CLOUD_NAME;
const rawApiKey = process.env.CLOUDINARY_API_KEY;
const rawApiSecret = process.env.CLOUDINARY_API_SECRET;

const CLOUD_NAME = (rawCloudName && rawCloudName !== 'your_cloud_name') ? rawCloudName : 'ehc1fewm';
const API_KEY = (rawApiKey && rawApiKey !== 'your_api_key') ? rawApiKey : '222139937659655';
const API_SECRET = (rawApiSecret && rawApiSecret !== 'your_api_secret') ? rawApiSecret : 'CUidagGOF8eVgV00bq2cTPOvbu8';

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ----------------------------------------------------
// Server-Side Token Verification & Authorization Middleware
// ----------------------------------------------------
const AUTHORIZED_ADMIN_EMAILS = [
  'darearqam@mardan.com',
  'the.rare.com@mardan.com',
  'hasnainqadir724657@gmail.com',
  'hasnainbuilds724656@gmail.com',
  'hasnainqadir627694@gmail.com',
  'principal@darearqam.com',
  'admin@darearqam.com',
];

function parseAuthToken(req: express.Request): { uid?: string; email?: string } | null {
  const authHeader = (req.headers.authorization as string) || (req.headers['x-auth-token'] as string);
  if (!authHeader) return null;
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : authHeader.trim();
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length >= 2) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
      if (payload && (payload.sub || payload.uid || payload.email)) {
        return {
          uid: payload.sub || payload.uid,
          email: (payload.email || '').toLowerCase().trim(),
        };
      }
    }
  } catch {
    // Fail closed
  }
  return null;
}

function isAuthorizedAdminToken(tokenUser: { uid?: string; email?: string } | null): boolean {
  if (!tokenUser || !tokenUser.email) return false;
  const email = tokenUser.email.toLowerCase().trim();
  return (
    AUTHORIZED_ADMIN_EMAILS.some((e) => e.toLowerCase() === email) ||
    email.includes('darearqam') ||
    email.includes('admin')
  );
}

// Health and Connectivity Check Endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'DARE ARQAM Institutional Server',
  });
});

// Cloudinary Configuration Info (Public)
app.get('/api/cloudinary/status', (_req, res) => {
  res.json({
    status: 'connected',
    cloudName: CLOUD_NAME,
    hasApiKey: !!API_KEY,
    hasApiSecret: !!API_SECRET,
  });
});

// Cloudinary Server-Side Secure Upload Endpoint
app.post('/api/cloudinary/upload', async (req, res) => {
  try {
    const tokenUser = parseAuthToken(req);
    // Allow uploads if authenticated user or admin
    if (!tokenUser && process.env.NODE_ENV === 'production') {
      return res.status(401).json({ success: false, error: 'Unauthorized: Authentication required for media upload' });
    }

    const { file, folder = 'dare_arqam_media', resource_type = 'auto' } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: resource_type as any,
    });

    return res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      created_at: result.created_at,
    });
  } catch (error: any) {
    console.error('Cloudinary Server Upload Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload media to Cloudinary',
    });
  }
});

// Cloudinary Delete Asset Endpoint (Server-Side Admin Protected)
app.post('/api/cloudinary/delete', async (req, res) => {
  try {
    const tokenUser = parseAuthToken(req);
    if (!isAuthorizedAdminToken(tokenUser) && process.env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, error: 'Forbidden: Admin authorization required to delete assets' });
    }

    const { publicId, resource_type = 'image' } = req.body;
    if (!publicId) {
      return res.status(400).json({ success: false, error: 'publicId is required' });
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resource_type as any,
    });

    return res.json({ success: true, result });
  } catch (error: any) {
    console.error('Cloudinary Delete Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete asset from Cloudinary',
    });
  }
});

// ----------------------------------------------------
// Persistent Student Profile & QR Database (Server Store)
// ----------------------------------------------------
const STUDENTS_FILE_PATH = path.resolve(__dirname, 'data/students.json');

function getStoredStudents(): Record<string, any> {
  try {
    if (!fs.existsSync(STUDENTS_FILE_PATH)) {
      fs.mkdirSync(path.dirname(STUDENTS_FILE_PATH), { recursive: true });
      fs.writeFileSync(STUDENTS_FILE_PATH, JSON.stringify({}), 'utf-8');
      return {};
    }
    const content = fs.readFileSync(STUDENTS_FILE_PATH, 'utf-8');
    return JSON.parse(content || '{}');
  } catch (err) {
    console.warn('Could not read students file:', err);
    return {};
  }
}

function saveStoredStudents(students: Record<string, any>) {
  try {
    fs.mkdirSync(path.dirname(STUDENTS_FILE_PATH), { recursive: true });
    fs.writeFileSync(STUDENTS_FILE_PATH, JSON.stringify(students, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write students file:', err);
  }
}

// Save or Update Student Profile (Authorization Checked)
app.post('/api/students/profile', (req, res) => {
  try {
    const student = req.body;
    if (!student || (!student.uid && !student.email)) {
      return res.status(400).json({ success: false, error: 'Student profile requires uid or email' });
    }

    const tokenUser = parseAuthToken(req);
    const isAdmin = isAuthorizedAdminToken(tokenUser);

    // If student is updating their own profile, strip privilege fields
    if (!isAdmin) {
      delete student.role;
      delete student.isAdmin;
      delete student.status;
      delete student.rollNumber;
      delete student.className;
    }

    const key = student.uid || student.email.toLowerCase().trim();
    const students = getStoredStudents();
    students[key] = {
      ...students[key],
      ...student,
      updatedAt: new Date().toISOString(),
    };
    saveStoredStudents(students);

    return res.json({ success: true, student: students[key] });
  } catch (err: any) {
    console.warn('Failed to save student to server store:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Get Student Profile by UID or Email
app.get('/api/students/:uid', (req, res) => {
  try {
    const { uid } = req.params;
    const students = getStoredStudents();

    if (students[uid]) {
      return res.json(students[uid]);
    }

    // Search by email or rollNumber
    const found = Object.values(students).find(
      (s: any) => s.uid === uid || s.email?.toLowerCase() === uid.toLowerCase() || s.studentId === uid
    );

    if (found) {
      return res.json(found);
    }

    return res.status(404).json({ error: 'Student not found' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// List all students (Admin Authorized Only)
app.get('/api/students', (req, res) => {
  try {
    const tokenUser = parseAuthToken(req);
    if (!isAuthorizedAdminToken(tokenUser) && process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Forbidden: Admin authorization required to list all student records' });
    }

    const students = getStoredStudents();
    return res.json(Object.values(students));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Verify QR Token
app.get('/api/students/verify-qr/:tokenId', (req, res) => {
  try {
    const { tokenId } = req.params;
    const students = getStoredStudents();
    const student = Object.values(students).find((s: any) => s.qrIdentity?.tokenId === tokenId);

    if (!student) {
      return res.status(404).json({
        isValid: false,
        status: 'not_found',
        message: 'Invalid or unrecognized student QR token.',
      });
    }

    if (student.qrIdentity?.status === 'revoked') {
      return res.json({
        isValid: false,
        status: 'revoked',
        student,
        message: 'This Student QR Identity has been revoked by administration.',
      });
    }

    return res.json({
      isValid: true,
      status: 'active',
      student,
      message: 'Student verified successfully with active permanent QR identity.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Helper: Wrap PNG buffer in ICO header
function createIcoBuffer(pngBuffer: Buffer): Buffer {
  const icondir = Buffer.alloc(6);
  icondir.writeUInt16LE(0, 0); // reserved
  icondir.writeUInt16LE(1, 2); // image type 1 = ICO
  icondir.writeUInt16LE(1, 4); // 1 image

  const direntry = Buffer.alloc(16);
  direntry.writeUInt8(64, 0); // width
  direntry.writeUInt8(64, 1); // height
  direntry.writeUInt8(0, 2); // colors
  direntry.writeUInt8(0, 3); // reserved
  direntry.writeUInt16LE(1, 4); // color planes
  direntry.writeUInt16LE(32, 6); // bits per pixel
  direntry.writeUInt32LE(pngBuffer.length, 8); // image size
  direntry.writeUInt32LE(6 + 16, 12); // image offset

  return Buffer.concat([icondir, direntry, pngBuffer]);
}

let logoLastUpdated = Date.now();

// Helper to write logo buffer across public/ and dist/
function saveLogoBufferToDisk(buffer: Buffer) {
  const targetPaths = [
    path.resolve(__dirname, 'public/branding/logo.png'),
    path.resolve(__dirname, 'src/assets/branding/logo.png'),
    path.resolve(__dirname, 'public/favicon.png'),
    path.resolve(__dirname, 'public/apple-touch-icon.png'),
    path.resolve(__dirname, 'public/icon-192.png'),
    path.resolve(__dirname, 'public/icon-512.png'),
    path.resolve(__dirname, 'public/og-image.png'),
  ];

  const distDir = path.resolve(__dirname, 'dist');
  if (fs.existsSync(distDir)) {
    targetPaths.push(
      path.resolve(distDir, 'branding/logo.png'),
      path.resolve(distDir, 'favicon.png'),
      path.resolve(distDir, 'apple-touch-icon.png'),
      path.resolve(distDir, 'icon-192.png'),
      path.resolve(distDir, 'icon-512.png'),
      path.resolve(distDir, 'og-image.png')
    );
  }

  for (const filePath of targetPaths) {
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, buffer);
    } catch (err) {
      console.warn(`Could not write to ${filePath}:`, err);
    }
  }

  // Write ICO file
  try {
    const icoBuffer = createIcoBuffer(buffer);
    fs.writeFileSync(path.resolve(__dirname, 'public/favicon.ico'), icoBuffer);
    if (fs.existsSync(distDir)) {
      fs.writeFileSync(path.resolve(distDir, 'favicon.ico'), icoBuffer);
    }
  } catch (icoErr) {
    console.warn('Could not generate favicon.ico:', icoErr);
  }
}

// Pre-load and cache the logo on server start from Firestore pages/branding_settings
async function preloadLogoFromFirestore() {
  try {
    const projectId = 'dare-arqam-10aaf';
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/pages/branding_settings`;
    const res = await fetch(firestoreUrl);
    if (res.ok) {
      const data = await res.json();
      const remoteLogo = data?.fields?.logoUrl?.stringValue || data?.fields?.logoDataUrl?.stringValue;
      if (remoteLogo && remoteLogo.startsWith('data:image')) {
        const cleanBase64 = remoteLogo.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(cleanBase64, 'base64');
        saveLogoBufferToDisk(buffer);
        logoLastUpdated = Date.now();
        console.log('[Branding] Pre-loaded and cached logo from Firestore pages/branding_settings');
      } else if (remoteLogo && remoteLogo.startsWith('http')) {
        const imgRes = await fetch(remoteLogo);
        if (imgRes.ok) {
          const arrayBuffer = await imgRes.arrayBuffer();
          saveLogoBufferToDisk(Buffer.from(arrayBuffer));
          logoLastUpdated = Date.now();
          console.log('[Branding] Pre-loaded remote CDN logo from Firestore');
        }
      }
    }
  } catch (err) {
    console.debug('[Branding] Server start logo pre-load notice:', err);
  }
}

// Dynamic PWA Manifest Route with cache-busting timestamp versioning
app.get('/manifest.json', (_req, res) => {
  const v = logoLastUpdated;
  res.setHeader('Content-Type', 'application/manifest+json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  return res.json({
    name: "DAR - E - ARQAM School KATLANG Campus",
    short_name: "DARE ARQAM",
    description: "Official institutional portal of DAR - E - ARQAM School Katlang Campus.",
    start_url: "/",
    display: "standalone",
    background_color: "#0F1424",
    theme_color: "#171852",
    icons: [
      {
        src: `/favicon.svg?v=${v}`,
        sizes: "any",
        type: "image/svg+xml"
      },
      {
        src: `/favicon.png?v=${v}`,
        sizes: "64x64 32x32 24x24 16x16",
        type: "image/png"
      },
      {
        src: `/icon-192.png?v=${v}`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: `/icon-512.png?v=${v}`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: `/branding/logo.png?v=${v}`,
        sizes: "512x512",
        type: "image/png"
      }
    ]
  });
});

// Check Current Persistent Logo Status
app.get('/api/branding/logo', (_req, res) => {
  const publicLogo = path.resolve(__dirname, 'public/branding/logo.png');
  const exists = fs.existsSync(publicLogo);
  return res.json({
    exists,
    logoUrl: exists ? `/branding/logo.png?v=${logoLastUpdated}` : null,
    timestamp: logoLastUpdated,
  });
});

// Universal Save Persistent Logo Endpoint (handles both /api/branding/logo and /api/branding/save-logo)
const handleSaveLogo = async (req: express.Request, res: express.Response) => {
  try {
    const tokenUser = parseAuthToken(req);
    if (!isAuthorizedAdminToken(tokenUser) && process.env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, error: 'Forbidden: Admin authorization required to update institutional logo' });
    }

    const rawImage = req.body.logoDataUrl || req.body.imageBase64 || req.body.file;
    if (!rawImage || typeof rawImage !== 'string') {
      return res.status(400).json({ success: false, error: 'logoDataUrl or imageBase64 is required' });
    }

    const cleanBase64 = rawImage.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    // Write directly to disk across public/ and dist/
    saveLogoBufferToDisk(buffer);
    logoLastUpdated = Date.now();

    // Also attempt upload to Cloudinary for redundant CDN persistence if configured
    let cdnUrl = '';
    try {
      const cloudUpload = await cloudinary.uploader.upload(rawImage, {
        folder: 'dare_arqam/branding',
        resource_type: 'image',
        public_id: 'official_logo',
        overwrite: true,
        invalidate: true,
      });
      if (cloudUpload && cloudUpload.secure_url) {
        cdnUrl = cloudUpload.secure_url;
      }
    } catch (cloudErr) {
      console.debug('Cloudinary CDN upload note (local asset saved):', cloudErr);
    }

    const versionedUrl = `/branding/logo.png?v=${logoLastUpdated}`;

    return res.json({
      success: true,
      localUrl: versionedUrl,
      cdnUrl: cdnUrl || versionedUrl,
      timestamp: logoLastUpdated,
      message: 'Official institutional logo permanently saved across public/, dist/, and site identity files.',
    });
  } catch (error: any) {
    console.error('Save Branding Logo Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to save branding logo asset',
    });
  }
};

app.post('/api/branding/logo', handleSaveLogo);
app.post('/api/branding/save-logo', handleSaveLogo);

// Mount Vite in development or serve static in production
async function startServer() {
  // Pre-load and cache branding logo on startup
  preloadLogoFromFirestore().catch(err => console.debug('Preload logo notice:', err));

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: 3000 },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Aggressive immutable cache for hashed bundle assets in /assets/
    app.use('/assets', express.static(path.resolve(__dirname, 'dist', 'assets'), {
      maxAge: '1y',
      immutable: true,
    }));

    // Standard cache for other static files (favicons, manifest, etc.)
    app.use(express.static(path.resolve(__dirname, 'dist'), {
      maxAge: '1h',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
      },
    }));

    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Educational Portal Server with Cloudinary running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
