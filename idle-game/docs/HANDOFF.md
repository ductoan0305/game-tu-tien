# TU TIÊN IDLE GAME — HANDOFF DOCUMENT
**Cập nhật lần cuối:** Session 16 — Tab-as-Popup + Resize System (2026-05-05)
**Version:** v12 | SAVE_KEY: `tutien_v10` | SAVE_VERSION: `11`

---

## DESIGN MANIFESTO (KHÓA TRIẾT LÝ SẢN PHẨM)

### 1) Câu lõi
**Tu tiên là chọn lọc, không phải leo rank. Cố gắng là điều kiện cần, không phải điều kiện đủ.**

### 2) Nguyên tắc không được phá
- Đa số thất bại là bình thường.
- Cơ duyên là biến số định mệnh, không thể thay thế hoàn toàn bằng cày tuyến tính.
- Tiến trình dài hạn (vài tháng thực tế) là mục tiêu, không phải lỗi pacing.
- Người chơi bỏ cuộc là outcome hợp lệ của game hardcore.
- Thành công hiếm (Trúc Cơ+) phải có giá trị xã hội và cảm xúc thật.

### 3) Quy tắc tuổi và cửa sổ đột phá (Luyện Khí)
- Tuổi thọ LK chuẩn: 120 năm game (dao động theo linh căn/cơ duyên).
- Tuổi bắt đầu: 10.
- Cửa sổ vàng đột phá: trước 70 tuổi.
- 70-75: tỷ lệ đột phá rơi mạnh.
- Từ 75+: xem như vô vọng nếu không có cơ duyên nghịch thiên.
- Tuổi thọ != tuổi tu luyện hiệu quả: còn sống không đồng nghĩa còn cơ hội.

### 4) Kỳ vọng theo linh căn (định hướng balance)
- Ngũ linh căn: kẹt LK6-7 là bình thường.
- Tứ linh căn: LK hậu kỳ có thể đạt, Trúc Cơ rất khó.
- Tam linh căn: mới có cửa nhỏ Trúc Cơ.
- Song/Thiên linh căn: nhóm hiếm, có xác suất Trúc Cơ khả thi trong cửa sổ tuổi.

### 5) Chống "buff xàm" và thưởng phá game
- Cấm thưởng ngẫu nhiên vô lý (vd spawn map được tặng linh thạch).
- Cấm power spike không có lore/hệ quả.
- Cấm loop spam cho tăng vĩnh viễn không cap rõ ràng.
- Mọi nguồn linh thạch phải có lao động/rủi ro/quan hệ xã hội tương ứng.

### 6) Triết lý nhiệm vụ
- Nhiệm vụ phải có người giao cụ thể (trưởng thôn, quản sự, trưởng lão...).
- Người chơi nhận thưởng vì giải quyết nhu cầu thật của NPC/faction.
- Tránh quest checklist arcade kiểu "giết N quái nhận mưa tài nguyên".
- Quest phải mở ra quan hệ, thông tin, cơ hội, hoặc tài nguyên có bối cảnh.

### 7) Check trước khi merge tính năng mới
Tính năng mới phải trả lời "YES" cho tất cả:
1. Có giữ triết lý "đa số thất bại là bình thường" không?
2. Có làm ngắn game bất thường (< vài tháng) không?
3. Có tạo đường tăng sức mạnh tuyến tính, chắc thắng không?
4. Có làm mờ vai trò linh căn/cơ duyên/tuổi tác không?
5. Có vi phạm logic kinh tế tu tiên (thưởng quá dễ, quá nhiều) không?

Nếu có 1 câu trả lời "NO" hoặc "có vi phạm", **không merge** cho đến khi redesign.

---

## CẨM NANG TÂN ĐẠO HỮU (ONBOARDING BẮT BUỘC)

Mục tiêu phần này: giúp người chơi hiểu đúng game ngay từ phút đầu, tránh hiểu nhầm đây là game "bấm vài nút là mạnh".

