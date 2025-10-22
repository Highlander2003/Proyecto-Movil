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
import { getFirestore } from 'firebase/firestore';

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
