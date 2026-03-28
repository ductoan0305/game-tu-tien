// ============================================================
// ui/render-core.js — Header, resource bars, tab switching
// Chỉ đọc G — không mutate state
// ============================================================
import { REALMS } from '../core/data.js';
import { calcQiRate, calcMaxQi, calcAtk, calcDef, calcMaxHp, calcPurityThreshold } from '../core/state.js';
import { fmtNum, fmtTime, pct, el } from '../utils/helpers.js';
import { renderPortrait } from './portrait.js';
import { getActiveTitle } from '../core/title-engine.js';
import { getRemainingLifespan, getMaxLifespan, getLifespanColor, getLifespanPercent, formatYear } from '../core/time-engine.js';
import { formatCurrencyShort, migrateCurrency } from '../core/currency.js';
import { isTabUnlocked, getTabLockInfo, TAB_UNLOCK_CONFIG } from './nav-progression.js';
import { calcBreakthroughChance } from '../core/actions.js';
import { getAmThuongStatus } from '../core/duoc-dien-engine.js';
import { getDanhVongTier } from '../core/danh-vong.js';

// ---- Tab management ----

let _currentTab = 'cultivate';
const TAB_IDS = ['cultivate','combat','alchemy','quests','skills','inventory','shop','ranking','equipment','dungeon','sect','passive','phapdia','nghe_nghiep','tran_phap','phu_chu','khoi_loi','linh_thuc','linh_thu'];

