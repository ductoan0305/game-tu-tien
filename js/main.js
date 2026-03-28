// ============================================================
// main.js — Entry point, game loop, render switcher
// Sau refactor: ~400 dòng (từ 2493 dòng)
// Business logic → core/systems/
// Bus handlers  → app/event-bus-handlers.js
// Popups        → app/popups/
// ============================================================
import { createFreshState, saveGame, loadGame,
         calcOfflineSec, applyOfflineMeditate, applyOfflineSkip,
         calcOfflineProgress,
         calcQiRate, calcMaxQi }                                     from './core/state.js';
import { gameTick, checkAchievements, applyCharacterSetup,
         doBreakthrough, toggleMeditate, doRest, doExplore, doFish,
         doArray, doSpar, doMeditation, learnSkill, buyItem, useItem,
         calcBreakthroughChance }                                    from './core/actions.js';
import { REALMS, SKILLS, ITEMS }                                     from './core/data.js';
import { isTabUnlocked as isTabUnlocked_ }                           from './ui/nav-progression.js';
import { startCombat, playerAction, flee,
         getAvailableEnemies, getUnlockedSkills }                    from './combat/combat-engine.js';
import { craftPill, gatherIngredient, upgradeFurnace,
         unlockRecipe, getAvailableRecipes }                         from './alchemy/alchemy-engine.js';
import { initQuestSystem, getActiveQuests, getDailyQuests,
         getAvailableQuests, claimDailyReward,
         updateQuests, acceptQuest }                                 from './quest/quest-engine.js';
import { renderHeader, renderCultivateStats, renderCombatStatus,
         showOfflineModal, showOfflineChoiceModal,
         showToast, showFloat, appendLog,
         restoreLog, switchTab, renderNav,
         checkAndNotifyUnlocks, toggleNotifPanel }                   from './ui/render-core.js';
import { bus }                                                       from './utils/helpers.js';
import { getRemainingLifespan, getMaxLifespan, getLifespanColor,
         getLifespanPercent, formatYear, spendTravelTime }            from './core/time-engine.js';
import { getSpiritDisplayName, getSpiritMainColor, getSpiritProphecy,
         calcSpiritRateMulti, SPIRIT_ROOT_TYPES,
         SPIRIT_ELEMENTS }                                           from './core/spirit-root.js';
import { initSetupScreen }                                           from './ui/setup-screen.js';
import { renderCombatTab, showCombatFloat,
         animateFighter, flashScreen }                               from './ui/tabs/combat-tab.js';
import { checkTitles, setActiveTitle,
         getActiveTitle, getUnlockedTitles }                        from './core/title-engine.js';
import { renderAlchemyTab }     from './ui/tabs/alchemy-tab.js';
import { renderQuestTab }       from './ui/tabs/quest-tab.js';
import { renderSkillsTab }      from './ui/tabs/skills-tab.js';
import { renderInventoryTab }   from './ui/tabs/inventory-tab.js';
import { renderShopTab }        from './ui/tabs/shop-tab.js';
import { renderRankingTab }     from './ui/tabs/ranking-tab.js';
import { renderEquipmentTab }   from './ui/tabs/equipment-tab.js';
import { equipFromBag, unequipSlot, discardFromBag } from './equipment/equipment-engine.js';
import { renderDungeonTab }     from './ui/tabs/dungeon-tab.js';
import { renderSectTab }        from './ui/tabs/sect-tab.js';
import { renderPassiveTab }     from './ui/tabs/passive-tab.js';
import { enterDungeon, onDungeonFloorClear, exitDungeon,
         resetDungeon, buildDungeonEnemyForCombat }                 from './dungeon/dungeon-engine.js';
import { doSectContribution }   from './sect/sect-engine.js';
import { upgradePassiveNode }   from './core/passive-engine.js';
import { renderWorldMap, updateMapStats,
         getCurrentNode, WORLD_NODES }                              from './ui/world-map.js';
import { renderPhapDiaTab }     from './ui/tabs/phapdia-tab.js';
import { renderNgheNghiepTab }  from './ui/tabs/nghe-nghiep-tab.js';
import { renderCraftTab }       from './ui/tabs/craft-tabs.js';
import { renderLinhThuTab }     from './ui/tabs/linh-thu-tab.js';
import { moveToPhapDia, upgradeCongPhap, addCongPhapSlot, removeCongPhapSlot } from './core/phap-dia.js';
import { expandDuocDien, plantCrop, harvestCrop, eatLinhMe,
         healAmThuong, getAmThuongStatus }                          from './core/duoc-dien-engine.js';
import { openMaDao, gainMaQi, toggleAnMa, doMaBreakthrough,
         completePurify, startPurifyQuest,
         getMaDaoStatus }                                           from './core/ma-dao-engine.js';
import { getDanhVongTier }      from './core/danh-vong.js';
import { resolveAmbushWin, resolveAmbushLoss } from './core/kiep-tu-engine.js';
import { LINH_THU_DATA, tryTame, pickupEgg,
         feedBeast, buyLinhThuEgg, releaseBeast,
         SHOP_EGGS }                                                from './core/linh-thu-engine.js';

// ---- Popups (tách từ main.js cũ) ----
import { showCharPopup }        from './app/popups/char-popup.js';
import { showGameOverScreen }   from './app/popups/gameover-popup.js';
import { showBreakthroughModal, showCoDuyenModal, showSectJoinModal,
         showResetConfirm, showWelcomeModal, showFullGuide,
         showLinhThuEncounterPopup }                               from './app/popups/misc-popups.js';

// ---- Bus handlers (tách từ startGame()) ----
import { wireEventBus }         from './app/event-bus-handlers.js';

// ---- Firebase ----
import { initAuthUI, showAccountMenu, uploadSave as cloudUpload } from './firebase/auth-ui.js';

// ---- Global state ----
let G              = null;

// Expose map functions để starter-village.js dùng (break circular import)
window._renderWorldMap = renderWorldMap;
window._updateMapStats = updateMapStats;
let _tickInterval  = null;
let _saveInterval  = null;

// ============================================================
// INIT
// ============================================================
async function init() {
  // Nếu vừa reset, xóa localStorage ngay đầu tiên trước mọi thứ
  if (sessionStorage.getItem('_pendingReset')) {
    localStorage.removeItem('tutien_v10');
    sessionStorage.removeItem('_pendingReset');
  }
  initAuthUI({
    getG:      () => G,
    showToast: (msg, type) => showToast(msg, type),

    // Anon user → load từ localStorage bình thường
    onAnonReady: () => {
      const saved = loadGame();
      if (saved) {
        G = saved;
        const offSec = calcOfflineSec(G);
        startGame();
        if (offSec > 0) {
          showOfflineChoiceModal(offSec, (choseMeditate) => {
            const offlineData = choseMeditate
              ? applyOfflineMeditate(G, offSec)
              : applyOfflineSkip(G, offSec);
            showOfflineModal(offlineData);
          });
        }
      } else {
        G = createFreshState();
        initSetupScreen(G, onSetupComplete);
      }
    },

    // Google user → cloud save đã được resolve (cloudG = save từ Firestore, hoặc null nếu chưa có)
    onGoogleReady: (cloudG) => {
      if (cloudG) {
        // Có cloud save → dùng luôn, ghi đè localStorage
        G = cloudG;
        window._G = G;
        saveGame(G);
        const offSec = calcOfflineSec(G);
        startGame();
        if (offSec > 0) {
          showOfflineChoiceModal(offSec, (choseMeditate) => {
            const offlineData = choseMeditate
              ? applyOfflineMeditate(G, offSec)
              : applyOfflineSkip(G, offSec);
            showOfflineModal(offlineData);
          });
        }
      } else {
        // Chưa có cloud save (account mới) → tạo nhân vật mới
        G = createFreshState();
        initSetupScreen(G, onSetupComplete);
      }
    },

    // User chọn dùng cloud save khi conflict
    onCloudLoad: (cloudG) => {
      G = cloudG;
      window._G = G;
      saveGame(G);
      window.location.reload();
    },
  });
}

