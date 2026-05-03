// ============================================================
// ui/setup-screen.js — Character creation + Spirit Root Cinematic
// Flow: gender → name → roll (cinematic) → confirm
// ============================================================
import { SPIRIT_ROOTS, SECTS, SPIRIT_ROOT_WEIGHTS } from '../core/data.js';
import { rollSpiritRoot, SPIRIT_ROOT_TYPES, SPIRIT_ELEMENTS, getSpiritProphecy, getSpiritDisplayName, getSpiritMainColor, getRecommendedSects, calcSpiritRateMulti } from '../core/spirit-root.js';
import { weightedRandom } from '../utils/helpers.js';

let _onComplete = null;
let _G = null;

let _state = {
  phase: 'gender',
  gender: null,
  name: '',
  spiritRootId: null,
  spiritData: null,
  rolls: 0,
  sectInvites: [],
  chosenSectId: null,   // null = tán tu, sectId = gia nhập ngay
  _revealDone: false,
};

export function initSetupScreen(G, onComplete) {
  _G = G;
  _onComplete = onComplete;
  const gameEl = document.getElementById('game-container');
  const setupEl = document.getElementById('setup-container');
  if (gameEl) gameEl.style.display = 'none';
  if (setupEl) setupEl.style.display = 'block';
  renderSetup();
}

function renderSetup() {
  const container = document.getElementById('setup-container');
  if (!container) return;
  switch (_state.phase) {
    case 'gender':  container.innerHTML = renderGenderPhase(); break;
    case 'name':    container.innerHTML = renderNamePhase(); break;
    case 'roll':    container.innerHTML = renderRollPhase(); break;
    case 'reveal':  renderRevealCinematic(container); break;
    case 'invite':  container.innerHTML = renderSectInvitePhase(); break;
    case 'confirm': container.innerHTML = renderConfirmPhase(); break;
  }
  wireSetupEvents();
}

// ============================================================
// PHASE: GENDER — Redesign v12
// ============================================================
function renderGenderPhase() {
  const maleSel   = _state.gender === 'male'   ? 'selected' : '';
  const femaleSel = _state.gender === 'female' ? 'selected' : '';
  const gridSel   = _state.gender ? 'has-selection' : '';
  return `
    <div class="gender-setup-screen">
      <!-- Sao (JS inject sau) -->
      <div class="gender-stars" id="gender-stars-layer"></div>
      <!-- Mist tím -->
      <div class="gender-mist"></div>

      <!-- Header -->
      <header class="gender-header">
        <div class="gender-han">擇選身份</div>
        <div class="gender-game-title">Tu Tiên Idle</div>
        <div class="gender-sub">Chọn Thân Phận</div>
      </header>

      <!-- Divider -->
      <div class="gender-divider">── ◆ ──</div>

      <!-- Panel -->
      <div class="gender-panel">
        <span class="g-corner tl"></span>
        <span class="g-corner tr"></span>
        <span class="g-corner bl"></span>
        <span class="g-corner br"></span>

        <p class="gender-quote">Con đường phía trước chưa rõ, đích đến vô định.<br>Nhưng không bước — thì mãi mãi chỉ là phàm nhân.</p>

        <div class="gender-grid ${gridSel}" id="gender-grid">

          <!-- Nam -->
          <div class="gender-card ${maleSel}" data-gender="male" tabindex="0">
            <span class="gender-badge">✓</span>
            <div class="gender-avatar-wrap">
              <span class="gender-emoji">⚔️</span>
              <span class="gender-avatar-ring"></span>
            </div>
            <div class="gender-name">Nam Tu</div>
            <div class="gender-particles" id="gp-male"></div>
          </div>

          <!-- Nữ -->
          <div class="gender-card ${femaleSel}" data-gender="female" tabindex="0">
            <span class="gender-badge">✓</span>
            <div class="gender-avatar-wrap">
              <span class="gender-emoji">🌸</span>
              <span class="gender-avatar-ring"></span>
            </div>
            <div class="gender-name">Nữ Tu</div>
            <div class="gender-particles" id="gp-female"></div>
          </div>

        </div><!-- /.gender-grid -->

        <button id="btn-gender-confirm" ${!_state.gender ? 'disabled' : ''}>
          Xác Nhận
        </button>
      </div><!-- /.gender-panel -->
    </div>`;
}

