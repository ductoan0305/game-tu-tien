// ============================================================
// core/state/persistence.js — Save / Load / Migration
// Chịu trách nhiệm duy nhất: đọc/ghi localStorage + migrate
// ============================================================
import { SAVE_KEY, SAVE_VERSION, createFreshState } from './fresh-state.js';
import { migrateCurrency } from '../currency.js';

export { SAVE_KEY, SAVE_VERSION };

export function saveGame(G) {
  G.lastSave = Date.now();
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(G));
  } catch (e) {
    console.warn('Save failed', e);
  }
}

export function loadGame() {
  // Xóa save key cũ để tránh conflict
  ['tutien_v1','tutien_v2','tutien_v3','tutien_v4','tutien_v5',
   'tutien_v6','tutien_v7','tutien_v8','tutien_v9'].forEach(k => localStorage.removeItem(k));

  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;

    let saved;
    try {
      saved = JSON.parse(raw);
    } catch (parseErr) {
      console.warn('[loadGame] JSON parse failed, clearing corrupt save:', parseErr);
      localStorage.removeItem(SAVE_KEY);
      return null;
    }

    if (!saved || typeof saved !== 'object') {
      localStorage.removeItem(SAVE_KEY);
      return null;
    }
    if (saved.version !== SAVE_VERSION) {
      console.warn(`[loadGame] Version mismatch: saved=${saved.version}, current=${SAVE_VERSION}`);
      localStorage.removeItem(SAVE_KEY);
      return null;
    }

    const fresh  = createFreshState();
    const merged = deepMerge(fresh, saved);

    _ensureArrays(merged);
    migrateCurrency(merged);
    _migrateAlchemy(merged);
    _migrateProfessions(merged);
    _migrateSpiritData(merged);
    _migrateV11(merged);
    _migrateKiepTu(merged);
    _migrateLinhThu(merged);
    _migrateThuongHoi(merged);
    _migrateCongPhap(merged);

    console.log('[loadGame] Loaded successfully, setupDone:', merged.setupDone);
    return merged;
  } catch (e) {
    console.error('[loadGame] Unexpected error:', e);
    return null;
  }
}

// ============================================================
// Helpers
// ============================================================

function deepMerge(target, source) {
  const out = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] !== null &&
      typeof target[key] === 'object'
    ) {
      out[key] = deepMerge(target[key], source[key]);
    } else {
      out[key] = source[key];
    }
  }
  return out;
}

function _ensureArrays(m) {
  if (!Array.isArray(m.inventory)) {
    m.inventory = new Array(24).fill(null);
  } else {
    while (m.inventory.length < 24) m.inventory.push(null);
  }
  if (!Array.isArray(m.combat?.log))        { if (m.combat) m.combat.log = []; }
  if (!Array.isArray(m.quests?.active))     { if (m.quests) m.quests.active = []; }
  if (!Array.isArray(m.quests?.completed))  { if (m.quests) m.quests.completed = []; }
  if (!Array.isArray(m.quests?.daily))      { if (m.quests) m.quests.daily = []; }
  if (!Array.isArray(m.equipment?.bag))     { if (m.equipment) m.equipment.bag = []; }
}

function _migrateAlchemy(m) {
  if (!m.alchemy) return;
  if (m.alchemy.furnaceDurability === undefined) {
    const lv  = m.alchemy.furnaceLevel || 0;
    const DUR = { 1:10, 2:15, 3:20, 4:30, 5:50 };
    m.alchemy.furnaceDurability = lv > 0 ? (DUR[lv] || 10) : 0;
  }
  if (m.alchemy.danPhuongTe === undefined) m.alchemy.danPhuongTe = 0;
  if (!m.alchemy.forge || typeof m.alchemy.forge !== 'object') {
    m.alchemy.forge = { level:0, durability:0 };
  } else {
    if (m.alchemy.forge.level      === undefined) m.alchemy.forge.level      = 0;
    if (m.alchemy.forge.durability === undefined) m.alchemy.forge.durability = 0;
  }
  // Reset furnaceLevel=1 nếu chưa từng dùng lò
  if ((m.alchemy.furnaceLevel || 0) === 1) {
    const neverUsed = (m.alchemySuccess || 0) === 0
      && (m.alchemy.craftsCount || 0) === 0
      && (m.alchemy.knownRecipes?.length || 0) === 0;
    if (neverUsed) m.alchemy.furnaceLevel = 0;
  }
}

