// ============================================================
// core/systems/cultivation.js
// Các hành động tu luyện cơ bản: bế quan, nghỉ, thám hiểm...
// ============================================================
import { ITEMS, SECTS, SPIRIT_ROOTS, REALMS } from '../data.js';
import { calcMaxQi, calcMaxHp }       from '../state/computed.js';
import { fmtNum, bus }                from '../../utils/helpers.js';
import { rollCoDuyen }                from '../co-duyen.js';
import { rollLinhThuEncounter }       from '../linh-thu-engine.js';
import { clamp, spendStamina, gainExp, gainStone } from './helpers-internal.js';
import { addToInventory }             from './inventory.js';

export function applyCharacterSetup(G, { name, gender, spiritRootId, spiritData, sectId, sectInvites }) {
  G.gender      = gender || 'male';
  G.spiritData  = spiritData || null;
  G.sectInvites = sectInvites || [];
  G.name        = name || 'Vô Danh Đạo Nhân';
  G.spiritRoot  = spiritRootId;
  G.sectId      = sectId || null;

  const root = SPIRIT_ROOTS.find(r => r.id === spiritRootId);
  if (root?.bonus) {
    if (root.bonus.atkPct)   G.atkPct   = (G.atkPct||0)   + root.bonus.atkPct;
    if (root.bonus.ratePct)  G.ratePct  = (G.ratePct||0)  + root.bonus.ratePct;
    if (root.bonus.hpPct)    G.hpPct    = (G.hpPct||0)    + root.bonus.hpPct;
    if (root.bonus.defPct)   G.defPct   = (G.defPct||0)   + root.bonus.defPct;
    if (root.bonus.danBonus) G.danBonus = (G.danBonus||0)  + root.bonus.danBonus;
  }

  const sect = SECTS.find(s => s.id === sectId);
  if (sect?.bonus) {
    if (sect.bonus.atkPct)     G.atkPct     = (G.atkPct||0)     + sect.bonus.atkPct;
    if (sect.bonus.ratePct)    G.ratePct    = (G.ratePct||0)    + sect.bonus.ratePct;
    if (sect.bonus.defPct)     G.defPct     = (G.defPct||0)     + sect.bonus.defPct;
    if (sect.bonus.hpPct)      G.hpPct      = (G.hpPct||0)      + sect.bonus.hpPct;
    if (sect.bonus.danBonus)   G.danBonus   = (G.danBonus||0)   + sect.bonus.danBonus;
    if (sect.bonus.stoneBonus) G.stoneBonus = (G.stoneBonus||0) + sect.bonus.stoneBonus;
  }

  if (!G.phapDia) G.phapDia = { currentId: 'pham_dia', expiresAt: null };

  const SECT_START = {
    kiem_tong: { zone:'thanh_van_son',  congPhap:'kiem_quyet_ha' },
    dan_tong:  { zone:'van_linh_thi',   congPhap:'dan_kinh_ha'   },
    tran_phap: { zone:'thien_kiep_dia', congPhap:'tran_phap_ha'  },
    the_tu:    { zone:'an_long_dong',   congPhap:'the_tu_ha'     },
  };

  if (sectId && SECT_START[sectId]) {
    const start = SECT_START[sectId];
    if (!G.worldMap) G.worldMap = {};
    G.worldMap.currentNodeId    = start.zone;
    G.worldMap.starterVillageId = null;
    G.worldMap.leftStarter      = true;
    G.congPhap = {
      currentId:   start.congPhap,
      unlockedIds: ['vo_danh', start.congPhap],
      activeIds:   [start.congPhap], // tông môn không tu vô danh
      mastery:     { [start.congPhap]: 0 },
    };
    if (!G.sect) G.sect = { rank:0, exp:0, totalContributions:0 };
  } else {
    const VILLAGES = ['thanh_phong_thon','hoa_diem_thon','han_bang_thon','lam_hai_thon'];
    const villageId = VILLAGES[Math.floor(Math.random() * VILLAGES.length)];
    if (!G.worldMap) G.worldMap = { currentNodeId:'thanh_van_son' };
    G.worldMap.starterVillageId = villageId;
    G.worldMap.leftStarter      = false;
    if (villageId === 'hoa_diem_thon') G.atk = (G.atk||10) + 10;
    if (villageId === 'han_bang_thon') G.qiBonus = (G.qiBonus||0) + 0.5;
    if (villageId === 'lam_hai_thon')  {
      if (!G.currency) G.currency = { ha:0,trung:0,thuong:0,cucpham:0 };
      G.currency.ha += 20; G.stone = (G.stone||0) + 20;
    }
    // Tán tu bắt đầu với Vô Danh Công Pháp
    G.congPhap = {
      currentId:   'vo_danh',
      unlockedIds: ['vo_danh'],
      activeIds:   ['vo_danh'],
      mastery:     { vo_danh: 0 },
    };
  }

  const kvRanges = {
    tu:[10,35], mu:[15,40], jin:[20,45], huo:[20,45],
    shui:[25,55], yin_yang:[45,75], hun:[65,95],
  };
  const rootId = spiritRootId || spiritData?.type || 'mu';
  const [kvMin, kvMax] = kvRanges[rootId] || [15,40];
  G.khiVan = Math.floor(Math.random() * (kvMax - kvMin + 1)) + kvMin;

  // Ngộ Tính — ngẫu nhiên, phân phối có trọng số
  // Đa số 15-55, hiếm 70+, cực hiếm 90+
  const ngoTinhRoll = Math.random();
  if (ngoTinhRoll < 0.60)      G.ngoTinh = Math.floor(Math.random() * 41) + 15;  // 60%: 15-55
  else if (ngoTinhRoll < 0.85) G.ngoTinh = Math.floor(Math.random() * 20) + 55;  // 25%: 55-75
  else if (ngoTinhRoll < 0.97) G.ngoTinh = Math.floor(Math.random() * 15) + 75;  // 12%: 75-90
  else                         G.ngoTinh = Math.floor(Math.random() * 10) + 90;  //  3%: 90-100

  G.maxHp   = 100;
  G.hp      = calcMaxHp(G);
  G.maxHp   = G.hp;

  // Tuổi bắt đầu = 10, lifespanMax theo cảnh giới hiện tại
  if (!G.gameTime) G.gameTime = { currentYear:10, totalYears:0, lifespanMax:120, lifespanBonus:0, isGameOver:false };
  G.gameTime.currentYear = 10;
  const realmLifespan = REALMS[G.realmIdx ?? 0]?.lifespan ?? 120;
  G.gameTime.lifespanMax = realmLifespan;

  G.setupDone = true;
}