function onSetupComplete(setupData) {
  applyCharacterSetup(G, setupData);
  saveGame(G);
  // Upload lên cloud ngay sau khi tạo nhân vật
  cloudUpload(G);
  startGame();
  setTimeout(() => showWelcomeModal(G), 600);
}

function startGame() {
  window._G = G;
  document.getElementById('game-container')?.style.setProperty('display','block');
  document.getElementById('setup-container')?.style.setProperty('display','none');

  initQuestSystem(G);

  G._sessionStartTime = Date.now();
  _tickInterval = setInterval(tick, 100);
  _saveInterval = setInterval(() => {
    saveGame(G);
    cloudUpload(G); // throttled internally — max 1 upload/30s
  }, 15000);

  // Wire tất cả bus.on listeners
  wireEventBus(G, {
    renderCurrentTab,
    renderAll,
    clearIntervals: () => { clearInterval(_tickInterval); clearInterval(_saveInterval); },
    cultivateActions,
    switchTabFn: (tabId) => { switchTab(tabId, G); renderCurrentTab(); },
  });

  wireEvents();
  renderAll();
  switchTab(G.activeTab || 'cultivate', G);
  setTimeout(() => restoreLog(G), 50);
}

// ============================================================
// TICK
// ============================================================
function tick() {
  if (!G || !G.setupDone) return;
  try {
    gameTick(G, 0.1);

    if (!G._tickCount) G._tickCount = 0;
    G._tickCount++;
    if (G._tickCount % 100 === 0 && (G.khiVan ?? 20) < 100)
      G.khiVan = Math.min(100, (G.khiVan ?? 20) + 1);

    const newAchievements = checkAchievements(G);
    for (const a of newAchievements) {
      showToast(`🏆 Thành tựu: ${a.name}`, 'epic');
      appendLog(`🏆 Đạt thành tựu: ${a.name}`, 'achievement');
    }

    const newTitles = checkTitles(G);
    for (const t of newTitles) {
      const c = { common:'jade', uncommon:'spirit', rare:'epic', epic:'epic', legendary:'legendary' }[t.rarity] || 'jade';
      showToast(`${t.emoji} Danh Hiệu: 【${t.name}】`, c);
      appendLog(`${t.emoji} Nhận danh hiệu: 【${t.name}】 — ${t.flavor}`, 'gold');
    }

    renderHeader(G);
    renderCultivateStats(G);
    renderCombatStatus(G);
    if (G.activeTab === 'cultivate') updateMapStats(G);
    if (G._tickCount % 30 === 0) {
      renderNav(G);
      checkAndNotifyUnlocks(G, showToast, appendLog);
    }
    // Smart reminders mỗi 5 phút thực (3000 ticks × 0.1s = 300s)
    if (G._tickCount % 3000 === 0) {
      _checkSmartNotifications(G);
    }
    if (G._tickCount % 600 === 0) {
      const earned = Math.floor(REALMS[G.realmIdx].rate * 0.015 * (1 + (G.stoneBonus||0)) * 60);
      if (earned > 0) appendLog(`💎 Thu được ${earned} linh thạch trong 60 giây qua`, 'gold');
    }
  } catch (e) { console.error('[tick error]', e); }
}

// ============================================================
// RENDER
// ============================================================
function renderAll() {
  renderHeader(G);
  renderCultivateStats(G);
  renderNav(G);
  renderCurrentTab();
}

function renderCurrentTab() {
  const tab = G.activeTab || 'cultivate';
  if (tab !== 'cultivate') {
    import('./ui/nav-progression.js').then(({ isTabUnlocked, getTabLockInfo }) => {
      if (!isTabUnlocked(tab, G)) {
        const info  = getTabLockInfo(tab, G);
        const panel = document.getElementById(`panel-${tab}`);
        if (panel) panel.innerHTML = `<div class="locked-panel"><div class="lp-icon">🔒</div><div class="lp-title">${info?.label||tab}</div><div class="lp-desc">${info?.desc||'Chưa mở khóa.'}</div></div>`;
        return;
      }
      _doRenderTab(tab);
    });
    return;
  }
  _doRenderTab(tab);
}

function _doRenderTab(tab) {
  switch (tab) {
    case 'cultivate':   renderWorldMap(G, mapActions); break;
    case 'combat':      renderCombatTab(G, combatActions); break;
    case 'alchemy':     renderAlchemyTab(G, alchemyActions); break;
    case 'quests':      renderQuestTab(G, questActions); break;
    case 'skills':      renderSkillsTab(G, skillActions); break;
    case 'inventory':   renderInventoryTab(G, inventoryActions); break;
    case 'shop':        renderShopTab(G, shopActions); break;
    case 'ranking':     renderRankingTab(G); break;
    case 'equipment':   renderEquipmentTab(G, equipmentActions); break;
    case 'dungeon':     renderDungeonTab(G, dungeonActions); break;
    case 'sect':        renderSectTab(G, sectActions); break;
    case 'passive':     renderPassiveTab(G, passiveActions); break;
    case 'phapdia':     renderPhapDiaTab(G, phapDiaActions); break;
    case 'nghe_nghiep': renderNgheNghiepTab(G, alchemyActions); break;
    case 'tran_phap':   renderCraftTab('tran_phap', G); break;
    case 'phu_chu':     renderCraftTab('phu_chu', G); break;
    case 'khoi_loi':    renderCraftTab('khoi_loi', G); break;
    case 'linh_thuc':   renderCraftTab('linh_thuc', G); break;
    case 'linh_thu':    renderLinhThuTab(G, linhThuActions); break;
  }
}

// ============================================================
// UNIVERSAL ACTION HANDLER
// ============================================================
function handleAction(result) {
  if (!result || !result.msg) return;
  appendLog(result.msg, result.type || '');
  showToast(result.msg, result.type || '');
  if (result.float) showFloat(result.float, result.type || '');
}

// ============================================================
// ACTION OBJECTS
// Giữ ở đây vì chúng cần closure `G` và `renderCurrentTab`
// ============================================================

// ── Travel overlay — hiển thị "đang di chuyển" vài giây rồi thực thi callback ──
function _showTravelOverlay(days, label, callback) {
  // Dừng bế quan nếu đang bế quan
  if (G.meditating) { G.meditating = false; }

  const overlay = document.createElement('div');
  overlay.id = 'travel-overlay';
  overlay.innerHTML = `
    <div class="travel-modal">
      <div class="travel-icon">🚶</div>
      <div class="travel-title">${label}</div>
      <div class="travel-days">⏳ Di chuyển và tìm kiếm — <strong>~${days} ngày</strong></div>
      <div class="travel-bar-track"><div class="travel-bar-fill" id="travel-bar-fill"></div></div>
      <div class="travel-hint" style="color:var(--text-dim);font-size:11px;margin-top:8px">
        Đạo hữu không thể làm gì khác trong lúc này...
      </div>
    </div>`;
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;z-index:9999';
  document.body.appendChild(overlay);

  // Animate bar 3 giây
  const fill = document.getElementById('travel-bar-fill');
  const DURATION = 3000;
  const start = Date.now();
  const tick = () => {
    const pct = Math.min(100, ((Date.now() - start) / DURATION) * 100);
    if (fill) fill.style.width = pct + '%';
    if (pct < 100) requestAnimationFrame(tick);
    else {
      overlay.remove();
      callback();
    }
  };
  requestAnimationFrame(tick);
}

