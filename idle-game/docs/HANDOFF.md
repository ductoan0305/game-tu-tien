# TU TIÊN IDLE GAME — HANDOFF DOCUMENT
**Cập nhật lần cuối:** L3 — Visual marker Thuần Độ bar T9 (2026-05-09)
**Version:** v12 | SAVE_KEY: `tutien_v10` | SAVE_VERSION: `11`

---

## DESIGN MANIFESTO

### Câu lõi
**Tu tiên là chọn lọc, không phải leo rank. Cố gắng là điều kiện cần, không phải điều kiện đủ.**

### Nguyên tắc bất biến
- Đa số thất bại là bình thường. Cơ duyên là biến số định mệnh.
- Tiến trình dài hạn (vài tháng thực tế). Người chơi bỏ cuộc là outcome hợp lệ.
- Thành công hiếm (Trúc Cơ+) phải có giá trị xã hội và cảm xúc thật.
- Cấm buff xàm, power spike không lore, loop spam không cap.
- Mọi nguồn linh thạch phải có lao động/rủi ro/quan hệ xã hội tương ứng.
- Quest phải có người giao cụ thể, mở ra quan hệ/thông tin/cơ hội có bối cảnh.

### Quy tắc tuổi Luyện Khí
- Tuổi thọ LK: 120 năm game. Tuổi bắt đầu: 10. Cửa sổ vàng: trước 70 tuổi.
- 70–75: tỷ lệ đột phá rơi mạnh. 75+: vô vọng trừ cơ duyên nghịch thiên.

### Kỳ vọng theo linh căn
Ngũ LC: kẹt LK6-7 bình thường. Tứ LC: LK hậu kỳ. Tam LC: cửa nhỏ TC. Song/Thiên: TC khả thi.

### Check trước khi merge tính năng mới (tất cả phải YES)
1. Giữ triết lý "đa số thất bại là bình thường"?
2. Không làm ngắn game bất thường (< vài tháng)?
3. Không tạo đường tăng sức mạnh tuyến tính, chắc thắng?
4. Không làm mờ vai trò linh căn/cơ duyên/tuổi tác?
5. Không vi phạm kinh tế tu tiên (thưởng quá dễ, quá nhiều)?

---

## WORLD DESIGN

**Nhân Giới only** — realmIdx 0–4. **KHÔNG làm Linh Giới.** Thiên Kiếp thuộc Linh Giới — chưa phát triển, đừng thêm.

| realmIdx | Tên | Tầng | Tuổi thọ |
|---|---|---|---|
| 0 | Luyện Khí | 9 | 120–144 năm game |
| 1 | Trúc Cơ | 4 | 200–240 |
| 2 | Kim Đan | 4 | 500–600 |
| 3 | Nguyên Anh | 4 | 1000–1200 |
| 4 | Hóa Thần | 4 | 2000–2400 |

**Thời gian:** 1s thực = 30 phút game | 1 năm game ≈ 2 ngày thực | `dtYears = 3/525600 * dt * 10`

**Đột phá Nhân Giới = quá trình nội tâm thuần túy — KHÔNG boss, KHÔNG Thiên Kiếp.**
**Tán tu** (KHÔNG phải "tản tu").

---

## KIẾN TRÚC FILE