export function toggleMeditate(G) {
  G.meditating = !G.meditating;
  return {
    ok: true,
    msg: G.meditating
      ? '🧘 Bế quan — Linh lực và Thuần Độ tích lũy. Vẫn có thể luyện đan, chế phù trong khi bế quan.'
      : '👁 Xuất quan',
    type: G.meditating ? 'jade' : '',
  };
}

export function doRest(G) {
  if (G.meditating) G.meditating = false;
  const now = Date.now();
  if (now - (G._restCooldown||0) < 30000) {
    const wait = Math.ceil((30000 - (now - G._restCooldown)) / 1000);
    return { ok:false, msg:`💤 Cần nghỉ thêm ${wait}s nữa`, type:'danger' };
  }
  G._restCooldown = now;
  const gain = clamp(35 + Math.floor(G.realmIdx * 5), 35, 80);
  G.stamina = clamp(G.stamina + gain, 0, G.maxStamina);
  return { ok:true, msg:`💤 Nghỉ ngơi — +${gain} thể năng`, type:'jade', float:`+${gain} thể năng` };
}

export function doExplore(G) {
  if (G.meditating) return { ok:false, msg:'🧘 Đang bế quan — xuất quan trước!', type:'danger' };
  if (!spendStamina(G, 10)) return { ok:false, msg:'⚠ Thể năng không đủ!', type:'danger' };

  if ((G.tamCanh ?? 50) < 100) G.tamCanh = Math.min(100, (G.tamCanh ?? 50) + 0.5);

  // Linh Thú encounter
  const encounter = rollLinhThuEncounter(G);
  if (encounter) {
    if (encounter.isEgg) {
      bus.emit('linhthu:encounter', { type:'egg', data:encounter.data });
      return { ok:true, msg:`🥚 Phát hiện trứng ${encounter.data.emoji} ${encounter.data.name}!`, type:'epic', linhThuEncounter:{ type:'egg', beastId:encounter.data.id } };
    } else {
      bus.emit('linhthu:encounter', { type:'wild', data:encounter.data });
      return { ok:true, msg:`✨ Gặp ${encounter.data.emoji} ${encounter.data.name} hoang dã! Có thể thuần hóa.`, type:'legendary', linhThuEncounter:{ type:'wild', beastId:encounter.data.id } };
    }
  }

  // Cơ Duyên
  const coDuyenResult = rollCoDuyen(G, 'explore');
  if (coDuyenResult) {
    bus.emit('coduyen:triggered', { event:coDuyenResult.event, detail:coDuyenResult.detail });
    return { ok:true, msg:`✨ KỲ NGỘ! ${coDuyenResult.msg}`, type:coDuyenResult.type, detail:coDuyenResult.detail, isCoDuyen:true };
  }

  const mult = G.realmIdx + 1;
  const roll = Math.random();
  if (roll < 0.30) {
    const s = gainStone(G, Math.floor(mult * 10 * Math.random()) + 8);
    G.stone += s; gainExp(G, 15);
    bus.emit('quest:update', { type:'explore', qty:1 });
    return { ok:true, msg:`🗺 Phát hiện linh mạch — +${s} linh thạch`, type:'gold', float:`+${s}💎` };
  } else if (roll < 0.55) {
    const maxQ = calcMaxQi(G);
    const q = Math.floor(maxQ * 0.06);
    G.qi = Math.min(G.qi + q, maxQ); gainExp(G, 20);
    return { ok:true, msg:`🗺 Linh địa bí ẩn — +${fmtNum(q)} linh lực`, type:'spirit', float:`+${fmtNum(q)}⚡` };
  } else if (roll < 0.70) {
    const item = ITEMS.find(i => i.id === 'lingrong');
    if (item) addToInventory(G, item);
    return { ok:true, msg:`🗺 Thu hái được ${item?.name||'thảo dược'}!`, type:'jade' };
  } else if (roll < 0.82) {
    const item = ITEMS.find(i => i.id === 'linghidan');
    if (item) addToInventory(G, item);
    return { ok:true, msg:`🗺 Tìm được ${item?.name||'đan dược'}!`, type:'spirit' };
  } else {
    const dmg = Math.floor(Math.random() * 20) + 8;
    G.hp = Math.max(1, G.hp - dmg); gainExp(G, 10);
    return { ok:true, msg:`🗺 Gặp yêu thú — bị thương -${dmg} HP!`, type:'danger', float:`-${dmg}❤` };
  }
}

