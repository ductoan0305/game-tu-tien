// ============================================================
// firebase/auth-ui.js — Login Gate (Option A)
// ============================================================
import {
  onAuth, signInAnon, signInGoogle, upgradeAnonToGoogle,
  logOut, getCurrentUser, getDisplayName,
} from './auth-engine.js';
import { downloadSave, uploadSave, pickNewerSave } from './cloud-save.js';

let _onAnonReady   = null;
let _onGoogleReady = null;
let _onCloudLoadCb = null;
let _getGCb        = null;
let _showToastCb   = null;
let _gateDismissed = false; // true sau khi user bấm nút bất kỳ trong gate

export function initAuthUI({ onAnonReady, onGoogleReady, onCloudLoad, getG, showToast }) {
  _onAnonReady   = onAnonReady;
  _onGoogleReady = onGoogleReady;
  _onCloudLoadCb = onCloudLoad;
  _getGCb        = getG;
  _showToastCb   = showToast;
  onAuth(user => _handleAuthChange(user));
}

async function _handleAuthChange(user) {
  const gate = document.getElementById('login-gate');

  // Chưa có user → hiện gate
  if (!user) { _showLoginGate(); return; }

  // Có user nhưng gate chưa được dismiss → hiện gate (kể cả Google session cũ)
  if (!_gateDismissed) {
    _showLoginGate(user);
    return;
  }

  if (gate) gate.remove();

  if (!user.isAnonymous) {
    await _tryMergeCloudSave();
  } else {
    _onAuthReady?.(user);
  }
}

function _showLoginGate(existingUser) {
  // Xóa gate cũ nếu có (re-render)
  const old = document.getElementById('login-gate');
  if (old) old.remove();

  document.getElementById('game-container')?.style.setProperty('display','none');
  document.getElementById('setup-container')?.style.setProperty('display','none');

  const isGoogle = existingUser && !existingUser.isAnonymous;
  const displayName = isGoogle ? (existingUser.displayName || existingUser.email || 'Tu Sĩ') : null;

  const gate = document.createElement('div');
  gate.id = 'login-gate';
  gate.innerHTML = `
    <div class="lg-box">
      <div class="lg-logo">🧘</div>
      <div class="lg-title">Vạn Giới Tu Tiên</div>
      <div class="lg-subtitle">Hành trình vạn dặm bắt đầu từ một bước chân</div>
      <div class="lg-buttons">
        ${isGoogle ? `
          <div class="lg-logged-in">
            <span class="lg-avatar">✅</span>
            <span class="lg-logged-name">${displayName}</span>
          </div>
          <button class="lg-btn lg-btn-google" id="lg-btn-continue">▶ Tiếp Tục</button>
          <div class="lg-divider"><span>hoặc</span></div>
          <button class="lg-btn lg-btn-anon" id="lg-btn-switch">🔄 Đăng Xuất / Đổi Tài Khoản</button>
        ` : `
          <button class="lg-btn lg-btn-google" id="lg-btn-google">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
            Đăng Nhập với Google
          </button>
          <div class="lg-divider"><span>hoặc</span></div>
          <button class="lg-btn lg-btn-anon" id="lg-btn-anon">👤 Chơi Ẩn Danh</button>
        `}
      </div>
      <div class="lg-note">
        Chơi ẩn danh lưu dữ liệu trên thiết bị này.<br>
        Đăng nhập Google để đồng bộ nhiều thiết bị.
      </div>
    </div>`;
  document.body.appendChild(gate);

  // Tiếp tục với Google account hiện tại
  document.getElementById('lg-btn-continue')?.addEventListener('click', () => {
    _gateDismissed = true;
    _handleAuthChange(existingUser);
  });

  // Đăng xuất để đổi account
  document.getElementById('lg-btn-switch')?.addEventListener('click', async () => {
    const btn = document.getElementById('lg-btn-switch');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Đang đăng xuất...'; }
    await logOut();
    _gateDismissed = false;
    // onAuth sẽ tự trigger lại với user=null → hiện gate login
  });

  // Đăng nhập Google mới
  document.getElementById('lg-btn-google')?.addEventListener('click', async () => {
    const btn = document.getElementById('lg-btn-google');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Đang kết nối...'; }
    _gateDismissed = true;
    const result = await signInGoogle();
    if (!result.ok && result.reason !== 'cancelled') {
      _gateDismissed = false;
      _showToastCb?.(`⚠ Lỗi đăng nhập: ${result.reason}`, 'danger');
      if (btn) { btn.disabled = false; btn.textContent = 'Đăng Nhập với Google'; }
    }
  });

  // Chơi ẩn danh
  document.getElementById('lg-btn-anon')?.addEventListener('click', async () => {
    const btn = document.getElementById('lg-btn-anon');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Đang kết nối...'; }
    _gateDismissed = true;
    await signInAnon();
  });
}