```
js/
├── core/
│   ├── state/
│   │   ├── fresh-state.js    createFreshState, SAVE_KEY='tutien_v10', SAVE_VERSION=11
│   │   ├── persistence.js    saveGame, loadGame, tất cả migrations
│   │   ├── computed.js       calcQiRate, calcMaxQi, calcAtk/Def/Hp, calcPurityRate,
│   │   │                     calcEffectiveCanCot, calcKhauKhauBonus
│   │   ├── offline.js        calcOfflineProgress
│   │   └── index.js
│   ├── state.js              SHIM → re-export từ state/
│   ├── visibility.js         getVisibleTabs(G) — SINGLE SOURCE OF TRUTH tab visibility
│   │                         KHÔNG gate programmatic tab switches (game logic)
│   ├── systems/
│   │   ├── cultivation.js    applyCharacterSetup, toggleMeditate, doRest,
│   │   │                     doExplore, doFish, doArray, doSpar, doMeditation
│   │   ├── breakthrough.js   calcBreakthroughChance, doBreakthrough (+ cooldown gate L2)
│   │   ├── inventory.js      addToInventory, buyItem (type:'ingredient' → G.alchemy.ingredients), useItem
│   │   ├── tick.js           gameTick — canPrestige gate realmIdx>=4
│   │   └── helpers-internal.js
│   ├── actions.js            SHIM → re-export từ systems/
│   ├── data.js               REALMS, ITEMS, ACHIEVEMENTS(34), NPC_RIVALS(9)
│   │                         purityThresholds LK: [107,182,310,528,898,1527,2597,4414,7505]
│   ├── phap-dia.js           CONG_PHAP_LIST, CONG_PHAP_MAX_SLOTS=4
│   │                         getActiveCongPhap, calcCongPhapMasteryBonus, calcMasteryGainPerTick
│   │                         addCongPhapSlot, removeCongPhapSlot, checkLinhDiaFee
│   ├── co-duyen.js           rollCoDuyen (extraCondition hook), applyCoduyen (unlock_profession case)
│   │                         rollRivalEncounter, RIVAL_DV_REWARD, getLuckMultiplier, getKhiVanMax
│   ├── danh-vong.js          5 tiers: 0/50/150/300/500
│   ├── tutorial-engine.js    ensureTutorialState, updateTutorialStep, trackMeditateSeconds,
│   │                         trackStaminaAction, trackBreakthroughAttempt, trackTabOpen, acknowledgeAgeWarning
│   ├── npc-reputation-engine.js  getNpcRep, gainNpcRep, getNpcRepTier, tickNpcRepVisit
│   ├── npc-data.js           NPC_REWARDS (tier2_secret/tier3_gift/tier4_buff), helpers
│   ├── kiep-tu-engine.js, linh-thu-engine.js, duoc-dien-engine.js
│   ├── thuong-hoi-engine.js, passive-engine.js, title-engine.js
│   ├── ma-dao-engine.js, currency.js, spirit-root.js, time-engine.js
│   └── passive-data.js, title-data.js
├── combat/
│   ├── combat-data.js        42 enemies (realm 0-4), 15 combat skills
│   └── combat-engine.js      startCombat, playerAction, flee
│                             rollRivalEncounter sau combat win (skip dungeon + rival)
├── alchemy/
│   ├── alchemy-data.js, alchemy-engine.js
│   ├── crafting-data.js      TRAN_MAT_RECIPES (3 công thức, không cần Bễ Rèn)
│   ├── tran-phap-data.js     ARRAY_RECIPES — materials: tran_ky/tran_ban/tran_nhan
│   ├── phu-chu-data.js, khoi-loi-data.js (25 puppet items tier 1-5), linh-thuc-data.js
├── dungeon/, equipment/, quest/, sect/
│   └── quest/quest-data.js   NPC_QUESTS (5 quest LK), NPC_QUEST_MAP
├── app/
│   ├── event-bus-handlers.js  rival:encounter/start_combat, combat:end (isNpcRival)
│   │                          dungeonQuestDone=true khi side_dungeon_01 hoàn thành
│   └── popups/               char-popup, gameover-popup, misc-popups (showRivalEncounterPopup)
├── ui/
│   ├── render-core.js        renderNav (getVisibleTabs), notifications (stable key field),
│   │                         tutorial panel, dispatch tab:open-popup (KHÔNG switchTab trực tiếp)
│   ├── popup-manager.js      PopupManager singleton
│   │                         open/close/toggle/isOpen, drag (header), resize 8-direction,
│   │                         z-index stacking (_zCounter=400), onClose callback, extraClass
│   ├── tab-popup.js          openTabPopup(tabId, G, renderFn), TAB_POPUP_CFG (18 tabs, trừ cultivate)
│   │                         DOM node move: panel → .pm-body, trả về .panel-center khi đóng
│   │                         isAnyTabPopupOpen(), closeAllTabPopups()
│   ├── tu-luyen-popup.js     openTuLuyenPopup / updateTuLuyenPopup / isTuLuyenPopupOpen
│   │                         id: 'tu-luyen', CSS: .pm-tu-luyen, prefix id: tlp-*
│   │                         _updateBreakthroughBtn: check cooldown TRƯỚC qi/purity
│   ├── starter-village.js    sv-side-popup (KHÔNG phải .map-side-t2)
│   │                         #sv-side-popup: absolute overlay trong .map-wrap-starter
│   ├── tabs/
│   │   ├── phapdia-tab.js    thuần thục bar, add/remove slot UI
│   │   ├── nghe-nghiep-tab.js  profession gates, locked card, _tryAutoUnlock
│   │   └── professions/      tran-phap-tab (stock bar vật liệu, section chế tạo)
│   ├── location-popup.js     NPC_DIALOGS (5 zone, 3 lore entry mỗi zone)
│   │                         Chỉ import map-data.js (KHÔNG import world-map.js)
│   ├── map-data.js           Không import gì (no circular)
│   └── portrait.js           clamp realmIdx về 4 (REALM_PORTRAIT index 0-4)
└── main.js                   _switchTabWithPopup(tabId) — unified tab + popup switch
                              wireNavBtn 'cultivate' → openTuLuyenPopup
                              wireNavBtn toggle: isAnyTabPopupOpen → closeAll (về home)
                              gameTick: updateTuLuyenPopup mỗi 2 ticks
                              craftTranMat(recipeId) action
```