// Spawn sao và particle sau khi DOM render xong
function _initGenderEffects() {
  // Sao
  const layer = document.getElementById('gender-stars-layer');
  if (layer && !layer.childElementCount) {
    const isMobile = window.matchMedia('(max-width:600px)').matches;
    const count = isMobile ? 35 : 70;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'gender-star';
      const sz = (Math.random() * 1.8 + 0.6).toFixed(1);
      s.style.cssText = [
        `left:${(Math.random()*100).toFixed(2)}%`,
        `top:${(Math.random()*100).toFixed(2)}%`,
        `width:${sz}px`, `height:${sz}px`,
        `--dur:${(Math.random()*4+2).toFixed(1)}s`,
        `--delay:-${(Math.random()*5).toFixed(2)}s`,
        `--mn:${(Math.random()*.1+.04).toFixed(2)}`,
        `--mx:${(Math.random()*.6+.4).toFixed(2)}`,
      ].join(';');
      frag.appendChild(s);
    }
    layer.appendChild(frag);
  }

  // Particle cho từng card
  ['gp-male', 'gp-female'].forEach(id => {
    const box = document.getElementById(id);
    if (box && !box.childElementCount) {
      const frag = document.createDocumentFragment();
      for (let i = 0; i < 8; i++) {
        const p = document.createElement('span');
        p.className = 'g-particle';
        p.style.cssText = [
          `left:${(Math.random()*80+10).toFixed(0)}%`,
          `bottom:${(Math.random()*20+5).toFixed(0)}px`,
          `--px:${((Math.random()-.5)*60).toFixed(1)}px`,
          `--pd:${(Math.random()*1.5+1.8).toFixed(1)}s`,
          `--pdel:${(Math.random()*2).toFixed(2)}s`,
        ].join(';');
        frag.appendChild(p);
      }
      box.appendChild(frag);
    }
  });
}

// ============================================================
// PHASE: NAME
// ============================================================
function renderNamePhase() {
  return `
    <div class="setup-screen">
      <div class="setup-header">
        <h1>🌌 Đặt Đạo Hiệu</h1>
        <p class="setup-sub">Tên ngươi sẽ lưu lại muôn đời trong sử sách</p>
      </div>
      <div class="setup-card">
        <h2>Đạo Hiệu</h2>
        <p>Nhập đạo hiệu của ngươi. Tên đẹp mang lại phúc khí.</p>
        <input type="text" id="input-name" maxlength="20"
          placeholder="Vô Danh Đạo Nhân" value="${_state.name}" class="setup-input"/>
        <button id="btn-name-confirm" class="btn-primary setup-btn">Xác Nhận Đạo Hiệu →</button>
      </div>
    </div>`;
}

// ============================================================
// PHASE: ROLL — trước khi reveal
// ============================================================
function renderRollPhase() {
  // Màn chờ ban đầu — chỉ hiện khi chưa roll lần nào
  return `
    <div class="setup-screen">
      <div class="setup-header">
        <h1>⚡ Khai Linh Căn</h1>
        <p class="setup-sub">Vạn linh quy tịch. Thiên cơ chưa tỏ.</p>
      </div>
      <div class="setup-card roll-card">
        <div class="roll-orb" id="roll-orb">
          <div class="roll-orb-inner">
            <span class="roll-orb-emoji">✦</span>
          </div>
          <div class="roll-orb-ring ring1"></div>
          <div class="roll-orb-ring ring2"></div>
          <div class="roll-orb-ring ring3"></div>
        </div>
        <p class="roll-desc">Ngươi đứng trước Khai Linh Đài.<br>Thiên địa im lặng, chờ đợi phán xét...</p>
        <button id="btn-roll" class="btn-primary setup-btn roll-btn">⚡ Khai Linh Căn</button>
      </div>
    </div>`;
}

