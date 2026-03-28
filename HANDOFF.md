# TU TIÊN IDLE GAME — HANDOFF DOCUMENT
**Cập nhật lần cuối:** Session 10 — Ngộ Tính, Công Pháp Redesign, Bug Fixes
**Version:** v12 | SAVE_KEY: `tutien_v10` | SAVE_VERSION: `11`

---

## WORLD DESIGN — ĐỌC TRƯỚC KHI LÀM BẤT CỨ THỨ GÌ

**Nhân Giới only** — realmIdx 0–4. **KHÔNG làm Linh Giới** cho đến khi Nhân Giới ổn.

| realmIdx | Tên | Tầng | Tuổi thọ |
|---|---|---|---|
| 0 | Luyện Khí | 9 | 120–144 năm game |
| 1 | Trúc Cơ | 4 | 200–240 |
| 2 | Kim Đan | 4 | 500–600 |
| 3 | Nguyên Anh | 4 | 1000–1200 |
| 4 | Hóa Thần | 4 | 2000–2400 |

**Triết lý (đã confirm với owner — KHÔNG thay đổi):**
- Game hardcore — vài tháng chơi là bình thường
- Hóa Thần: 1/1000 người đạt được đã là may
- Ngũ Linh Căn chết ở LK6–7 là **ĐÚNG** thiết kế
- Thiên Kiếp thuộc Linh Giới — chưa phát triển, **đừng thêm**
- **Đột phá Nhân Giới = quá trình nội tâm thuần túy — KHÔNG boss, KHÔNG Thiên Kiếp**
- **Tán tu** (KHÔNG phải "tản tu") — đã đổi toàn bộ

**Thời gian game:**
- 1 giây thực = 30 phút game
- 1 năm game = 175,200 giây thực ≈ 2 ngày thực
- 120 năm thọ LK = ~243 ngày thực (casual 2h/ngày = ~4 tháng thực)
- `dtYears = 3/525600 * dt * 10` (dt = 0.1s thực)

---

## KIẾN TRÚC FILE ĐẦY ĐỦ

```
js/
├── core/
│   ├── state.js              SHIM (14 dòng) → re-export từ state/
│   ├── state/
│   │   ├── fresh-state.js    createFreshState, SAVE_KEY='tutien_v10', SAVE_VERSION=11
│   │   ├── persistence.js    saveGame, loadGame, tất cả migrations
│   │   │                     _migrateCongPhap() — thêm S10: activeIds + mastery
│   │   ├── computed.js       calcQiRate, calcMaxQi, calcAtk, calcDef, calcMaxHp,
│   │   │                     calcPurityRate (×getPurityBoostMult), calcPurityThreshold
│   │   │                     S10: dùng calcCongPhapMasteryBonus thay CONG_PHAP_MULT cố định
│   │   ├── offline.js        calcOfflineProgress
│   │   └── index.js          re-exports
│   ├── actions.js            SHIM (19 dòng) → re-export từ systems/
│   ├── systems/
│   │   ├── cultivation.js    applyCharacterSetup, toggleMeditate, doRest,
│   │   │                     doExplore, doFish, doArray, doSpar, doMeditation
│   │   │                     S10: ngoTinh random lúc tạo nhân vật
│   │   │                          doMeditation tăng ngoTinh 0~0.1 (60% chance)
│   │   ├── breakthrough.js   calcBreakthroughChance, doBreakthrough
│   │   │                     S10: F_ngotinh mở rộng 6 bậc (0.80→1.40)
│   │   ├── inventory.js      addToInventory, buyItem, useItem, claimWorldEvent
│   │   ├── tick.js           gameTick — S10: tăng mastery công pháp mỗi tick bế quan
│   │   └── helpers-internal.js  clamp, spendStamina, gainExp, gainStone
│   ├── data.js               REALMS, ITEMS, ACHIEVEMENTS(34), NPC_RIVALS(9)
│   │                         purityThresholds LK: [107,182,310,528,898,1527,2597,4414,7505]
│   ├── time-engine.js
│   ├── phap-dia.js           S10: CONG_PHAP_LIST redesign (xem bên dưới)
│   │                         CONG_PHAP_MAX_SLOTS = 4
│   │                         getActiveCongPhap, checkElementMatch
│   │                         calcCongPhapMasteryBonus, calcMasteryGainPerTick
│   │                         addCongPhapSlot, removeCongPhapSlot
│   │                         upgradeCongPhap (updated), getAvailableCongPhap (updated)
│   ├── co-duyen.js           S10: getLuckMultiplier × ngoTinhBonus
│   ├── danh-vong.js          5 tiers: 0/50/150/300/500
│   ├── kiep-tu-engine.js     calcAmbushChance × getAmbushWardFactor
│   ├── linh-thu-engine.js    8 linh thú
│   ├── duoc-dien-engine.js   Dược Điền, hunger, ám thương
│   ├── ma-dao-engine.js      Ma Đạo path
│   ├── thuong-hoi-engine.js  Thương Hội (stone+DV)
│   ├── passive-engine.js, title-engine.js, spirit-root.js, currency.js
│   └── passive-data.js, title-data.js
├── combat/
│   ├── combat-data.js        42 enemies (realm 0-4), 15 combat skills
│   └── combat-engine.js      startCombat, playerAction, flee
├── alchemy/
│   ├── alchemy-data.js
│   ├── alchemy-engine.js     S10: calcSuccessChance += ngoTinh + linh căn Hỏa
│   ├── crafting-data.js, tran-phap-data.js, phu-chu-data.js
│   ├── khoi-loi-data.js      25 puppet items tier 1-5
│   └── linh-thuc-data.js
├── dungeon/
│   └── dungeon-engine.js
├── equipment/, quest/, sect/
├── app/
│   ├── event-bus-handlers.js
│   └── popups/               char-popup, gameover-popup, misc-popups
├── ui/
│   ├── render-core.js        S10: hiển thị số công pháp đang tu thay vì tên
│   ├── tabs/
│   │   ├── phapdia-tab.js    S10: UI redesign — thuần thục bar, add/remove slot
│   │   ├── nghe-nghiep-tab.js S10: thêm khai báo _arrayTier, _buaTier, _kloiTier...
│   │   └── professions/      S10: fix thiếu import ALL_INGS, fmtDuration, filter params
│   └── ...
└── main.js                   S10: addCongPhapSlot, removeCongPhapSlot actions
                              fix pagehide check _isResetting
                              fix init() xóa localStorage khi _pendingReset
```