### A) Game này là gì?
- Đây là game tu tiên hardcore, thiên về sinh tồn và lựa chọn.
- Không phải game idle power fantasy tăng số tuyến tính.
- Cố gắng là bắt buộc, nhưng không đảm bảo thành công.
- Đa số nhân vật thất bại ở Luyện Khí là bình thường.

### B) Người chơi đang theo đuổi điều gì?
- Mục tiêu gần: sống sót và đột phá từng tầng Luyện Khí.
- Mục tiêu trung: đạt Luyện Khí hậu kỳ trước khi cửa sổ tuổi đóng lại.
- Mục tiêu khó: Trúc Cơ trước ngưỡng tuổi suy giảm mạnh.
- Mục tiêu thật: đi được xa nhất có thể với linh căn và cơ duyên của chính mình.

### C) Thắng / thua được hiểu thế nào?
- Không có "thắng tuyệt đối" cho mọi run.
- "Thua" (kẹt cảnh giới, chết vì tuổi, đột phá thất bại) là một phần của fantasy tu tiên.
- "Thắng" là tối ưu hóa một số phận khó, không phải chắc chắn phá đảo.

### D) 4 hệ thống người chơi phải hiểu trong 3 phút đầu
1. **Linh Căn**: quyết định thiên hướng và trần phát triển.
2. **Tuổi & Cửa Sổ Đột Phá**: còn sống không đồng nghĩa còn cơ hội.
3. **Công Pháp**: `Vô Danh Công Pháp` yếu nhưng là đường sống của đa số tán tu.
4. **Tài Nguyên**: linh thạch không tự rơi từ trời, phải đổi bằng lao động/rủi ro.

### E) Script hướng dẫn 10 phút đầu (chỉ Luyện Khí)
- **Phút 0-1:** Sau tạo nhân vật, hiển thị tóm tắt "Linh căn của bạn là gì, hợp con đường nào".
- **Phút 1-3:** Hướng dẫn bế quan để thấy linh lực tăng và hiểu nhịp tu luyện.
- **Phút 3-5:** Hướng dẫn hành động tiêu hao thể năng (khám phá/làm việc/săn nhẹ) để hiểu chi phí.
- **Phút 5-7:** Mở mục tiêu đầu tiên: chuẩn bị điều kiện đột phá tầng kế tiếp.
- **Phút 7-10:** Nhấn mạnh "đột phá có thể thất bại", giới thiệu vai trò cơ duyên và tuổi.

### F) Copy gợi ý cho popup "Bạn phải biết trước khi tu"
- "Ngươi không ở đây để chắc thắng. Ngươi ở đây để thử xem số mệnh của mình đi được bao xa."
- "Linh căn quyết định thiên hướng, nhưng lựa chọn quyết định tốc độ tự diệt."
- "Trước 70 tuổi là cửa sổ vàng của Luyện Khí. Qua mốc này, đột phá sẽ tắt dần."
- "Không có linh thạch miễn phí. Mọi tài nguyên đều có cái giá của nó."

### G) Quy tắc UX bắt buộc
- Luôn hiển thị "Mục tiêu tiếp theo" ở trạng thái hiện tại (không để màn hình rỗng mục đích).
- Khi người chơi thất bại, phải giải thích "vì sao thất bại" và "còn đường nào".
- Tránh spam notification vô nghĩa; ưu tiên thông tin giúp ra quyết định.
- Mọi tutorial text phải giữ giọng "tu tiên khắc nghiệt", không casual hóa.

---

## IMPLEMENTATION SPEC V1 — ONBOARDING 10 PHÚT ĐẦU (LK ONLY)

Mục tiêu: biến flow sản phẩm thành đặc tả đủ chi tiết để code trực tiếp, không đụng balance sâu.

### 1) State cần thêm

Thêm vào `G`:

```js
tutorial: {
  enabled: true,           // bật tutorial cho save mới
  step: 0,                 // 0..6
  completed: false,        // hoàn tất onboarding 10 phút đầu
  startedAt: 0,            // Date.now() lúc bắt đầu step 1
  seenHints: {},           // map id->true để tránh spam popup
  progress: {
    meditateSec: 0,        // tổng giây bế quan trong step yêu cầu
    usedStaminaAction: false,
    attemptedBreakthrough: false,
    openedPhapdiaTab: false,
    openedQuestTab: false
  }
}
```