// ============================================================
// PHASE: REVEAL — Cinematic animation
// ============================================================
function renderRevealCinematic(container) {
  const spiritData = _state.spiritData;
  if (!spiritData) { _state.phase = 'roll'; renderSetup(); return; }
  const mainEl = SPIRIT_ELEMENTS[spiritData.mainElement] || {};
  const typeInfo = SPIRIT_ROOT_TYPES[spiritData.type] || {};
  // Build root-like object for template compatibility
  const root = {
    emoji:   mainEl.emoji || '✦',
    color:   getSpiritMainColor(spiritData),
    rarity:  typeInfo.rarity || 'thường',
    prophecy: getSpiritProphecy(spiritData),
    bonus:   {},
    name:    getSpiritDisplayName(spiritData),
    element: mainEl.name || typeInfo.label || 'Linh Căn',
  };
  // Speed multiplier as bonus display
  const rateMulti = calcSpiritRateMulti(spiritData);

  // Rarity config
  const RARITY_CFG = {
    'thường':    { tier: 1, tierName: 'Linh Căn Phổ Thông', particles: 8,  delay: 1500, shake: false },
    'hiếm':      { tier: 2, tierName: 'Linh Căn Hiếm',      particles: 15, delay: 2000, shake: false },
    'cực hiếm':  { tier: 3, tierName: '✦ LINH CĂN CỰC HIẾM', particles: 25, delay: 2500, shake: true  },
    'huyền thoại':{ tier: 4, tierName: '🌌 THIÊN MỆNH LINH CĂN', particles: 40, delay: 3000, shake: true },
  };
  const cfg = RARITY_CFG[typeInfo.rarity || 'thường'] || RARITY_CFG['thường'];

  // Build particles
  const particles = Array.from({length: cfg.particles}, (_, i) => {
    const angle = (i / cfg.particles) * 360;
    const dist  = 80 + Math.random() * 60;
    const size  = 3 + Math.random() * 5;
    const dur   = 1.5 + Math.random() * 2;
    const delay = Math.random() * 1;
    return `<div class="reveal-particle" style="
      transform: rotate(${angle}deg) translateY(-${dist}px);
      width:${size}px; height:${size}px;
      background:${root.color};
      animation: particle-float ${dur}s ${delay}s ease-in-out infinite alternate,
                 particle-fade 0.5s 0.3s ease forwards;
    "></div>`;
  }).join('');

  // Sect invites based on root
  _state.sectInvites = _getSectInvites(spiritData);

  container.innerHTML = `
    <div class="setup-screen reveal-screen" style="background: radial-gradient(ellipse at center, ${root.color}15 0%, #000 70%)">
      <div class="reveal-stage" id="reveal-stage" style="--rd:${cfg.delay}ms">

        <!-- Orb zone: container cố định để charging + orb dùng position:absolute -->
        <!-- Không dùng display:none ở đây → không có layout reflow khi swap -->
        <div class="reveal-orb-zone">

          <!-- Phase 1: Charging — CSS tự fade out sau --rd ms -->
          <div class="reveal-phase rp-charge" id="rp-charging">
            <div class="reveal-charge-text">⚡ Thiên Địa Phán Xét...</div>
            <div class="reveal-charge-bar">
              <div class="reveal-charge-fill"></div>
            </div>
          </div>

          <!-- Phase 2: Orb — CSS tự xuất hiện sau --rd ms, không cần JS -->
          <div class="reveal-phase rp-orb-phase" id="rp-orb">
            <div class="reveal-orb-wrap" style="--root-color:${root.color}">
              <div class="reveal-orb-bg" style="background:radial-gradient(circle, ${root.color}40 0%, transparent 70%)"></div>
              ${particles}
              <div class="reveal-orb-core">
                <span class="reveal-orb-icon">${root.emoji}</span>
              </div>
            </div>
          </div>

        </div><!-- /.reveal-orb-zone -->

        <!-- Phase 3: Reveal text — JS remove hidden + double-rAF -->
        <div class="reveal-phase hidden" id="rp-text">
          <div class="reveal-rarity-badge" style="color:${root.color};border-color:${root.color}44">
            ${cfg.tierName}
          </div>
          <div class="reveal-root-name" style="color:${root.color}">
            ${root.name}
          </div>
          <div class="reveal-element">⬥ ${root.element} ⬥</div>
        </div>

        <!-- Phase 4: Prophecy + Bonuses -->
        <div class="reveal-phase hidden" id="rp-details">
          <div class="reveal-prophecy">"${root.prophecy}"</div>
          <div class="reveal-bonuses">
            <div class="reveal-bonus-item" style="color:${root.color}">×${rateMulti} tốc độ tu luyện</div>
          ${Object.entries(spiritData.points).sort((a,b)=>b[1]-a[1]).map(([el,pts]) => { const e = SPIRIT_ELEMENTS[el]; return `<div class="reveal-bonus-item" style="color:${e?.color||'#aaa'}">${e?.emoji||'?'} ${e?.name||el}: ${pts} điểm</div>`; }).join('')}
          </div>
          ${_state.sectInvites.length > 0 ? `
            <div class="reveal-invite-hint" style="color:${root.color}">
              ✉ ${_state.sectInvites.length === 4 ? 'CẢ 4 TÔNG MÔN' : _state.sectInvites.map(s=>s.name).join(', ')} gửi thư mời!
            </div>
          ` : ''}
          <div class="reveal-action-btns" style="display:flex;gap:10px;justify-content:center;margin-top:8px">
            ${_state.rolls < 3 ? `
              <button id="btn-reroll" class="btn-secondary reveal-next-btn" style="flex:1">
                🎲 Thử Lại (${3 - _state.rolls})
              </button>` : ''}
            <button id="btn-reveal-next" class="btn-primary reveal-next-btn" style="border-color:${root.color};flex:1">
              ${_state.sectInvites.length > 0 ? '✉ Xem Thư Mời →' : '✓ Chấp Nhận →'}
            </button>
          </div>
        </div>

      </div>
    </div>`;

  // Run animation sequence — chỉ chạy khi mới roll, không chạy khi back từ confirm
  if (!_state._revealDone) {
    _state._revealDone = true;
    _runRevealAnimation(cfg.delay, cfg.shake);
  } else {
    // Đã xem rồi (back từ confirm) — skip toàn bộ animation, hiện ngay
    // reveal-instant override CSS animation về trạng thái cuối tức thì
    document.getElementById('reveal-stage')?.classList.add('reveal-instant');
    document.getElementById('rp-text')?.classList.remove('hidden');
    document.getElementById('rp-details')?.classList.remove('hidden');
  }
  // NOTE: KHÔNG gọi wireSetupEvents() ở đây — renderSetup() đã gọi sau switch.
  // Gọi 2 lần → btn-reroll nhận 2 listener → rollRoot() bắn đôi mỗi click.
}