---

## STATE STRUCTURE (G)

```js
G = {
  name, gender, spiritRoot, spiritData, sectId, sectInvites, setupDone,
  realmIdx(0-4), stage(1-9 LK / 1-4 TC+),
  khiVan, ngoTinh, canCot, tamCanh, huongTu,
  // ngoTinh S10: random lúc tạo (15–100), tăng qua thiền định 0~0.1
  // Ảnh hưởng: đột phá, luyện đan, cơ duyên, thuần thục công pháp
  // tamCanh: tăng qua doExplore (+0.5), ảnh hưởng đột phá
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
    currentId,        // tương thích ngược
    unlockedIds,      // đã sở hữu
    activeIds,        // đang tu luyện (tối đa 4) — S10 MỚI
    mastery: { [cpId]: 0-100 }  // thuần thục từng công pháp — S10 MỚI
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
  nghiepLuc: 0,
  linhThu: { slots:[null,null], eggs:[] },
  maDaoPath: null,
  thuongHoi: null | { ... },
  dungeon: { ..., attemptsToday, lastAttemptDay },
  combat, quests, titles, equipment, sect, passiveTree,
  skills, inventory, achievements,
  breakthroughs, hunts, totalKills, alchemySuccess, skillsLearned,
  totalTime, totalQuestsCompleted, lastSave,
  activeTab, _tickCount, _sessionStartTime,
  _breakthroughDanduoc:1.0, _breakthroughCoDuyenBonus:0,
}
```

---

## CÔNG PHÁP — THIẾT KẾ S10

**Tối đa 4 công pháp tu cùng lúc** (`CONG_PHAP_MAX_SLOTS = 4`)

**Mỗi công pháp có:**
- `element`: hệ ngũ hành (kim/mu/shui/huo/tu/null)
- `stages`: số tầng
- `realmRange`: [minRealm, maxRealm] — cảnh giới áp dụng
- `grade`: 0=Tạp, 1=Hạ, 2=Trung, 3=Thượng
- `acquireType`: 'default' | 'buy' | 'sect' | 'co_duyen'
- `buffs(mastery, elementMatch)`: hàm trả về buff — tăng dần theo thuần thục

**Danh sách công pháp:**

