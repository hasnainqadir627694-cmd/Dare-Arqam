import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import firebaseConfig from '../../firebase-applet-config.json';

export interface BackendHealthResult {
  success: boolean;
  timestamp?: string;
  data?: any;
  error?: string;
  errorCode?: string;
  path: string;
  projectId: string;
  appId: string;
}

/**
 * Executes a REAL Firestore read/write test to system/backendHealth.
 * Performs real setDoc() with serverTimestamp() and real getDoc().
 */
export async function runFirestoreBackendHealthTest(): Promise<BackendHealthResult> {
  const path = 'system/backendHealth';
  const projectId = (firebaseConfig as any).projectId || 'dare-arqam-a9d8e';
  const appId = (firebaseConfig as any).appId || '';

  console.log(`[Firestore Health Test] Initializing live test on projectId: ${projectId} -> path: ${path}`);

  try {
    const docRef = doc(db, 'system', 'backendHealth');

    // 1. REAL Firestore Write
    await setDoc(docRef, {
      status: 'connected',
      timestamp: serverTimestamp(),
      environment: 'production',
    });

    console.log('[Firestore Health Test] Real Firestore write completed! Now reading back to verify...');

    // 2. REAL Firestore Read
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      throw new Error('Document was written but could not be read back from Firestore.');
    }

    const data = snap.data();
    console.log('[Firestore Health Test] VERIFIED! Document in Firestore:', data);

    return {
      success: true,
      data,
      path,
      projectId,
      appId,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    const errorCode = err?.code || 'unknown-error';
    const errorMessage = err?.message || String(err);

    console.warn('ℹ️ [Firestore Health Test Status]:', {
      errorCode,
      errorMessage,
      path,
      projectId,
    });

    return {
      success: false,
      error: errorMessage,
      errorCode,
      path,
      projectId,
      appId,
      timestamp: new Date().toISOString(),
    };
  }
}