function _runRevealAnimation(revealDelay, shake) {
  // Phase 1 (charge fill) + Phase 2 (orb): handled by CSS animation-delay via --rd.
  // Không cần JS timeout cho 2 phase này nữa — không layout reflow, GPU-only.

  // Screen shake — chỉ rarity hiếm, cần JS vì phụ thuộc vào cfg.shake runtime
  if (shake) {
    setTimeout(() => {
      const stage = document.getElementById('reveal-stage');
      if (!stage) return;
      stage.classList.add('screen-shake');
      // Tự xóa sau khi animation xong để không block transform sau này
      stage.addEventListener('animationend', () => stage.classList.remove('screen-shake'), { once: true });
    }, revealDelay);
  }

  // Phase 3: Tên linh căn — double-rAF tách display:block khỏi animation start
  // Không dùng classList.add animation cùng frame với remove('hidden'):
  // browser bỏ qua from-keyframe → flash. double-rAF đảm bảo layout commit xong.
  setTimeout(() => {
    const el = document.getElementById('rp-text');
    if (!el) return;
    el.classList.remove('hidden');
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('reveal-fade-in')));
  }, revealDelay + 800);

  // Phase 4: Chi tiết + nút — same pattern
  setTimeout(() => {
    const el = document.getElementById('rp-details');
    if (!el) return;
    el.classList.remove('hidden');
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('reveal-fade-in')));
  }, revealDelay + 1600);
}

