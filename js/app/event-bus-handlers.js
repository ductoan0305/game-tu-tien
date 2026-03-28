// ============================================================
// app/event-bus-handlers.js — Tất cả bus.on() listeners
// Được gọi 1 lần trong startGame()
// ============================================================
import { bus }                    from '../utils/helpers.js';
import { showToast, showFloat,
         appendLog, switchTab }   from '../ui/render-core.js';
import { updateMapStats }         from '../ui/world-map.js';
import { onDungeonFloorClear,
         exitDungeon }            from '../dungeon/dungeon-engine.js';
import { resolveAmbushWin,
         resolveAmbushLoss }      from '../core/kiep-tu-engine.js';
import { LINH_THU_DATA }          from '../core/linh-thu-engine.js';
import { getDanhVongTier }        from '../core/danh-vong.js';
import { showGameOverScreen }     from './popups/gameover-popup.js';
import { showCoDuyenModal,
         showLinhThuEncounterPopup } from './popups/misc-popups.js';
import { flashScreen }            from '../ui/tabs/combat-tab.js';

export function wireEventBus(G, { renderCurrentTab, renderAll, clearIntervals, cultivateActions, switchTabFn }) {

  bus.on('quest:completed', ({ questId, quest, rewards }) => {
    showToast(`✅ Hoàn thành: ${quest.name}! +${rewards.stone}💎`, 'gold');
    appendLog(`📜 Nhiệm vụ hoàn thành: ${quest.name}`, 'quest');
    if (rewards.recipe) showToast(`📜 Học được công thức: ${rewards.recipe}`, 'spirit');
    renderCurrentTab();
  });

  bus.on('combat:end', ({ victory, enemy, rewards }) => {
    if (victory) {
      appendLog(`✅ Chiến thắng ${enemy.name} — +${rewards?.stone||0}💎`, 'gold');
      if (enemy?.isKiepTu) {
        const r = resolveAmbushWin(G, enemy._kiepTuData || enemy);
        showToast(r.msg, 'gold');
        appendLog(`⚔ Đánh bại Kiếp Tu ${enemy.name}! +${r.stoneGain}💎`, 'gold');
      }
      if (G.dungeon?.active) {
        const dr = onDungeonFloorClear(G);
        if (dr.ok) {
          showToast(dr.msg, dr.type||'jade');
          appendLog(dr.msg, 'jade');
          if (dr.itemGained) showToast(`📦 Nhận: ${dr.itemGained.emoji} ${dr.itemGained.name}!`, 'epic');
          if (dr.isFinal) showToast('🏆 Chinh phục toàn bộ Thiên Ma Địa Phủ!', 'legendary');
        }
      }
    } else {
      appendLog(`💀 Bại trận trước ${enemy.name}`, 'danger');
      if (enemy?.isKiepTu) {
        const r = resolveAmbushLoss(G, enemy._kiepTuData || enemy);
        showToast(r.msg, 'danger');
      }
      if (G.dungeon?.active) {
        const er = exitDungeon(G);
        showToast(er.msg, 'danger');
        appendLog(er.msg, 'danger');
      }
    }
    if (!G.dungeon?.active) {
      setTimeout(() => { switchTabFn('cultivate'); renderCurrentTab(); }, 1200);
    } else {
      renderCurrentTab();
    }
  });

  bus.on('equipment:drop', ({ item }) => {
    showToast(`⚔ Rơi đồ: ${item.emoji} ${item.name}!`, 'epic');
    appendLog(`⚔ Nhận trang bị: ${item.name}`, 'gold');
  });

  document.addEventListener('tab:switch', () => renderCurrentTab());

  bus.on('phapdia:changed', ({ phapDia }) => {
    showToast(`🏔 Di chuyển đến ${phapDia.name} — ×${phapDia.rateMultiplier} tốc độ`, 'jade');
  });

  bus.on('coduyen:triggered', ({ event, detail }) => {
    showCoDuyenModal(G, event, detail);
  });

  bus.on('phapdia:expired', () => {
    showToast('⏳ Động Phủ đã hết thời hạn — trở về Phàm Địa!', 'danger');
    appendLog('⏳ Động Phủ hết hạn, lui về Phàm Địa.', 'danger');
  });

  bus.on('lifespan:warning', ({ remaining, level }) => {
    const msgs  = { warning:`⚠ Tuổi thọ còn ${remaining} năm!`, danger:`🔴 NGUY HIỂM! Còn ${remaining} năm!`, critical:`💀 CỰC KỲ NGUY HIỂM! Chỉ còn ${remaining} năm!` };
    const types = { warning:'gold', danger:'danger', critical:'danger' };
    showToast(msgs[level], types[level]);
    appendLog(msgs[level], types[level]);
  });

  bus.on('lifespan:breakthrough', ({ realmName, newLifespan, totalYears }) => {
    showToast(`✨ Đột phá ${realmName}! Tuổi thọ → ${newLifespan} năm!`, 'legendary');
    appendLog(`📜 Ký sự: Năm thứ ${Math.floor(totalYears)} — Đột phá ${realmName}!`, 'realm');
  });

  bus.on('game:over', () => {
    if (G) G.gameTime.isGameOver = true;
    clearIntervals();
    showGameOverScreen(G);
  });

  // ---- Đói Khát ----
  bus.on('hunger:starved', () => {
    if (!G) return;
    showToast('💀 Chết đói! Phải trồng Linh Mễ hoặc mua lương thực!', 'danger');
    appendLog('💀 Chết đói — thiếu lương thực!', 'danger');
    flashScreen('death');
    G.gameTime.isGameOver = true;
    clearIntervals();
    showGameOverScreen(G);
  });
  bus.on('hunger:warning', ({ days, severe }) => {
    if (severe) showToast(`⚠ Đói nặng ${days} ngày — HP đang giảm nhanh!`, 'danger');
    else if (days === 1) showToast('🌾 Đã qua 2 ngày chưa ăn — tìm Linh Mễ!', 'warning');
  });
  bus.on('hunger:fed', ({ source }) => {
    if (source === 'linh_me') showFloat('🌾 No!', 'jade');
    else if (source === 'ich_coc_dan') showFloat('💊 Ích Cốc Đan!', 'jade');
  });

  // ---- Dược Điền ----
  bus.on('duoc_dien:ready',     () => showToast('🌾 Dược Điền có cây đã trưởng thành — vào Linh Thực để thu hoạch!', 'jade'));
  bus.on('duoc_dien:harvested', ({ yield: y }) => { showToast(`🌾 Thu hoạch ${y} Linh Mễ!`, 'jade'); showFloat(`+${y} 🌾`, 'jade'); });
  bus.on('duoc_dien:expanded',  ({ maxSlots }) => showToast(`🪴 Dược Điền mở rộng — ${maxSlots} ô!`, 'jade'));

  // ---- Ám Thương ----
  bus.on('am_thuong:cancot_lost', ({ delta, total }) => {
    showToast(`🩸 Ám Thương tích lũy — Căn Cốt -${delta} (tổng: ${total})`, 'danger');
    appendLog(`🩸 Ám Thương -${delta} Căn Cốt`, 'danger');
  });
  bus.on('am_thuong:gained', ({ gained }) => {
    if (gained >= 3) showFloat(`🩸 Ám Thương +${gained}`, 'danger');
  });

  // ---- Ma Đạo ----
  bus.on('ma_dao:opened',           () => { showToast('👹 Ma Đạo khai mở — con đường hắc ám bắt đầu...', 'danger'); appendLog('👹 Ma Đạo khai mở.', 'danger'); });
  bus.on('ma_dao:tau_hoa_permanent',() => { showToast('💀 Tẩu Hỏa Ma Tính vĩnh viễn!', 'danger'); appendLog('💀 Tẩu Hỏa Ma Tính vĩnh viễn!', 'danger'); flashScreen('heavy'); });
  bus.on('ma_dao:exposed',          () => { showToast('⚠ Bị phát hiện là Ma Tu — trục xuất khỏi tông môn!', 'danger'); appendLog('⚠ Bị trục xuất vì Ma Đạo.', 'danger'); });
  bus.on('ma_dao:purified',         ({ hunYuanBonus }) => showToast(`✨ Giải trừ Ma Căn! +${hunYuanBonus} tốc tu luyện vĩnh viễn`, 'epic'));

  // ---- Map ----
  bus.on('map:moved', () => { if (G.activeTab === 'cultivate') renderCurrentTab(); });

  // ---- Danh Vọng ----
  bus.on('danhvong:gained', ({ amount, source }) => {
    const tier = getDanhVongTier(G.danhVong ?? 0);
    appendLog(`🌟 Danh Vọng +${amount} (${source}) — ${tier.label}`, 'gold');
    renderCurrentTab();
  });

  bus.on('sect:dv_bonus', ({ bonus, extra }) => {
    showFloat(`🌟 DV bonus +${bonus}% sectExp (+${extra})`, 'gold');
  });

  bus.on('dungeon:boss_cleared', ({ floor }) => {
    const dvGain = 10 + floor * 5;
    G.danhVong = (G.danhVong ?? 0) + dvGain;
    showToast(`🏆 Boss tầng ${floor} bại trận! Danh Vọng +${dvGain}!`, 'legendary');
    bus.emit('danhvong:gained', { amount: dvGain, source: `Boss Địa Phủ tầng ${floor}` });
  });

  // ---- Kiếp Tu ----
  bus.on('kieptu:start_combat', ({ kiepTu }) => {
    const REALM_ATK = [15,60,200,600,1800];
    const REALM_DEF = [8,30,100,300,900];
    const REALM_HP  = [120,500,2000,8000,30000];
    const r = kiepTu.realmIdx ?? 0;
    const enemy = {
      id:kiepTu.id, name:kiepTu.name, emoji:kiepTu.emoji, desc:kiepTu.desc||'',
      realmIdx:r,
      atk:  Math.floor(REALM_ATK[r]*(kiepTu.atkMult??1.3)),
      def:  Math.floor(REALM_DEF[r]*(kiepTu.defMult??1.1)),
      hp:   Math.floor(REALM_HP[r] *(kiepTu.hpMult ??1.2)),
      maxHp:Math.floor(REALM_HP[r] *(kiepTu.hpMult ??1.2)),
      exp:  Math.floor(REALM_ATK[r]*2),
      stone:(kiepTu.stoneLoot?.[0]||30)+Math.floor(Math.random()*((kiepTu.stoneLoot?.[1]||100)-(kiepTu.stoneLoot?.[0]||30))),
      tier:r, isKiepTu:true, _kiepTuData:kiepTu,
    };
    G.combat = {
      active:true, enemy,
      playerHp:G.hp, playerMaxHp:G.maxHp,
      playerMp:100, playerMaxMp:100,
      turn:0, phase:'player',
      log:[{ text:`⚠ ${kiepTu.name} xuất hiện chặn đường! "${kiepTu.desc}"`, type:'system' }],
      selectedSkill:null, comboCount:0, lastActionWin:false,
      isKiepTu:true, _kiepTuData:kiepTu,
    };
    switchTabFn('combat');
    renderCurrentTab();
    showToast(`⚠ Bị ${kiepTu.name} phục kích!`, 'danger');
    appendLog(`⚠ Kiếp Tu ${kiepTu.name} chặn đường!`, 'danger');
  });
  bus.on('kieptu:ambush', ({ kiepTu }) => appendLog(`🗡 Phát hiện Kiếp Tu ${kiepTu.name} đang rình rập!`, 'danger'));

  // ---- Linh Thú ----
  bus.on('linhthu:encounter', ({ type, data }) => appendLog(`✨ Phát hiện ${data.emoji} ${data.name} ${type==='egg'?'(trứng)':'(hoang dã)'}!`, 'spirit'));
  bus.on('linhthu:tamed',     ({ data }) => { showToast(`🎉 Thuần hóa ${data.emoji} ${data.name} thành công!`, 'legendary'); appendLog(`🐾 Linh thú mới: ${data.emoji} ${data.name}`, 'spirit'); });
  bus.on('linhthu:hatched',   ({ data }) => { showToast(`🥚 Trứng ${data.emoji} ${data.name} đã nở!`, 'epic'); appendLog(`🥚 ${data.emoji} ${data.name} chào đời!`, 'spirit'); });
  bus.on('linhthu:egg_waiting', () => showToast('🥚 Trứng đã nở nhưng chưa có chỗ — thả bớt linh thú!', 'danger'));
  bus.on('linhthu:released',  ({ beastId }) => {
    const d = LINH_THU_DATA[beastId];
    appendLog(`${d?.emoji||'🐾'} ${d?.name||beastId} được thả về tự nhiên.`, 'jade');
  });
}