export function switchTab(tabId, G) {
  if (!TAB_IDS.includes(tabId)) return;
  _currentTab = tabId;
  if (G) G.activeTab = tabId;

  // Update nav buttons (bottom-nav + compat)
  document.querySelectorAll('.nav-btn, .bnav-btn, .bmp-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  // Close "more" panel after tab switch
  const morePanel = document.getElementById('bnav-more-panel');
  if (morePanel) morePanel.style.display = 'none';

  // Show/hide panels (center-panel)
  TAB_IDS.forEach(id => {
    const panel = el(`panel-${id}`);
    if (panel) panel.style.display = id === tabId ? '' : 'none';
  });

  // Update scene title
  const SCENE_TITLES = {
    cultivate:['🗺 Bản Đồ — Thanh Vân Sơn','Khám phá thế giới tu tiên, chinh phục mọi vùng đất'],
    combat:   ['⚔ Liệp Yêu — Chiến Trường','Đánh bại yêu thú tích lũy kinh nghiệm và loot'],
    alchemy:  ['⚗ Luyện Đan — Đan Lư','Luyện đan dược tăng cường sức mạnh tu tiên'],
    quests:   ['📜 Nhiệm Vụ — Bảng Lệnh','Hoàn thành nhiệm vụ nhận phần thưởng'],
    skills:   ['✦ Kỹ Năng — Tu Tiên Chi Đạo','Học kỹ năng tăng sức mạnh chiến đấu'],
    inventory:['🎒 Túi Đồ — Càn Khôn Đại Sách','Vật phẩm tích lũy trên đường tu tiên'],
    shop:     ['🏮 Cửa Hàng — Vạn Linh Thị','Mua bán vật phẩm tu luyện'],
    ranking:  ['🏆 Xếp Hạng — Thiên Bảng','Tranh đoạt vị trí trên thiên bảng'],
    equipment:['⚔ Trang Bị — Pháp Bảo Các','Trang bị pháp bảo nâng cao chiến lực'],
    dungeon:  ['☠ Địa Phủ — Thiên Ma Địa Phủ','Chinh phục 10 tầng nhận báu vật hiếm'],
    sect:     ['🏯 Tông Môn — Môn Phái','Đóng góp tông môn nhận phần thưởng'],
    passive:  ['✦ Thiên Phú — Linh Căn Chi Lực','Phát triển tiềm năng thiên phú linh căn'],
    phapdia:  ['🏔 Pháp Địa — Môi Trường Tu Luyện','Chọn vị trí và công pháp tu luyện tối ưu'],
    nghe_nghiep:['🛠 Nghề Nghiệp — Bách Nghệ Đường','Luyện đan, rèn khí và các nghề phụ tu tiên'],
    tran_phap:['🔮 Trận Pháp — Trận Pháp Các','Bố trí trận pháp phòng thủ và tấn công'],
    phu_chu:  ['📿 Phù Chú — Phù Lục Đường','Vẽ phù chú linh tăng cường và bảo hộ'],
    khoi_loi: ['🤖 Khôi Lỗi — Khôi Lỗi Phường','Chế tạo và điều khiển khối lỗi chiến đấu'],
    linh_thuc:['🍲 Linh Thực — Linh Thực Lâu','Nấu linh thực tăng tuổi thọ và sức mạnh'],
    linh_thu: ['🐾 Linh Thú — Thú Uyển','Thuần dưỡng linh thú hỗ trợ tu luyện'],
  };
  const info = SCENE_TITLES[tabId] || [tabId,''];
  const titleEl = document.querySelector('.scene-title');
  const subEl   = document.getElementById('scene-subtitle');
  if (titleEl) titleEl.textContent = info[0];
  if (subEl)   subEl.textContent   = info[1];

  const event = new CustomEvent('tab:switch', { detail: { tabId, G } });
  document.dispatchEvent(event);
}

export function getCurrentTab() {
  return _currentTab;
}

// ---- Header render (gọi mỗi tick) ----

// ---- Render nav với unlock states ----
export function renderNav(G) {
  // Tính notification dots
  const dots = _calcNavDots(G);

  document.querySelectorAll('.bnav-btn[data-tab], .bmp-btn[data-tab]').forEach(btn => {
    const tabId = btn.dataset.tab;
    if (!tabId) return;

    // Lock state (chỉ cho .nav-btn cũ nếu còn)
    const unlocked = isTabUnlocked(tabId, G);
    if (!unlocked) {
      btn.classList.add('nav-locked');
      return;
    }
    btn.classList.remove('nav-locked');
    btn.querySelector('.nav-lock-icon')?.remove();

    // Notification dot
    let dot = btn.querySelector('.nav-dot');
    if (dots[tabId]) {
      if (!dot) {
        dot = document.createElement('span');
        dot.className = `nav-dot nav-dot-${dots[tabId]}`;
        btn.appendChild(dot);
      } else {
        dot.className = `nav-dot nav-dot-${dots[tabId]}`;
      }
    } else {
      dot?.remove();
    }
  });

  // Compat: nav-btn cũ
  document.querySelectorAll('.nav-btn[data-tab]').forEach(btn => {
    const tabId = btn.dataset.tab;
    if (!tabId || tabId === 'cultivate') return;
    const unlocked = isTabUnlocked(tabId, G);
    btn.classList.toggle('nav-locked', !unlocked);
    if (!unlocked) {
      const lockInfo = getTabLockInfo(tabId, G);
      if (lockInfo && !btn.querySelector('.nav-lock-icon')) {
        const lock = document.createElement('span');
        lock.className = 'nav-lock-icon';
        lock.textContent = '🔒';
        btn.appendChild(lock);
      }
    } else {
      btn.querySelector('.nav-lock-icon')?.remove();
    }
  });
}

// Tính notification dots cho từng tab
// Return: { tabId: 'red' | 'yellow' | null }
function _calcNavDots(G) {
  const dots = {};

  // ---- cultivate dot — KHÔNG dùng nữa, dùng char-popup indicator thay thế ----
  // Đỏ: đang đói (urgent) — vẫn gắn vào nav để báo khẩn
  if ((G.hunger?.hungerDays ?? 0) >= 1) dots.cultivate = 'red';

  // ---- quests ----
  const unclaimedDaily = (G.quests?.daily || []).some(e => e.completed && !e.claimed);
  if (unclaimedDaily) dots.quests = 'red';
  else {
    const hasCompletedActive = (G.quests?.active || []).some(e => e.completed);
    if (hasCompletedActive) dots.quests = 'yellow';
  }

  // ---- nghe_nghiep (nghề nghiệp) ----
  // Dược Điền có ô chín → đỏ
  const hasReadyCrop = (G.duocDien?.slots || []).some(s => {
    if (!s) return false;
    return (G.gameTime?.currentYear ?? 0) >= s.harvestAt;
  });
  if (hasReadyCrop) dots.nghe_nghiep = 'red';
  // Bếp/Bễ Rèn hỏng → vàng
  else if (
    (G.linhThuc?.kitchen?.durability ?? 1) <= 0 ||
    (G.alchemy?.forge?.durability ?? 1) <= 0 ||
    (G.alchemy?.furnaceDurability ?? 1) <= 0
  ) dots.nghe_nghiep = 'yellow';

  // ---- alchemy ----
  if (_hasReadyRecipe(G)) dots.alchemy = 'yellow';

  // ---- sect ----
  if (G.sectId && _hasSectActivityReady(G)) dots.sect = 'yellow';

  // ---- dungeon ----
  if (isTabUnlocked('dungeon', G)) {
    const dv = G.danhVong ?? 0;
    const maxAttempts = dv >= 500 ? 8 : dv >= 300 ? 6 : dv >= 150 ? 5 : dv >= 50 ? 4 : 3;
    const attemptsToday = G.dungeon?.attemptsToday ?? G.dungeon?.runsToday ?? 0;
    if (attemptsToday < maxAttempts) dots.dungeon = 'yellow';
  }

  // ---- linh_thu (Linh Thú) ----
  if (isTabUnlocked('linh_thu', G)) {
    const slots = G.linhThu?.slots || [];
    const now   = G.gameTime?.currentYear ?? 0;
    const eggReady   = (G.linhThu?.eggs || []).some(e => now >= e.hatchAt);
    const beastHungry = slots.some(s => s && (now - (s.lastFedAt ?? 0)) * 365 >= 5);
    if (eggReady)      dots.linh_thu = 'red';
    else if (beastHungry) dots.linh_thu = 'yellow';
  }

  // ---- cultivate: Nghiệp Lực cao ----
  if ((G.nghiepLuc ?? 0) >= 50 && !dots.cultivate) {
    dots.cultivate = 'yellow'; // chỉ nếu chưa có dot đỏ từ đột phá/đói
  }

  // ---- Thương Hội — dot trên nghe_nghiep hoặc cultivate ----
  if ((G.danhVong ?? 0) >= 50 && G.thuongHoi && window._thuongHoiData?.FREELANCE_QUESTS) {
    const now2 = G.gameTime?.currentYear ?? 0;
    const th   = G.thuongHoi;
    const hasReady = window._thuongHoiData.FREELANCE_QUESTS.some(q => {
      if ((G.danhVong ?? 0) < q.requireDV) return false;
      if ((G.realmIdx ?? 0) < q.requireRealm) return false;
      return (now2 - (th.questCooldowns?.[q.id] ?? 0)) >= q.cooldownHours / 8760;
    });
    if (hasReady && !dots.cultivate) dots.cultivate = 'yellow';
  }

  // ---- shop ----
  if (isTabUnlocked('shop', G)) {
    const stone = G.stone ?? 0;
    const noFurnace = (G.alchemy?.furnaceLevel ?? 0) === 0 && stone >= 200;
    const noForge   = (G.alchemy?.forge?.level ?? 0) === 0 && stone >= 250;
    const noKitchen = (G.linhThuc?.kitchen?.level ?? 0) === 0 && stone >= 200
                      && isTabUnlocked('nghe_nghiep', G);
    // Gợi ý Linh Địa nếu đang ở Phàm Địa
    const wantPhapDia = (G.phapDia?.currentId ?? 'pham_dia') === 'pham_dia' && stone >= 500;
    if (noFurnace || noForge || noKitchen || wantPhapDia) dots.shop = 'yellow';
  }

  // ---- passive ----
  if (isTabUnlocked('passive', G)) {
    const passiveTree = G.passiveTree || {};
    const canUpgrade  = Object.values(passiveTree).some(n => !n.maxed && (G.stone ?? 0) >= (n.nextCost ?? 999999));
    if (canUpgrade) dots.passive = 'yellow';
  }

  return dots;
}

function _hasReadyRecipe(G) {
  if (!G.alchemy?.knownRecipes?.length) return false;
  const ingredients = G.alchemy?.ingredients || {};
  return G.alchemy.knownRecipes.length > 0 && Object.values(ingredients).some(v => v > 0);
}

function _hasSectActivityReady(G) {
  if (!G.sectId) return false;
  const cooldowns = G.sect?.cooldowns || {};
  const now = Date.now();
  if (Object.keys(cooldowns).length === 0) return true;
  // Nhiều hoạt động có cooldown 30–120 phút thực (1800–7200s)
  return Object.values(cooldowns).some(ts => (now - ts) / 1000 >= 1800);
}

// Kiểm tra và thông báo tab vừa mở khóa
let _prevUnlockState = {};
export function checkAndNotifyUnlocks(G, showToastFn, appendLogFn) {
  for (const [tabId, cfg] of Object.entries(TAB_UNLOCK_CONFIG)) {
    if (!cfg.unlockMsg) continue;
    const key = `unlock_notified_${tabId}`;
    if (G[key]) continue; // đã thông báo rồi
    if (isTabUnlocked(tabId, G)) {
      G[key] = true;
      if (showToastFn) showToastFn(cfg.unlockMsg, 'jade');
      if (appendLogFn) appendLogFn(`🔓 ${cfg.unlockMsg}`, 'jade');
    }
  }
}

// Hiển thị linh thạch từ G.stone (nguồn thực tế game dùng G.stone += X)
function _formatStone(G) {
  const total = Math.floor(G.stone || 0);
  if (total >= 1000000) return `${(total/1000000).toFixed(1)}🔮 Thượng`;
  if (total >= 10000)   return `${(total/10000).toFixed(1)}💠 Trung`;
  if (total >= 1000)    return `${(total/1000).toFixed(1)}K 💎Hạ`;
  return `${total} 💎Hạ`;
}

// Helper: chỉ set textContent khi giá trị thay đổi — tránh layout thrashing + flicker
function setIfChanged(id, value, attr = 'textContent') {
  const node = el(id);
  if (!node) return;
  if (node[attr] !== value) node[attr] = value;
}

function setStyleIfChanged(node, prop, value) {
  if (!node) return;
  if (node.style[prop] !== value) node.style[prop] = value;
}

export function renderHeader(G) {
  const realm = REALMS[G.realmIdx];
  const maxQi = calcMaxQi(G);
  const maxHp = calcMaxHp(G);
  const rate  = calcQiRate(G);

  // Realm + stage — dùng stageNames nếu có
  const stageName = realm.stageNames
    ? (realm.stageNames[G.stage - 1] ?? `Tầng ${G.stage}`)
    : `Tầng ${G.stage}`;
  setIfChanged('hdr-realm', `${realm.emoji} ${realm.name} · ${stageName}`);

  // Name
  setIfChanged('hdr-name', G.name);

  // Indicator đột phá — gắn vào khu vực nhân vật (btn-char-popup)
  const charPopupBtn = document.getElementById('btn-char-popup');
  if (charPopupBtn) {
    const threshold = REALMS[G.realmIdx]?.purityThresholds?.[(G.stage ?? 1) - 1] ?? 999999;
    const purity    = G.purity ?? 0;
    const qiFull    = (G.qi ?? 0) >= calcMaxQi(G);
    const btReady   = qiFull && purity >= threshold;
    const btSoon    = qiFull && purity >= threshold * 0.5 && !btReady;

    let indicator = charPopupBtn.querySelector('.char-bt-indicator');
    if (btReady || btSoon) {
      if (!indicator) {
        indicator = document.createElement('span');
        indicator.className = 'char-bt-indicator';
        charPopupBtn.style.position = 'relative';
        charPopupBtn.appendChild(indicator);
      }
      indicator.textContent = btReady ? '⚡' : '✦';
      indicator.style.cssText = `position:absolute;top:4px;right:4px;font-size:12px;color:${btReady?'#a855f7':'#f0d47a'};animation:pulse 1.2s infinite;pointer-events:none`;
    } else {
      indicator?.remove();
    }
  }

  // Active title
  const titleEl = el('hdr-title');
  if (titleEl) {
    const t = getActiveTitle(G);
    if (t) {
      const rarityColors = { common:'#aaa', uncommon:'#56c46a', rare:'#4a9eff', epic:'#a855f7', legendary:'#f0d47a' };
      const newText = `${t.emoji} 【${t.name}】`;
      if (titleEl.textContent !== newText) titleEl.textContent = newText;
      titleEl.style.color = rarityColors[t.rarity] || '#aaa';
      titleEl.style.display = '';
    } else {
      titleEl.style.display = 'none';
    }
  }

  // Pháp Địa + Công Pháp — ít thay đổi nhất
  const leftPd = el('stat-phapdia-left');
  if (leftPd) {
    const pdId = G.phapDia?.currentId || 'pham_dia';
    const cpId = G.congPhap?.currentId || 'vo_danh';
    const pdMap = { pham_dia:'🏚 Phàm Địa', linh_dia:'🌿 Linh Địa', phuc_dia:'🏔 Phúc Địa', dong_phu:'🕳 Động Phủ', bao_dia:'💎 Bảo Địa' };
    const activeCount = G.congPhap?.activeIds?.length ?? 1;
    const pdText = `${pdMap[pdId]||pdId} · ${activeCount} công pháp`;
    if (leftPd.textContent !== pdText) leftPd.textContent = pdText;
  }

  // Thanh Qi / Purity — khi qi đầy 100%, chuyển hiển thị sang purity
  const qiFull = (G.qi ?? 0) >= maxQi;
  if (!qiFull) {
    // Qi chưa đầy — hiển thị bình thường
    renderBar('bar-qi', G.qi, maxQi,
      `⚡ ${fmtNum(Math.floor(G.qi))} / ${fmtNum(maxQi)}  (${rate}/s)`);
    _setBarColor('bar-qi', '#4a9eff');
  } else {
    // Qi đã đầy — hiển thị Thuần Độ
    const threshold = calcPurityThreshold(G);
    const purRatio  = Math.min((G.purity ?? 0) / Math.max(1, threshold), 2.0);
    const purPct    = Math.min(purRatio * 100, 100); // cap hiển thị ở 100%
    const purLabel  = purRatio >= 1.0
      ? `✨ Thuần Độ ${((G.purity ?? 0) / threshold * 100).toFixed(0)}% ngưỡng — sẵn sàng đột phá`
      : `✨ Thuần Độ ${((G.purity ?? 0) / threshold * 100).toFixed(1)}% / 100% ngưỡng`;
    renderBar('bar-qi', purPct, 100, purLabel);
    // Màu chuyển dần: xanh → vàng → tím khi đủ ngưỡng
    const purColor = purRatio >= 1.0 ? '#a855f7' : purRatio >= 0.5 ? '#f0d47a' : '#56c46a';
    _setBarColor('bar-qi', purColor);
  }
  renderBar('bar-hp',      G.hp,       maxHp,        `HP ${Math.floor(G.hp)} / ${maxHp}`);
  renderBar('bar-stamina', G.stamina,  G.maxStamina, `💪 ${Math.floor(G.stamina)} / ${G.maxStamina}`);

  // Mobile char bar — cập nhật mini bars
  const mcbQi      = document.getElementById('mcb-qi');
  const mcbHp      = document.getElementById('mcb-hp');
  const mcbStamina = document.getElementById('mcb-stamina');
  const mcbName    = document.getElementById('mcb-name');
  const mcbRealm   = document.getElementById('mcb-realm');
  const mcbBar     = document.getElementById('mobile-char-bar');
  if (mcbQi)      mcbQi.style.width      = `${Math.min(100,(G.qi/maxQi)*100).toFixed(1)}%`;
  if (mcbHp)      mcbHp.style.width      = `${Math.min(100,(G.hp/maxHp)*100).toFixed(1)}%`;
  if (mcbStamina) mcbStamina.style.width = `${Math.min(100,(G.stamina/G.maxStamina)*100).toFixed(1)}%`;
  if (mcbName)    mcbName.textContent    = G.name || 'Vô Danh';
  if (mcbRealm)   mcbRealm.textContent   = `${realm.emoji} ${realm.name} · ${stageName}`;
  // Click vào mobile char bar → mở char popup
  if (mcbBar && !mcbBar._wired) {
    mcbBar._wired = true;
    mcbBar.addEventListener('click', () => document.getElementById('btn-char-popup')?.click());
  }

  // Stone + EXP
  const stoneText = `💰 ${_formatStone(G)}`;
  setIfChanged('hdr-stone', stoneText);

  const expText = `📈 ${fmtNum(G.exp)} / ${fmtNum(G.maxExp)}`;
  setIfChanged('hdr-exp', expText);

  // Danh Vọng
  const dvEl = el('hdr-danhvong');
  if (dvEl) {
    const dv = G.danhVong ?? 0;
    const tier = getDanhVongTier(dv);
    const newText = dv > 0 ? `🌟 ${dv} · ${tier.label}` : '';
    if (dvEl.textContent !== newText) dvEl.textContent = newText;
    dvEl.style.color = tier.color;
    dvEl.style.display = dv > 0 ? '' : 'none';
  }

  // Lifespan
  if (G.gameTime) {
    const pct       = getLifespanPercent(G);
    const remaining = getRemainingLifespan(G);
    const color     = getLifespanColor(pct);
    const pctStr    = pct.toFixed(1) + '%';

    const lifespanEl = document.getElementById('lifespan-bar-fill');
    if (lifespanEl) { setStyleIfChanged(lifespanEl, 'width', pctStr); setStyleIfChanged(lifespanEl, 'background', color); }

    const lifespanTextEl = document.getElementById('lifespan-text');
    if (lifespanTextEl) {
      const remText = formatYear(remaining);
      if (lifespanTextEl.textContent !== remText) lifespanTextEl.textContent = remText;
      lifespanTextEl.style.color = color;
    }

    const yearText = `⏳ ${Math.floor(G.gameTime.currentYear)} tuổi`;
    setIfChanged('gametime-display', yearText);

    // Right panel lifespan
    const lifespanRightFill = document.getElementById('lifespan-bar-fill-right');
    if (lifespanRightFill) { setStyleIfChanged(lifespanRightFill, 'width', pctStr); setStyleIfChanged(lifespanRightFill, 'background', color); }

    const yearFull = `Tuổi ${Math.floor(G.gameTime.currentYear)} / ${formatYear(getMaxLifespan(G))}`;
    const ldYear = document.getElementById('ld-year');
    if (ldYear) { if (ldYear.textContent !== yearFull) ldYear.textContent = yearFull; ldYear.style.color = color; }

    const remText2 = `Còn ${formatYear(remaining)}`;
    setIfChanged('ld-remaining', remText2);

    // Thời gian chơi thực tế và trong game
    const realSec  = Math.floor((G.totalTime || 0));
    const realText = _fmtRealTime(realSec);
    setIfChanged('pt-real', realText);

    const gameYears = Math.max(0, (G.gameTime.currentYear || 10) - 10);
    const gameText  = gameYears <= 0 ? '0 năm' : _fmtGameTime(gameYears);
    setIfChanged('pt-game', gameText);
  } else if (G) {
    // G tồn tại nhưng gameTime chưa có — vẫn hiện thời gian thực
    setIfChanged('pt-real', _fmtRealTime(Math.floor(G.totalTime || 0)));
    setIfChanged('pt-game', '0 năm');
  }

  // Chronicle preview — chỉ update khi có entry mới
  const chrPrev = document.getElementById('chronicle-preview');
  if (chrPrev && G.chronicle?.length) {
    const last5key = G.chronicle.slice(-5).map(e => e.year).join(',');
    if (chrPrev.dataset.lastKey !== last5key) {
      chrPrev.dataset.lastKey = last5key;
      chrPrev.innerHTML = G.chronicle.slice(-5).reverse().map(e => `
        <div class="chr-preview-item">
          <span class="chr-py">Năm ${e.year} [${e.realmName}]</span><br>
          ${e.event}
        </div>`).join('');
    }
  }

  // Meditate button
  const meditateBtn = el('btn-meditate');
  if (meditateBtn) {
    meditateBtn.classList.toggle('active', !!G.meditating);
    meditateBtn.title = G.meditating ? '🧘 Xuất Quan' : '🧘 Bế Quan';
  }

  // Breakthrough header button
  const btHdrBtn = el('btn-breakthrough-hdr');
  if (btHdrBtn) {
    const qiFull = (G.qi || 0) >= maxQi;
    if (!qiFull) {
      const pctVal = Math.floor(Math.min(100, ((G.qi || 0) / Math.max(1, maxQi)) * 100));
      btHdrBtn.disabled = true;
      btHdrBtn.classList.remove('lq-btn-bt-ready');
      btHdrBtn.title = `⚡ Đột Phá (${pctVal}%)`;
      btHdrBtn.innerHTML = `⚡<span class="bt-pct">${pctVal}%</span>`;
    } else {
      const threshold = calcPurityThreshold(G);
      const purRatio  = (G.purity ?? 0) / Math.max(1, threshold);
      const canAttempt = purRatio >= 0.5;
      const { chance } = calcBreakthroughChance(G);

      btHdrBtn.disabled = !canAttempt;
      btHdrBtn.classList.toggle('lq-btn-bt-ready', canAttempt);

      if (canAttempt) {
        btHdrBtn.title = `⚡ Cơ hội đột phá: ${chance.toFixed(1)}%`;
        btHdrBtn.innerHTML = `⚡<span class="bt-pct">${chance.toFixed(0)}%</span>`;
      } else {
        const purPct = Math.floor(purRatio * 100);
        btHdrBtn.title = `✨ Đang tinh luyện Thuần Độ (${purPct}%)`;
        btHdrBtn.innerHTML = `✨<span class="bt-pct">${purPct}%</span>`;
      }
    }
  }

  // Timers / buffs
  renderActiveBuffs(G);
}

function renderBar(barId, current, max, label) {
  const container = el(barId);
  if (!container) return;

  const fill = container.querySelector('.bar-fill');
  const text = container.querySelector('.bar-text');

  const p = Math.round(pct(current, max) * 10) / 10;
  const pStr = `${p}%`;
  if (fill && fill.style.width !== pStr) fill.style.width = pStr;
  if (text && text.textContent !== label) text.textContent = label;
}

function _setBarColor(barId, color) {
  const fill = el(barId)?.querySelector('.bar-fill');
  if (fill && fill.style.background !== color) fill.style.background = color;
}

// Key cache để tránh re-render mỗi tick
let _lastBuffKey = '';

function renderActiveBuffs(G) {
  const buffsEl = el('active-buffs');
  if (!buffsEl) return;

  const pills = [];

  if (G.atkBuffTimer > 0)
    pills.push({ icon:'⚔', label:`ATK +${G.atkBuff}%`, timer: Math.ceil(G.atkBuffTimer), color:'#e05c4a' });
  if (G.defBuffTimer > 0)
    pills.push({ icon:'🛡', label:`DEF +${G.defBuff}%`, timer: Math.ceil(G.defBuffTimer), color:'#4a9eff' });
  if (G.stoneBuffTimer > 0)
    pills.push({ icon:'💎', label:`Đá +${G.stoneBuffPct}%`, timer: Math.ceil(G.stoneBuffTimer), color:'#f0d47a' });
  if (G.eventRateTimer > 0)
    pills.push({ icon:'⚡', label:`Tu tốc +${G.eventRateBonus}%`, timer: Math.ceil(G.eventRateTimer), color:'#56c46a' });
  if (G.eventExpTimer > 0)
    pills.push({ icon:'📈', label:`EXP +${G.eventExpBonus}%`, timer: Math.ceil(G.eventExpTimer), color:'#a89df5' });
  if (G.meditating)
    pills.push({ icon:'🧘', label:'Bế Quan ×1.6', timer: 0, color:'#7bcf8a' });

  // Tạo key: chỉ re-render khi danh sách buff hoặc timer (mỗi 5s) thay đổi
  const key = pills.map(p => `${p.label}:${p.timer > 0 ? Math.floor(p.timer/5) : 0}`).join('|');
  if (key === _lastBuffKey) return;
  _lastBuffKey = key;

  if (!pills.length) {
    buffsEl.innerHTML = '';
    return;
  }

  buffsEl.innerHTML = pills.map(p => {
    const timerStr = p.timer > 0
      ? `<span class="buff-timer">${_fmtTimer(p.timer)}</span>`
      : '';
    return `<span class="buff-pill" style="--buff-color:${p.color}">${p.icon} ${p.label}${timerStr}</span>`;
  }).join('');
}

function _fmtTimer(sec) {
  const s = Math.ceil(sec);
  if (s >= 3600) return `${Math.floor(s/3600)}h${Math.floor((s%3600)/60)}m`;
  if (s >= 60)   return `${Math.floor(s/60)}m${s%60}s`;
  return `${s}s`;
}

// ---- Cultivate tab (fast-updating elements) ----

export function renderCultivateStats(G) {
  if (_currentTab !== 'cultivate') return;

  renderPortrait(G);

  const realm   = REALMS[G.realmIdx];
  const rate    = calcQiRate(G);
  const maxQi   = calcMaxQi(G);
  const qiFull  = (G.qi ?? 0) >= maxQi;
  const threshold = calcPurityThreshold(G);

  // Stage name
  const stageName = realm.stageNames?.[G.stage - 1] ?? `Tầng ${G.stage}`;
  setIfChanged('stat-stage-name', stageName);

  const rateEl = el('stat-rate');
  if (rateEl) {
    const hungerMod = G.realmIdx === 0 && (G.hunger?.hungerDays ?? 0) > 0
      ? ` ⚠ đói ×${G.hunger?.isStarving ? '0.3' : '0.6'}`
      : '';
    rateEl.textContent = `${rate}/s${hungerMod}`;
  }

  const atkEl = el('stat-atk');  if (atkEl) atkEl.textContent = calcAtk(G);
  const defEl = el('stat-def');  if (defEl) defEl.textContent = calcDef(G);
  const hpEl  = el('stat-maxhp'); if (hpEl)  hpEl.textContent  = calcMaxHp(G);

  // ---- Nút Đột Phá + Tooltip xác suất ----
  const btBtn = el('btn-breakthrough');
  if (btBtn) {
    if (!qiFull) {
      // Qi chưa đầy — hiển thị %
      btBtn.disabled = true;
      btBtn.textContent = `⚡ Đột Phá (${Math.floor(pct(G.qi, maxQi))}%)`;
      btBtn.title = 'Cần đạt 100% linh lực trước.';
      btBtn.classList.remove('bt-ready', 'bt-purity-ready');
    } else {
      const purRatio = (G.purity ?? 0) / Math.max(1, threshold);
      const canAttempt = purRatio >= 0.5;
      const { chance, breakdown } = calcBreakthroughChance(G);

      if (canAttempt) {
        btBtn.disabled = false;
        btBtn.textContent = `⚡ ĐỘT PHÁ! (${chance.toFixed(1)}%)`;
        btBtn.classList.add('bt-ready');
        btBtn.classList.toggle('bt-purity-ready', purRatio >= 1.0);
      } else {
        btBtn.disabled = true;
        btBtn.textContent = `⚡ Tinh Luyện... (${(purRatio * 100).toFixed(0)}%)`;
        btBtn.classList.remove('bt-ready', 'bt-purity-ready');
      }

      // Tooltip breakdown
      const bd = breakdown;
      btBtn.title = [
        `🎯 Cơ hội thành công: ${chance.toFixed(1)}%`,
        `📊 Nền ${(bd.P_base * 100).toFixed(0)}%`,
        `  × Linh Căn ×${bd.F_lingcan.toFixed(2)}`,
        `  × Tuổi ×${bd.F_tuoi.toFixed(2)}`,
        `  × Thuần Độ ×${bd.F_purity.toFixed(2)} (${bd.purityRatio}% ngưỡng)`,
        `  × Ngộ Tính ×${bd.F_ngotinh.toFixed(2)}`,
        `  × Tâm Cảnh ×${bd.F_tamcanh.toFixed(2)}`,
        bd.danDoc > 40 ? `⚠ Đan Độc ${bd.danDoc.toFixed(0)} — giảm xác suất` : '',
        bd.canCotBonus > 0 ? `✓ Căn Cốt +${(bd.canCotBonus * 100).toFixed(1)}%` : '',
      ].filter(Boolean).join('\n');
    }
  }

  // ---- Pháp Địa + Công Pháp ----
  const pdEl = el('stat-phapdia');
  if (pdEl) {
    const pdId = G.phapDia?.currentId || 'pham_dia';
    const cpId = G.congPhap?.currentId || 'vo_danh';
    const pdMap = { pham_dia:'🏚 Phàm Địa', linh_dia:'🌿 Linh Địa', phuc_dia:'🏔 Phúc Địa', dong_phu:'🕳 Động Phủ', bao_dia:'💎 Bảo Địa' };
    const cpMap = {
      vo_danh:'📜 Vô Danh',
      kiem_quyet_ha:'⚔ Hạ Phẩm', kiem_quyet_trung:'⚔ Trung Phẩm', kiem_quyet_thuong:'⚔ Thượng Phẩm',
      dan_kinh_ha:'⚗ Hạ Phẩm', dan_kinh_trung:'⚗ Trung Phẩm', dan_kinh_thuong:'⚗ Thượng Phẩm',
      tran_phap_ha:'🔮 Hạ Phẩm', tran_phap_trung:'🔮 Trung Phẩm',
      the_tu_ha:'💪 Hạ Phẩm', the_tu_trung:'💪 Trung Phẩm',
    };
    pdEl.textContent = `${pdMap[pdId]||pdId} · ${cpMap[cpId]||cpId}`;
  }

  // ---- Hunger indicator (chỉ LK) ----
  const hungerEl = el('stat-hunger');
  if (hungerEl) {
    if (G.realmIdx === 0) {
      const h = G.hunger;
      const days = h?.hungerDays ?? 0;
      const linh_me = h?.linhMeCount ?? 0;
      const ichCoc  = h?.ichCocDanDays ?? 0;

      if (ichCoc > 0) {
        hungerEl.textContent = `💊 Ích Cốc Đan (còn ${Math.ceil(ichCoc)} ngày)`;
        hungerEl.style.color = 'var(--color-text-success)';
      } else if (days === 0) {
        hungerEl.textContent = `🌾 No (còn ${linh_me} phần)`;
        hungerEl.style.color = linh_me <= 2 ? 'var(--color-text-warning)' : 'var(--color-text-success)';
      } else if (days < 5) {
        hungerEl.textContent = `⚠ Đói ${days} ngày — mất HP`;
        hungerEl.style.color = 'var(--color-text-warning)';
      } else {
        hungerEl.textContent = `💀 Đói nặng ${days} ngày — nguy hiểm!`;
        hungerEl.style.color = 'var(--color-text-danger)';
      }
      hungerEl.style.display = '';
    } else {
      hungerEl.style.display = 'none'; // TC+ không cần ăn
    }
  }

  // ---- Ám Thương indicator ----
  const atEl = el('stat-am-thuong');
  if (atEl) {
    const status = getAmThuongStatus(G);
    if (status && status.points > 0) {
      const colors = { mild:'var(--color-text-warning)', moderate:'var(--color-text-warning)', heavy:'var(--color-text-danger)', critical:'var(--color-text-danger)' };
      atEl.textContent = `🩸 Ám Thương ${status.points} điểm (Căn Cốt -${status.canCotPenalty})`;
      atEl.style.color = colors[status.severity] ?? 'var(--color-text-secondary)';
      atEl.style.display = '';
    } else {
      atEl.style.display = 'none';
    }
  }

  // Timer display
  const timerEl = el('stat-time');
  if (timerEl) timerEl.textContent = fmtTime(Math.floor(G.totalTime));

  // ---- Status notifications bar ----
  _renderStatusNotifs(G);

  renderTitlePanel(G);
}


function _renderStatusNotifs(G) {
  // Tìm hoặc tạo container
  let bar = document.getElementById('status-notif-bar');
  if (!bar) {
    // Inject sau cultivate-stats nếu chưa có trong HTML
    const statsPanel = document.getElementById('cultivate-panel') ||
                       document.getElementById('panel-cultivate');
    if (!statsPanel) return;
    bar = document.createElement('div');
    bar.id = 'status-notif-bar';
    statsPanel.prepend(bar);
  }

  const notifs = [];
  const now    = G.gameTime?.currentYear ?? 0;

  // 1. Đột phá sẵn sàng
  const maxQi    = calcMaxQi(G);
  const purity   = G.purity ?? 0;
  const thresh   = calcPurityThreshold(G);
  if ((G.qi ?? 0) >= maxQi && purity >= thresh * 0.5) {
    notifs.push({ icon:'⚡', text:'Đột phá sẵn sàng!', color:'#f0d47a', priority:10, tab:'cultivate' });
  } else if ((G.qi ?? 0) >= maxQi) {
    const pct = Math.round(purity / thresh * 100);
    notifs.push({ icon:'🌀', text:`Linh lực đầy — tích Thuần Độ (${pct}%)`, color:'#4a9eff', priority:7, tab:'cultivate' });
  }

  // 2. Đói (đã tắt hunger system)

  // 3. Dược Điền chín
  const readyCrops = (G.duocDien?.slots || []).filter(s => s && now >= (s.harvestAt ?? Infinity));
  if (readyCrops.length > 0) {
    notifs.push({ icon:'🌾', text:`${readyCrops.length} ô Dược Điền có thể thu hoạch!`, color:'#56c46a', priority:9, tab:'nghe_nghiep' });
  }

  // 4. Linh thú đói / trứng nở
  const eggReady = (G.linhThu?.eggs || []).some(e => now >= (e.hatchAt ?? Infinity));
  if (eggReady) {
    notifs.push({ icon:'🥚', text:'Trứng Linh Thú đã nở!', color:'#f0d47a', priority:12, tab:'linh_thu' });
  } else {
    const hungryBeast = (G.linhThu?.slots || []).find(s =>
      s && (now - (s.lastFedAt ?? 0)) * 365 >= 5
    );
    if (hungryBeast) {
      notifs.push({ icon:'🐾', text:`${hungryBeast.name ?? 'Linh Thú'} đang đói!`, color:'#e07030', priority:11, tab:'linh_thu' });
    }
  }

  // 5. Ám Thương nặng
  if ((G.amThuong?.points ?? 0) >= 50) {
    notifs.push({ icon:'🩸', text:`Ám Thương ${Math.floor(G.amThuong.points)}/100 — dùng Tái Sinh Đan`, color:'#e05c4a', priority:6, tab:'inventory' });
  }

  // 6. Tuổi thọ cảnh báo
  if (G.gameTime) {
    const rem = (G.gameTime.lifespanMax + (G.gameTime.lifespanBonus ?? 0)) - G.gameTime.currentYear;
    const maxLife = G.gameTime.lifespanMax + (G.gameTime.lifespanBonus ?? 0);
    const remPct  = rem / maxLife;
    if (remPct < 0.1 && rem > 0) {
      notifs.push({ icon:'⏳', text:`Tuổi thọ chỉ còn ${Math.floor(rem)} năm!`, color:'#e05c4a', priority:14, tab:'cultivate' });
    } else if (remPct < 0.2) {
      notifs.push({ icon:'⏳', text:`Tuổi thọ còn ${Math.floor(rem)} năm`, color:'#f0d47a', priority:5, tab:'cultivate' });
    }
  }

  // 7. Nghiệp Lực cao — đang phạt qi rate
  const nghiep = G.nghiepLuc ?? 0;
  if (nghiep >= 70) {
    notifs.push({ icon:'👹', text:`Nghiệp Lực ${Math.floor(nghiep)}/100 — qi rate giảm nặng!`, color:'#e05c4a', priority:8, tab:'cultivate' });
  } else if (nghiep >= 40) {
    notifs.push({ icon:'👹', text:`Nghiệp Lực ${Math.floor(nghiep)}/100 — tu luyện chậm lại`, color:'#f0d47a', priority:4, tab:'cultivate' });
  }

  // 8. Trận Pháp passive — stone sắp hết
  if (G.tranPhap?.activeArrays?.length) {
    const passiveArrays = G.tranPhap.activeArrays.filter(a => a.category === 'passive');
    const totalDrain = passiveArrays.reduce((s, a) => s + (a.stoneCostPerMin || 0), 0);
    if (totalDrain > 0) {
      const stoneLeft = G.stone ?? 0;
      const minsLeft  = stoneLeft / totalDrain;
      if (minsLeft < 10) {
        notifs.push({ icon:'🔯', text:`Trận pháp sắp tắt — còn ~${Math.floor(minsLeft)} phút stone!`, color:'#e05c4a', priority:9, tab:'tran_phap' });
      } else if (minsLeft < 30) {
        notifs.push({ icon:'🔯', text:`Trận pháp cần stone — còn ~${Math.floor(minsLeft)} phút`, color:'#f0d47a', priority:3, tab:'tran_phap' });
      }
    }
  }

  // 9. Thương Hội — quest du hiệp hết cooldown
  if ((G.danhVong ?? 0) >= 50 && G.thuongHoi) {
    const th  = G.thuongHoi;
    const cdY = G.gameTime?.currentYear ?? 0;
    const { FREELANCE_QUESTS } = window._thuongHoiData || {};
    if (FREELANCE_QUESTS) {
      const hasReady = FREELANCE_QUESTS.some(q => {
        if ((G.danhVong ?? 0) < q.requireDV) return false;
        if ((G.realmIdx ?? 0) < q.requireRealm) return false;
        const cdYrs = q.cooldownHours / 8760;
        return (cdY - (th.questCooldowns?.[q.id] ?? 0)) >= cdYrs;
      });
      if (hasReady) notifs.push({ icon:'🏪', text:'Thương Hội có nhiệm vụ du hiệp mới!', color:'#e8a020', priority:4, tab:'nghe_nghiep' });
    }
  }

  // 10. Thương Hội buff sắp hết hạn
  if (G.thuongHoi) {
    const th  = G.thuongHoi;
    const now2 = G.gameTime?.currentYear ?? 0;
    if (th.ambushWardExpires && th.ambushWardExpires - now2 < 0.001) {
      notifs.push({ icon:'🛡', text:'Bùa Trừ Kiếp Tu sắp hết hạn!', color:'#f0d47a', priority:3, tab:'nghe_nghiep' });
    }
    if (th.purityBoostExpires && th.purityBoostExpires - now2 < 0.001) {
      notifs.push({ icon:'🌙', text:'Tĩnh Tâm Thư sắp hết hạn!', color:'#f0d47a', priority:3, tab:'nghe_nghiep' });
    }
  }

  // Sort by priority descending, show top 4
  notifs.sort((a, b) => b.priority - a.priority);
  const shown = notifs.slice(0, 4);

  if (shown.length === 0) {
    bar.innerHTML = '';
    bar.style.display = 'none';
    return;
  }

  bar.style.display = 'flex';

  // Chỉ update DOM khi nội dung thực sự thay đổi — tránh chớp liên tục
  const newHtml = shown.map(n => {
    const clickable = n.tab ? ' sn-clickable' : '';
    const arrow     = n.tab ? ' <span class="sn-arrow">›</span>' : '';
    return `<div class="sn-item${clickable}" style="border-left-color:${n.color}" ${n.tab ? `data-tab="${n.tab}"` : ''}>
      <span class="sn-icon">${n.icon}</span>
      <span class="sn-text" style="color:${n.color}">${n.text}${arrow}</span>
    </div>`;
  }).join('');

  if (bar.innerHTML === newHtml) return; // không thay đổi → không render lại

  bar.innerHTML = newHtml;

  // Wire clicks
  bar.querySelectorAll('.sn-clickable').forEach(el => {
    el.addEventListener('click', () => {
      const tabId = el.dataset.tab;
      if (tabId) switchTab(tabId, G);
    });
  });
}

export function renderTitlePanel(G) {
  const panel = el('title-panel');
  if (!panel) return;

  const unlocked = (G.titles?.unlocked || []);
  const activeId = G.titles?.active || null;
  const { TITLES, RARITY_ORDER } = window._titleData || {};
  if (!TITLES) return;

  const rarityColors = { common:'#aaa', uncommon:'#56c46a', rare:'#4a9eff', epic:'#a855f7', legendary:'#f0d47a' };
  const rarityLabel  = { common:'Phổ Thông', uncommon:'Hiếm', rare:'Quý', epic:'Sử Thi', legendary:'Huyền Thoại' };

  if (unlocked.length === 0) {
    panel.innerHTML = `<p class="title-empty">Chưa có danh hiệu. Hãy tiếp tục tu luyện!</p>`;
    return;
  }

  const sorted = TITLES
    .filter(t => unlocked.includes(t.id))
    .sort((a,b) => RARITY_ORDER.indexOf(b.rarity) - RARITY_ORDER.indexOf(a.rarity));

  panel.innerHTML = sorted.map(t => {
    const color   = rarityColors[t.rarity] || '#aaa';
    const isActive = t.id === activeId;
    return `
      <div class="title-card ${isActive ? 'title-active' : ''}"
           style="border-color:${color}44; background:${color}0a"
           data-title-id="${t.id}">
        <span class="title-emoji">${t.emoji}</span>
        <div class="title-info">
          <span class="title-name" style="color:${color}">【${t.name}】</span>
          <span class="title-name-cn" style="color:${color}88">${t.nameCN}</span>
          <span class="title-rarity" style="color:${color}">${rarityLabel[t.rarity]}</span>
          <span class="title-flavor">${t.flavor}</span>
        </div>
        <button class="btn-equip-title btn-sm ${isActive ? 'btn-active-title' : 'btn-secondary'}"
                data-title-id="${t.id}">
          ${isActive ? '✓ Đang Dùng' : 'Trang Bị'}
        </button>
      </div>
    `;
  }).join('');

  // Wire equip buttons
  panel.querySelectorAll('.btn-equip-title').forEach(btn => {
    btn.addEventListener('click', () => {
      window._setActiveTitle?.(btn.dataset.titleId);
    });
  });
}

// ---- Combat mini-status (hiển thị ở header khi đang combat) ----

export function renderCombatStatus(G) {
  const combatBanner = el('combat-banner');
  if (!combatBanner) return;

  if (G.combat.active) {
    combatBanner.style.display = 'block';
    const enemy = G.combat.enemy;
    combatBanner.innerHTML = `
      ⚔ ĐANG CHIẾN ĐẤU: ${enemy.emoji} ${enemy.name}
      &nbsp;|&nbsp; HP địch: ${Math.max(0, Math.floor(enemy.currentHp))} / ${enemy.maxHp}
      &nbsp;|&nbsp; HP ta: ${Math.floor(G.combat.playerHp)} / ${G.combat.playerMaxHp}
    `;
  } else {
    combatBanner.style.display = 'none';
  }
}

// ---- Offline modals ----

// Bước 1: Hỏi người chơi muốn bế quan hay nghỉ ngơi khi offline
// callback(choseMeditate: boolean) được gọi sau khi người chọn
export function showOfflineChoiceModal(offSec, callback) {
  const modal = el('modal-offline');
  if (!modal) { callback(false); return; }

  const h       = Math.floor(offSec / 3600);
  const m       = Math.floor((offSec % 3600) / 60);
  const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;

  const content = modal.querySelector('.modal-content');
  if (content) {
    content.innerHTML = `
      <h2>💤 Vắng mặt ${timeStr}</h2>
      <p class="offline-status">
        Trong thời gian vắng mặt, đạo hữu muốn làm gì?
      </p>

      <div class="offline-choice-grid">
        <button class="offline-choice-btn offline-choice-meditate" id="offline-btn-meditate">
          <span class="offline-choice-icon">🧘</span>
          <strong>Bế Quan</strong>
          <span class="offline-choice-desc">
            Linh lực tích lũy bình thường.<br>
            Tuổi thọ trôi qua.<br>
            Buff theo thời gian hết dần.
          </span>
        </button>
        <button class="offline-choice-btn offline-choice-rest" id="offline-btn-rest">
          <span class="offline-choice-icon">😴</span>
          <strong>Nghỉ Ngơi</strong>
          <span class="offline-choice-desc">
            Không nhận gì.<br>
            Tuổi thọ không trôi.<br>
            Thời gian đóng băng.
          </span>
        </button>
      </div>
    `;

    document.getElementById('offline-btn-meditate')?.addEventListener('click', () => {
      modal.style.display = 'none';
      callback(true);
    });
    document.getElementById('offline-btn-rest')?.addEventListener('click', () => {
      modal.style.display = 'none';
      callback(false);
    });
  }
  modal.style.display = 'flex';
}

// Bước 2: Hiển thị kết quả sau khi đã tính xong
export function showOfflineModal(offlineData) {
  if (!offlineData) return;
  const modal = el('modal-offline');
  if (!modal) return;

  const {
    offSec, qiEarned, purityEarned, masteryGained = {},
    offlineYears, choseMeditate, gameOver,
    buffsExpired = [], questsProgressed = 0,
    // backward compat với code cũ gọi showOfflineModal(offlineData) trực tiếp
    earned, wasMeditating,
  } = offlineData;

  const resolvedQi       = qiEarned   ?? earned ?? 0;
  const resolvedMeditate = choseMeditate ?? wasMeditating ?? false;

  const h = Math.floor(offSec / 3600);
  const m = Math.floor((offSec % 3600) / 60);
  const timeStr  = h > 0 ? `${h}h ${m}m` : `${m}m`;
  const yearStr  = offlineYears ? `${offlineYears.toFixed(1)} năm game` : '';

  const buffsHtml = buffsExpired.length ? `
    <div class="offline-row offline-warn">
      ⏰ Buff hết hạn: ${buffsExpired.join(', ')}
    </div>` : '';

  const questHtml = questsProgressed > 0 ? `
    <div class="offline-row offline-jade">
      📜 ${questsProgressed} nhiệm vụ được tính tiến độ
    </div>` : '';

  const masteryHtml = Object.keys(masteryGained).length ? `
    <div class="offline-row offline-jade">
      ✦ Thuần thục công pháp tăng
    </div>` : '';

  const skipHtml = !resolvedMeditate ? `
    <div class="offline-tip">
      😴 Đạo hữu đã chọn nghỉ ngơi — thời gian đóng băng, không nhận gì.
    </div>` : '';

  const content = modal.querySelector('.modal-content');
  if (content) {
    content.innerHTML = `
      <h2>${resolvedMeditate ? '🧘' : '😴'} Vắng mặt ${timeStr}</h2>

      ${resolvedMeditate ? `
      <div class="offline-rewards">
        <div class="offline-row">
          <span>🌀 Linh lực tích lũy</span>
          <strong>+${fmtNum(resolvedQi)}</strong>
        </div>
        ${(purityEarned ?? 0) > 0 ? `
        <div class="offline-row">
          <span>✨ Thuần độ tích lũy</span>
          <strong>+${purityEarned.toFixed(1)}</strong>
        </div>` : ''}
        ${yearStr ? `
        <div class="offline-row offline-dim">
          <span>⏳ Thời gian trôi qua</span>
          <strong>${yearStr}</strong>
        </div>` : ''}
        ${buffsHtml}
        ${masteryHtml}
        ${questHtml}
      </div>` : skipHtml}

      ${gameOver ? '<p class="offline-gameover">💀 TUỔI THỌ ĐÃ CẠN KHI VẮNG MẶT!</p>' : ''}

      <button class="btn-primary offline-close-btn"
        onclick="document.getElementById('modal-offline').style.display='none'">
        ✦ Tiếp tục tu luyện
      </button>
    `;
  }
  modal.style.display = 'flex';
}

// ---- Toast / floating text ----

let _toastQueue = [];
let _toastTimer = null;

export function showToast(msg, type = '') {
  const container = el('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  container.appendChild(toast);

  // Lưu vào notification log để xem lại
  if (window._G) {
    if (!window._G._notifLog) window._G._notifLog = [];
    window._G._notifLog.push({ msg, type, ts: Date.now() });
    if (window._G._notifLog.length > 200) window._G._notifLog.shift();
    // Cập nhật badge
    _updateNotifBadge();
  }

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 500);
  }, 2500);
}