async function _tryMergeCloudSave() {
  console.log('[Auth] _tryMergeCloudSave: đang tải cloud save...');
  const result = await downloadSave();
  console.log('[Auth] downloadSave result:', result.ok ? 'OK' : 'FAIL', '| reason:', result.reason ?? '-', '| setupDone:', result.G?.setupDone);

  if (!result.ok) {
    if (result.reason === 'no_cloud_save') {
      console.log('[Auth] Không có cloud save → _onAnonReady (sẽ check localStorage)');
      _onAnonReady?.();
    } else {
      console.log('[Auth] Lỗi cloud save, fallback localStorage. Reason:', result.reason);
      _showToastCb?.('⚠ Không thể tải cloud save, dùng dữ liệu local', 'danger');
      _onAnonReady?.();
    }
    return;
  }

  console.log('[Auth] Có cloud save, setupDone =', result.G?.setupDone, '→', result.G?.setupDone ? 'startGame' : 'initSetupScreen');
  // Có cloud save → dùng luôn
  _onGoogleReady?.(result.G);
}

function _showMergePrompt(meta, cloudG) {
  const existing = document.getElementById('cloud-merge-modal');
  if (existing) existing.remove();
  const REALM_NAMES = ['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hóa Thần'];
  const realmName = REALM_NAMES[meta.realmIdx ?? 0] || 'Luyện Khí';
  const dateStr = meta.updatedAt
    ? meta.updatedAt.toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
    : 'Không rõ';
  const localG = _getGCb?.();
  const modal = document.createElement('div');
  modal.id = 'cloud-merge-modal';
  modal.className = 'modal-overlay';
  modal.style.zIndex = '99999';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:380px">
      <div style="font-size:20px;text-align:center;margin-bottom:12px">☁ Cloud Save Tìm Thấy</div>
      <div style="font-size:12px;color:var(--text-dim);margin-bottom:16px;text-align:center">
        Cloud save mới hơn thiết bị này. Chọn save muốn dùng.
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
        <div style="background:rgba(255,255,255,0.05);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:11px;color:var(--text-dim);margin-bottom:6px">💻 Thiết Bị Này</div>
          <div style="font-size:13px;font-weight:600;color:#fff">${localG?.name ?? 'Chưa có'}</div>
          <div style="font-size:11px;color:var(--text-dim);margin-top:4px">${REALM_NAMES[localG?.realmIdx??0]} tầng ${localG?.stage??1}</div>
        </div>
        <div style="background:rgba(74,158,255,0.08);border:1px solid #4a9eff55;border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:11px;color:#4a9eff;margin-bottom:6px">☁ Cloud</div>
          <div style="font-size:13px;font-weight:600;color:#fff">${meta.name ?? '?'}</div>
          <div style="font-size:11px;color:var(--text-dim);margin-top:4px">${realmName} tầng ${meta.stage??1}</div>
          <div style="font-size:10px;color:var(--text-dim);margin-top:2px">${dateStr}</div>
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <button id="merge-keep-local" style="flex:1;padding:10px;background:rgba(255,255,255,0.08);border:1px solid var(--border);border-radius:6px;color:#fff;cursor:pointer;font-size:12px">💻 Giữ Thiết Bị Này</button>
        <button id="merge-use-cloud" style="flex:1;padding:10px;background:rgba(74,158,255,0.15);border:1px solid #4a9eff55;border-radius:6px;color:#4a9eff;cursor:pointer;font-size:13px;font-weight:600">☁ Dùng Cloud Save</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  document.getElementById('merge-use-cloud')?.addEventListener('click', () => { modal.remove(); _onGoogleReady?.(cloudG); });
  document.getElementById('merge-keep-local')?.addEventListener('click', async () => {
    modal.remove();
    const G = _getGCb?.();
    if (G) await uploadSave(G);
    _onAnonReady?.(); // giữ local save
  });
}

// ── In-game account menu ───────────────────────────────────
export async function showAccountMenu(getG, showToast) {
  const user = getCurrentUser();
  if (!user) return;
  const existing = document.getElementById('account-menu-modal');
  if (existing) { existing.remove(); return; }
  const modal = document.createElement('div');
  modal.id = 'account-menu-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:300px">
      <div style="font-size:15px;font-weight:700;margin-bottom:10px">👤 Tài Khoản</div>
      <div style="font-size:12px;color:#ccc;margin-bottom:14px">
        ${user.isAnonymous ? '👤 Ẩn danh — lưu trên thiết bị này' : '✅ ' + getDisplayName()}
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${user.isAnonymous
          ? '<button class="lp-action-main" id="acct-link-google">🔗 Liên Kết Google</button>'
          : '<button class="lp-action-main" id="acct-sync">☁ Đồng Bộ Ngay</button><button class="lp-action-main" style="color:#e05c4a;border-color:#e05c4a44" id="acct-logout">🚪 Đăng Xuất</button>'
        }
        <button class="lp-action-main" id="acct-close" style="color:var(--text-dim)">Đóng</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.getElementById('acct-close')?.addEventListener('click', () => modal.remove());
  document.getElementById('acct-link-google')?.addEventListener('click', async () => {
    modal.remove();
    const result = await upgradeAnonToGoogle();
    if (result.ok) { showToast('✅ Đã liên kết Google!', 'jade'); const G = getG(); if (G) await uploadSave(G); }
    else if (result.reason !== 'cancelled') showToast(`⚠ ${result.reason}`, 'danger');
  });
  document.getElementById('acct-sync')?.addEventListener('click', async () => {
    modal.remove(); const G = getG();
    if (G) { await uploadSave(G); showToast('✅ Đã đồng bộ!', 'jade'); }
  });
  document.getElementById('acct-logout')?.addEventListener('click', async () => {
    modal.remove(); const G = getG();
    if (G) await uploadSave(G);
    await logOut(); window.location.reload();
  });
}

export { uploadSave };