function _getSectInvites(spiritData) {
  if (!spiritData) return [];
  const SECT_INFO = {
    kiem_tong: { id:'kiem_tong', name:'Thanh Vân Kiếm Tông', emoji:'⚔', color:'#c8a84b' },
    dan_tong:  { id:'dan_tong',  name:'Vạn Linh Đan Tông',   emoji:'⚗', color:'#e05c1a' },
    tran_phap: { id:'tran_phap', name:'Huyền Cơ Các',         emoji:'🔮', color:'#7b68ee' },
    the_tu:    { id:'the_tu',    name:'Thiết Cốt Môn',         emoji:'💪', color:'#a07850' },
  };
  // Chỉ mời khi Thiên/Song/Biến Dị
  if (!['TIEN','SONG','BIEN_DI'].includes(spiritData.type)) return [];
  const recSects = getRecommendedSects(spiritData);
  return recSects.map(id => SECT_INFO[id]).filter(Boolean);
}

// ============================================================
// PHASE: SECT INVITE — Thư mời tông môn
// ============================================================
function renderSectInvitePhase() {
  const root = _state.spiritData ? { color: getSpiritMainColor(_state.spiritData), emoji: SPIRIT_ELEMENTS[_state.spiritData.mainElement]?.emoji || '✦', name: getSpiritDisplayName(_state.spiritData), prophecy: getSpiritProphecy(_state.spiritData) } : null;
  const invites = _state.sectInvites;
  const isLegendary = root?.rarity === 'huyền thoại';
  const isEpic      = root?.rarity === 'cực hiếm';

  return `
    <div class="setup-screen" style="background:radial-gradient(ellipse at center, ${root?.color}10 0%, #000 70%)">
      <div class="setup-header">
        <h1>${isLegendary ? '🌌 THIÊN MỆNH ĐƯỢC CÔNG NHẬN' : isEpic ? '✦ CƠ DUYÊN HIẾM CÓ' : '✉ Thư Mời'}</h1>
        <p class="setup-sub" style="color:${root?.color}">
          ${isLegendary ? 'Tổ Sư các tông môn đích thân xuất hiện!' : 'Linh căn của ngươi đã thu hút sự chú ý'}
        </p>
      </div>
      <div class="setup-card" style="border-color:${root?.color}44">
        ${isLegendary ? `
          <div class="invite-legendary-banner">
            🌌 Hỗn Nguyên Linh Căn xuất hiện lần đầu trong 10.000 năm!<br>
            Thiên địa rung chuyển, cả Phàm Nhân Giới đều cảm nhận được!
          </div>
        ` : ''}
        <p style="color:var(--text-dim);font-size:13px;margin-bottom:16px">
          ${invites.length === 4
            ? 'Tất cả các đại tông môn đều muốn thu ngươi làm đệ tử!'
            : `Thiên phú của ngươi đã lọt vào mắt xanh của ${invites.map(s=>s.name).join(' và ')}.`}
        </p>
        <div class="invite-note" style="margin-bottom:14px">
          Hãy chọn gia nhập ngay — ngươi sẽ bắt đầu hành trình tại tông môn đó.<br>
          Hoặc từ chối tất cả để bắt đầu như một <strong>tán tu</strong> tự do.
        </div>
        <div class="invite-list">
          ${invites.map(sect => `
            <div class="invite-card" style="border-color:${sect.color}44;cursor:pointer" data-sect-id="${sect.id}">
              <span class="invite-emoji">${sect.emoji}</span>
              <div style="flex:1">
                <div class="invite-name" style="color:${sect.color}">${sect.name}</div>
                <div class="invite-msg" style="font-size:11px;color:var(--text-dim)">Nhấn để gia nhập tông môn này ngay</div>
              </div>
              <button class="btn-primary btn-sm btn-join-sect" data-sect-id="${sect.id}"
                style="border-color:${sect.color};font-size:11px;padding:4px 10px">
                ✓ Gia Nhập
              </button>
            </div>
          `).join('')}
        </div>
        <button id="btn-invite-continue" class="btn-secondary setup-btn" style="margin-top:8px">
          🌿 Từ Chối — Bắt Đầu Như Tán Tu
        </button>
      </div>
    </div>`;
}

