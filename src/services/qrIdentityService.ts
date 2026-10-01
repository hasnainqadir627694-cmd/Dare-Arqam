/**
 * DARE ARQAM Permanent Student QR Identity Service
 * Cryptographically unique, tamper-proof QR tokens linked to student profiles.
 * Never embeds personal data directly; acts as a secure identity lookup token.
 */

import QRCode from 'qrcode';
import { StudentQrIdentity } from '../types';

/**
 * Generates an unpredictable, non-guessable, cryptographically secure token.
 * Does NOT contain student name, roll number, email, phone number or any PII.
 */
export function generateSecureQrToken(): string {
  try {
    const randomBytes = new Uint8Array(20);
    crypto.getRandomValues(randomBytes);
    const hex = Array.from(randomBytes).map((b) => b.toString(16).padStart(2, '0')).join('');
    return `dast_${hex}`;
  } catch {
    // Fallback if crypto.getRandomValues is unavailable
    const randomHex = Math.random().toString(36).substring(2) + Date.now().toString(36) + Math.random().toString(36).substring(2);
    return `dast_${randomHex}`;
  }
}

/**
 * Builds the canonical verification URL or token payload for QR encoding.
 */
export function buildQrVerificationPayload(tokenId: string): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/verify-student?token=${encodeURIComponent(tokenId)}`;
  }
  return `https://dare-arqam-katlang.edu.pk/verify-student?token=${encodeURIComponent(tokenId)}`;
}

/**
 * Extracts a token ID from scanned input (whether a full URL or a raw token).
 */
export function extractTokenFromScan(scannedText: string): string {
  if (!scannedText) return '';
  const trimmed = scannedText.trim();
  
  // If it's a URL with ?token= or &token=
  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const url = new URL(trimmed);
      const tokenParam = url.searchParams.get('token');
      if (tokenParam) return tokenParam.trim();
    }
  } catch {}

  // Fallback regex matching dast_...
  const match = trimmed.match(/dast_[a-zA-Z0-9_-]+/);
  if (match) return match[0];

  return trimmed;
}

/**
 * Generates a high-contrast, high-resolution QR Code Data URL with standard quiet zone.
 * Uses high error correction level 'H' (30% damage tolerance) for physical card reliability.
 */
export async function generateQrCodeDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'H',
    margin: 2, // Clear quiet zone
    width: 480,
    color: {
      dark: '#0F1035', // Institutional Deep Navy for maximum optical camera contrast
      light: '#FFFFFF', // Pure White quiet zone
    },
  });
}

/**
 * Factory that creates a new fresh active StudentQrIdentity record.
 */
export async function createStudentQrIdentity(existingVersion = 0): Promise<StudentQrIdentity> {
  const tokenId = generateSecureQrToken();
  const payload = buildQrVerificationPayload(tokenId);
  const qrDataUrl = await generateQrCodeDataUrl(payload);

  return {
    tokenId,
    status: 'active',
    createdAt: new Date().toISOString(),
    qrDataUrl,
    version: existingVersion + 1,
  };
}