### 2) Nguồn sự kiện dùng để cập nhật step

- `tick:meditate` -> cộng `meditateSec`
- action thành công: `doExplore/doFish/doArray/doSpar/doMeditation` -> set `usedStaminaAction=true`
- click action `breakthrough` (dù fail hay success) -> `attemptedBreakthrough=true`
- chuyển tab `phapdia` -> `openedPhapdiaTab=true`
- chuyển tab `quests` -> `openedQuestTab=true`
- mỗi lần đổi trạng thái/tick -> gọi `updateTutorialStep(G)`

### 3) Định nghĩa step (code-ready)

#### Step 0 — Vừa vào game sau setup
- Trigger: `setupDone=true && tutorial.step===0`
- UI text: "Ngươi đã khai linh. Hãy bắt đầu bế quan để tích linh lực."
- Next condition: người chơi bật bế quan ít nhất 10 giây thực (`meditateSec >= 10`)
- On pass: `step=1`

#### Step 1 — Hiểu chi phí hành động
- UI text: "Tu luyện cần trả giá. Hãy thử một hành động tiêu hao thể năng."
- Next condition: `usedStaminaAction===true`
- On pass: `step=2`

#### Step 2 — Chạm cơ chế đột phá
- UI text: "Đột phá có thể thất bại. Hãy thử đột phá một lần để hiểu thiên mệnh."
- Next condition: `attemptedBreakthrough===true`
- On pass: `step=3`

#### Step 3 — Nhận thức công pháp
- UI text: "Công pháp quyết định đường dài. Mở tab Pháp Địa để xem công pháp đang tu."
- Next condition: `openedPhapdiaTab===true`
- On pass: `step=4`

#### Step 4 — Nhận thức mục tiêu
- UI text: "Ngươi cần mục tiêu rõ ràng. Mở tab Nhiệm Vụ để xem việc nên làm tiếp."
- Next condition: `openedQuestTab===true`
- On pass: `step=5`

#### Step 5 — Khóa nhận thức tuổi và độ khó
- UI text (bắt buộc):  
  "Trước 70 tuổi là cửa sổ vàng Luyện Khí. Qua mốc này, đột phá sẽ suy mạnh."
- Next condition: người chơi xác nhận popup (nút "Đã hiểu")
- On pass: `step=6`

#### Step 6 — Hoàn tất onboarding
- UI text: "Con đường tu tiên đã mở. Từ đây, thất bại là bình thường."
- Set:
  - `completed=true`
  - `enabled=false` (chỉ tắt tutorial chính, vẫn giữ hint hệ thống riêng nếu cần)

### 4) Rule hiển thị UI (tránh spam)

- Chỉ hiển thị 1 khối "Mục tiêu hiện tại" tại một thời điểm.
- Popup chặn màn hình chỉ dùng cho Step 5 (tuổi & độ khó), các step khác dùng panel góc.
- Mỗi hint chỉ auto-show 1 lần, lưu vào `seenHints`.
- Nếu người chơi đóng panel, vẫn cho mở lại bằng nút "Cẩm nang tân đạo hữu".

### 5) Copy ngắn cho panel mục tiêu

- Step 0: "Bế quan 10 giây để cảm nhận linh lực vận hành."
- Step 1: "Thử 1 hành động tiêu hao thể năng."
- Step 2: "Thử đột phá 1 lần (thành/bại đều được)."
- Step 3: "Mở Pháp Địa để xem công pháp đang tu."
- Step 4: "Mở Nhiệm Vụ để nhận hướng đi tiếp."
- Step 5: "Đọc cảnh báo tuổi tu luyện trước khi đi tiếp."

### 6) Không làm trong V1

- Không thêm thưởng linh thạch miễn phí.
- Không can thiệp công thức balance cảnh giới.
- Không thêm quest mới phức tạp.
- Không thay đổi combat.

### 7) Tiêu chí nghiệm thu V1