| id | Tên | Hệ | Cảnh giới | Nguồn |
|---|---|---|---|---|
| vo_danh | Vô Danh Công Pháp | — | LK only | Mặc định |
| truong_xuan_cong | Trường Xuân Công | Mộc | LK only | Mua 800💎 |
| tay_tuy_quyet | Tẩy Tủy Quyết | — | LK+TC | Mua 1500💎 |
| thanh_nguyen_kiem_quyet | Thanh Nguyên Kiếm Quyết | Kim | TC trở lên | Mua 8000💎 |
| kiem_quyet_ha | Thanh Vân Kiếm Quyết (Hạ) | Kim | LK | Tông môn |
| dan_kinh_ha | Vạn Linh Đan Kinh (Hạ) | Hỏa | LK | Tông môn |
| tran_phap_ha | Huyền Cơ Trận Kinh (Hạ) | Thổ | LK | Tông môn |
| the_tu_ha | Thiết Cốt Thần Công (Hạ) | — | LK | Tông môn |
| kiem_quyet_trung | Thanh Vân Kiếm Quyết (Trung) | Kim | TC+KĐ | Tông môn 5000💎 |
| dan_kinh_trung | Vạn Linh Đan Kinh (Trung) | Hỏa | TC+KĐ | Tông môn 5000💎 |
| tran_phap_trung | Huyền Cơ Trận Kinh (Trung) | Thổ | TC+KĐ | Tông môn 5000💎 |
| the_tu_trung | Thiết Cốt Thần Công (Trung) | — | TC+KĐ | Tông môn 5000💎 |
| kiem_quyet_thuong | Thanh Vân Kiếm Quyết (Thượng) | Kim | NA+HT | Cơ Duyên |
| dan_kinh_thuong | Vạn Linh Đan Kinh (Thượng) | Hỏa | NA+HT | Cơ Duyên |

**Tốc độ thuần thục:** `calcMasteryGainPerTick(G, cpId)` — base 0.01 + (ngoTinh/100)×0.04, ×1.3 nếu khớp hệ
**Buff áp dụng:** `calcCongPhapMasteryBonus(G)` → { ratePct, atkPct, defPct, hpPct, danBonus }

---

## NGỘ TÍNH vs TÂM CẢNH

| | Ngộ Tính | Tâm Cảnh (tamCanh) |
|---|---|---|
| Bản chất | Trí tuệ, khả năng học hỏi | Tâm tính, ý chí, ổn định nội tâm |
| Khởi đầu | Random lúc tạo nhân vật (15–100) | 50 mặc định |
| Tăng qua | Thiền định (0~0.1, 60% chance) + Cơ Duyên | doExplore (+0.5) |
| Ảnh hưởng | Thuần thục công pháp, luyện đan, cơ duyên, đột phá | Đột phá (F_tamcanh) |

---

## DANH VỌNG — TÁC ĐỘNG ĐẦY ĐỦ

| Tier | DV | Shop | Dungeon/ngày | Sect EXP | Thương Hội | NPC dialog |
|---|---|---|---|---|---|---|
| Vô Danh | 0 | — | 3 | — | — | mặc định |
| Tân Tiến | 50 | -3% | 4 | — | Mở cửa | mặc định |
| Có Tiếng | 150 | -6% | 5 | +6% | Tier 2 | Variant 1 |
| Nổi Danh | 300 | -10% | 6 | +12% | Tier 3 | Variant 2 |
| Lừng Lẫy | 500 | -15% | 8 | +20% | Tier 4 | Variant 3 |

---

## BALANCE (đã calibrate S9)

**purityThresholds LK** (Tam LC tán tu Linh Địa xong LK tuổi ~110/120):
```
[107, 182, 310, 528, 898, 1527, 2597, 4414, 7505]
```

**Linh Thực tier 1 buff duration:**
- 300s → 1200s / 600s → 1800s / 900s → 2700s

**Trận Pháp passive drain**: filter `a.category === 'passive'` (KHÔNG `a.type`)

---

## BUGS ĐÃ FIX

### S9
1. Trận Pháp passive stone không drain → fix filter `a.type` → `a.category`
2. purityThresholds LK quá cao → calibrated xuống 7505
3. Linh Thực tier 1 buff quá ngắn → tăng duration
4. 9 puppet specials chưa có handler → thêm đầy đủ

### S10
5. Chơi lại không vào tạo nhân vật → fix `init()` xóa localStorage qua `sessionStorage._pendingReset`
6. `pagehide` không check `_isResetting` → ghi lại save sau reset
7. `_onAuthReady` typo → `_onAnonReady` trong auth-ui.js
8. `_arrayTier`, `_buaTier`, `_kloiTier` undefined → khai báo + truyền qua params
9. `ALL_INGS` undefined trong tran-phap/phu-chu/khoi-loi-tab → thêm import
10. Bếp/Bễ Rèn báo hỏng ngay từ đầu → chỉ báo khi `level > 0`
11. Nghề phụ rank names sai → đổi sang tên đúng (Luyện Khí, Trận Pháp, Phù Chú, Khôi Lỗi, Linh Thực)
12. "Khối Lỗi" → "Khôi Lỗi" toàn bộ
13. "tản tu" → "tán tu" toàn bộ