---

## STATE STRUCTURE (G)

```js
G = {
  name, gender, spiritRoot, spiritData, sectId, sectInvites, setupDone,
  realmIdx(0-4), stage(1-9 LK / 1-4 TC+),
  khiVan, ngoTinh, canCot, tamCanh, huongTu,
  // ngoTinh: random lúc tạo (15–100), tăng qua thiền định 0~0.1 (60% chance)
  // Ảnh hưởng: đột phá, luyện đan, cơ duyên, thuần thục công pháp
  // tamCanh: default 50, tăng qua doExplore (+0.5), ảnh hưởng đột phá (F_tamcanh)
  qi, stone, hp, maxHp, stamina, maxStamina, exp, maxExp,
  purity,    // tuyệt đối, so với purityThresholds[stage-1]
  danDoc,    // 0-100
  atk, def, atkPct, defPct, hpPct, ratePct,
  hpBonus, defBonus, qiBonus, stoneBonus, danBonus, arrayBonus, expBonus,
  atkBuff, atkBuffTimer, stoneBuffPct, stoneBuffTimer,
  eventRateBonus, eventRateTimer, eventExpBonus, eventExpTimer,
  gameTime: { currentYear, totalYears, lifespanMax, lifespanBonus, isGameOver },
  chronicle: [ { year, realmName, event } ],
  phapDia: { currentId, expiresAt },
  congPhap: {
    currentId,        // GIỮ để tương thích ngược — KHÔNG xóa
    unlockedIds,      // đã sở hữu
    activeIds,        // đang tu (tối đa 4)
    mastery: { [cpId]: 0-100 }
  },
  worldMap: { currentNodeId, starterVillageId, leftStarter },
  danhVong: 0,
  alchemy: { knownRecipes, ingredients:{}, furnaceLevel:0, furnaceDurability:0,
             totalCrafted, craftsCount, successStreak,
             forge:{level,durability}, _craftQty:1 },
  hunger: { linhMeCount, lastEatYear, hungerDays, isStarving, eatingBuff, ichCocDanDays },
  duocDien: { slots:[{cropId,plantedAt,harvestAt}|null], maxSlots:0 },
  amThuong: { points:0, canCotPenalty:0, hpMaxPenalty:0 },
  linhThuc: { cooksCount, kitchen:{level,durability}, activeBuffs, ingredients },
  tranPhap: { arrayCount, activeArrays, stoneDrainTimer },
  phuChu:   { drawCount, activeBuffs },
  khoiLoi:  { craftCount, activePuppet },
  linhThu:  { slots:[null,null], eggs:[] },
  // nghiepLuc nằm trong kiepTu.nghiepLuc — KHÔNG phải G.nghiepLuc top-level
  thuongHoi: null | { ... },
  dungeon:  { ..., attemptsToday, lastAttemptDay },
  combat, quests, titles, equipment, sect, passiveTree,
  skills, inventory, achievements,
  breakthroughs, hunts, totalKills, alchemySuccess, skillsLearned,
  totalTime, totalQuestsCompleted, lastSave,
  activeTab, _tickCount, _sessionStartTime,
  _breakthroughDanduoc:1.0, _breakthroughCoDuyenBonus:0,
  // Breakthrough cooldown (L2):
  _btFailStreak: 0, _btFailCooldownUntil: 0, _btLastFailYear: 0,
  // NPC Reputation:
  npcReputation: { [npcId]: 0-100 },
  _npcRepLastVisit: { [npcId]: year },
  _npcRepYearlyGain: { [npcId]: { year, amount } },
  flags: { unlockedSecretZones: { [zoneId]: true }, dungeonQuestDone, unlockedProfessions },
  _npcGiftClaimed: { [npcId]: true },
  _npcKhauKhau: { [npcId]: true },
  _secretZoneCooldown: { [zoneId]: { lastRefresh: ms } },
  // NPC Rivals:
  _rivalEncounterCd: 0,
  _rivalBeaten: { [name]: count },
  // Tutorial:
  tutorial: {
    enabled, step(0-6), completed, startedAt, seenHints, panelDismissed,
    progress: { meditateSec, usedStaminaAction, attemptedBreakthrough, openedPhapdiaTab, openedQuestTab }
  }
}
```

