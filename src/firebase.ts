import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const AUTHORIZED_BRIDGE_ORIGIN = 'https://scholarlens-analytics.vercel.app';

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

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

testConnection();

export interface StoredUserProfileData {
  displayName: string;
  photoURL: string;
  scholarUrl?: string;
}

const LOCAL_PROFILE_PREFIX = 'scholarlens_user_profile_';

export function getLocalUserProfileOverride(
  uid: string
): StoredUserProfileData | null {
  try {
    const raw = localStorage.getItem(`${LOCAL_PROFILE_PREFIX}${uid}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.displayName === 'string') {
      return {
        displayName: parsed.displayName,
        photoURL: typeof parsed.photoURL === 'string' ? parsed.photoURL : '',
        scholarUrl:
          typeof parsed.scholarUrl === 'string' ? parsed.scholarUrl : '',
      };
    }
  } catch {
    // Ignore storage read errors
  }
  return null;
}

export function saveLocalUserProfileOverride(
  uid: string,
  data: StoredUserProfileData
): void {
  try {
    localStorage.setItem(`${LOCAL_PROFILE_PREFIX}${uid}`, JSON.stringify(data));
  } catch {
    // Ignore storage write errors
  }
}

export async function syncOrFetchGoogleUserProfile(
  user: User
): Promise<StoredUserProfileData> {
  const safeUid = user.uid.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);
  const fallbackName = (user.displayName || user.email || 'Researcher').slice(
    0,
    120
  );
  const fallbackPhoto = user.photoURL || '';
  const localOverride = getLocalUserProfileOverride(safeUid);

  if (user.emailVerified) {
    try {
      const userRef = doc(db, 'users', safeUid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const d = snap.data();
        const resolved: StoredUserProfileData = {
          displayName:
            localOverride?.displayName ||
            (typeof d.displayName === 'string' && d.displayName
              ? d.displayName
              : fallbackName),
          photoURL:
            localOverride?.photoURL !== undefined &&
            localOverride.photoURL !== ''
              ? localOverride.photoURL
              : typeof d.photoURL === 'string' && d.photoURL
              ? d.photoURL
              : fallbackPhoto,
          scholarUrl:
            localOverride?.scholarUrl ||
            (typeof d.scholarUrl === 'string' ? d.scholarUrl : ''),
        };
        saveLocalUserProfileOverride(safeUid, resolved);
        return resolved;
      } else {
        const initialData: StoredUserProfileData = {
          displayName: localOverride?.displayName || fallbackName,
          photoURL: localOverride?.photoURL || fallbackPhoto,
          scholarUrl: localOverride?.scholarUrl || '',
        };
        await setDoc(userRef, {
          uid: safeUid,
          displayName: initialData.displayName,
          photoURL: initialData.photoURL.slice(0, 140000),
          ...(initialData.scholarUrl
            ? { scholarUrl: initialData.scholarUrl.slice(0, 500) }
            : {}),
          provider: 'google',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        saveLocalUserProfileOverride(safeUid, initialData);
        return initialData;
      }
    } catch {
      // Fallback to local override or Firebase Auth profile
    }
  }

  return {
    displayName: localOverride?.displayName || fallbackName,
    photoURL: localOverride?.photoURL || fallbackPhoto,
    scholarUrl: localOverride?.scholarUrl || '',
  };
}

export async function signInWithGoogleAccount(): Promise<{
  user: User;
  profile: StoredUserProfileData;
  idToken?: string | null;
}> {
  const cred = await signInWithPopup(auth, googleProvider);
  const oauthCred = GoogleAuthProvider.credentialFromResult(cred);
  const profile = await syncOrFetchGoogleUserProfile(cred.user);
  return { user: cred.user, profile, idToken: oauthCred?.idToken || null };
}

export async function signInWithGoogleIdToken(idToken: string): Promise<{
  user: User;
  profile: StoredUserProfileData;
}> {
  const credential = GoogleAuthProvider.credential(idToken);
  const cred = await signInWithCredential(auth, credential);
  const profile = await syncOrFetchGoogleUserProfile(cred.user);
  return { user: cred.user, profile };
}

export async function updateCustomUserProfile(
  uid: string,
  displayName: string,
  photoURL: string,
  scholarUrl: string
): Promise<void> {
  const cleanName = displayName.trim().slice(0, 120) || 'Researcher';
  const cleanPhoto = photoURL.trim().slice(0, 140000);
  const cleanScholarUrl = scholarUrl.trim().slice(0, 500);
  const safeUid = uid.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);

  saveLocalUserProfileOverride(safeUid, {
    displayName: cleanName,
    photoURL: cleanPhoto,
    scholarUrl: cleanScholarUrl,
  });

  const currentUser = auth.currentUser;
  if (currentUser && currentUser.uid === uid) {
    try {
      await updateProfile(currentUser, {
        displayName: cleanName,
        ...(cleanPhoto.startsWith('http') ? { photoURL: cleanPhoto } : {}),
      });
    } catch {
      // Ignore if photoURL is a data URI that exceeds Firebase Auth header limit
    }

    if (currentUser.emailVerified) {
      try {
        const userRef = doc(db, 'users', safeUid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          await updateDoc(userRef, {
            displayName: cleanName,
            photoURL: cleanPhoto,
            scholarUrl: cleanScholarUrl,
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(userRef, {
            uid: safeUid,
            displayName: cleanName,
            photoURL: cleanPhoto,
            scholarUrl: cleanScholarUrl,
            provider: 'google',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${safeUid}`);
      }
    }
  }
}

export async function deleteCustomUserAccount(uid: string): Promise<void> {
  const safeUid = uid.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);
  try {
    localStorage.removeItem(`${LOCAL_PROFILE_PREFIX}${safeUid}`);
  } catch {
    // Ignore storage errors
  }

  const currentUser = auth.currentUser;
  if (currentUser && currentUser.uid === uid) {
    try {
      await deleteDoc(doc(db, 'users', safeUid));
    } catch {
      // Ignore if document does not exist
    }
    try {
      await deleteUser(currentUser);
      return;
    } catch {
      // Fall back to signOut if recent authentication is required for deleteUser
    }
  }

  try {
    await firebaseSignOut(auth);
  } catch {
    // Ignore
  }
}

export async function logExportToFirestore(
  scholarName: string,
  exportType: 'pdf' | 'png',
  targetName: string
): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return;
  const safeUid = user.uid.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);
  const exportId = `exp_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  try {
    await setDoc(doc(collection(db, 'exports'), exportId), {
      ownerId: safeUid,
      scholarName: scholarName.slice(0, 160),
      exportType,
      targetName: targetName.slice(0, 160),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `exports/${exportId}`);
  }
}

export { onAuthStateChanged, firebaseSignOut };
