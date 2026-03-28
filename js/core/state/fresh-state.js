// ============================================================
// core/state/fresh-state.js — Định nghĩa shape của Game State
// Chỉ chứa createFreshState() — không logic, không persistence
// ============================================================

export const SAVE_KEY     = 'tutien_v10';
export const SAVE_VERSION = 11;

export function createFreshState() {
  return {
    version: SAVE_VERSION,

    // ---- Character ----
    name: 'Vô Danh Đạo Nhân',
    gender: 'male',
    spiritRoot: null,
    spiritData: null,
    currency: { ha:0, trung:0, thuong:0, cucpham:0 },
    sectId: null,
    sectInvites: [],
    setupDone: false,

    // ---- Chỉ số tu tiên đặc thù ----
    khiVan: 20,
    ngoTinh: 50,
    canCot: 50,
    tamCanh: 50,
    huongTu: 'kiem',
    _khiVanLastTick: 0,

    // ---- v12: Thuần Độ & Đan Độc ----
    purity: 0,
    danDoc: 0,

    // ---- v12: Danh Vọng ----
    danhVong: 0,

    // ---- Realm / Stage ----
    realmIdx: 0,
    stage: 1,

    // ---- Resources ----
    qi: 0,
    stone: 0,

    // ---- Combat stats ----
    hp: 100,
    maxHp: 100,
    atk: 10,
    def: 5,
    stamina: 100,
    maxStamina: 100,
    exp: 0,
    maxExp: 200,

    // ---- Permanent bonuses ----
    qiBonus: 0,
    stoneBonus: 0,
    hpBonus: 0,
    defBonus: 0,
    spdBonus: 0,
    atkPct: 0,
    defPct: 0,
    hpPct: 0,
    ratePct: 0,
    danBonus: 0,
    arrayBonus: 0,
    expBonus: 0,

    // ---- Timed buffs ----
    atkBuff: 0,
    atkBuffTimer: 0,
    defBuff: 0,
    defBuffTimer: 0,
    stoneBuffPct: 0,
    stoneBuffTimer: 0,
    eventRateBonus: 0,
    eventRateTimer: 0,
    eventExpBonus: 0,
    eventExpTimer: 0,

    // ---- Passive state ----
    meditating: false,

    // ---- Skills ----
    skills: {},

    // ---- Inventory ----
    inventory: new Array(24).fill(null),

    // ---- Combat state ----
    combat: {
      active: false,
      enemy: null,
      playerHp: 0,
      playerMaxHp: 0,
      playerMp: 100,
      playerMaxMp: 100,
      turn: 0,
      phase: 'idle',
      log: [],
      selectedSkill: null,
      comboCount: 0,
      lastActionWin: false,
      tianJieActive: false,
      tianJieWave: 0,
      tianJieTotalWaves: 3,
      tianJieBoss: null,
    },

    // ---- Quest state ----
    quests: {
      active: [],
      completed: [],
      daily: [],
      lastDailyReset: 0,
    },

    // ---- Alchemy state ----
    alchemy: {
      knownRecipes: [],
      ingredients: {},
      furnaceLevel: 0,
      furnaceDurability: 0,
      totalCrafted: 0,
      craftsCount: 0,
      successStreak: 0,
      danPhuongTe: 0,
      forge: { level: 0, durability: 0 },
    },

    // ---- Nghề Nghiệp (Life Skills) state ----
    crafts: {
      tran_phap: { level: 0, exp: 0 },
      phu_chu:   { level: 0, exp: 0 },
      khoi_loi:  { level: 0, exp: 0 },
      linh_thuc: { level: 0, exp: 0 },
    },

    // ---- Linh Thực Sư state ----
    linhThuc: {
      cooksCount: 0,
      kitchen: { level: 0, durability: 0 },
      activeBuffs: [],
      ingredients: {},
    },

    // ---- Dược Điền ----
    duocDien: {
      slots: [],
      maxSlots: 0,
      totalHarvests: 0,
    },

    // ---- Hunger ----
    hunger: {
      linhMeCount: 0,
      lastEatYear: 0,
      hungerDays: 0,
      isStarving: false,
      eatingBuff: 0,
      ichCocDanDays: 0,
    },

    // ---- Ám Thương ----
    amThuong: {
      points: 0,
      canCotPenalty: 0,
      hpMaxPenalty: 0,
      lastHealYear: 0,
    },

    // ---- Trận Pháp Sư state ----
    tranPhap: {
      arrayCount: 0,
      activeArrays: [],
      stoneDrainTimer: 0,
    },

    // ---- Phù Chú Sư state ----
    phuChu: {
      drawCount: 0,
    },

    // ---- Khôi Lỗi Sư state ----
    khoiLoi: {
      craftCount: 0,
      activePuppet: null,
    },

    // ---- Kiếp Tu state ----
    kiepTu: {
      ambushCooldown: 0,
      totalAmbushed: 0,
      totalDefeated: 0,
      robbedCount: 0,
      nghiepLuc: 0,
      activeCount: 0,
      lastActiveYear: 0,
    },

    // ---- Linh Thú state ----
    linhThu: {
      slots: [null, null],
      eggs: [],
    },

    // ---- Thương Hội state ----
    thuongHoi: null,  // khởi tạo lazy trong _th() của engine

    // ---- Prestige / Luân Hồi ----
    prestige: {
      count: 0,
      totalAscensions: 0,
      bonuses: { ratePct: 0, atkPct: 0, stonePct: 0 },
    },

    // ---- Progress counters ----
    breakthroughs: 0,
    hunts: 0,
    alchemySuccess: 0,
    skillsLearned: 0,
    totalTime: 0,
    totalKills: 0,
    totalQuestsCompleted: 0,

    // ---- Achievements ----
    achievements: {},

    // ---- Titles ----
    titles: {
      unlocked: [],
      active: null,
    },

    _pendingRealmIdx: null,

    // ---- Equipment ----
    equipment: {
      slots: (() => {
        const useStaff = Math.random() < 0.5;
        const weaponItem = useStaff
          ? { itemId:'wood_staff', name:'Gậy Gỗ Linh', emoji:'🪄', slot:'tay_phai', rarity:'common', stats:{ atk:8 } }
          : { itemId:'iron_sword', name:'Thiết Kiếm',   emoji:'⚔',  slot:'tay_phai', rarity:'common', stats:{ atk:12 } };
        const robeItem = { itemId:'starter_robe', name:'Áo Vải Thô', emoji:'👕', slot:'than', rarity:'common', stats:{} };
        return {
          tay_phai: weaponItem, tay_trai: null, than: robeItem,
          dau: null, chan: null, that_lung: null,
          nhan_trai: null, nhan_phai: null, phap_bao: null,
          weapon: null, armor: null, accessory: null,
        };
      })(),
      bag: [],
      totalDropped: 0,
    },

    // ---- Dungeon ----
    dungeon: {
      currentFloor: 0,
      maxFloorReached: 0,
      active: false,
      activeEnemyId: null,
      runsToday: 0,        // legacy — giữ compat
      lastRunAt: 0,
      attemptsToday: 0,    // dùng bởi enterDungeon + dungeon-tab
      lastAttemptDay: 0,   // ngày game (Math.floor(currentYear * 365))
    },

    // ---- Sect ----
    sect: {
      exp: 0,
      cooldowns: {},
      totalContributions: 0,
    },

    // ---- Passive Skill Tree ----
    passiveTree: {
      ranks: {},
      totalPoints: 0,
    },

    // ---- World Map ----
    worldMap: {
      currentNodeId: 'thanh_van_son',
    },

    // ---- Pháp Địa & Công Pháp ----
    phapDia: {
      currentId: 'pham_dia',
      expiresAt: null,
    },
    congPhap: {
      currentId:  'vo_danh',
      unlockedIds: ['vo_danh'],
      activeIds:   ['vo_danh'], // đang tu luyện (tối đa 4)
      mastery:     { vo_danh: 0 }, // thuần thục từng công pháp 0-100
    },

    // ---- Action cooldowns ----
    _restCooldown: 0,
    _medCooldown: 0,
    _sparCooldown: 0,
    _arrayCooldown: 0,
    _coDuyenCooldowns: {},
    _coDuyenGlobalCd: 0,

    // ---- Hệ thống Thời Gian ----
    gameTime: {
      currentYear: 16,
      totalYears: 0,
      lifespanMax: 120,
      lifespanBonus: 0,
      isGameOver: false,
    },

    // ---- Ký Sự ----
    chronicle: [],
    _actionLog: [],

    // ---- UI / meta ----
    lastSave: Date.now(),
    activeTab: 'cultivate',
  };
}