---

## CÔNG PHÁP (S10)

**Tối đa 4 công pháp tu cùng lúc.** `CONG_PHAP_LIST[x].buffs(mastery, match)` — HÀM, KHÔNG phải object.

| id | Tên | Hệ | Grade | Cảnh giới | Nguồn |
|---|---|---|---|---|---|
| vo_danh | Vô Danh Công Pháp | — | Tạp | LK | Mặc định |
| truong_xuan_cong | Trường Xuân Công | Mộc | Hạ | LK | 800💎 |
| tay_tuy_quyet | Tẩy Tủy Quyết | — | Hạ | LK+TC | 1500💎 |
| hoi_thuy_quyet | Hồi Thủy Quyết | Thủy | Hạ | LK | 900💎 |
| cuong_tho_kinh | Cương Thổ Kinh | Thổ | Hạ | LK | 1000💎 |
| thanh_nguyen_kiem_quyet | Thanh Nguyên Kiếm Quyết | Kim | Trung | TC+ | 8000💎 |
| bac_minh_thuy_kinh | Bắc Minh Thủy Kinh | Thủy | Trung | TC+KĐ | 6500💎 |
| hon_nguyen_hoa_kinh | Hỗn Nguyên Hóa Kinh | — | Trung | TC+KĐ | 7500💎 |
| kiem_quyet_ha/trung/thuong | Thanh Vân Kiếm Quyết | Kim | Hạ/Trung/Thượng | LK / TC+KĐ / NA+HT | Tông môn |
| dan_kinh_ha/trung/thuong | Vạn Linh Đan Kinh | Hỏa | Hạ/Trung/Thượng | LK / TC+KĐ / NA+HT | Tông môn |
| tran_phap_ha/trung | Huyền Cơ Trận Kinh | Thổ | Hạ/Trung | LK / TC+KĐ | Tông môn |
| the_tu_ha/trung | Thiết Cốt Thần Công | — | Hạ/Trung | LK / TC+KĐ | Tông môn |
| dia_tang_chon_kinh | Địa Tạng Chân Kinh | Thổ | Thượng | NA+HT | Cơ Duyên (tán tu) |
| hon_nguyen_chon_kinh | Hỗn Nguyên Chân Kinh | — | Thượng | NA+HT | Cơ Duyên (tán tu) |

**Thuần thục:** `calcMasteryGainPerTick` — base 0.01 + (ngoTinh/100)×0.04, ×1.3 nếu khớp hệ
**Buff:** `calcCongPhapMasteryBonus(G)` → `{ ratePct, atkPct, defPct, hpPct, danBonus }`

---

## DANH VỌNG

