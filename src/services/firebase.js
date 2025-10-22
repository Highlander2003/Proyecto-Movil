import firebaseConfig from './firebase.config';
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const LOCAL_MODE = !firebaseConfig?.apiKey || String(firebaseConfig.apiKey).startsWith('YOUR_');

let app = null;
let auth = null;
let db = null;

export function getFirebase() {
  if (LOCAL_MODE) return { app: null, auth: null, db: null, local: true };
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
    db = getFirestore(app);
  }
  return { app, auth, db, local: false };
}

export function initAuthListener(callback) {
  const { auth, local } = getFirebase();
  if (local) {
    // Simula sesión guardada local (si existe)
    (async () => {
      const raw = await AsyncStorage.getItem('smartsteps-local-user');
      const user = raw ? JSON.parse(raw) : null;
      callback(user);
    })();
    return () => {};
  }
  return onAuthStateChanged(auth, (user) => callback(user));
}

export async function authSignIn(email, password) {
  const fb = getFirebase();
  if (fb.local) {
    const user = { uid: 'local-uid', email };
    await AsyncStorage.setItem('smartsteps-local-user', JSON.stringify(user));
    return user;
  }
  const cred = await signInWithEmailAndPassword(fb.auth, email, password);
  return cred.user;
}

export async function authRegister(email, password, displayName) {
  const fb = getFirebase();
  if (fb.local) {
    const user = { uid: 'local-uid', email, displayName: displayName || 'Usuario' };
    await AsyncStorage.setItem('smartsteps-local-user', JSON.stringify(user));
    return user;
  }
  const cred = await createUserWithEmailAndPassword(fb.auth, email, password);
  if (displayName) {
    try { await updateProfile(cred.user, { displayName }); } catch {}
  }
  return cred.user;
}

export async function authSignOut() {
  const fb = getFirebase();
  if (fb.local) {
    await AsyncStorage.removeItem('smartsteps-local-user');
    return;
  }
  await signOut(fb.auth);
}

export { db };