// ============================================================
// PHASE: CONFIRM
// ============================================================
function renderConfirmPhase() {
  const root = _state.spiritData ? { color: getSpiritMainColor(_state.spiritData), emoji: SPIRIT_ELEMENTS[_state.spiritData.mainElement]?.emoji || '✦', name: getSpiritDisplayName(_state.spiritData), prophecy: getSpiritProphecy(_state.spiritData) } : null;
  return `
    <div class="setup-screen">
      <div class="setup-header">
        <h1>🌟 Số Mệnh Đã Định</h1>
        <p class="setup-sub">Con đường tu tiên của ngươi bắt đầu</p>
      </div>
      <div class="setup-card confirm-card">
        <div class="confirm-row">
          <span class="confirm-label">Đạo Hiệu</span>
          <span class="confirm-value">${_state.name || 'Vô Danh Đạo Nhân'}</span>
        </div>
        <div class="confirm-row">
          <span class="confirm-label">Thân Phận</span>
          <span class="confirm-value">${_state.gender === 'female' ? '👩 Nữ Tu Sĩ' : '👨 Nam Tu Sĩ'}</span>
        </div>
        <div class="confirm-row">
          <span class="confirm-label">Linh Căn</span>
          <span class="confirm-value" style="color:${root?.color}">${root?.emoji} ${root?.name}</span>
        </div>
        <div class="confirm-row">
          <span class="confirm-label">Tông Môn</span>
          <span class="confirm-value" style="color:${_state.chosenSectId ? '#c8a84b' : '#888'}">
            ${_state.chosenSectId
              ? (() => {
                  const SECT_NAMES = { kiem_tong:'⚔ Thanh Vân Kiếm Tông', dan_tong:'⚗ Vạn Linh Đan Tông', tran_phap:'🔮 Huyền Cơ Các', the_tu:'💪 Thiết Cốt Môn' };
                  return SECT_NAMES[_state.chosenSectId] || _state.chosenSectId;
                })()
              : '🌿 Tán Tu (chưa gia nhập)'}
          </span>
        </div>
        <div style="background:rgba(200,168,75,0.08);border:1px solid rgba(200,168,75,0.2);
          border-radius:8px;padding:10px;font-size:11px;color:var(--text-dim);line-height:1.6;margin:8px 0">
          ⚠ Ngươi bắt đầu như một tán tu. Hãy khám phá thế giới và gia nhập tông môn khi đã đủ sức.
        </div>
        <div class="confirm-prophecy">
          <p>${root?.prophecy}</p>
        </div>
        <button id="btn-start" class="btn-primary setup-btn large">⚡ Bắt Đầu Tu Tiên</button>
        <button id="btn-back" class="btn-secondary setup-btn small">← Quay Lại</button>
      </div>
    </div>`;
}