export function doFish(G) {
  if (G.meditating) return { ok:false, msg:'🧘 Đang bế quan — xuất quan trước!', type:'danger' };
  if (!spendStamina(G, 5)) return { ok:false, msg:'⚠ Thể năng không đủ!', type:'danger' };
  const roll = Math.random();
  if (roll < 0.35) {
    const s = gainStone(G, Math.floor(8 + Math.random() * 20));
    G.stone += s;
    return { ok:true, msg:`🎣 Câu được linh ngư — +${s} linh thạch`, type:'gold', float:`+${s}💎` };
  } else if (roll < 0.60) {
    G.hp = Math.min(G.hp + 20, calcMaxHp(G));
    return { ok:true, msg:`🎣 Câu được linh thảo hồi phục — +20 HP`, type:'jade', float:'+20❤' };
  } else if (roll < 0.72) {
    const item = ITEMS.find(i => i.id === 'linghidan');
    if (item) addToInventory(G, item);
    return { ok:true, msg:`🎣 Kỳ ngộ! Câu được linh đan!`, type:'spirit' };
  } else {
    gainExp(G, 8);
    return { ok:true, msg:`🎣 Không câu được gì, tĩnh tâm...`, type:'' };
  }
}

export function doArray(G) {
  const now = Date.now();
  if (now - (G._arrayCooldown||0) < 90000) {
    const wait = Math.ceil((90000 - (now - G._arrayCooldown)) / 1000);
    return { ok:false, msg:`🔮 Trận pháp cần ${wait}s để tái lập`, type:'danger' };
  }
  if (!spendStamina(G, 25)) return { ok:false, msg:'⚠ Thể năng không đủ!', type:'danger' };
  G._arrayCooldown = now;
  const bonus    = 1 + (G.arrayBonus||0) / 100;
  const arrays   = ['Tụ Linh Trận','Hộ Môn Đại Trận','Tốc Tu Trận','Linh Khí Tụ Tán Trận'];
  const name     = arrays[Math.floor(Math.random() * arrays.length)];
  const rateGain = Math.round(0.15 * bonus * 10) / 10;
  G.qiBonus += rateGain; gainExp(G, 20);
  return { ok:true, msg:`🔮 Bố ${name} — +${rateGain} linh lực/s`, type:'spirit', float:`+${rateGain}/s` };
}