1. Save mới vào game luôn có mục tiêu rõ ở mỗi step.
2. Không có trạng thái "không biết làm gì" trong 10 phút đầu.
3. Không tạo power spike và không phá triết lý hardcore.
4. Người chơi hiểu 3 điều sau onboarding:
   - đột phá có thể thất bại,
   - tuổi là giới hạn thật,
   - công pháp và linh căn quyết định đường dài.

---

## WORLD DESIGN — ĐỌC TRƯỚC KHI LÀM BẤT CỨ THỨ GÌ

**Nhân Giới only** — realmIdx 0–4. **KHÔNG làm Linh Giới** cho đến khi Nhân Giới ổn.

> AUDIT NOTE: Code hiện tại còn dư realm sau Hóa Thần và còn dấu vết `tianJie` trong combat/content.
> Quy ước chuẩn sản phẩm vẫn là Nhân Giới only; cần cleanup code để khớp định hướng.

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
│   ├── visibility.js         S-B: getVisibleTabs(G) → string[]
│   │                         Kiểm soát tab nào hiện trong bottom nav theo progression
│   │                         Gate: always / setupDone / flags / realm+stage
│   │                         KHÔNG gate programmatic tab switches (game logic)
│   ├── state/
│   │   ├── fresh-state.js    createFreshState, SAVE_KEY='tutien_v10', SAVE_VERSION=11
│   │   │                     S-B: thêm flags: { shopUnlocked, dungeonQuestDone, unlockedProfessions }
│   │   ├── persistence.js    saveGame, loadGame, tất cả migrations
│   │   │                     _migrateCongPhap() — thêm S10: activeIds + mastery
│   │   │                     _migrateFlags() — S-B: auto-detect từ save cũ (shopUnlocked, professions)
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
│   │                         S-B: renderNav() import getVisibleTabs → ẩn/hiện button + "Thêm" btn
│   ├── popup-manager.js      S15/S16: PopupManager singleton
│   │                         open/close/toggle/isOpen/setContent/closeAll
│   │                         Drag (header), Resize 8-direction (N/S/E/W + 4 góc)
│   │                         onClose callback, extraClass support
│   ├── tab-popup.js          S15: MỚI — hệ thống tab-as-floating-popup
│   │                         openTabPopup(tabId, G, renderFn)
│   │                         closeTabPopup / closeAllTabPopups / isTabPopupOpen
│   │                         TAB_POPUP_CFG: 18 tabs (không có cultivate)
│   │                         DOM node move: panel vào .pm-body, trả về khi đóng
│   ├── starter-village.js    S15: side panel → sv-side-popup (absolute overlay)
│   │                         Xóa div.mst1-stats.sv-stats-top (map-stat-rate/age/stone)
│   │                         Class mới: .sv-side-popup (không dùng .map-side-t2)
│   ├── tabs/
│   │   ├── phapdia-tab.js    S10: UI redesign — thuần thục bar, add/remove slot
│   │   ├── nghe-nghiep-tab.js S10: thêm khai báo _arrayTier, _buaTier, _kloiTier...
│   │   └── professions/      S10: fix thiếu import ALL_INGS, fmtDuration, filter params
│   └── ...
└── main.js                   S10: addCongPhapSlot, removeCongPhapSlot actions
                              fix pagehide check _isResetting
                              fix init() xóa localStorage khi _pendingReset
                              S15: _switchTabWithPopup(tabId) helper
                              wireNavBtn → _switchTabWithPopup thay switchTab
                              alchemyActions.switchTab → _switchTabWithPopup
                              dungeonActions.enterDungeon → _switchTabWithPopup('combat')
                              hunt start / combat end / flee → _switchTabWithPopup
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
  // NOTE: nghiepLuc nằm trong kiepTu.nghiepLuc (không phải top-level)
  linhThu: { slots:[null,null], eggs:[] },
  // NOTE: maDaoPath không còn trong state hiện tại
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
7. `_onAuthReady` typo → `_onAnonReady` trong auth-ui.js ✅ **ĐÃ FIX** (Session 11)
8. `_arrayTier`, `_buaTier`, `_kloiTier` undefined → khai báo + truyền qua params
9. `ALL_INGS` undefined trong tran-phap/phu-chu/khoi-loi-tab → thêm import
10. Bếp/Bễ Rèn báo hỏng ngay từ đầu → chỉ báo khi `level > 0`
11. Nghề phụ rank names sai → đổi sang tên đúng (Luyện Khí, Trận Pháp, Phù Chú, Khôi Lỗi, Linh Thực)
12. "Khối Lỗi" → "Khôi Lỗi" toàn bộ
13. "tản tu" → "tán tu" toàn bộ