const mapActions = {
  onMapMove: (node) => { showToast(`🗺 Đến ${node.name}`, 'jade'); appendLog(`🗺 Di chuyển đến ${node.name} — ${node.desc}`, 'jade'); },
  onMapError: (msg) => showToast(msg, 'danger'),
  toast: (msg, type) => showToast(msg, type||'jade'),
  switchTab: (tabId) => { switchTab(tabId, G); renderCurrentTab(); },
  startHunt: (enemyId, huntDays = 7) => {
    _showTravelOverlay(huntDays, '⚔ Tìm Kiếm Yêu Thú', () => {
      const travelResult = spendTravelTime(G, huntDays);
      if (!travelResult.ok) {
        showToast(travelResult.msg, 'danger');
        appendLog(travelResult.msg, 'danger');
        renderCurrentTab();
        return;
      }
      const result = startCombat(G, enemyId);
      if (!result.ok) { showToast(result.msg, 'danger'); return; }
      showToast(`⚔ Bắt đầu chiến đấu: ${result.enemy.name}`, 'danger');
      appendLog(`⚔ Gặp ${result.enemy.name} sau ${huntDays} ngày lùng sục!`, 'danger');
      switchTab('combat', G);
      renderCurrentTab();
    });
  },
  gather: (zoneId, travelDays = 30) => {
    // Lấy travelDays từ GATHER_ZONES nếu không truyền vào
    _showTravelOverlay(travelDays, '🌿 Tìm Kiếm Thảo Dược', () => {
      const travelResult = spendTravelTime(G, travelDays);
      if (!travelResult.ok) {
        showToast(travelResult.msg, 'danger');
        appendLog(travelResult.msg, 'danger');
        renderCurrentTab();
        return;
      }
      const r = gatherIngredient(G, zoneId);
      handleAction(r);
      appendLog(r.ok ? `🌿 Thu thập sau ${travelDays} ngày: ${r.msg}` : r.msg, r.ok ? 'jade' : 'danger');
      renderCurrentTab();
    });
  },
  explore: () => {
    const result = doExplore(G);
    handleAction(result);
    if (result.linhThuEncounter) showLinhThuEncounterPopup(G, result.linhThuEncounter, { renderCurrentTab });
    if (G.activeTab === 'cultivate') renderCurrentTab();
  },
  showSectJoin: (sectId, sectName) => showSectJoinModal(G, sectId, sectName, { appendLog, renderCurrentTab }),
  breakthrough: () => {
    const result = doBreakthrough(G);
    if (!result.ok) { handleAction(result); return; }
    if (result.type === 'fail' || result.type === 'fail_severe') {
      showToast(result.msg, result.type==='fail_severe'?'danger':'warning');
      appendLog(`💥 ${result.msg}`, result.type==='fail_severe'?'danger':'warning');
    } else if (result.type === 'realm') {
      showToast(`🌟 ĐẠI ĐỘT PHÁ! → ${result.sub}`, 'epic');
      appendLog(`⚡ Đại đột phá: ${result.sub}`, 'realm');
      showBreakthroughModal(result);
    } else { handleAction(result); }
    renderCurrentTab();
  },
  updateQuest: (type, data) => { updateQuests(G, type, data); renderCurrentTab(); },
  acceptQuestDirect: (questId) => {
    const result = acceptQuest(G, questId);
    if (result.ok) { showToast(result.msg,'jade'); appendLog(result.msg,'jade'); renderCurrentTab(); }
    return result;
  },
};

const cultivateActions = {
  meditate: () => handleAction(toggleMeditate(G)),
  rest:     () => handleAction(doRest(G)),
  explore:  () => {
    const result = doExplore(G);
    handleAction(result);
    if (result.linhThuEncounter) showLinhThuEncounterPopup(G, result.linhThuEncounter, { renderCurrentTab });
  },
  fish:       () => handleAction(doFish(G)),
  array:      () => handleAction(doArray(G)),
  spar:       () => handleAction(doSpar(G)),
  meditation: () => handleAction(doMeditation(G)),
  breakthrough: () => {
    const result = doBreakthrough(G);
    if (!result.ok) {
      handleAction(result);
      if (result.chance) appendLog(`📊 Cơ hội: ${result.chance}% — ${result.msg}`, 'dim');
      return;
    }
    if (result.type === 'fail' || result.type === 'fail_severe') {
      const color = result.type==='fail_severe'?'danger':'warning';
      showToast(result.msg, color); appendLog(`💥 ${result.msg} (Cơ hội: ${result.chance}%)`, color);
      if (result.type==='fail_severe') flashScreen('heavy');
    } else if (result.type === 'stage') {
      showToast(`✨ Tiến Cảnh! ${result.sub} (${result.chance}%)`, 'jade');
      appendLog(`✨ Tiến cảnh: ${result.sub}`, 'jade');
    } else if (result.type === 'realm') {
      showToast(`🌟 ĐẠI ĐỘT PHÁ! → ${result.sub}`, 'epic');
      appendLog(`⚡ Đại đột phá: ${result.sub}`, 'realm');
      showBreakthroughModal(result);
    } else if (result.type === 'ascend') {
      showToast('☀ PHI THĂNG! Vượt thoát Nhân Giới!', 'legendary');
      appendLog('☀ PHI THĂNG — Hành trình Nhân Giới kết thúc!', 'realm');
      showBreakthroughModal(result);
    }
    renderCurrentTab();
  },
};

const combatActions = {
  startHunt: (enemyId) => {
    const result = startCombat(G, enemyId);
    if (!result.ok) { showToast(result.msg, 'danger'); return; }
    showToast(`⚔ Bắt đầu chiến đấu: ${result.enemy.name}`, 'danger');
    renderCurrentTab();
  },
  action: (actionType, data) => {
    const result = playerAction(G, actionType, data);
    if (!result.ok) { showToast(result.msg, 'danger'); return; }
    if (result.playerDmg > 0) { animateFighter('player','attack'); animateFighter('enemy','hit'); showCombatFloat(`-${result.playerDmg}`,'enemy',result.msgs?.some(m=>m.includes('COMBO'))?'crit':'dmg'); }
    if (result.enemyDmg > 0)  { animateFighter('enemy','attack'); animateFighter('player','hit'); showCombatFloat(`-${result.enemyDmg}`,'player','hit'); const maxHp=G.combat.playerMaxHp||1; if(result.enemyDmg/maxHp>0.2) flashScreen('heavy'); else flashScreen('hit'); }
    if (result.msgs?.some(m=>m.includes('né'))) showCombatFloat('MISS','player','miss');
    for (const msg of (result.msgs||[])) appendLog(msg, result.victory?'gold':'danger');
    if (result.ended) {
      if (result.victory) showToast(`🏆 Chiến thắng! +${result.rewards?.stone}💎`, 'gold');
      else { showToast('💀 Bại trận!', 'danger'); flashScreen('death'); }
      if (!G.dungeon?.active) { setTimeout(() => { switchTab('cultivate',G); renderCurrentTab(); }, 1200); return; }
    }
    renderCurrentTab();
  },
  flee: () => {
    const result = flee(G);
    showToast(result.msg, result.ok?'jade':'danger');
    if (result.ok) {
      if (G.dungeon?.active) { const er=exitDungeon(G); showToast(er.msg,'danger'); appendLog(er.msg,'danger'); renderCurrentTab(); }
      else { setTimeout(()=>{ switchTab('cultivate',G); renderCurrentTab(); }, 800); return; }
    } else renderCurrentTab();
  },
};