function _migrateProfessions(m) {
  // Linh Thực Sư
  if (!m.linhThuc || typeof m.linhThuc !== 'object') {
    m.linhThuc = { cooksCount:0, kitchen:{level:0,durability:0}, activeBuffs:[], ingredients:{} };
  } else {
    if (m.linhThuc.cooksCount === undefined) m.linhThuc.cooksCount = 0;
    if (!m.linhThuc.kitchen)                m.linhThuc.kitchen     = { level:0, durability:0 };
    if (!Array.isArray(m.linhThuc.activeBuffs)) m.linhThuc.activeBuffs = [];
    if (!m.linhThuc.ingredients)            m.linhThuc.ingredients = {};
  }
  // Trận Pháp Sư
  if (!m.tranPhap || typeof m.tranPhap !== 'object') {
    m.tranPhap = { arrayCount:0, activeArrays:[], stoneDrainTimer:0 };
  } else {
    if (m.tranPhap.arrayCount === undefined)         m.tranPhap.arrayCount      = 0;
    if (!Array.isArray(m.tranPhap.activeArrays))     m.tranPhap.activeArrays    = [];
    if (m.tranPhap.stoneDrainTimer === undefined)    m.tranPhap.stoneDrainTimer = 0;
  }
  // Phù Chú Sư
  if (!m.phuChu || typeof m.phuChu !== 'object') {
    m.phuChu = { drawCount:0 };
  } else {
    if (m.phuChu.drawCount === undefined) m.phuChu.drawCount = 0;
  }
  // Khôi Lỗi Sư
  if (!m.khoiLoi || typeof m.khoiLoi !== 'object') {
    m.khoiLoi = { craftCount:0, activePuppet:null };
  } else {
    if (m.khoiLoi.craftCount    === undefined) m.khoiLoi.craftCount    = 0;
    if (m.khoiLoi.activePuppet  === undefined) m.khoiLoi.activePuppet  = null;
  }
  // crafts object
  if (!m.crafts || typeof m.crafts !== 'object') {
    m.crafts = { tran_phap:{level:0,exp:0}, phu_chu:{level:0,exp:0}, khoi_loi:{level:0,exp:0}, linh_thuc:{level:0,exp:0} };
  } else {
    for (const id of ['tran_phap','phu_chu','khoi_loi','linh_thuc']) {
      if (!m.crafts[id]) m.crafts[id] = { level:0, exp:0 };
    }
  }
}

function _migrateSpiritData(m) {
  const sd = m.spiritData;
  const needsMigration = !sd ||
    (sd.type === 'TIEN' && Object.keys(sd.points||{}).length > 1 && Math.max(...Object.values(sd.points||{})) < 90);

  if (needsMigration && m.spiritRoot) {
    const root    = m.spiritRoot;
    const BASE    = ['kim','moc','shui','huo','tu'];
    const BIEN_DI = ['phong','loi','bang','am','duong'];

    if (BIEN_DI.includes(root)) {
      m.spiritData = { type:'BIEN_DI', mainElement:root, points:{ [root]:92 } };
    } else if (root === 'yin_yang') {
      m.spiritData = { type:'SONG', mainElement:'jin', points:{ jin:50, shui:20 } };
    } else if (root === 'hun') {
      m.spiritData = { type:'BIEN_DI', mainElement:'jin', points:{ jin:20, mu:20, shui:20, huo:20, tu:20 } };
    } else if (BASE.includes(root)) {
      const others = BASE.filter(e => e !== root);
      const [b, c] = others.slice(0,2);
      m.spiritData = { type:'TAM', mainElement:root, points:{ [root]:32, [b]:18, [c]:12 } };
    }
  }
}

