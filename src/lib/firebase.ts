import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const apiKeyEnv = (import.meta as any).env.VITE_FIREBASE_API_KEY;
const authDomainEnv = (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN;
const projectIdEnv = (import.meta as any).env.VITE_FIREBASE_PROJECT_ID;
const storageBucketEnv = (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET;
const messagingSenderIdEnv = (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const appIdEnv = (import.meta as any).env.VITE_FIREBASE_APP_ID;

const firebaseConfig = {
  apiKey: apiKeyEnv || "placeholder-api-key-to-prevent-startup-crash",
  authDomain: authDomainEnv || "placeholder-auth-domain",
  projectId: projectIdEnv || "leadpilot-industry",
  storageBucket: storageBucketEnv || "placeholder-storage-bucket",
  messagingSenderId: messagingSenderIdEnv || "placeholder-sender-id",
  appId: appIdEnv || "placeholder-app-id",
};

const app = initializeApp(firebaseConfig);

console.log("Firebase Project:", firebaseConfig.projectId);

// Initialize Firestore and authentication/storage using the initialized app instance
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
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