---

## LƯU Ý KỸ THUẬT

```js
// Circular imports đã giải quyết:
// map-data.js ← không import gì
// world-map.js ← map-data.js + location-popup.js
// location-popup.js ← map-data.js (KHÔNG phải world-map.js)
// danh-vong.js — độc lập hoàn toàn
// thuong-hoi-engine.js — chỉ import bus

// Công Pháp S10:
// congPhap.activeIds — list công pháp đang tu (tối đa 4)
// congPhap.mastery   — { [cpId]: 0-100 } thuần thục từng cái
// congPhap.currentId — GIỮ để tương thích ngược, không xóa
// CONG_PHAP_LIST[x].buffs(mastery, match) — hàm, KHÔNG phải object

// Bế quan:
// ĐƯỢC: luyện đan, chế phù, khôi lỗi, cảm ngộ công pháp
// KHÔNG: đánh quái, di chuyển map

// furnaceLevel mặc định = 0, KHÔNG dùng || 1 fallback

// Puppet combat flags (reset mỗi lượt địch):
// G.combat._puppetTaunt, _puppetReflect, _puppetImmuneThisTurn, _puppetRevived

// window._thuongHoiData — exposed từ main.js wireEvents()
// window._titleData — exposed từ main.js wireEvents()
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
hunger:warning, hunger:fed, hunger:starved
duoc_dien:ready, duoc_dien:harvested, duoc_dien:expanded
am_thuong:gained, am_thuong:cancot_lost
ma_dao:opened, ma_dao:exposed, ma_dao:purified, ma_dao:tau_hoa_permanent
phapdia:changed, phapdia:expired
lifespan:warning, lifespan:breakthrough
game:over, map:moved, tick:meditate
```

---

## ROADMAP — CÒN LẠI

### ⬜ Multi-device Session Lock
Chặn đăng nhập 2 thiết bị cùng lúc để tránh ghi đè save.
**Hướng đề xuất (Kick thiết bị cũ):**
- Mỗi lần login, ghi `sessionToken` (UUID) + timestamp lên Firestore (`sessions/{uid}`)
- Thiết bị đang chơi polling mỗi 30s — nếu token không khớp → tự logout + thông báo
- Thiết bị mới login → ghi token mới → thiết bị cũ bị kick
**File cần sửa:** `js/firebase/auth-ui.js`, `js/firebase/cloud-save.js`
**Lưu ý:** Cần timeout 5 phút để handle trường hợp browser crash mà không logout sạch

### ⬜ Content
- **NPC dialog cho zone chính** — Vạn Linh Thị, Hắc Phong Lâm, Địa Phủ Môn,
  Ẩn Long Động, Linh Dược Cốc, Thiên Kiếp Địa
  File: `js/ui/location-popup.js` → thêm vào `NPC_DIALOGS`
- **Cơ Duyên events TC/KĐ/NA** — hiện 52 events hầu hết cho LK
  File: `js/core/co-duyen.js`
- **Công pháp bổ sung** — cần thêm nhiều loại phong phú hơn cho tán tu
  File: `js/core/phap-dia.js` → `CONG_PHAP_LIST`

### ⬜ Thiết kế còn lại (chưa code)
- **Trận Pháp redesign** — đổi materials thành trận kỳ + trận bàn + trận nhãn + linh thạch
  Trận kỳ chế tạo từ nguyên liệu hoặc mua shop/cơ duyên
- **Luyện Đan rào cản** — cần thiên phú (ngộ tính + hệ Hỏa) để mở nghề
  Hiện tại ai cũng luyện được ngay — cần thêm gate
- **6 nghề phụ cần cơ duyên** — không phải ai cũng theo được, cần rào cản mở nghề

### ⬜ Polish
- **Combat log formatting** — hiện text thuần, cần color/icon
- **Mobile UI** — responsive improvements
- **Notification clickable** — click notif → mở đúng tab
- **Thông báo chớp liên tục** — linh lực đầy + thuần độ cần fix debounce

### ⬜ Kỹ thuật
- **Balance playtesting** — TC/KĐ/NA purityThresholds chưa calibrate
- **Thuần thục công pháp balance** — tốc độ tăng cần test thực tế
- **Firebase deploy** — Auth + Firestore production

---

## CSS FILES (12)
```
base.css, layout.css, components.css,
tabs.css (+Thương Hội), setup.css, equipment.css, combat.css,
dungeon_sect.css (+Achievement UI),
systems.css, map.css, tutorial.css, craft-popup.css
```