const alchemyActions = {
  craft: (recipeId, quantity=1) => {
    const result = craftPill(G, recipeId, quantity);
    handleAction(result);
    if (result.explosions>0) showToast('💥 NỔ LÒ! Lò đan hư hỏng!','danger');
    else if (result.critical) showToast('🌟 THẦN PHẨM! Hiệu quả tối thượng!','legendary');
    if (result.newUnlocks?.length>0) for (const name of result.newUnlocks) showToast(`📜 Mở công thức: ${name}!`,'gold');
    if (result.ok && result.pham) {
      const tier=result.pill?.tier||1; const phamId=result.pham?.id||'';
      if (tier>=3||phamId==='thuong'||phamId==='than') {
        const dvGain=phamId==='than'?5:tier>=4?4:tier>=3?2:1;
        G.danhVong=(G.danhVong??0)+dvGain;
        if (dvGain>=3) showToast(`🌟 Danh Vọng +${dvGain} — tiếng lành đồn xa!`,'gold');
      }
    }
    renderCurrentTab();
  },
  forge: (recipeId) => {
    import('./alchemy/crafting-data.js').then(({ CRAFTING_RECIPES, getCraftsmanRank, FORGE_SUCCESS_BONUS, CRAFTABLE_EQUIPMENT }) => {
      import('./equipment/equipment-data.js').then(({ EQUIPMENT }) => {
        const recipe=CRAFTING_RECIPES.find(r=>r.id===recipeId); if (!recipe) return;
        const forgeLv=G.alchemy?.forge?.level||0; const forgeDur=G.alchemy?.forge?.durability||0;
        if (forgeLv===0) { showToast('⚒ Chưa có Bễ Rèn! Mua tại Cửa Hàng.','danger'); return; }
        if (forgeDur<=0) { showToast('💥 Bễ Rèn đã hỏng! Cần sửa lại.','danger'); return; }
        const rNames=['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hóa Thần'];
        if ((G.realmIdx||0)<(recipe.requireRealm||0)) { showToast(`🔒 Cần đạt ${rNames[recipe.requireRealm]} trước!`,'danger'); return; }
        const rank=getCraftsmanRank(G.alchemy?.craftsCount||0);
        if (rank.rank<(recipe.requireRank||0)) { showToast('🔒 Cần cấp bậc cao hơn!','danger'); return; }
        const canForge=recipe.materials.every(({id,qty})=>(G.alchemy?.ingredients?.[id]||0)>=qty)&&(G.stone||0)>=(recipe.stoneCost||0);
        if (!canForge) { showToast('❌ Thiếu nguyên liệu!','danger'); return; }
        recipe.materials.forEach(({id,qty})=>{ G.alchemy.ingredients[id]=(G.alchemy.ingredients[id]||0)-qty; });
        G.stone-=(recipe.stoneCost||0);
        const finalChance=Math.min(0.97,(recipe.successChance||0.7)+(rank.bonus||0)/100+(FORGE_SUCCESS_BONUS[forgeLv]||0));
        const dmg=recipe.forgeDamage||1;
        if (!G.alchemy.forge) G.alchemy.forge={level:forgeLv,durability:forgeDur};
        if (Math.random()<finalChance) {
          G.alchemy.craftsCount=(G.alchemy?.craftsCount||0)+1;
          G.alchemy.forge.durability=Math.max(0,G.alchemy.forge.durability-1);
          const allEq=[...(EQUIPMENT||[]),...(CRAFTABLE_EQUIPMENT||[])];
          const eq=allEq.find(e=>e.id===recipe.resultItem);
          if (eq&&G.equipment?.bag) { G.equipment.bag.push({itemId:eq.id,name:eq.name,emoji:eq.emoji,slot:eq.slot,rarity:eq.rarity,stats:{...(eq.statsBase||{})}}); showToast(`⚒ Rèn thành công: ${eq.emoji} ${eq.name}!`,'gold'); appendLog(`⚒ Luyện Khí: ${eq.name} vào túi trang bị`,'gold'); }
          else showToast(`⚒ Rèn thành công! (${recipe.name})`,'gold');
        } else {
          G.alchemy.forge.durability=Math.max(0,G.alchemy.forge.durability-Math.ceil(Math.max(0,dmg-forgeLv*0.5)+1));
          const fe=recipe.failEffect||'nothing';
          if (fe==='nothing') { recipe.materials.forEach(({id,qty})=>{ G.alchemy.ingredients[id]=(G.alchemy.ingredients[id]||0)+qty; }); showToast('💥 Rèn thất bại! Nguyên liệu được hoàn lại.','danger'); }
          else if (fe==='lose_half') { recipe.materials.forEach(({id,qty})=>{ G.alchemy.ingredients[id]=(G.alchemy.ingredients[id]||0)+Math.ceil(qty/2); }); showToast('💥 Rèn thất bại! Mất một nửa nguyên liệu.','danger'); }
          else showToast('💥 Rèn thất bại! Toàn bộ nguyên liệu mất.','danger');
          if (G.alchemy.forge.durability<=0) showToast('🔥 Bễ Rèn bị hỏng! Vào Cửa Hàng sửa chữa.','danger');
        }
        saveGame(G); renderCurrentTab();
      });
    });
  },
  gather: (zoneId) => { const r=gatherIngredient(G,zoneId); handleAction(r); renderCurrentTab(); },
  upgradeFurnace: () => { const r=upgradeFurnace(G); handleAction(r); renderCurrentTab(); },
  repairFurnace: () => { import('./alchemy/alchemy-engine.js').then(({repairFurnace:rf})=>{ const r=rf(G); handleAction(r); renderCurrentTab(); }); },
  repairForge: () => {
    if (!G.alchemy?.forge) return;
    const lv=G.alchemy.forge.level||0; if (lv===0) { showToast('⚒ Chưa có Bễ Rèn!','danger'); return; }
    const DUR={1:{max:8,repairCost:80},2:{max:15,repairCost:150},3:{max:25,repairCost:280},4:{max:40,repairCost:500},5:{max:60,repairCost:900}};
    const cfg=DUR[lv];
    if (G.alchemy.forge.durability>=cfg.max) { showToast('⚒ Bễ Rèn vẫn còn tốt!','jade'); return; }
    if ((G.stone||0)<cfg.repairCost) { showToast(`💎 Cần ${cfg.repairCost} linh thạch để sửa!`,'danger'); return; }
    G.stone-=cfg.repairCost; G.alchemy.forge.durability=cfg.max;
    showToast(`🔧 Sửa Bễ Rèn thành công! ${cfg.max}/${cfg.max}`,'gold'); saveGame(G); renderCurrentTab();
  },
  cook: (recipeId) => {
    import('./alchemy/linh-thuc-data.js').then(({FOOD_RECIPES,getChefRank,KITCHEN_SUCCESS_BONUS})=>{
      import('./core/time-engine.js').then(({addLifespanBonus})=>{
        const recipe=FOOD_RECIPES.find(r=>r.id===recipeId); if (!recipe) return;
        if (!G.linhThuc) G.linhThuc={cooksCount:0,kitchen:{level:0,durability:0},activeBuffs:[],ingredients:{}};
        const kitLv=G.linhThuc.kitchen.level||0; const kitDur=G.linhThuc.kitchen.durability||0;
        if (kitLv===0) { showToast('🍳 Chưa có Bếp Linh Thực! Mua tại Cửa Hàng.','danger'); return; }
        if (kitDur<=0) { showToast('💥 Bếp đã hỏng!','danger'); return; }
        const rNames=['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hóa Thần'];
        if ((G.realmIdx||0)<(recipe.requireRealm||0)) { showToast(`🔒 Cần ${rNames[recipe.requireRealm]}!`,'danger'); return; }
        const rank=getChefRank(G.linhThuc.cooksCount||0);
        if (rank.rank<(recipe.requireRank||0)) { showToast('🔒 Cần nâng cấp Linh Thực Sư!','danger'); return; }
        const canCook=recipe.materials.every(({id,qty})=>((G.linhThuc.ingredients?.[id]||0)+(G.alchemy?.ingredients?.[id]||0))>=qty);
        if (!canCook) { showToast('❌ Thiếu nguyên liệu!','danger'); return; }
        if ((G.stone||0)<(recipe.stoneCost||0)) { showToast(`💎 Cần ${recipe.stoneCost} linh thạch!`,'danger'); return; }
        recipe.materials.forEach(({id,qty})=>{ let rem=qty; const ff=Math.min(G.linhThuc.ingredients[id]||0,rem); G.linhThuc.ingredients[id]=(G.linhThuc.ingredients[id]||0)-ff; rem-=ff; if (rem>0) G.alchemy.ingredients[id]=Math.max(0,(G.alchemy.ingredients[id]||0)-rem); });
        G.stone-=(recipe.stoneCost||0);
        const spiritEl=G.spiritData?.mainElement; const spiritBonus=(spiritEl==='moc'||spiritEl==='tu')?0.12:0;
        const finalChance=Math.min(0.97,(recipe.successChance||0.8)+(rank.bonus||0)/100+(KITCHEN_SUCCESS_BONUS[kitLv]||0)+spiritBonus);
        G.linhThuc.kitchen.durability=Math.max(0,kitDur-1);
        if (Math.random()<finalChance) {
          G.linhThuc.cooksCount=(G.linhThuc.cooksCount||0)+1;
          if (!Array.isArray(G.linhThuc.activeBuffs)) G.linhThuc.activeBuffs=[];
          for (const buff of (recipe.buffs||[])) {
            if (buff.type==='hp_instant') G.hp=Math.min(G.maxHp||G.hp||1,(G.hp||0)+buff.value);
            else if (buff.type==='stamina_regen') G.stamina=Math.min(G.maxStamina||100,(G.stamina||0)+buff.value);
            else if (buff.type==='lifespan') addLifespanBonus(G,buff.value,`${recipe.emoji} ${recipe.name}`);
            else if (buff.duration) { const ex=G.linhThuc.activeBuffs.find(b=>b.type===buff.type&&b.source===recipe.id); if (ex) { ex.timer=Math.max(ex.timer,buff.duration); ex.value=Math.max(ex.value,buff.value); } else G.linhThuc.activeBuffs.push({type:buff.type,value:buff.value,timer:buff.duration,source:recipe.id,emoji:recipe.emoji,name:recipe.name}); }
          }
          const buffDesc=(recipe.buffs||[]).map(b=>{ if(b.type==='hp_instant')return`+${b.value} HP`; if(b.type==='stamina_regen')return`+${b.value} thể lực`; if(b.type==='lifespan')return`+${b.value} năm thọ`; if(b.type==='rate_pct')return`+${b.value}% tốc tu`; if(b.type==='atk_pct')return`+${b.value}% ATK`; return b.type; }).join(', ');
          showToast(`🍳 Nấu thành công: ${recipe.emoji} ${recipe.name}! ${buffDesc}`,'gold'); appendLog(`🍲 Linh Thực: ${recipe.name} (${buffDesc})`,'gold');
        } else { G.linhThuc.kitchen.durability=Math.max(0,G.linhThuc.kitchen.durability-1); showToast(`💥 Nấu thất bại! ${recipe.name} cháy.`,'danger'); if (G.linhThuc.kitchen.durability<=0) showToast('🔥 Bếp hỏng!','danger'); }
        saveGame(G); renderCurrentTab();
      });
    });
  },
  repairKitchen: () => {
    if (!G.linhThuc?.kitchen) return; const lv=G.linhThuc.kitchen.level||0;
    if (lv===0) { showToast('🍳 Chưa có Bếp!','danger'); return; }
    const CFG={1:{max:10,repairCost:60},2:{max:18,repairCost:120},3:{max:30,repairCost:220},4:{max:45,repairCost:400},5:{max:70,repairCost:750}};
    const cfg=CFG[lv]; if (G.linhThuc.kitchen.durability>=cfg.max) { showToast('🍳 Bếp vẫn tốt!','jade'); return; }
    if ((G.stone||0)<cfg.repairCost) { showToast(`💎 Cần ${cfg.repairCost}!`,'danger'); return; }
    G.stone-=cfg.repairCost; G.linhThuc.kitchen.durability=cfg.max;
    showToast(`🔧 Sửa Bếp thành công! ${cfg.max}/${cfg.max}`,'gold'); saveGame(G); renderCurrentTab();
  },
  activateArray: (recipeId) => {
    import('./alchemy/tran-phap-data.js').then(({ARRAY_RECIPES,getArrayMasterRank,getArrayEffects})=>{
      const recipe=ARRAY_RECIPES.find(r=>r.id===recipeId); if (!recipe) return;
      if (!G.tranPhap) G.tranPhap={arrayCount:0,activeArrays:[],stoneDrainTimer:0};
      const rN=['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hóa Thần'];
      if ((G.realmIdx||0)<(recipe.requireRealm||0)) { showToast(`🔒 Cần ${rN[recipe.requireRealm]}!`,'danger'); return; }
      const rank=getArrayMasterRank(G.tranPhap.arrayCount||0);
      if (rank.rank<(recipe.requireRank||0)) { showToast('🔒 Cần nâng cấp Trận Pháp Sư!','danger'); return; }
      const can=recipe.materials.every(({id,qty})=>(G.alchemy?.ingredients?.[id]||0)>=qty)&&(G.stone||0)>=(recipe.stoneCostOnce||0);
      if (!can) { showToast('❌ Thiếu nguyên liệu!','danger'); return; }
      if (recipe.category==='passive'&&(recipe.stoneCostPerMin||0)>0&&(G.stone||0)<recipe.stoneCostPerMin*5) { showToast(`⚠ Cần ít nhất ${recipe.stoneCostPerMin*5}💎 dự phòng!`,'danger'); return; }
      recipe.materials.forEach(({id,qty})=>{ G.alchemy.ingredients[id]=(G.alchemy.ingredients[id]||0)-qty; });
      G.stone-=(recipe.stoneCostOnce||0);
      const rankMult=1+(rank.bonus||0)/100;
      const effects=getArrayEffects(recipe).map(ef=>({type:ef.type,value:Math.round(ef.value*rankMult)}));
      if (!Array.isArray(G.tranPhap.activeArrays)) G.tranPhap.activeArrays=[];
      G.tranPhap.activeArrays=G.tranPhap.activeArrays.filter(a=>a.category!==recipe.category);
      const entry={id:recipe.id,name:recipe.name,emoji:recipe.emoji,category:recipe.category,tier:recipe.tier,effects,stoneCostPerMin:recipe.stoneCostPerMin||0};
      if (recipe.category!=='passive') entry.timer=recipe.duration||1800;
      G.tranPhap.activeArrays.push(entry); G.tranPhap.arrayCount=(G.tranPhap.arrayCount||0)+1;
      const effectDesc=effects.map(e=>{ if(e.type==='rate_pct')return`+${e.value}% tốc tu`; if(e.type==='atk_pct')return`+${e.value}% ATK`; if(e.type==='def_pct')return`+${e.value}% DEF`; if(e.type==='dmg_reduce')return`-${e.value}% ST`; return e.type; }).join(', ');
      const tl=recipe.category==='passive'?'Thường trực':recipe.category==='active'?'Kích hoạt':'Phòng ngự';
      showToast(`🔯 ${recipe.name} (${tl})! ${effectDesc}`,'gold'); appendLog(`🔯 Trận Pháp: ${recipe.name} — ${effectDesc}`,'gold');
      saveGame(G); renderCurrentTab();
    });
  },
  cancelArray: (arrayId) => { if (!G.tranPhap?.activeArrays) return; G.tranPhap.activeArrays=G.tranPhap.activeArrays.filter(a=>a.id!==arrayId); showToast('🔯 Đã huỷ trận pháp.','jade'); saveGame(G); renderCurrentTab(); },
  drawTalisman: (recipeId) => {
    import('./alchemy/phu-chu-data.js').then(({TALISMAN_RECIPES,TALISMAN_ITEMS,getTalismanRank})=>{
      const recipe=TALISMAN_RECIPES.find(r=>r.id===recipeId); if (!recipe) return;
      if (!G.phuChu) G.phuChu={drawCount:0};
      const rN=['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hóa Thần'];
      if ((G.realmIdx||0)<(recipe.requireRealm||0)) { showToast(`🔒 Cần ${rN[recipe.requireRealm]}!`,'danger'); return; }
      const rank=getTalismanRank(G.phuChu.drawCount||0);
      if (rank.rank<(recipe.requireRank||0)) { showToast('🔒 Cần nâng cấp Phù Chú Sư!','danger'); return; }
      const can=recipe.materials.every(({id,qty})=>(G.alchemy?.ingredients?.[id]||0)>=qty)&&(G.stone||0)>=(recipe.stoneCost||0);
      if (!can) { showToast('❌ Thiếu nguyên liệu!','danger'); return; }
      recipe.materials.forEach(({id,qty})=>{ G.alchemy.ingredients[id]=(G.alchemy.ingredients[id]||0)-qty; });
      G.stone-=(recipe.stoneCost||0);
      const spiritEl=G.spiritData?.mainElement; const spiritBonus=(spiritEl==='moc'||spiritEl==='am')?0.10:0;
      const finalChance=Math.min(0.97,(recipe.successChance||0.8)+(rank.bonus||0)/100+spiritBonus);
      if (Math.random()<finalChance) {
        const talItem=TALISMAN_ITEMS.find(t=>t.id===recipe.resultItem);
        if (talItem) {
          const qty=recipe.qty||1; const ex=G.inventory.find(s=>s&&s.id===talItem.id);
          if (ex) { ex.qty+=qty; } else { const ei=G.inventory.findIndex(s=>!s); if (ei!==-1) G.inventory[ei]={id:talItem.id,qty}; else { showToast('⚠ Túi đồ đầy!','danger'); return; } }
          G.phuChu.drawCount=(G.phuChu.drawCount||0)+1;
          showToast(`📜 Vẽ thành công: ${talItem.emoji} ${talItem.name} ×${qty}!`,'gold'); appendLog(`📜 Phù Chú: ${talItem.name} ×${qty}`,'gold');
        }
      } else showToast('💥 Vẽ bùa thất bại! Nguyên liệu mất.','danger');
      saveGame(G); renderCurrentTab();
    });
  },
  switchTab: (tabId) => { switchTab(tabId,G); renderCurrentTab(); },
  craftPuppet: (recipeId) => {
    import('./alchemy/khoi-loi-data.js').then(({PUPPET_RECIPES,PUPPET_ITEMS,getPuppetRank})=>{
      const recipe=PUPPET_RECIPES.find(r=>r.id===recipeId); if (!recipe) return;
      if (!G.khoiLoi) G.khoiLoi={craftCount:0,activePuppet:null};
      const rN=['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hóa Thần'];
      if ((G.realmIdx||0)<(recipe.requireRealm||0)) { showToast(`🔒 Cần ${rN[recipe.requireRealm]}!`,'danger'); return; }
      const rank=getPuppetRank(G.khoiLoi.craftCount||0);
      if (rank.rank<(recipe.requireRank||0)) { showToast('🔒 Cần nâng cấp Khôi Lỗi Sư!','danger'); return; }
      const can=recipe.materials.every(({id,qty})=>(G.alchemy?.ingredients?.[id]||0)>=qty)&&(G.stone||0)>=(recipe.stoneCost||0);
      if (!can) { showToast('❌ Thiếu nguyên liệu!','danger'); return; }
      recipe.materials.forEach(({id,qty})=>{ G.alchemy.ingredients[id]=(G.alchemy.ingredients[id]||0)-qty; });
      G.stone-=(recipe.stoneCost||0);
      const spiritEl=G.spiritData?.mainElement; const spiritBonus=(spiritEl==='kim'||spiritEl==='tho')?0.10:0;
      const finalChance=Math.min(0.97,(recipe.successChance||0.8)+(rank.bonusPct||0)/100*0.3+spiritBonus);
      if (Math.random()<finalChance) {
        const pi=PUPPET_ITEMS.find(p=>p.id===recipe.resultItem);
        if (pi) { const ex=G.inventory.find(s=>s&&s.id===pi.id); if (ex) { ex.qty=(ex.qty||1)+1; } else { const ei=G.inventory.findIndex(s=>!s); if (ei!==-1) G.inventory[ei]={id:pi.id,qty:1}; else { showToast('⚠ Túi đồ đầy!','danger'); return; } } G.khoiLoi.craftCount=(G.khoiLoi.craftCount||0)+1; showToast(`🤖 Chế tạo thành công: ${pi.emoji} ${pi.name}!`,'gold'); appendLog(`🤖 Khôi Lỗi: ${pi.name}`,'gold'); }
      } else showToast('💥 Chế tạo thất bại!','danger');
      saveGame(G); renderCurrentTab();
    });
  },
  summonPuppet: (puppetId) => { import('./alchemy/khoi-loi-data.js').then(({PUPPET_ITEMS})=>{ const def=PUPPET_ITEMS.find(p=>p.id===puppetId); if(!def) return; const slot=G.inventory.find(s=>s&&s.id===puppetId); if(!slot){showToast('❌ Không tìm thấy!','danger');return;} if(!G.khoiLoi)G.khoiLoi={craftCount:0,activePuppet:null}; G.khoiLoi.activePuppet={id:puppetId,def,combatHp:null}; showToast(`🤖 Đã triệu hồi ${def.emoji} ${def.name}!`,'jade'); saveGame(G); renderCurrentTab(); }); },
  dismissPuppet: () => { if (!G.khoiLoi?.activePuppet) return; G.khoiLoi.activePuppet=null; showToast('🤖 Đã thu hồi khối lỗi.','info'); saveGame(G); renderCurrentTab(); },
};

