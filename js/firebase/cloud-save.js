// ============================================================
// firebase/cloud-save.js — Firestore multi-device sync
// Strategy: localStorage = primary (offline OK),
//           Firestore    = cloud backup, load on login
// ============================================================
import { auth, db }                              from './firebase-config.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { SAVE_KEY, SAVE_VERSION }               from '../core/state/fresh-state.js';

const CLOUD_SAVE_THROTTLE_MS = 30000; // max 1 cloud write per 30s
let _lastCloudSave = 0;
let _pendingCloudSave = null;

// ── Upload save lên Firestore ──────────────────────────────
export async function uploadSave(G) {
  const user = auth.currentUser;
  if (!user) return { ok: false, reason: 'not_logged_in' };

  const now = Date.now();
  // Throttle: nếu gọi nhiều lần, chỉ ghi sau 30s
  if (now - _lastCloudSave < CLOUD_SAVE_THROTTLE_MS) {
    // Schedule deferred upload
    if (_pendingCloudSave) clearTimeout(_pendingCloudSave);
    _pendingCloudSave = setTimeout(() => uploadSave(G), CLOUD_SAVE_THROTTLE_MS);
    return { ok: false, reason: 'throttled' };
  }

  try {
    const ref  = doc(db, 'saves', user.uid);
    const data = {
      saveData:  JSON.stringify(G),
      version:   SAVE_VERSION,
      saveKey:   SAVE_KEY,
      updatedAt: serverTimestamp(),
      // metadata nhanh để so sánh mà không cần parse
      realmIdx:  G.realmIdx ?? 0,
      stage:     G.stage ?? 1,
      gameYear:  G.gameTime?.currentYear ?? 0,
      name:      G.name ?? '',
    };
    await setDoc(ref, data);
    _lastCloudSave = Date.now();
    _pendingCloudSave = null;
    console.log('[CloudSave] Uploaded successfully');
    return { ok: true };
  } catch (e) {
    console.warn('[CloudSave] Upload failed:', e);
    return { ok: false, reason: e.message };
  }
}

// ── Download save từ Firestore ─────────────────────────────
export async function downloadSave() {
  const user = auth.currentUser;
  if (!user) return { ok: false, reason: 'not_logged_in' };

  try {
    const ref  = doc(db, 'saves', user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { ok: false, reason: 'no_cloud_save' };

    const data = snap.data();

    // Save đã bị reset → báo no_cloud_save để vào setup
    if (data.reset === true || !data.saveData) {
      return { ok: false, reason: 'no_cloud_save' };
    }

    if (data.version !== SAVE_VERSION) {
      return { ok: false, reason: 'version_mismatch', cloudVersion: data.version };
    }

    let parsed;
    try {
      parsed = JSON.parse(data.saveData);
    } catch {
      return { ok: false, reason: 'corrupt_cloud_save' };
    }

    return {
      ok: true,
      G: parsed,
      meta: {
        updatedAt: data.updatedAt?.toDate?.() ?? null,
        realmIdx:  data.realmIdx,
        stage:     data.stage,
        gameYear:  data.gameYear,
        name:      data.name,
      },
    };
  } catch (e) {
    console.warn('[CloudSave] Download failed:', e);
    return { ok: false, reason: e.message };
  }
}

// ── So sánh cloud vs local để chọn save mới hơn ───────────
export function pickNewerSave(localG, cloudG) {
  if (!localG) return cloudG;
  if (!cloudG)  return localG;
  // So sánh theo totalTime (giây chơi tích lũy) — đáng tin hơn lastSave timestamp
  const localTime = localG.totalTime ?? 0;
  const cloudTime = cloudG.totalTime ?? 0;
  return cloudTime > localTime ? cloudG : localG;
}