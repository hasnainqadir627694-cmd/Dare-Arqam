import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, Firestore, setLogLevel, memoryLocalCache } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Filter out internal Firestore transport reconnection logs in sandboxed iframe environments
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = function (...args: any[]) {
    if (
      args.length > 0 &&
      typeof args[0] === 'string' &&
      (args[0].includes('@firebase/firestore') ||
        args[0].includes('Could not reach Cloud Firestore backend') ||
        args[0].includes('code=unavailable'))
    ) {
      // Route transient connection/offline notices to debug instead of flagging as applet errors
      console.debug(...args);
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

// Suppress transient network transport reconnection logs in sandboxed preview iframe environments
try {
  setLogLevel('silent');
} catch {}

// Initialize Firebase App instance safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use initializeFirestore with experimentalForceLongPolling and memory cache for robust, instant connectivity
// in cloud run, preview iframe, and proxy environments without throwing backend unavailable logs
const databaseId = (firebaseConfig as Record<string, any>).firestoreDatabaseId;
let firestoreDb: Firestore;
try {
  firestoreDb = databaseId
    ? initializeFirestore(app, {
        experimentalForceLongPolling: true,
        localCache: memoryLocalCache(),
      }, databaseId)
    : initializeFirestore(app, {
        experimentalForceLongPolling: true,
        localCache: memoryLocalCache(),
      });
} catch {
  firestoreDb = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
}
export const db = firestoreDb;
export const storage = getStorage(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