const questActions = {
  toast:       (msg, type) => showToast(msg, type||'jade'),
  refresh:     () => renderCurrentTab(),
  claim:       (questId) => { const r=claimDailyReward(G,questId); handleAction(r); renderCurrentTab(); },
  acceptQuest: (questId) => { const r=acceptQuest(G,questId); if (!r.ok) showToast(r.msg||'Không thể nhận','danger'); else { showToast(r.msg,'jade'); appendLog(r.msg,'jade'); } renderCurrentTab(); },
};

const skillActions     = { learn: (skillId) => { handleAction(learnSkill(G,skillId)); renderCurrentTab(); } };
const inventoryActions = {
  use: (slotIdx) => { handleAction(useItem(G,slotIdx)); renderCurrentTab(); },
  equipFromBag:  (bi) => { const r=equipFromBag(G,bi); handleAction(r); renderCurrentTab(); return r; },
  unequipSlot:   (s)  => { const r=unequipSlot(G,s);   handleAction(r); renderCurrentTab(); return r; },
};
const shopActions = {
  buy: (itemId, costOverride) => { handleAction(buyItem(G,itemId,costOverride)); renderCurrentTab(); },
  expandDuocDien: () => { handleAction(expandDuocDien(G)); renderCurrentTab(); },
};
const duocDienActions = {
  plant:       (si,ci) => { handleAction(plantCrop(G,si,ci)); renderCurrentTab(); },
  harvest:     (si)    => { handleAction(harvestCrop(G,si)); renderCurrentTab(); },
  eat:         ()      => handleAction(eatLinhMe(G)),
  healAmThuong:(pts)   => handleAction(healAmThuong(G,pts??15,'Tái Sinh Đan')),
};
const maDaoActions = {
  open:          (tid) => { handleAction(openMaDao(G,tid)); renderCurrentTab(); },
  toggleAnMa:    ()    => handleAction(toggleAnMa(G)),
  doBreakthrough:()    => { handleAction(doMaBreakthrough(G)); renderCurrentTab(); },
  startPurify:   (hd)  => handleAction(startPurifyQuest(G,hd)),
  completePurify:()    => { handleAction(completePurify(G)); renderCurrentTab(); },
};
const equipmentActions = {
  equipFromBag:  (bi) => { const r=equipFromBag(G,bi); handleAction(r); renderCurrentTab(); return r; },
  unequipSlot:   (s)  => { const r=unequipSlot(G,s);   handleAction(r); renderCurrentTab(); return r; },
  discardFromBag:(bi) => { const r=discardFromBag(G,bi); handleAction(r); renderCurrentTab(); return r; },
};
const dungeonActions = {
  enterDungeon: () => {
    const result=enterDungeon(G); if (!result.ok) { showToast(result.msg,'danger'); return; }
    showToast(result.msg,'jade');
    if (result.floorData) {
      const eid=result.floorData.enemies[0]; const de=buildDungeonEnemyForCombat(eid,G.realmIdx);
      if (de) { G._dungeonPendingEnemy=de; G._dungeonPendingFloor=result.floor; const cr=startCombat(G,'__dungeon__'); if (cr.ok) { appendLog(`🏯 Bước vào tầng ${result.floor}: ${result.floorData.name}`,'jade'); appendLog(`⚔ ${de.name} xuất hiện!`,'danger'); switchTab('combat',G); return; } }
    }
    renderCurrentTab();
  },
  resetDungeon: () => { const r=resetDungeon(G); showToast(r.msg,'info'); renderCurrentTab(); },
};
const sectActions    = { sectContrib: (cid) => { const r=doSectContribution(G,cid); handleAction(r); if (r.rankUp) showToast(`🎉 Thăng cấp tông môn: ${r.rankUp.name}!`,'epic'); renderCurrentTab(); } };
const passiveActions = { upgradePassive: (nid) => { handleAction(upgradePassiveNode(G,nid)); renderCurrentTab(); } };
const phapDiaActions = {
  movePhapDia:      (id) => { handleAction(moveToPhapDia(G,id));     renderCurrentTab(); },
  upgradeCongPhap:  (id) => { handleAction(upgradeCongPhap(G,id));  renderCurrentTab(); },
  addCongPhapSlot:  (id) => { handleAction(addCongPhapSlot(G,id));  saveGame(G); renderCurrentTab(); },
  removeCongPhapSlot:(id)=> { handleAction(removeCongPhapSlot(G,id)); saveGame(G); renderCurrentTab(); },
};
const linhThuActions = {
  feedBeast:    (slot)    => { const r=feedBeast(G,slot);      handleAction(r); saveGame(G); renderCurrentTab(); return r; },
  releaseBeast: (slot)    => { const r=releaseBeast(G,slot);   handleAction(r); saveGame(G); renderCurrentTab(); return r; },
  buyLinhThuEgg:(beastId) => { const r=buyLinhThuEgg(G,beastId); handleAction(r); saveGame(G); renderCurrentTab(); return r; },
};