| Tier | DV | Shop | Dungeon/ngày | Sect EXP | Thương Hội |
|---|---|---|---|---|---|
| Vô Danh | 0 | — | 3 | — | — |
| Tân Tiến | 50 | -3% | 4 | — | Mở cửa |
| Có Tiếng | 150 | -6% | 5 | +6% | Tier 2 |
| Nổi Danh | 300 | -10% | 6 | +12% | Tier 3 |
| Lừng Lẫy | 500 | -15% | 8 | +20% | Tier 4 |

---

## BALANCE

**purityThresholds LK** (Tam LC tán tu Linh Địa xong LK ~110/120 tuổi):
```
[107, 182, 310, 528, 898, 1527, 2597, 4414, 7505]
```

**Breakthrough Ngũ LC LK1** (purity đủ): `0.90 × 0.40 × 1.0 × 1.0 × 0.9 ≈ 32.4%` — đúng thiết kế.

**Điều kiện mở nghề:**
| Nghề | ID | Điều kiện |
|---|---|---|
| Luyện Đan | `luyen_dan` | ngoTinh≥40 + Hỏa căn (auto), hoặc cơ duyên `cd_dan_kinh_co_nhan` (ngoTinh≥20) |
| Luyện Khí | `luyen_khi` | Auto LK5+ (realmIdx>0 \|\| stage≥5), hoặc cơ duyên `cd_luyen_khi_lo_ren` (LK4+) |
| Trận Pháp | `tran_phap` | Cơ duyên `cd_tran_kinh_phe_tich` (LK4+) |
| Phù Chú   | `phu_chu`   | Cơ duyên `cd_phu_chu_bi_thu` (LK4+) |
| Khôi Lỗi  | `khoi_loi`  | Cơ duyên `cd_khoi_loi_cuon_ky` (LK4+) |
| Linh Thực | `linh_thuc` | Bếp level≥1 (auto), hoặc Linh Địa |

**Trận Pháp vật liệu:**
- `tran_ky`🚩 Tier 1-2 | `tran_ban`🎴 Tier 2-4 | `tran_nhan`🔵 Tier 3-5
- T1: `tran_ky×2` | T2: `tran_ky×4+tran_ban×1` | T3: `tran_ban×2+tran_nhan×1` | T4: `tran_ban×3+tran_nhan×2` | T5: `tran_ban×2+tran_nhan×3`
- Shop: tran_ky 200💎, tran_ban 700💎, tran_nhan 3000💎 (realm 1+)
- `buyItem` type `'ingredient'` → cộng vào `G.alchemy.ingredients`

**Trận Pháp passive drain:** filter `a.category === 'passive'` (KHÔNG phải `a.type`)
**Trận Pháp stone drain timer:** giây THỰC, fire khi >= 60s thực (= 30 phút game)

**Linh Địa phí:** 150💎/năm game (`LINH_DIA_ANNUAL_FEE`) qua `checkLinhDiaFee`. Drain 2💎/năm liên tục trong tick.js đã **bỏ**.
**Linh Thực tier 1 buff:** 300s→1200s / 600s→1800s / 900s→2700s

**NPC Rivals:** `RIVAL_DV_REWARD = [10, 22, 50, 90, 150]` (theo realmIdx 0-4). Trigger: 0.4%/action; cooldown 4h real.

**NPC Quests (LK):**
| Quest ID | NPC | Làng | Điều kiện |
|---|---|---|---|
| nq_01_clear_vermin | lao_duoc_su | Thanh Phong Thôn | setupDone + LK1+ |
| nq_02_herb_knowledge | lao_duoc_su | Thanh Phong Thôn | nq_01 hoàn thành |
| nq_03_patrol_duty | lao_ngu_ong | Lâm Hải Thôn | setupDone + LK1+ |
| nq_04_river_secret | lao_ngu_ong | Lâm Hải Thôn | nq_03 hoàn thành |
| nq_05_forge_test | dao_khach_gia | Hỏa Diệm Thôn | setupDone + LK1+ |

---

## LƯU Ý KỸ THUẬT