// ── Notification panel ────────────────────────────────────
let _notifBadgeCount = 0;
let _notifPanelOpen  = false;

function _updateNotifBadge() {
  _notifBadgeCount++;
  const badge = document.getElementById('notif-badge');
  if (badge) {
    badge.textContent = _notifBadgeCount > 99 ? '99+' : _notifBadgeCount;
    badge.style.display = 'block';
  }
}

export function toggleNotifPanel(G) {
  const existing = document.getElementById('notif-panel');
  if (existing) { existing.remove(); _notifPanelOpen = false; return; }

  _notifPanelOpen = true;
  _notifBadgeCount = 0;
  const badge = document.getElementById('notif-badge');
  if (badge) badge.style.display = 'none';

  const log = (G?._notifLog || []).slice().reverse();
  const panel = document.createElement('div');
  panel.id = 'notif-panel';
  panel.innerHTML = `
    <div class="np-header">
      <span>🔔 Thông Báo</span>
      <button class="np-close" id="np-close">✕</button>
    </div>
    <div class="np-list">
      ${log.length === 0
        ? '<div class="np-empty">Chưa có thông báo nào.</div>'
        : log.map(n => {
            const time = new Date(n.ts).toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
            const colorMap = { jade:'#56c46a', gold:'#f0d47a', danger:'#e05c4a', legendary:'#a855f7', epic:'#c084fc', '':'#aaa' };
            const color = colorMap[n.type] || '#aaa';
            return `<div class="np-item">
              <span class="np-dot" style="background:${color}"></span>
              <span class="np-msg" style="color:${color}">${n.msg}</span>
              <span class="np-time">${time}</span>
            </div>`;
          }).join('')
      }
    </div>
    <div class="np-footer">
      <button class="np-clear" id="np-clear">🗑 Xóa Tất Cả</button>
    </div>`;
  document.body.appendChild(panel);

  document.getElementById('np-close')?.addEventListener('click', () => { panel.remove(); _notifPanelOpen = false; });
  document.getElementById('np-clear')?.addEventListener('click', () => {
    if (G) G._notifLog = [];
    panel.querySelector('.np-list').innerHTML = '<div class="np-empty">Chưa có thông báo nào.</div>';
  });
}