// ============================================================
// WIRE EVENTS — DOM bindings
// ============================================================
function wireEvents() {
  function wireNavBtn(btn) {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab; if (!tabId) return;
      import('./ui/nav-progression.js').then(({ isTabUnlocked, getTabLockInfo }) => {
        if (!isTabUnlocked(tabId, G)) { const info=getTabLockInfo(tabId,G); showToast(`🔒 ${info?.desc||'Chưa mở khóa'}`,'danger'); appendLog(`🔒 ${info?.label}: ${info?.desc}`,'danger'); return; }
        switchTab(tabId, G); renderCurrentTab();
      });
    });
  }
  document.querySelectorAll('.nav-btn, .bnav-btn, .bmp-btn').forEach(wireNavBtn);

  const bnavMoreBtn   = document.getElementById('bnav-more-btn');
  const bnavMorePanel = document.getElementById('bnav-more-panel');
  bnavMoreBtn?.addEventListener('click', (e) => { e.stopPropagation(); if (bnavMorePanel) bnavMorePanel.style.display=bnavMorePanel.style.display==='none'?'':'none'; });

  const menuBtn      = document.getElementById('btn-menu-icon') || document.getElementById('btn-menu');
  const menuDropdown = document.getElementById('menu-dropdown');
  menuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menuDropdown.style.display !== 'none';
    if (isOpen) { menuDropdown.style.display='none'; return; }
    const rect = menuBtn.getBoundingClientRect();
    menuDropdown.style.left=(rect.right+6)+'px'; menuDropdown.style.top=rect.top+'px'; menuDropdown.style.display='block';
    const ddRect=menuDropdown.getBoundingClientRect();
    if (ddRect.right>window.innerWidth-8) menuDropdown.style.left=(rect.left-ddRect.width-6)+'px';
    if (bnavMorePanel) bnavMorePanel.style.display='none';
  });
  document.addEventListener('click', (e) => {
    if (menuDropdown&&!menuDropdown.contains(e.target)&&e.target!==menuBtn) menuDropdown.style.display='none';
    if (bnavMorePanel&&!bnavMorePanel.contains(e.target)&&e.target!==bnavMoreBtn) bnavMorePanel.style.display='none';
  });

  safeClick('btn-meditate',   () => cultivateActions.meditate());
  safeClick('btn-rest',       () => cultivateActions.rest());
  safeClick('btn-explore',    () => cultivateActions.explore());
  safeClick('btn-fish',       () => cultivateActions.fish());
  safeClick('btn-array',      () => cultivateActions.array());
  safeClick('btn-spar',       () => cultivateActions.spar());
  safeClick('btn-meditation', () => cultivateActions.meditation());
  safeClick('btn-breakthrough',() => cultivateActions.breakthrough());

  document.getElementById('btn-guide-icon')?.addEventListener('click', () => showFullGuide(G));
  document.getElementById('btn-notif-bell')?.addEventListener('click', () => toggleNotifPanel(G));
  document.getElementById('menu-save')?.addEventListener('click', () => { saveGame(G); showToast('💾 Đã lưu!','jade'); menuDropdown.style.display='none'; });
  document.getElementById('menu-reset')?.addEventListener('click', () => { menuDropdown.style.display='none'; showResetConfirm(G,{ clearIntervals:()=>{ clearInterval(_tickInterval); clearInterval(_saveInterval); } }); });
  document.getElementById('menu-guide')?.addEventListener('click', () => { if (menuDropdown) menuDropdown.style.display='none'; showFullGuide(G); });
  document.getElementById('menu-account')?.addEventListener('click', () => { menuDropdown.style.display='none'; showAccountMenu(() => G, showToast); });
  safeClick('btn-save', () => { saveGame(G); showToast('💾 Đã lưu!','jade'); });
  safeClick('btn-char-popup', () => showCharPopup(G, { cultivateActions, saveGame, renderCurrentTab }));

  window._gameActions = { cultivateActions,combatActions,alchemyActions,questActions,skillActions,inventoryActions,shopActions,duocDienActions,maDaoActions };
  window._G = G;
  import('./core/title-data.js').then(m => { window._titleData = m; });
  import('./core/thuong-hoi-engine.js').then(m => { window._thuongHoiData = m; });
  window._setActiveTitle = (titleId) => { const r=setActiveTitle(G,titleId); if (r.ok) renderAll(); };
}