// ============================================================
// WIRE EVENTS
// ============================================================
function wireSetupEvents() {
  switch (_state.phase) {
    case 'gender':
      // Spawn hiệu ứng sao + particle sau khi DOM đã có
      requestAnimationFrame(_initGenderEffects);

      document.querySelectorAll('.gender-card').forEach(card => {
        card.addEventListener('click', () => {
          _state.gender = card.dataset.gender;
          // Cập nhật class trực tiếp thay vì re-render để giữ animation
          document.querySelectorAll('.gender-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          document.getElementById('gender-grid')?.classList.add('has-selection');
          const btn = document.getElementById('btn-gender-confirm');
          if (btn) btn.removeAttribute('disabled');
        });
        card.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
        });
      });
      document.getElementById('btn-gender-confirm')?.addEventListener('click', () => {
        if (_state.gender) { _state.phase = 'name'; renderSetup(); }
      });
      break;

    case 'name':
      document.getElementById('btn-name-confirm')?.addEventListener('click', () => {
        const v = document.getElementById('input-name')?.value.trim();
        _state.name = v || 'Vô Danh Đạo Nhân';
        _state.phase = 'roll';
        renderSetup();
      });
      document.getElementById('input-name')?.addEventListener('keypress', e => {
        if (e.key === 'Enter') document.getElementById('btn-name-confirm')?.click();
      });
      break;

    case 'roll':
      // Chỉ còn nút Khai Linh Căn ban đầu
      document.getElementById('btn-roll')?.addEventListener('click', rollRoot);
      break;

    case 'reveal':
      // Nút Thử Lại — roll lại, cinematic chạy lại với kết quả mới
      document.getElementById('btn-reroll')?.addEventListener('click', rollRoot);
      // Nút Chấp Nhận — đi tiếp
      document.getElementById('btn-reveal-next')?.addEventListener('click', () => {
        if (_state.sectInvites.length > 0) {
          _state.phase = 'invite';
        } else {
          _state.phase = 'confirm';
        }
        renderSetup();
      });
      break;

    case 'invite':
      // Gia nhập tông môn ngay
      document.querySelectorAll('.btn-join-sect').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          _state.chosenSectId = btn.dataset.sectId;
          _state.phase = 'confirm';
          renderSetup();
        });
      });
      // Từ chối — tán tu
      document.getElementById('btn-invite-continue')?.addEventListener('click', () => {
        _state.chosenSectId = null;
        _state.phase = 'confirm';
        renderSetup();
      });
      break;

    case 'confirm':
      document.getElementById('btn-start')?.addEventListener('click', () => {
        document.getElementById('setup-container').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        _onComplete({
          name: _state.name,
          gender: _state.gender || 'male',
          spiritRootId: _state.spiritRootId,
          spiritData: _state.spiritData,
          sectId: _state.chosenSectId || null,
          sectInvites: _state.sectInvites.map(s => s.id),
        });
      });
      // Back: về invite nếu có, về reveal nếu không — không chạy lại animation vì _runRevealAnimation không tự gọi khi re-render
      document.getElementById('btn-back')?.addEventListener('click', () => {
        _state.phase = _state.sectInvites.length > 0 ? 'invite' : 'reveal';
        renderSetup();
      });
      break;
  }
}

function rollRoot() {
  _state.rolls++;
  _state.spiritData = rollSpiritRoot();
  _state.spiritRootId = _state.spiritData.mainElement;
  _state.sectInvites = _getSectInvites(_state.spiritData);
  _state._revealDone = false; // reset để animation chạy lại với kết quả mới

  _state.phase = 'reveal';
  const container = document.getElementById('setup-container');
  container.style.opacity = '0';
  setTimeout(() => {
    renderSetup();
    container.style.opacity = '1';
  }, 200);
}

// Helper render root result (dùng trong phase roll)
function renderRootResult(root) {
  const bonuses = Object.entries(root.bonus)
    .map(([k, v]) => `${k}: +${v}`).join(', ');
  return `
    <div class="root-result" style="border-color:${root.color}">
      <div class="root-emoji">${root.emoji}</div>
      <h3 style="color:${root.color}">${root.name}</h3>
      <div class="root-rarity rarity-${root.rarity}">${root.rarity.toUpperCase()}</div>
      <p class="root-desc">${root.desc}</p>
      <p class="root-bonus">Bonus: ${bonuses}</p>
    </div>`;
}