export function doSpar(G) {
  if (G.meditating) return { ok:false, msg:'🧘 Đang bế quan — xuất quan trước!', type:'danger' };
  const now = Date.now();
  if (now - (G._sparCooldown||0) < 45000) {
    const wait = Math.ceil((45000 - (now - G._sparCooldown)) / 1000);
    return { ok:false, msg:`🥊 Thiết đả hồi sức: còn ${wait}s`, type:'danger' };
  }
  if (!spendStamina(G, 20)) return { ok:false, msg:'⚠ Thể năng không đủ!', type:'danger' };
  G._sparCooldown = now;
  G.atk += 1;
  if ((G.canCot ?? 50) < 100) G.canCot = Math.min(100, (G.canCot ?? 50) + 0.2);
  gainExp(G, 20);
  return { ok:true, msg:`🥊 Thiết đả tu luyện — +1 công kích, Căn Cốt +0.2`, type:'jade', float:'+1⚔' };
}

export function doMeditation(G) {
  const now = Date.now();
  if (now - (G._medCooldown||0) < 120000) {
    const wait = Math.ceil((120000 - (now - G._medCooldown)) / 1000);
    return { ok:false, msg:`🌸 Tham thiền cần ${wait}s hồi phục`, type:'danger' };
  }
  if (!spendStamina(G, 40)) return { ok:false, msg:'⚠ Thể năng không đủ (cần 40)!', type:'danger' };
  G._medCooldown = now;
  const maxQ = calcMaxQi(G);
  const q    = Math.floor(maxQ * 0.08);
  G.qi = Math.min(G.qi + q, maxQ);
  const cap = [60,75,85,92,100][G.realmIdx] ?? 60;
  // Ngộ Tính tăng rất nhỏ qua thiền định — ngẫu nhiên 0~0.1, có lúc không tăng
  const ngoTinhRoll = Math.random();
  if (ngoTinhRoll > 0.4) { // 60% có tăng, 40% không tăng gì
    const ngoTinhGain = Math.round(Math.random() * 0.1 * 100) / 100;
    if (ngoTinhGain > 0) G.ngoTinh = Math.min(100, (G.ngoTinh ?? 50) + ngoTinhGain);
  }
  gainExp(G, 12);
  const coDuyenMed = rollCoDuyen(G, 'meditate');
  if (coDuyenMed) {
    return { ok:true, msg:`🌸 Tham thiền ngộ đạo ✨ KỲ NGỘ! ${coDuyenMed.msg}`, type:coDuyenMed.type, detail:coDuyenMed.detail };
  }
  return { ok:true, msg:`🌸 Tham thiền ngộ đạo — +${fmtNum(q)} linh lực`, type:'spirit', float:`+${fmtNum(q)}⚡` };
}