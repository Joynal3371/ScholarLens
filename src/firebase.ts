import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const AUTHORIZED_BRIDGE_ORIGIN = 'https://1xkhel-bd.vercel.app';

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
        const resolved = {
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
        };
        saveLocalUserProfileOverride(safeUid, resolved);
        return resolved;
      } else {
        const initialData = {
          displayName: localOverride?.displayName || fallbackName,
          photoURL: localOverride?.photoURL || fallbackPhoto,
        };
        await setDoc(userRef, {
          uid: safeUid,
          displayName: initialData.displayName,
          photoURL: initialData.photoURL.slice(0, 140000),
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

export async function signInOrRegisterWithGmail(
  emailInput: string,
  displayNameInput: string,
  passwordInput: string
): Promise<{
  user: User;
  profile: StoredUserProfileData;
}> {
  const email = emailInput.trim().toLowerCase();
  const displayName =
    displayNameInput.trim() ||
    email
      .split('@')[0]
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  const password =
    passwordInput && passwordInput.length >= 6
      ? passwordInput
      : `Scholar#${email.slice(0, 8)}2026!`;

  let user: User;
  try {
    const signInCred = await signInWithEmailAndPassword(auth, email, password);
    user = signInCred.user;
  } catch (err: any) {
    const code = String(err?.code || '');
    if (
      code.includes('user-not-found') ||
      code.includes('invalid-credential') ||
      code.includes('invalid-login-credentials')
    ) {
      const createCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      user = createCred.user;
    } else {
      throw err;
    }
  }

  if (displayName && (!user.displayName || displayNameInput.trim())) {
    try {
      await updateProfile(user, { displayName });
    } catch {
      // Ignore profile update warning
    }
  }

  const localOverride = getLocalUserProfileOverride(user.uid);
  const finalProfile: StoredUserProfileData = {
    displayName: localOverride?.displayName || displayName || user.displayName || email,
    photoURL: localOverride?.photoURL || user.photoURL || '',
  };
  saveLocalUserProfileOverride(user.uid, finalProfile);

  return { user, profile: finalProfile };
}

export async function updateCustomUserProfile(
  uid: string,
  displayName: string,
  photoURL: string
): Promise<void> {
  const cleanName = displayName.trim().slice(0, 120) || 'Researcher';
  const cleanPhoto = photoURL.trim().slice(0, 140000);
  const safeUid = uid.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);

  saveLocalUserProfileOverride(safeUid, {
    displayName: cleanName,
    photoURL: cleanPhoto,
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
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(userRef, {
            uid: safeUid,
            displayName: cleanName,
            photoURL: cleanPhoto,
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