```js
// ============================================================
// GOTCHA — sai ở đây là bug khó tìm
// ============================================================

// furnaceLevel mặc định = 0 — KHÔNG dùng || 1 fallback
// congPhap.currentId — GIỮ để tương thích ngược, không xóa
// Trận Pháp passive drain: filter a.category === 'passive' (KHÔNG a.type)
// nghiepLuc nằm trong G.kiepTu.nghiepLuc (KHÔNG phải G.nghiepLuc top-level)
// dungeonQuestDone nằm trong G.flags.dungeonQuestDone (KHÔNG top-level)
// bt_ready: dùng calcMaxQi(G), không dùng G._lastMaxQi (field không tồn tại)
// Bếp/Bễ Rèn hỏng: chỉ hiển thị cảnh báo khi level > 0

// ============================================================
// Tu Luyện Popup (S-H4)
// ============================================================
// Nav "Tu Luyện" → openTuLuyenPopup (KHÔNG _switchTabWithPopup('cultivate'))
// _switchTabWithPopup('cultivate') chỉ dùng programmatic (combat end, flee)
// updateTuLuyenPopup(G) gọi mỗi 2 ticks trong gameTick
// _updateBreakthroughBtn: check cooldown TRƯỚC qi/purity check

// ============================================================
// Popup System (S15/S16)
// ============================================================
// Tab (trừ cultivate) → floating popup qua openTabPopup()
// DOM node move: appendChild(panelEl) vào .pm-body; trả về .panel-center khi đóng
// .panel-center: bottom:52px desktop / 56px mobile — KHÔNG dùng inset:0
// .panel-in-popup: height/min-height/max-height: auto/unset/none
// starter-village side panel: .sv-side-popup (KHÔNG phải .map-side-t2)
// Notification click: dispatch tab:open-popup event (KHÔNG gọi switchTab trực tiếp)

// ============================================================
// Circular imports
// ============================================================
// map-data.js ← không import gì
// location-popup.js ← map-data.js (KHÔNG world-map.js)
// thuong-hoi-engine.js ← chỉ import bus
// danh-vong.js ← độc lập hoàn toàn

// ============================================================
// Công Pháp
// ============================================================
// congPhap.activeIds — đang tu (tối đa 4)
// congPhap.mastery — { [cpId]: 0-100 }
// CONG_PHAP_LIST[x].buffs(mastery, match) — HÀM, không phải object
// calcEffectiveCanCot(G) — apply canCotBonus từ tay_tuy_quyet (đừng dùng G.canCot trực tiếp)

// ============================================================
// Cooldown đột phá fail (L2)
// ============================================================
// Formula: min(30 × _btFailStreak, 300)s thực (cap 5 phút)
// Gate ở đầu doBreakthrough — không tiêu qi/purity nếu chặn
// Auto-reset trong gameTick: streak > 0 && currentYear − _btLastFailYear ≥ 1

// ============================================================
// Tab Visibility
// ============================================================
// visibility.js = single source of truth. nav-progression.js = thin shim
// Tab conditions: skills(stage≥3||kills≥5), passive/combat(realm≥1),
//   dungeon(dungeonQuestDone||realm≥1), alchemy(stage≥2||hasIngredients),
//   equipment(kills≥3), ranking(stage≥3)
// dungeonQuestDone = true khi side_dungeon_01 hoàn thành (event-bus-handlers.js)

// ============================================================
// NPC Reputation (L6-L7)
// ============================================================
// Tiers: 0=Lạ Mặt(0-24) | 1=Quen Mặt(25-49) | 2=Tin Cậy(50-79) | 3=Tâm Giao(80-99) | 4=Khẩu Khẩu(100)
// Gain: quest complete +10; visit periodic +1/5yr; cap +20/năm game/NPC
// Rewards: Tier2→mở bí cảnh | Tier3→quà 1 lần | Tier4→buff khẩu khẩu vĩnh viễn (1 NPC/run)
// NPCs có reward: lao_duoc_su, lao_ngu_ong, dao_khach_gia
// SECRET_ZONE_REFRESH_MS = 30 ngày thực
// Secret zones:
//   duoc_thao_bi_canh_thanh_phong (thanh_van_son)
//   linh_ngu_dam_lam_hai (linh_duoc_coc)
//   co_lo_phe_tich_hoa_diem (thien_kiep_dia)
// calcKhauKhauBonus(G) → { danBonus, atkPct, eventRatePct } — computed.js

// ============================================================
// Misc
// ============================================================
// Bế quan: ĐƯỢC luyện đan/chế phù/khôi lỗi/cảm ngộ công pháp
//          KHÔNG: đánh quái, di chuyển map
// Puppet combat flags (reset mỗi lượt địch):
//   G.combat._puppetTaunt, _puppetReflect, _puppetImmuneThisTurn, _puppetRevived
// window._thuongHoiData / window._titleData — exposed từ main.js wireEvents()
// canPrestige gate: realmIdx >= 4 (Hóa Thần) — feature chưa có UI
// portrait.js: clamp realmIdx về Math.min(G.realmIdx || 0, 4)
```