function safeClick(id, handler) {
  document.getElementById(id)?.addEventListener('click', handler);
}

// ============================================================
// SMART NOTIFICATIONS — nhắc nhở ngữ cảnh mỗi 5 phút thực
// Tránh spam: mỗi loại nhắc tối đa 1 lần / session cho đến khi action
// ============================================================
const _notifiedThisSession = new Set();

function _checkSmartNotifications(G) {
  const now = G.gameTime?.currentYear ?? 0;

  // 1. Dược Điền chín — nhắc khi có ô ready
  const readyCrops = (G.duocDien?.slots || []).filter(s => s && now >= s.harvestAt).length;
  if (readyCrops > 0 && !_notifiedThisSession.has('duoc_dien_ready')) {
    showToast(`🌾 Dược Điền: ${readyCrops} ô đã chín — vào tab Nghề Nghiệp để thu hoạch!`, 'jade');
    _notifiedThisSession.add('duoc_dien_ready');
  } else if (readyCrops === 0) {
    _notifiedThisSession.delete('duoc_dien_ready'); // reset khi đã thu hoạch
  }

  // 2. Linh thú đói — nhắc sau 5 ngày chưa cho ăn
  const hungryBeasts = (G.linhThu?.slots || []).filter(s => {
    if (!s) return false;
    return (now - (s.lastFedAt ?? 0)) * 365 >= 4.5; // gần đến 5 ngày
  });
  if (hungryBeasts.length > 0 && !_notifiedThisSession.has('linhthu_hungry')) {
    const names = hungryBeasts.map(s => s.name || s.id).join(', ');
    showToast(`🐾 ${names} sắp đói — vào tab Linh Thú cho ăn!`, 'warning');
    appendLog(`🐾 Linh thú sắp đói: ${names}`, 'warning');
    _notifiedThisSession.add('linhthu_hungry');
  } else if (hungryBeasts.length === 0) {
    _notifiedThisSession.delete('linhthu_hungry');
  }

  // 3. Trứng Linh Thú sắp nở
  const hatchingSoon = (G.linhThu?.eggs || []).filter(e => e.hatchAt - now <= 1/365); // trong 1 ngày game
  if (hatchingSoon.length > 0 && !_notifiedThisSession.has('linhthu_hatch')) {
    showToast(`🥚 Trứng Linh Thú sắp nở! Vào tab Linh Thú để đón chờ.`, 'epic');
    _notifiedThisSession.add('linhthu_hatch');
  } else if (hatchingSoon.length === 0) {
    _notifiedThisSession.delete('linhthu_hatch');
  }

  // 4. Đột phá sẵn sàng (qi đầy + purity đủ) — nhắc nếu đang không ở cultivate
  if (G.activeTab !== 'cultivate') {
    const { calcMaxQi: cmq, calcPurityThreshold: cpt } = window._stateComputedCache || {};
    const maxQi = (G.qi ?? 0) >= (G._lastMaxQi ?? 999);
    const threshold = REALMS[G.realmIdx]?.purityThresholds?.[(G.stage ?? 1) - 1] ?? 999999;
    const purityOk  = (G.purity ?? 0) >= threshold * 0.5;
    if (maxQi && purityOk && !_notifiedThisSession.has('bt_ready')) {
      showToast(`⚡ Linh lực và Thuần Độ đã đủ — sẵn sàng ĐỘT PHÁ!`, 'gold');
      _notifiedThisSession.add('bt_ready');
    }
    if (!(maxQi && purityOk)) _notifiedThisSession.delete('bt_ready');
  }

  // 5. Sect activity hết cooldown (nhắc lần đầu trong session)
  if (G.sectId && !_notifiedThisSession.has('sect_ready')) {
    const cooldowns = G.sect?.cooldowns || {};
    const nowMs = Date.now();
    const hasReady = Object.keys(cooldowns).length === 0
      || Object.values(cooldowns).some(ts => (nowMs - ts) / 1000 >= 3600);
    if (hasReady) {
      showToast(`🏯 Tông môn có hoạt động sẵn sàng!`, 'jade');
      _notifiedThisSession.add('sect_ready');
    }
  }

  // 6. Dungeon chưa vào hôm nay (nhắc 1 lần/session vào buổi tối)
  if (isTabUnlocked_('dungeon', G) && !_notifiedThisSession.has('dungeon_reminder')) {
    const dv = G.danhVong ?? 0;
    const maxAttempts = dv >= 500 ? 8 : dv >= 300 ? 6 : dv >= 150 ? 5 : dv >= 50 ? 4 : 3;
    const attempts = G.dungeon?.attemptsToday ?? 0;
    if (attempts === 0 && G._tickCount > 6000) { // sau 10 phút mới nhắc
      showToast(`☠ Hôm nay chưa vào Địa Phủ — còn ${maxAttempts} lượt!`, 'jade');
      _notifiedThisSession.add('dungeon_reminder');
    }
  }

  // 7. Bếp/Bễ Rèn hỏng — chỉ báo khi đã từng mua (level > 0)
  if ((G.alchemy?.forge?.level ?? 0) > 0 && (G.alchemy?.forge?.durability ?? 1) <= 0 && !_notifiedThisSession.has('forge_broken')) {
    showToast(`⚒ Bễ Rèn đã hỏng — vào Cửa Hàng để sửa!`, 'danger');
    _notifiedThisSession.add('forge_broken');
  }
  if ((G.linhThuc?.kitchen?.level ?? 0) > 0 && (G.linhThuc?.kitchen?.durability ?? 1) <= 0 && !_notifiedThisSession.has('kitchen_broken')) {
    showToast(`🍳 Bếp Linh Thực đã hỏng — vào Cửa Hàng để sửa!`, 'danger');
    _notifiedThisSession.add('kitchen_broken');
  }

  // 8. Ám Thương nặng — nhắc khi ≥50 points
  if ((G.amThuong?.points ?? 0) >= 50 && !_notifiedThisSession.has('am_thuong_heavy')) {
    showToast(`🩸 Ám Thương nặng (${Math.floor(G.amThuong.points)}) — dùng Tái Sinh Đan để hồi phục!`, 'danger');
    appendLog(`🩸 Ám Thương nặng — Căn Cốt bị ảnh hưởng!`, 'danger');
    _notifiedThisSession.add('am_thuong_heavy');
  }
  if ((G.amThuong?.points ?? 0) < 40) _notifiedThisSession.delete('am_thuong_heavy');
}