function _migrateV11(m) {
  if (m.purity    === undefined) m.purity    = 0;
  if (m.danDoc    === undefined) m.danDoc    = 0;
  if (m.danhVong  === undefined) m.danhVong  = 0;

  // Dược Điền
  if (!m.duocDien || typeof m.duocDien !== 'object') {
    m.duocDien = { slots:[], maxSlots:0, totalHarvests:0 };
  } else {
    if (!Array.isArray(m.duocDien.slots))          m.duocDien.slots         = [];
    if (m.duocDien.maxSlots      === undefined)    m.duocDien.maxSlots      = 0;
    if (m.duocDien.totalHarvests === undefined)    m.duocDien.totalHarvests = 0;
  }

  // Hunger
  if (!m.hunger || typeof m.hunger !== 'object') {
    m.hunger = { linhMeCount:0, lastEatYear:0, hungerDays:0, isStarving:false, eatingBuff:0, ichCocDanDays:0 };
  } else {
    if (m.hunger.linhMeCount   === undefined) m.hunger.linhMeCount   = 0;
    if (m.hunger.lastEatYear   === undefined) m.hunger.lastEatYear   = 0;
    if (m.hunger.hungerDays    === undefined) m.hunger.hungerDays    = 0;
    if (m.hunger.isStarving    === undefined) m.hunger.isStarving    = false;
    if (m.hunger.eatingBuff    === undefined) m.hunger.eatingBuff    = 0;
    if (m.hunger.ichCocDanDays === undefined) m.hunger.ichCocDanDays = 0;
  }

  // Ám Thương
  if (!m.amThuong || typeof m.amThuong !== 'object') {
    m.amThuong = { points:0, canCotPenalty:0, hpMaxPenalty:0, lastHealYear:0 };
  } else {
    if (m.amThuong.points        === undefined) m.amThuong.points        = 0;
    if (m.amThuong.canCotPenalty === undefined) m.amThuong.canCotPenalty = 0;
    if (m.amThuong.hpMaxPenalty  === undefined) m.amThuong.hpMaxPenalty  = 0;
    if (m.amThuong.lastHealYear  === undefined) m.amThuong.lastHealYear  = 0;
  }
}

function _migrateKiepTu(m) {
  if (!m.kiepTu || typeof m.kiepTu !== 'object') {
    m.kiepTu = { ambushCooldown:0, totalAmbushed:0, totalDefeated:0, robbedCount:0, nghiepLuc:0, activeCount:0, lastActiveYear:0 };
  } else {
    if (m.kiepTu.ambushCooldown === undefined) m.kiepTu.ambushCooldown = 0;
    if (m.kiepTu.totalAmbushed  === undefined) m.kiepTu.totalAmbushed  = 0;
    if (m.kiepTu.totalDefeated  === undefined) m.kiepTu.totalDefeated  = 0;
    if (m.kiepTu.robbedCount    === undefined) m.kiepTu.robbedCount    = 0;
    if (m.kiepTu.nghiepLuc      === undefined) m.kiepTu.nghiepLuc      = 0;
    if (m.kiepTu.activeCount    === undefined) m.kiepTu.activeCount    = 0;
    if (m.kiepTu.lastActiveYear === undefined) m.kiepTu.lastActiveYear = 0;
  }
}

function _migrateLinhThu(m) {
  if (!m.linhThu || typeof m.linhThu !== 'object') {
    m.linhThu = { slots:[null, null], eggs:[] };
  } else {
    if (!Array.isArray(m.linhThu.slots) || m.linhThu.slots.length < 2)
      m.linhThu.slots = [m.linhThu.slots?.[0] || null, null];
    if (!Array.isArray(m.linhThu.eggs)) m.linhThu.eggs = [];
  }
}

function _migrateCongPhap(m) {
  if (!m.congPhap) m.congPhap = { currentId:'vo_danh', unlockedIds:['vo_danh'], activeIds:['vo_danh'], mastery:{ vo_danh:0 } };
  if (!m.congPhap.activeIds) {
    // migrate từ hệ cũ — dùng currentId làm active
    m.congPhap.activeIds = [m.congPhap.currentId || 'vo_danh'];
  }
  if (!m.congPhap.mastery) {
    // save cũ chưa có mastery — bắt đầu từ 0
    m.congPhap.mastery = {};
    for (const id of m.congPhap.activeIds) m.congPhap.mastery[id] = 0;
  }
}

function _migrateThuongHoi(m) {
  if (m.thuongHoi === undefined) m.thuongHoi = null;
  // Migrate dungeon attemptsToday từ runsToday cũ
  if (m.dungeon) {
    if (m.dungeon.attemptsToday === undefined) m.dungeon.attemptsToday = m.dungeon.runsToday ?? 0;
    if (m.dungeon.lastAttemptDay === undefined) m.dungeon.lastAttemptDay = 0;
  }
}