---

## TAB_IDS (19)
```
cultivate, combat, alchemy, quests, skills, inventory, shop, ranking,
equipment, dungeon, sect, passive, phapdia, nghe_nghiep,
tran_phap, phu_chu, khoi_loi, linh_thuc, linh_thu
```

---

## BUS EVENTS
```
quest:update, quest:completed
combat:end, combat:enemy_killed, equipment:drop
coduyen:triggered
danhvong:gained, dungeon:boss_cleared
sect:dv_bonus
thuonghoi:quest_done
kieptu:start_combat, kieptu:ambush
linhthu:encounter, linhthu:tamed, linhthu:hatched, linhthu:egg_waiting, linhthu:released
rival:encounter, rival:start_combat
hunger:warning, hunger:fed, hunger:starved
duoc_dien:ready, duoc_dien:harvested, duoc_dien:expanded
am_thuong:gained, am_thuong:cancot_lost
ma_dao:opened, ma_dao:exposed, ma_dao:purified, ma_dao:tau_hoa_permanent
phapdia:changed, phapdia:expired, phapdia:fee_paid, phapdia:fee_overdue
lifespan:warning, lifespan:breakthrough
game:over, map:moved, tick:meditate
npc:rep_gained, npc:rep_tier_up
tab:open-popup, tab:switch
```

---

## CSS FILES (13)
```
base.css, tokens.css, layout.css, components.css,
tabs.css, setup.css, equipment.css, combat.css,
dungeon_sect.css, systems.css, map.css, tutorial.css, craft-popup.css
```

**Z-index scale (tokens.css):**
`decorative(0)` → `hud(90)` → `sticky(100)` → `dropdown(200)` → `panel(300)` → `popup(400)` → `overlay(500)` → `modal(600)` → `toast(700)` → `notification(800)` → `tooltip-top(900)` → `critical(1000)` → `auth(1100)` → `system(1200)`

`#popup-layer`(500) và `.pm-popup` giữ 400–500. `.modal-overlay`(600) > popup-layer — đúng thứ tự.

---

## ROADMAP — CÒN LẠI

### ⬜ Multi-device Session Lock
Chặn 2 thiết bị đăng nhập cùng lúc để tránh ghi đè save.
- Mỗi login ghi `sessionToken` (UUID) + timestamp lên Firestore (`sessions/{uid}`)
- Thiết bị đang chơi polling 30s — token không khớp → logout + thông báo
- Thiết bị mới login → ghi token mới → kick thiết bị cũ
- Timeout 5 phút cho browser crash
- **Files:** `js/firebase/auth-ui.js`, `js/firebase/cloud-save.js`

### ⬜ Content
- **Cơ Duyên events TC/KĐ/NA** — 52 events hiện hầu hết LK (`js/core/co-duyen.js`)
- **Công pháp bổ sung** cho tán tu TC+ (`js/core/phap-dia.js → CONG_PHAP_LIST`)
- **Lore thêm** Thiên Kiếp Địa nếu cần (`js/ui/location-popup.js → NPC_DIALOGS`)

### ⬜ Kỹ thuật
- **Balance playtesting** — TC/KĐ/NA purityThresholds chưa calibrate
- **Thuần thục công pháp balance** — tốc độ tăng cần test thực tế
- **Firebase deploy** — Auth + Firestore production
- **Mobile UI** — touch drag/resize cho popup (panel-center bottom đã fix)