// ============================================================
// ============================================================
// WINDOW EVENTS
// ============================================================
let _isResetting = false; // flag để không save khi đang reset

window.addEventListener('beforeunload', () => {
  if (!G || !G.setupDone || _isResetting) return;
  if (!G.meditating) G.meditating = true;
  saveGame(G);
});

// Export flag cho misc-popups dùng
window._setResetting = (v) => { _isResetting = v; };
document.addEventListener('visibilitychange', () => {
  if (!G?.setupDone) return;
  if (document.hidden) {
    saveGame(G);
    G._hiddenAt = Date.now();
  } else {
    // Tab quay lại — bù tick bị mất (browser throttle setInterval khi ẩn)
    if (G._hiddenAt) {
      const missedMs  = Date.now() - G._hiddenAt;
      const missedTicks = Math.floor(missedMs / 100);
      // Giới hạn bù tối đa 5 phút (3000 ticks) để tránh lag
      const catchUp = Math.min(missedTicks, 3000);
      for (let i = 0; i < catchUp; i++) tick();
      G._hiddenAt = null;
    }
  }
});
window.addEventListener('pagehide', () => { if (G?.setupDone && !_isResetting) saveGame(G); });

// ---- Rotate lock (mobile portrait) ----
async function tryLockLandscape() {
  try {
    if (screen.orientation?.lock) {
      await screen.orientation.lock('landscape');
    }
  } catch(e) { /* iOS không hỗ trợ — CSS overlay xử lý */ }
}
document.addEventListener('click',      () => tryLockLandscape(), { once: true });
document.addEventListener('touchstart', () => tryLockLandscape(), { once: true });

// ---- Boot ----
document.addEventListener('DOMContentLoaded', init);