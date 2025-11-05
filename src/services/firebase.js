// Servicio de Firebase (Auth + Firestore) con modo local de fallback
// Objetivo:
// - Si existen credenciales válidas en firebase.config.js => usa Firebase real
// - Si NO existen (placeholders) => funciona en "modo local" para que la app sea usable sin backend
//
// Modo local:
// - Simula login/registro guardando un objeto `user` en AsyncStorage ('smartsteps-local-user')
// - initAuthListener lee ese valor y emite el usuario para mantener la sesión
// - Firestore no está disponible en local (db=null)
import firebaseConfig from './firebase.config';
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// Determina si se debe usar el modo local (sin backend) en base a la config
const LOCAL_MODE = !firebaseConfig?.apiKey || String(firebaseConfig.apiKey).startsWith('YOUR_');

let app = null;
let auth = null;
let db = null;

/**
 * Inicializa (una sola vez) Firebase App/Auth/Firestore y devuelve referencias.
 * Si está en modo local, devuelve indicadores nulos y local=true.
 */
export function getFirebase() {
  if (LOCAL_MODE) return { app: null, auth: null, db: null, local: true };
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
    db = getFirestore(app);
  }
  return { app, auth, db, local: false };
}

/**
 * Suscribe a los cambios de autenticación.
 * - Firebase real: usa onAuthStateChanged y retorna una función para desuscribirse
 * - Modo local: lee desde AsyncStorage el usuario simulado y llama al callback, retorna no-op
 */
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

/**
 * Inicia sesión con email y contraseña.
 * - Modo local: guarda un usuario mínimo en AsyncStorage y lo retorna
 * - Firebase: usa signInWithEmailAndPassword y retorna el user
 */
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

/**
 * Registra una cuenta con email/contraseña y opcionalmente displayName.
 * - Modo local: crea el usuario simulado y lo persiste
 * - Firebase: crea el usuario y actualiza perfil con displayName si se indica
 */
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

/**
 * Cierra la sesión actual.
 * - Modo local: borra el usuario simulado del almacenamiento
 * - Firebase: invoca signOut(auth)
 */
export async function authSignOut() {
  const fb = getFirebase();
  if (fb.local) {
    await AsyncStorage.removeItem('smartsteps-local-user');
    return;
  }
  await signOut(fb.auth);
}

export { db };

/**
 * Actualiza el displayName del usuario actual.
 * - Modo local: actualiza el objeto guardado en AsyncStorage.
 * - Firebase: usa updateProfile sobre el usuario actual.
 * @param {string} displayName
 * @returns {Promise<object|null>} usuario actualizado o null si no hay sesión
 */
export async function authUpdateDisplayName(displayName) {
  const fb = getFirebase();
  if (fb.local) {
    const raw = await AsyncStorage.getItem('smartsteps-local-user');
    const user = raw ? JSON.parse(raw) : null;
    if (!user) return null;
    const updated = { ...user, displayName };
    await AsyncStorage.setItem('smartsteps-local-user', JSON.stringify(updated));
    return updated;
  }
  const u = fb?.auth?.currentUser;
  if (!u) return null;
  await updateProfile(u, { displayName });
  // Firebase actualiza el objeto en memoria
  return fb.auth.currentUser;
}

/**
 * Obtiene el perfil del usuario desde Firestore (users/{uid}) o almacenamiento local.
 * @param {string} uid
 * @returns {Promise<object|null>}
 */
export async function fetchUserProfile(uid) {
  if (!uid) return null;
  const fb = getFirebase();
  if (fb.local) {
    const raw = await AsyncStorage.getItem(`smartsteps-profile-${uid}`);
    return raw ? JSON.parse(raw) : null;
  }
  if (!fb.db) return null;
  const ref = doc(fb.db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

/**
 * Actualiza (merge) el perfil del usuario en Firestore o en almacenamiento local.
 * @param {string} uid
 * @param {object} data
 * @returns {Promise<object>} perfil resultante
 */
export async function updateUserProfile(uid, data) {
  if (!uid) return {};
  const fb = getFirebase();
  if (fb.local) {
    const key = `smartsteps-profile-${uid}`;
    const raw = await AsyncStorage.getItem(key);
    const prev = raw ? JSON.parse(raw) : {};
    const merged = { ...prev, ...data, updatedAt: Date.now() };
    await AsyncStorage.setItem(key, JSON.stringify(merged));
    return merged;
  }
  const ref = doc(fb.db, 'users', uid);
  const payload = { ...data, updatedAt: serverTimestamp() };
  await setDoc(ref, payload, { merge: true });
  // Leer de vuelta no es estrictamente necesario, devolvemos merge local
  return payload;
}
