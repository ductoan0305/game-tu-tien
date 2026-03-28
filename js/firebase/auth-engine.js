// ============================================================
// firebase/auth-engine.js — Anonymous + Google auth + upgrade
// ============================================================
import { auth }                                    from './firebase-config.js';
import {
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

const provider = new GoogleAuthProvider();

// ── State ──────────────────────────────────────────────────
let _onAuthChange = null; // callback(user)

export function onAuth(cb) {
  _onAuthChange = cb;
  return onAuthStateChanged(auth, user => {
    _onAuthChange?.(user);
  });
}

// ── Anonymous login (tự động khi init) ────────────────────
export async function signInAnon() {
  try {
    const cred = await signInAnonymously(auth);
    return { ok: true, user: cred.user };
  } catch (e) {
    console.warn('[Auth] Anonymous sign-in failed:', e);
    return { ok: false, reason: e.message };
  }
}

// ── Google Sign-In (new account) ──────────────────────────
export async function signInGoogle() {
  try {
    const cred = await signInWithPopup(auth, provider);
    return { ok: true, user: cred.user, isNew: false };
  } catch (e) {
    if (e.code === 'auth/popup-closed-by-user') return { ok: false, reason: 'cancelled' };
    console.warn('[Auth] Google sign-in failed:', e);
    return { ok: false, reason: e.message };
  }
}

// ── Upgrade: link anonymous → Google ──────────────────────
// Dùng khi user đang anonymous và muốn lưu progress
export async function upgradeAnonToGoogle() {
  const user = auth.currentUser;
  if (!user) return { ok: false, reason: 'not_logged_in' };
  if (!user.isAnonymous) return { ok: false, reason: 'already_linked' };

  try {
    const cred = await linkWithPopup(user, provider);
    return { ok: true, user: cred.user };
  } catch (e) {
    // Nếu Google account đã có save riêng → không thể link
    if (e.code === 'auth/credential-already-in-use') {
      return { ok: false, reason: 'credential_in_use', credential: e.credential };
    }
    if (e.code === 'auth/popup-closed-by-user') return { ok: false, reason: 'cancelled' };
    console.warn('[Auth] Upgrade failed:', e);
    return { ok: false, reason: e.message };
  }
}

// ── Sign out ───────────────────────────────────────────────
export async function logOut() {
  try {
    await signOut(auth);
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

// ── Helpers ────────────────────────────────────────────────
export function getCurrentUser()  { return auth.currentUser; }
export function isAnonymous()     { return auth.currentUser?.isAnonymous ?? true; }
export function isLoggedIn()      { return !!auth.currentUser; }
export function getDisplayName()  {
  const u = auth.currentUser;
  if (!u) return null;
  if (u.isAnonymous) return 'Khách';
  return u.displayName || u.email || 'Tu Sĩ';
}