export function showFloat(text, type = '') {
  const container = el('float-container');
  if (!container) return;

  const float = document.createElement('div');
  float.className = `float-text float-${type}`;
  float.textContent = text;
  float.style.left = `${30 + Math.random() * 40}%`;
  container.appendChild(float);

  setTimeout(() => float.remove(), 1200);
}

// ---- Log (action log bên dưới màn hình) ----

export function appendLog(msg, type = '') {
  // Lưu vào state để restore sau reload
  if (window._G) {
    if (!window._G._actionLog) window._G._actionLog = [];
    window._G._actionLog.push({ msg, type, ts: Date.now() });
    // Giới hạn 100 entries
    if (window._G._actionLog.length > 100) window._G._actionLog.shift();
  }

  const logEl = el('action-log');
  if (!logEl) return;

  const line = document.createElement('div');
  line.className = `log-line log-${type}`;
  line.textContent = msg;
  logEl.appendChild(line);

  while (logEl.children.length > 100) logEl.removeChild(logEl.firstChild);
  logEl.scrollTop = logEl.scrollHeight;
}

// Restore log từ G._actionLog sau khi DOM sẵn sàng
export function restoreLog(G) {
  const logEl = el('action-log');
  if (!logEl || !G._actionLog?.length) return;
  logEl.innerHTML = '';
  G._actionLog.forEach(({ msg, type }) => {
    const line = document.createElement('div');
    line.className = `log-line log-${type}`;
    line.textContent = msg;
    logEl.appendChild(line);
  });
  logEl.scrollTop = logEl.scrollHeight;
}
// ── Playtime formatters ───────────────────────────────────
function _fmtRealTime(totalSec) {
  if (totalSec < 60)   return `${totalSec}s`;
  if (totalSec < 3600) return `${Math.floor(totalSec/60)} phút`;
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h < 24) return m > 0 ? `${h}g ${m}p` : `${h} giờ`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return rh > 0 ? `${d}n ${rh}g` : `${d} ngày`;
}

function _fmtGameTime(years) {
  if (years < 1)   return `${Math.floor(years * 12)} tháng`;
  if (years < 10)  return `${years.toFixed(1)} năm`;
  return `${Math.floor(years)} năm`;
}