16. `canCotBonus` từ `tay_tuy_quyet` đã được tính trong `calcCongPhapMasteryBonus` nhưng chưa apply vào pipeline — đã thêm `calcEffectiveCanCot(G)` vào `computed.js`, cập nhật `breakthrough.js` dùng hàm này thay `G.canCot` trực tiếp, export qua `state.js` shim (Audit #5 ✅ ĐÃ FIX)

### S15/S16 — Tab-as-Popup + Layout + Resize
21. `hud-right` (#hud-right) tạm tắt — comment `_buildRightHUD()` và `_updateRightPill()` trong `hud.js`
22. `.panel-center` dùng `inset: 0` che khuất bottom-nav → fix thành `bottom: 52px` (56px mobile)
23. `starter-village-side` (map-side-t2) gây nhầm lẫn với T2 world-map → đổi sang class `.sv-side-popup` hoàn toàn mới, loại bỏ `.mst1-stats.sv-stats-top`
24. PopupManager thiếu drag, onClose, extraClass → thêm đủ 3, wired trong `open()`
25. PopupManager thiếu resize → thêm `_makeResizable()` 8-direction (N/S/E/W + NE/NW/SE/SW), min 240×160px, clamp viewport, override `maxHeight` khi resize thủ công
26. Tất cả tab switches dùng `switchTab()` + `renderCurrentTab()` riêng lẻ → thống nhất qua `_switchTabWithPopup(tabId)` trong `main.js`

### S12 — Onboarding Tutorial V1
17. `tutorial-engine.js` chưa tồn tại trong khi `main.js` đã import → tạo file `js/core/tutorial-engine.js` với đầy đủ exports: `ensureTutorialState`, `updateTutorialStep`, `trackMeditateSeconds`, `trackStaminaAction`, `trackBreakthroughAttempt`, `trackTabOpen`, `acknowledgeAgeWarning` ✅ ĐÃ FIX
18. `G.tutorial` default state đã có trong `fresh-state.js` và migration `_migrateTutorial()` trong `persistence.js` ✅ ĐÃ DONE
19. `renderTutorialObjectivePanel()` và `showTutorialAgeWarningModal()` đã có trong `render-core.js` ✅ ĐÃ DONE
20. Wiring trong `main.js`: `trackMeditateSeconds` gọi mỗi tick khi bế quan, `trackStaminaAction` / `trackBreakthroughAttempt` gắn vào từng cultivate action, `trackTabOpen` gắn vào tab switch, Step 5 modal trigger trong tick loop ✅ ĐÃ DONE

### S-B — Visibility Gate System (2026-05-05)
29. Bottom nav hiển thị toàn bộ 19 tabs ngay từ đầu → vi phạm triết lý hardcore, overwhelm người mới → tạo `js/core/visibility.js` với `getVisibleTabs(G)`, wire vào `renderNav()` (ẩn button nếu tab chưa visible), wire vào `wireNavBtn` (toast nếu click button ẩn). Migration `_migrateFlags()` đảm bảo save cũ không mất tab. `G.flags` object thêm vào `fresh-state.js`. Programmatic tab switches (hunting, dungeon, combat end) KHÔNG bị gate. ✅ ĐÃ FIX

### S-A — Fix Tutorial Panel Re-trigger (2026-05-05)
27. Tutorial panel tự bật lại ngay sau khi đóng — `renderTutorialObjectivePanel()` gọi mỗi tick, không có guard cho trạng thái "người chơi đã đóng tay" → thêm `G.tutorial.panelDismissed` flag; khi user bấm X, `onClose` callback set flag `true`; `renderTutorialObjectivePanel` không auto-open nếu flag đang `true`; flag reset về `false` tự động khi `_advance()` chuyển step mới ✅ ĐÃ FIX
28. Không có nút mở lại tutorial panel sau khi đóng (HANDOFF §4 spec) → thêm `_renderTutorialReopenBtn()` trong `render-core.js`: nút `#tutorial-reopen-btn` class `.tutorial-reopen-btn` fixed-position góc phải màn hình, chỉ hiện khi `panelDismissed=true`, click → reset flag + reopen panel; CSS thêm vào `tutorial.css` ✅ ĐÃ FIX

### S11
14. `calcCultivationMultiplier()` dùng `congPhap.rateMultiplier` (field không tồn tại) → xóa dead code khỏi `phap-dia.js` (Audit #3 ✅)
15. `doArray()` đã dùng `eventRateBonus`/`eventRateTimer` (buff 300s, tự expire) thay vì cộng `qiBonus` permanent — xác nhận đã fix, đánh dấu chính thức (Audit #4 ✅)

---

## AUDIT MISMATCHES (2026-04-01)

Các mục dưới đây là sai lệch đã xác minh giữa tài liệu và code hiện tại:

1. **Scope Nhân Giới lệch:** `data.js` vẫn có realm sau Hóa Thần (Luyện Hư, Hợp Thể...).
2. **Thiên Kiếp lệch triết lý:** vẫn còn state/logic `tianJie` trong combat và content map.
3. **Dead code lỗi:** `calcCultivationMultiplier()` dùng `congPhap.rateMultiplier` (không tồn tại) và không được dùng.
4. **Stack vĩnh viễn:** `doArray()` cộng `qiBonus` permanent, chưa có cap/timer.
5. ~~**Buff không có tác dụng:** `tay_tuy_quyet` tạo `canCotBonus` nhưng chưa được apply vào hệ stat/chance.~~ ✅ **ĐÃ FIX** — `calcEffectiveCanCot(G)` trong `computed.js`, `breakthrough.js` dùng hàm này
6. **Linh Địa chưa có phí định kỳ:** hiện chỉ trừ stone một lần khi chuyển map.
7. **Prestige lệch mặc định lò:** `_freshMini()` đặt `furnaceLevel=1` trong khi state chuẩn là `0`.
8. **Sect rank check không đồng bộ:** `phap-dia.js` tự tính rank bằng `Math.floor(exp/500)` thay vì dùng rank helper tông môn.

---

## LƯU Ý KỸ THUẬT

```js
// ---- Popup System (S15/S16) ----
// Tất cả tab (trừ cultivate) mở như floating popup qua openTabPopup()
// Cultivate luôn là background canvas — KHÔNG popup hóa
// DOM node move strategy: appendChild(panelEl) vào .pm-body để giữ event listeners
// Khi đóng popup: panel trả về .panel-center (display:none), không clone innerHTML
// _openTabPopupCount() đếm .pm-popup.pm-tab-popup — dùng để detect popup cuối (<=1)
// onClose closure capture G ref để reset G.activeTab = 'cultivate' khi popup cuối đóng

// ---- Layout (S15) ----
// .panel-center: bottom: 52px (desktop) / 56px (mobile) — KHÔNG dùng inset:0
// .panel-in-popup: height/min-height/max-height: auto/unset/none — tránh double-scroll
// .pm-popup.pm-tab-popup: max-height: min(84vh, 860px) — override khi resize thủ công

// ---- starter-village side panel (S15) ----
// Class .sv-side-popup (KHÔNG phải .map-side-t2 — class đó dùng cho T2 world-map)
// #sv-side-popup: absolute overlay trong .map-wrap-starter (position: relative)
// Drag nội bộ: _makeSvPopupDraggable — dùng offsetParent coords (khác PopupManager)

// ---- Circular imports đã giải quyết:
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
- **Mobile UI** — responsive improvements (panel-center bottom đã fix, còn touch drag/resize)
- **Notification clickable** — click notif → gọi `openTabPopup(tabId, G, renderFn)` (nền tảng đã có)
- **Thông báo chớp liên tục** — linh lực đầy + thuần độ cần fix debounce
- **Popup z-index / focus** — khi click vào popup, nên bring-to-front (hiện chưa có stacking order). Token `--z-tooltip-top` (900) có thể dùng cho focused popup, nhưng cần cơ chế JS set z-index động khi click.

### ⬜ Kỹ thuật
- **Balance playtesting** — TC/KĐ/NA purityThresholds chưa calibrate
- **Thuần thục công pháp balance** — tốc độ tăng cần test thực tế
- **Firebase deploy** — Auth + Firestore production
- ~~**Auth typo cleanup**~~ — ✅ Đã fix toàn bộ `_onAuthReady` → `_onAnonReady`
- **Cleanup scope** — loại bỏ realm 5+ và toàn bộ `tianJie` path khỏi code Nhân Giới
- ~~**Apply canCotBonus từ tay_tuy_quyet**~~ ✅ Đã fix — `calcEffectiveCanCot(G)` trong `computed.js` + `breakthrough.js` (Audit #5)
- **Linh Địa monthly fee** — thêm cơ chế trừ phí định kỳ theo game-time
- **Chuẩn hóa timer Trận Pháp** — thống nhất đơn vị game-time vs real-time trong drain logic/comment

---

## CSS FILES (13)
```
base.css, tokens.css, layout.css, components.css,
tabs.css (+Thương Hội), setup.css, equipment.css, combat.css,
dungeon_sect.css (+Achievement UI),
systems.css, map.css, tutorial.css, craft-popup.css
```
_(style.css đã XÓA — file 3182 dòng orphan, không load trong index.html)_

### CSS Refactoring — Đã hoàn thành (Session CSS-Audit)

**tokens.css** đã rebuild đầy đủ:
- Z-index scale 14 tầng: `--z-decorative(0)` → `--z-hud(90)` → `--z-sticky(100)` → `--z-dropdown(200)` → `--z-panel(300)` → `--z-popup(400)` → `--z-overlay(500)` → `--z-modal(600)` → `--z-toast(700)` → `--z-notification(800)` → `--z-tooltip-top(900)` → `--z-critical(1000)` → `--z-auth(1100)` → `--z-system(1200)`
- Spacing: `--space-1(4px)` đến `--space-6(32px)`
- Border-radius: `--radius-xs(4px)` đến `--radius-pill(99px)`
- Shadow: `--shadow-soft`, `--shadow-card`, `--shadow-popup`

**Z-index values đã thay đổi** (quan trọng cho popup/overlay logic):
| Element | Cũ | Mới (token) |
|---------|-----|-------------|
| `#login-gate` | 9999 | 1100 (`--z-auth`) |
| rotate overlay | 99999 | 1200 (`--z-system`) |
| `.passive-tooltip` | 9999 | 900 (`--z-tooltip-top`) |
| `#notif-panel` | 8000 | 800 (`--z-notification`) |
| `.toast-container` | 1000 | 700 (`--z-toast`) |
| `.float-container` | 999 | 700 (`--z-toast`) |
| `.modal-overlay` | 2000 | 600 (`--z-modal`) |
| `#modal-ambush` | 9999 | 600 (`--z-modal`) |
| `#popup-layer` | 500 | **500** (`--z-overlay`) — KHÔNG ĐỔI |
| `.craft-popup-overlay` | 400 | **400** (`--z-popup`) — KHÔNG ĐỔI |
| `#hud-left`, `#hud-right` | 90 | **90** (`--z-hud`) — KHÔNG ĐỔI |

**Popup system S15/S16 KHÔNG bị ảnh hưởng** — `#popup-layer` (500) và `.pm-popup` giữ nguyên value. `.modal-overlay` (600 > 500) vẫn nổi trên popup-layer đúng thứ tự.

**!important** — đã xóa sạch 19 cascade wars trên 7 file. 6 `!important` còn lại trong map.css media query là hợp lệ (override inline JS styles của menu dropdown).