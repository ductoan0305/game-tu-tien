# TU TIÊN IDLE GAME — HANDOFF DOCUMENT
**Cập nhật lần cuối:** Session P5 — NPC Dialogs: Các Zone Chính (2026-05-08)
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
│   ├── tu-luyen-popup.js     S-H4: MỚI — floating popup Tu Luyện (id: 'tu-luyen')
│   │                         openTuLuyenPopup(G, cultivateActions) / updateTuLuyenPopup(G)
│   │                         isTuLuyenPopupOpen() / closeTuLuyenPopup()
│   │                         Nội dung: bars qi/hp/stamina, stats grid, pháp địa,
│   │                         hunger/ám thương, 6 action buttons, breakthrough pulse
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
                              S-H4: import openTuLuyenPopup/updateTuLuyenPopup
                              wireNavBtn special-case 'cultivate' → openTuLuyenPopup
                              gameTick: updateTuLuyenPopup mỗi 2 ticks
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

## CÔNG PHÁP — THIẾT KẾ S10 (cập nhật P8)

**Tối đa 4 công pháp tu cùng lúc** (`CONG_PHAP_MAX_SLOTS = 4`)

**Mỗi công pháp có:**
- `element`: hệ ngũ hành (kim/mu/shui/huo/tu/null)
- `stages`: số tầng
- `realmRange`: [minRealm, maxRealm] — cảnh giới áp dụng
- `grade`: 0=Tạp, 1=Hạ, 2=Trung, 3=Thượng
- `acquireType`: 'default' | 'buy' | 'sect' | 'co_duyen'
- `buffs(mastery, elementMatch)`: hàm trả về buff — tăng dần theo thuần thục

**Danh sách công pháp:**

| id | Tên | Hệ | Grade | Cảnh giới | Nguồn |
|---|---|---|---|---|---|
| vo_danh | Vô Danh Công Pháp | — | Tạp | LK only | Mặc định |
| truong_xuan_cong | Trường Xuân Công | Mộc | Hạ | LK only | Mua 800💎 |
| tay_tuy_quyet | Tẩy Tủy Quyết | — | Hạ | LK+TC | Mua 1500💎 |
| hoi_thuy_quyet | Hồi Thủy Quyết | Thủy | Hạ | LK only | Mua 900💎 |
| cuong_tho_kinh | Cương Thổ Kinh | Thổ | Hạ | LK only | Mua 1000💎 |
| thanh_nguyen_kiem_quyet | Thanh Nguyên Kiếm Quyết | Kim | Trung | TC trở lên | Mua 8000💎 |
| bac_minh_thuy_kinh | Bắc Minh Thủy Kinh | Thủy | Trung | TC+KĐ | Mua 6500💎 |
| hon_nguyen_hoa_kinh | Hỗn Nguyên Hóa Kinh | — | Trung | TC+KĐ | Mua 7500💎 |
| kiem_quyet_ha | Thanh Vân Kiếm Quyết (Hạ) | Kim | Hạ | LK | Tông môn |
| dan_kinh_ha | Vạn Linh Đan Kinh (Hạ) | Hỏa | Hạ | LK | Tông môn |
| tran_phap_ha | Huyền Cơ Trận Kinh (Hạ) | Thổ | Hạ | LK | Tông môn |
| the_tu_ha | Thiết Cốt Thần Công (Hạ) | — | Hạ | LK | Tông môn |
| kiem_quyet_trung | Thanh Vân Kiếm Quyết (Trung) | Kim | Trung | TC+KĐ | Tông môn 5000💎 |
| dan_kinh_trung | Vạn Linh Đan Kinh (Trung) | Hỏa | Trung | TC+KĐ | Tông môn 5000💎 |
| tran_phap_trung | Huyền Cơ Trận Kinh (Trung) | Thổ | Trung | TC+KĐ | Tông môn 5000💎 |
| the_tu_trung | Thiết Cốt Thần Công (Trung) | — | Trung | TC+KĐ | Tông môn 5000💎 |
| kiem_quyet_thuong | Thanh Vân Kiếm Quyết (Thượng) | Kim | Thượng | NA+HT | Cơ Duyên |
| dan_kinh_thuong | Vạn Linh Đan Kinh (Thượng) | Hỏa | Thượng | NA+HT | Cơ Duyên |
| dia_tang_chon_kinh | Địa Tạng Chân Kinh | Thổ | Thượng | NA+HT | Cơ Duyên (tán tu) |
| hon_nguyen_chon_kinh | Hỗn Nguyên Chân Kinh | — | Thượng | NA+HT | Cơ Duyên (tán tu) |

**Ghi chú balance (P8):** Công pháp tán tu buy ≤ sect cùng grade. Tán tu co_duyen không vượt sect co_duyen: tổng buff null-Thượng = 150% (vs sect 170%); Thổ-Thượng với match = 170% = bằng kiem_quyet_thuong nhưng thiên DEF thay ATK.

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

**Trận Pháp vật liệu (P9)**:
- `tran_ky` 🚩, `tran_ban` 🎴, `tran_nhan` 🔵 — lưu trong `G.alchemy.ingredients`
- Tier 1: `tran_ky×2` | Tier 2: `tran_ky×4 + tran_ban×1` | Tier 3: `tran_ban×2 + tran_nhan×1`
- Tier 4: `tran_ban×3 + tran_nhan×2` | Tier 5: `tran_ban×2 + tran_nhan×3`
- Chế tạo: `TRAN_MAT_RECIPES` trong `crafting-data.js` → action `craftTranMat(recipeId)` trong `main.js`
- Mua shop: `shop_tran_ky` (200💎), `shop_tran_ban` (700💎), `shop_tran_nhan` (3000💎 — realm 1)
- Shop handler: `type:'ingredient'` trong `buyItem` (`inventory.js`) → cộng vào `G.alchemy.ingredients`
- UI: stock bar + section chế tạo vật liệu ở đầu tab Trận Pháp (`tran-phap-tab.js`)

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

### S-Phase3 — State Mismatch Bug Fixes (2026-05-07)

46. **`G.nghiepLuc` mismatch — notification/dot/Thương Hội không bao giờ fire** → Code đọc `G.nghiepLuc` (top-level, luôn `undefined`) thay vì `G.kiepTu.nghiepLuc` (nơi engine thực sự ghi). Hậu quả: (a) dot indicator nghiệp lực `render-core.js:179` không hiện; (b) notification nghiepLuc `render-core.js:830` không fire; (c) Thương Hội check `nghiepLuc_low` luôn pass dù player có nghiệp cao; (d) `nghiepCleanse` effect ghi vào field sai, không giảm được nghiệp lực. Fix: đổi tất cả 4 chỗ sang `G.kiepTu?.nghiepLuc`. ✅ ĐÃ FIX

47. **Dungeon tab không hiện ở Trúc Cơ — chicken-and-egg** → `visibility.js` check `dungeonQuestDone || realm >= 2`, nhưng `dungeonQuestDone` không bao giờ được set `true` ở bất kỳ đâu. TC player (realm 1) cần tab dungeon để làm `side_dungeon_01` nhưng tab chỉ hiện ở KĐ (realm 2). Fix: (a) đổi condition sang `realm >= 1`; (b) wire `G.flags.dungeonQuestDone = true` trong `event-bus-handlers.js` khi `questId === 'side_dungeon_01'` hoàn thành. ✅ ĐÃ FIX

48. **bt_ready toast dùng `G._lastMaxQi` không tồn tại** → `_checkSmartNotifications` dùng `G._lastMaxQi ?? 999` để check qi đầy — field này không bao giờ được set, fallback 999 khiến condition luôn `false`. `calcMaxQi` đã được import sẵn trong `main.js`. Fix: thay `G._lastMaxQi ?? 999` bằng `calcMaxQi(G)`. ✅ ĐÃ FIX

**Files thay đổi trong S-Phase3:** `render-core.js`, `thuong-hoi-engine.js`, `visibility.js`, `event-bus-handlers.js`, `main.js`

### P1 — Technical Cleanup: Realm Scope + Timer (2026-05-08)

49. **`canPrestige` dùng `realmIdx >= 7` — sai scope Nhân Giới** → Game chỉ có realm 0-4 (LK/TC/KĐ/NA/HT). Condition `>= 7` là dead code từ ARCHITECTURE.md v2 cũ. Fix: đổi thành `>= 4` (gate tại Hóa Thần hoàn thành), thêm comment giải thích feature chưa có UI. `doPrestige` không được gọi từ đâu hiện tại — vẫn giữ code để implement sau. (`js/core/systems/tick.js`) ✅ ĐÃ FIX

50. **`portrait.js` clamp `realmIdx` về 7 — array `REALM_PORTRAIT` chỉ có index 0-4** → `Math.min(G.realmIdx || 0, 7)` sẽ không crash vì realmIdx không vượt 4, nhưng comment `(0-7)` gây nhầm lẫn và nếu bug nào khác làm realmIdx tăng lên 5/6 sẽ crash (`REALM_PORTRAIT[5]` là `undefined`). Fix: đổi thành `Math.min(G.realmIdx || 0, 4)`, cập nhật comment dòng đầu file. (`js/ui/portrait.js`) ✅ ĐÃ FIX

51. **Comment Trận Pháp sai đơn vị: "game-time" vs "thực"** → `tran-phap-data.js` comment ghi "phút game-time" và "giây game" nhưng engine thực sự dùng giây thực (real-time): `stoneDrainTimer` tích lũy `dtSec` (giây thực, không phải giây game) và fire khi `>= 60` (60 giây thực). Comment trong `alchemy-engine.js` cũng ghi "60 giây game = 1 phút" — sai. Fix: cập nhật tất cả comment để ghi rõ "giây THỰC / real-time"; thêm ghi chú quy đổi "1 phút thực = 30 phút game". Logic drain giữ nguyên — chỉ làm rõ đơn vị. (`js/alchemy/tran-phap-data.js`, `js/alchemy/alchemy-engine.js`) ✅ ĐÃ FIX

**Files thay đổi trong P1:** `tick.js`, `portrait.js`, `tran-phap-data.js`, `alchemy-engine.js`, `HANDOFF.md`

### P2 — Combat Log Formatting (2026-05-08)

52. **Static HTML build không gọi formatter** → `renderCombatTab` có 2 code path: initial build (HTML template) và dynamic update (setEl). Path dynamic đã gọi `_formatLogLine` đúng, nhưng initial build dùng `l.text` raw. Fix: đổi initial build dùng `_formatLogLine(l.text, l.type)` — cả 2 path nhất quán. (`js/ui/tabs/combat-tab.js`) ✅ ĐÃ FIX

53. **addLog dùng sai type — mọi line đều player/enemy/system** → Engine phân loại log không theo ngữ nghĩa, làm mất màu sắc phân biệt. Fix: reclassify 8 addLog calls: dodge → `'miss'`, stun/burn/berserk → `'debuff'`, enemy heal → `'heal'`, bại trận → `'flee'`, combo hit → `'combo'`. Thêm `wasCombo` flag trước damage calc để detect combo. (`js/combat/combat-engine.js`) ✅ ĐÃ FIX

54. **CSS thiếu class cho 5 log type mới + `_formatLogLine` thiếu badge** → Thêm vào `combat.css`: `.log-miss` (xanh nhạt italic), `.log-heal` (xanh lá + bg mờ), `.log-debuff` (tím + bg mờ), `.log-flee` (cam italic), `.log-combo` (vàng + bg mờ); 4 badge CSS; override `.log-num` màu theo type (heal→xanh, combo→vàng sáng+glow). Thêm vào `_formatLogLine`: badge entries cho 5 type mới; regex bắt "mất N" không có unit; full-line highlight theo type thay vì keyword để tránh conflict. (`css/combat.css`, `js/ui/tabs/combat-tab.js`) ✅ ĐÃ FIX

**Files thay đổi trong P2:** `combat-engine.js`, `combat-tab.js`, `combat.css`, `HANDOFF.md`

### P3 — Luyện Đan Gate Cứng (2026-05-08)

55. **`rollCoDuyen` không có `extraCondition` hook** → Các event có điều kiện phức tạp (ví dụ: "chưa mở nghề X" hoặc "ngoTinh ≥ N") không thể express qua `conditions` array thông thường — phải dùng string flag, gây coupling. Fix: thêm `extraCondition(G)` optional field vào filter loop của `rollCoDuyen`; nếu field tồn tại và return `false` thì event bị loại. Không breaking change — event không có field này vẫn pass. (`js/core/co-duyen.js`) ✅ ĐÃ FIX

56. **`applyCoduyen` không có effect type `unlock_profession`** → Không có cách cơ duyên mở nghề nghiệp. Fix: thêm `case 'unlock_profession'` vào switch — đảm bảo `G.flags.unlockedProfessions` là array, push `effect.profId` nếu chưa có, hiện thông báo tên nghề. Nếu đã có nghề rồi → fallback thưởng 500 linh thạch (tránh waste roll). (`js/core/co-duyen.js`) ✅ ĐÃ FIX

57. **Không có cơ duyên mở Luyện Đan cho người không có Hỏa căn** → Player thiếu Hỏa căn không có đường mở Luyện Đan (auto-unlock yêu cầu Hỏa + ngoTinh ≥ 40). Fix: thêm event `cd_dan_kinh_co_nhan` (tier 2, baseChance 0.006) — điều kiện `ngoTinh ≥ 20` + chưa có `luyen_dan`, trigger khi `explore` hoặc `meditate`, unlockRealm 0. Effect: `unlock_profession` mở `luyen_dan`. Đây là path thay thế cho player không Hỏa căn. (`js/core/co-duyen.js`) ✅ ĐÃ FIX

58. **Locked card Luyện Đan chỉ hiển thị 1 điều kiện mơ hồ** → UI cũ chỉ show "Cần Hỏa căn + ngoTinh 40" — không giải thích path thay thế (cơ duyên), không có progress bar, không có context. Fix: viết lại `_renderLuyenDanProgress` thành 2 path box riêng biệt: **Path 1** (border cam) — auto-unlock qua Hỏa căn: show linh căn hiện tại + progress bar ngoTinh → 40 + contextual message (không Hỏa / Hỏa nhưng chưa đủ / Hỏa + đủ điều kiện). **Path 2** (border tím) — cơ duyên: giải thích hệ thống cơ duyên + progress bar ngoTinh → 20 (hoặc "✦ Đủ điều kiện" nếu đã ≥ 20). (`js/ui/tabs/nghe-nghiep-tab.js`) ✅ ĐÃ FIX

**Files thay đổi trong P3:** `co-duyen.js`, `nghe-nghiep-tab.js`, `HANDOFF.md`

### P9 — Trận Pháp Redesign: Hệ Vật Liệu Mới (2026-05-08)

59. **Vật liệu Trận Pháp cũ là nguyên liệu dược liệu thô — sai triết lý** → Trận Pháp dùng `spirit_herb`, `earth_stone`, `wolf_fang`... giống y chang Luyện Đan. Không có rào cản cơ duyên, không tốn đầu tư đặc thù, ai cũng dễ dàng deploy. Redesign: đổi sang hệ 3 vật liệu trận chuyên dụng (`tran_ky` 🚩 / `tran_ban` 🎴 / `tran_nhan` 🔵) tạo ra gate tự nhiên theo tier và nguồn lực.

**Hệ vật liệu mới:**
- `tran_ky` (Trận Kỳ): Tier 1–2, craft dễ (80% thành công, hoàn nguyên liệu nếu thất bại), mua shop 200💎
- `tran_ban` (Trận Bàn): Tier 2–4, craft vừa (60%, mất ½ nếu thất bại), mua shop 700💎  
- `tran_nhan` (Trận Nhãn): Tier 3–5, craft khó (40%, mất tất cả nếu thất bại), mua shop 3000💎 (realm 1+), chủ yếu từ cơ duyên

**Schema materials theo tier:**
- Tier 1: `tran_ky×2` | Tier 2: `tran_ky×4 + tran_ban×1` | Tier 3: `tran_ban×2 + tran_nhan×1` | Tier 4: `tran_ban×3 + tran_nhan×2` | Tier 5: `tran_ban×2 + tran_nhan×3`

**Files thay đổi trong P9:**
- `alchemy/alchemy-data.js` — Thêm `tran_ky`, `tran_ban`, `tran_nhan` vào `INGREDIENTS` (zone: 'craft')
- `alchemy/crafting-data.js` — Thêm export `TRAN_MAT_RECIPES` (3 công thức chế tạo, không cần Bễ Rèn)
- `alchemy/tran-phap-data.js` — Cập nhật `materials` toàn bộ 35 ARRAY_RECIPES sang hệ mới; combat bonuses giữ nguyên
- `ui/tabs/professions/tran-phap-tab.js` — Redesign: thêm stock bar kho vật liệu, section chế tạo vật liệu, material display đặc biệt với màu riêng, hint chỉ về section chế tạo khi thiếu nguyên liệu
- `ui/tabs/nghe-nghiep-tab.js` — Wire event `tp-craft-mat-btn` → `actions.craftTranMat`
- `main.js` — Thêm `craftTranMat(recipeId)` action (import `TRAN_MAT_RECIPES` + `getArrayMasterRank`, check rank trận pháp sư, roll thành/thất bại, apply failEffect)
- `core/data.js` — Thêm 3 shop items (`shop_tran_ky`, `shop_tran_ban`, `shop_tran_nhan`) với `type:'ingredient'`
- `core/systems/inventory.js` — Thêm `case type === 'ingredient'` trong `buyItem` → cộng vào `G.alchemy.ingredients`

### P11 — NPC Rivals System (2026-05-09)

60. **NPC_RIVALS (9 đối thủ) được định nghĩa trong data.js nhưng không có encounter logic** → Đối thủ chỉ là data tĩnh, không xuất hiện trong game. Fix: tạo đầy đủ encounter system gồm trigger + popup dialog + combat + Danh Vọng reward.

**Kiến trúc hệ thống:**
- `rollRivalEncounter(G, actionType)` — trigger check trong `co-duyen.js`; xác suất 0.4%/action; cooldown 4h real time; filter đối thủ theo `realmIdx ±1` so với player; ưu tiên đối thủ chưa gặp; emit `rival:encounter` bus event
- `showRivalEncounterPopup(G, rival, callbacks)` — modal 3 nút trong `misc-popups.js`: **Thi Đấu** (emit `rival:start_combat`), **Trao Đổi** (inline panel ingredients), **Bỏ Qua**
- `rival:start_combat` handler trong `event-bus-handlers.js` — build combat state từ `RIVAL_ATK/DEF/HP` base theo realmIdx × stage modifier (`1 + stage×0.07`), gắn `isNpcRival:true` + `_rivalData` vào enemy object
- `combat:end` handler — detect `enemy.isNpcRival` → tăng `G.danhVong` theo `RIVAL_DV_REWARD[realmIdx]`, ghi vào `G._rivalBeaten[name]`

**Trao Đổi — per-rival trade items (vào `G.alchemy.ingredients`):**
- Vân Tiêu: earth_stone×5 (80💎), wolf_fang×3 (120💎)
- Đan Mai: jade_lotus×3 (150💎), cloud_mushroom×5 (60💎)
- Thiết Minh: earth_stone×8 (60💎), demon_core_1×2 (180💎)
- Hỏa Linh Nhi: blood_ginseng×2 (280💎), spirit_herb×10 (80💎)
- Huyền Kỳ: tran_ky×2 (150💎), moon_dew×3 (200💎)
- Lăng Phong: lightning_core×1 (400💎), wolf_fang×5 (100💎)
- Bắc Minh: demon_core_1×3 (180💎), blood_ginseng×1 (350💎)
- Bạch Diệu: blood_ginseng×2 (250💎), jade_lotus×5 (200💎)
- Vân Tiêu Thần: dragon_scale×1 (2000💎), lightning_core×3 (500💎)

**Danh Vọng reward khi thắng:**
`RIVAL_DV_REWARD = [10, 22, 50, 90, 150]` — index theo realmIdx (0=LK, 1=TC, 2=KĐ, 3=NA, 4=HT)

**State mới trong G:**
- `G._rivalEncounterCd` — timestamp cooldown next encounter (ms)
- `G._rivalBeaten[name]` — số lần đã thắng mỗi đối thủ

**Trigger points:** `explore` action (cultivation.js) và `combat` win (combat-engine.js, skip nếu đang dungeon hoặc vừa thắng rival)

**Files thay đổi trong P11:**
- `core/co-duyen.js` — Import `NPC_RIVALS`; export `RIVAL_DV_REWARD`, `rollRivalEncounter`
- `app/popups/misc-popups.js` — Export `showRivalEncounterPopup` với RIVAL_TRADES map + normName helper
- `app/event-bus-handlers.js` — Import `RIVAL_DV_REWARD`, `showRivalEncounterPopup`; wire `rival:encounter`, `rival:start_combat`; update `combat:end` cho isNpcRival
- `core/systems/cultivation.js` — Import + call `rollRivalEncounter` trước `rollCoDuyen` trong explore
- `combat/combat-engine.js` — Import + call `rollRivalEncounter` sau combat win (skip dungeon + rival)
- `docs/HANDOFF.md` — Bus events list + session entry

### S-Phase2 — UX Polish (2026-05-07)

43. **Notification bar click ẩn world map** → click notification gọi `switchTab(tabId, G)` trong `render-core.js` — hàm này hide tất cả panels trừ target, làm mất world map background. Fix: thay bằng `document.dispatchEvent(new CustomEvent('tab:open-popup', { detail: { tabId } }))`. Main.js lắng nghe event này và gọi `_switchTabWithPopup(tabId)`. Tránh circular import `render-core → tab-popup → render-core`. ✅ ĐÃ FIX

44. **Popup không bring-to-front khi click** → PopupManager không có z-index stacking — popup bị che khuất sau popup khác, click vào không lên trên. Fix: thêm `_zCounter = 400` module-level; trong `_buildEl` thêm `mousedown` listener (capture phase) tăng counter và set `el.style.zIndex`; khi `open()` popup mới cũng set z-index để luôn ở trên cùng. ✅ ĐÃ FIX

45. **Dead code `_showHuntPopup` chứa pattern sai** → `_showHuntPopup` trong `location-popup.js` gọi `actions.switchTab('combat')` sau `actions.startHunt()` (race condition — combat chưa start mà đã mở popup). Hàm này KHÔNG BAO GIỜ được gọi (dead code). Fix: xóa toàn bộ hàm khỏi `location-popup.js`. Live paths (`_wireLocPopupActions → lp-enemy-row click`) đã đúng — chỉ gọi `actions.startHunt()`, tab switch do `mapActions.startHunt` xử lý nội bộ sau travel overlay. ✅ ĐÃ FIX

**Files thay đổi trong S-Phase2:** `render-core.js`, `main.js`, `popup-manager.js`, `location-popup.js`

### S-Phase1 — Refactor: Tab Visibility + Bug Fixes (2026-05-07)

40. **Notification spam: "Linh lực đầy — tích Thuần Độ (X%)" re-appear sau dismiss** → `contentKey` dùng `icon + text` làm key; `pct` thay đổi mỗi tick → key thay đổi → `_notifDismissedKey` không khớp → notification tái hiện. Fix: thêm `key` field vào tất cả notification objects có variable content (`qi_full_purity`, `breakthrough_ready`, `duoc_dien_ready`, `linh_thu_hungry`, `am_thuong_warning`, `lifespan_critical`, `lifespan_warning`, `nghiep_high`, `nghiep_medium`, `tranphap_critical`, `tranphap_warning`). Đổi `contentKey = shown.map(n => n.key || (n.icon + n.text)).join('|')` trong `render-core.js`. ✅ ĐÃ FIX

41. **Warning purity 50-74% trước đột phá thiếu hậu quả cụ thể** → Button chỉ nói "Guaranteed Fail" nhưng không nêu stat loss. Fix: thêm div cảnh báo đỏ bên dưới button khi `btRatio < 0.75`, liệt kê: Linh lực −40% · Thuần Độ −50% · Tâm Cảnh −15~25 · mất 3~7 năm tuổi thọ + gợi ý chờ ≥75%. (`char-popup.js`) ✅ ĐÃ FIX

42. **Double-gate: nav-progression.js vs visibility.js — hai nguồn truth gây mâu thuẫn** → `nav-progression.js` có lock icon logic độc lập với `visibility.js`; tab có thể "visible nhưng 🔒" gây UX kỳ lạ. Fix: `visibility.js` → single source of truth. `nav-progression.js` → thin shim re-export từ `visibility.js`. `render-core.js` → import trực tiếp `{ getVisibleTabs, isTabVisible, getUnlockMessages }` từ `visibility.js`; `renderNav` chỉ show/hide, không có lock icon. `main.js` → dùng `isTabVisible` thay `isTabUnlocked_`. Tab conditions mới (tất cả trong `visibility.js`): skills: stage≥3 || kills≥5; passive/combat: realm≥1; alchemy: stage≥2 || hasIngredients; equipment: kills≥3; ranking: stage≥3; dungeon: dungeonQuestDone || realm≥2. ✅ ĐÃ FIX

**Files thay đổi trong S-Phase1:** `render-core.js`, `char-popup.js`, `core/visibility.js`, `ui/nav-progression.js` (shim), `main.js`

### S-H5 — Bug Fix: 3 lỗi UI (2026-05-07)

37. **panel-cultivate bị ẩn khi mở tab popup** → `openTabPopup()` gọi `switchTab(tabId, G)` → `switchTab` ẩn `panel-cultivate` → world map background mất. Fix: thay `switchTab(tabId, G)` bằng minimal nav update (set `G.activeTab`, update nav buttons, dispatch `tab:switch` event, đóng more-panel) — KHÔNG touch panel visibility. Export thêm `isAnyTabPopupOpen()` từ `tab-popup.js`. ✅ ĐÃ FIX

38. **Không có button về trang giao diện chính** → "Tu Luyện" nav button chỉ mở Tu Luyện popup, không có cách đóng tất cả popup và về world map canvas. Fix: `wireNavBtn` cultivate toggle — nếu `isAnyTabPopupOpen()` thì `closeAllTabPopups()` (về home), nếu không thì `openTuLuyenPopup()` như bình thường. Import `isAnyTabPopupOpen` vào `main.js`. ✅ ĐÃ FIX

39. **Bounty board + daily quests hiện ngay từ đầu game** → `quest-tab.js` render 3 bounties (`unlockRealm:0`) và daily quests ngay lần đầu vào — vi phạm Manifesto §6 ("tránh quest checklist arcade"). Fix: thêm guard `hasQuestActivity = npcActive.length > 0 || G.quests.completed.length > 0` — bounties và daily chỉ hiện sau khi player đã nhận ít nhất 1 NPC quest hoặc hoàn thành 1 quest. ✅ ĐÃ FIX

### S-H4 — Feature: Tách Nav + Popup Tu Luyện mới (2026-05-07)

36. **"Tu Luyện" nav button chỉ là nút "home" (close all popups) — không cung cấp UI cultivation** → Tạo `js/ui/tu-luyen-popup.js` với popup floating via PopupManager (id: `tu-luyen`, width 300px, góc phải màn hình). Popup hiển thị toàn bộ cultivation context: bars qi/hp/stamina, stats grid (tu tốc/thuần độ/atk/def), pháp địa + số công pháp đang tu, hunger/ám thương indicators, 6 action buttons (Nhập Định span toàn hàng + 5 action button 3-cột), Đột Phá button với pulse animation. `wireNavBtn` trong `main.js` special-case `tabId === 'cultivate'` → `openTuLuyenPopup(G, cultivateActions)`. `_switchTabWithPopup('cultivate')` (dùng cho programmatic nav như combat end/flee) **không đổi** — vẫn đóng tab popups về background canvas. `updateTuLuyenPopup(G)` gọi mỗi 2 ticks trong gameTick. CSS thêm vào `systems.css`. ✅ ĐÃ FIX

### S-H2 — Bug Fix: Nhập Định báo "hết linh thạch" khi mới tạo char (2026-05-07)

35. **Notification "Hết linh thạch" fire ngay khi char mới bấm nhập định** → `fresh-state.js` khởi tạo `stone:0`; notification check trong `render-core.js` (`if G.meditating && stone <= 0`) kích ngay. Song song, `stoneMod=0.05` trong `tick.js` giảm qi rate 95% âm thầm. Phàm Địa có `costType:'none'` — không nên có stone drain hay penalty. Fix:
  - `tick.js`: R1 stone drain + stoneMod guard bằng `phapDia !== 'pham_dia'`; tại Phàm Địa `stoneMod=1.0`, `stoneStarved=false`
  - `render-core.js`: notification R1 cũng guard `phapDia !== 'pham_dia'` — stone warning chỉ hiện từ Linh Địa trở lên
  ✅ ĐÃ FIX

### S-H1 — Bug Fix: Khí Vận cap theo linh căn (2026-05-07)

34. **khiVan không có trần theo loại linh căn** → tick regen trong `main.js` dùng `Math.min(100, ...)` cho mọi LC → NGU LC có thể leo lên 100 sau đủ thời gian (100 ticks × giây). Ngoài ra `kvRanges` trong `applyCharacterSetup` thiếu key `kim`, `moc` (chỉ có `jin`, `mu`). Fix:
  - Thêm `getKhiVanMax(G)` export từ `co-duyen.js` → NGU=45, TU=55, TAM=65, SONG=75, BIEN_DI=90, TIEN=100 (legacy fallback theo spiritRoot string)
  - Thay `Math.min(100, ...)` bằng `Math.min(getKhiVanMax(G), ...)` ở 3 chỗ: tick regen `main.js`, tier boost & `khivan_boost` case trong `applyCoduyen`
  - Fix `kvRanges` trong `cultivation.js`: thêm `kvTypeRanges` (ưu tiên) + key mới `kim:[20,45]`, `moc:[15,40]` vào legacy ranges
  ✅ ĐÃ FIX

### S-G — LK End-to-End Playtest & Balance (2026-05-06)

32. **Chicken-and-egg: `luyen_dan` auto-unlock không bao giờ fire** → `_tryAutoUnlock` chỉ gọi trong `renderNgheNghiepTab`, nhưng `nghe_nghiep` tab không hiện trong nav khi `flags.unlockedProfessions` trống → player có Hỏa root + ngoTinh≥40 không bao giờ thấy tab nghề nghiệp → fix `visibility.js`: thêm check `luyenDanEligible` trực tiếp (spiritData.points.huo > 0 && ngoTinh >= 40) → show `nghe_nghiep` → mở tab → `_tryAutoUnlock` fires bình thường ✅ ĐÃ FIX

33. **`fresh-state.js` tutorial thiếu `panelDismissed`** → default state không có field này; `ensureTutorialState()` patch được nhưng state không nhất quán → thêm `panelDismissed: false` vào `fresh-state.js` ✅ ĐÃ FIX

**Playtest confirmations (không cần fix):**
- Tutorial steps 0-6: logic đúng, wiring đúng (main.js tick + action handlers)
- `panelDismissed` guard: panel không tự bật lại sau khi đóng ✅
- Nút reopen "📖 Cẩm nang" hoạt động đúng ✅
- Age warning modal step 5: trigger once, acknowledge → advance ✅
- Gate system: shop ẩn khi chưa gặp NPC ✅, quest tab empty state ✅, profession locked card ✅
- Time engine: 1s thực = 30 phút game (YEARS_PER_TICK × dt × 10 = đúng) ✅
- Breakthrough chance Ngũ LC LK1 (purity đủ): P_base=0.90 × F_lingcan=0.4 × F_purity=1.0 × F_ngotinh=1.0 × F_tamcanh=0.9 ≈ **32.4%** — thấp nhưng không bằng 0 ✅ đúng thiết kế
- purityThresholds LK đã calibrate từ S9, không cần thay đổi ✅
- canCotBonus từ tay_tuy_quyet đã apply qua `calcEffectiveCanCot` ✅
- Audit #1,2,6,7,8 đã fix từ S-F, không có regression ✅

**UX concern đã fix (S-Phase1 #41):**
- Purity 50-74%: button đã hiện warning + liệt kê stat loss cụ thể (xem #41 ở trên). ✅

### S-E — Profession Gates (2026-05-06)
31. Tab Nghề Nghiệp hiển thị nội dung Trận Pháp/Phù Chú/Khôi Lỗi dù chưa unlock → vi phạm triết lý "không phải ai cũng theo được mọi nghề" → tạo profession gate system:
  - `js/ui/tabs/nghe-nghiep-tab.js`: sửa `_isUnlocked()` dùng `G.flags.unlockedProfessions` thay `unlockRealm/Stage`; thêm `_tryAutoUnlock(G)` (Luyện Đan: ngoTinh≥40 + Hỏa root; Linh Thực: kitchen≥1); thêm `_renderLockedCard(prof, G)` hiển thị tên+mô tả+điều kiện mờ; locked button vẫn clickable để xem điều kiện; kho nguyên liệu chỉ hiện khi nghề đã unlock
  - `js/core/state/persistence.js`: fix `_inferUnlockedProfessions()` dùng đúng id `luyen_dan` (thay `alchemy`) và thêm `luyen_khi` inference
  - `css/craft-popup.css`: thêm CSS cho `.nn-locked-card`, `.nn-lc-*`, `.nn-lock-grid`, `.nn-sidebar-hint`; sửa `.nn-prof-locked` cho phép click
  ✅ ĐÃ FIX

**Điều kiện mở nghề (S-E + P4):**
| Nghề | ID | Điều kiện |
|---|---|---|
| Luyện Đan | `luyen_dan` | ngoTinh ≥ 40 + linh căn Hỏa (auto-unlock), hoặc cơ duyên `cd_dan_kinh_co_nhan` (ngoTinh≥20, không cần Hỏa) |
| Luyện Khí | `luyen_khi` | **Auto-unlock LK5+** (realmIdx>0 hoặc stage≥5), hoặc cơ duyên `cd_luyen_khi_lo_ren` (LK4+, explore/combat) |
| Trận Pháp | `tran_phap` | Cơ duyên `cd_tran_kinh_phe_tich` (LK4+, explore/array) |
| Phù Chú   | `phu_chu`   | Cơ duyên `cd_phu_chu_bi_thu` (LK4+, explore/meditate) |
| Khôi Lỗi  | `khoi_loi`  | Cơ duyên `cd_khoi_loi_cuon_ky` (LK4+, explore/combat) |
| Linh Thực | `linh_thuc` | Bếp Linh Thực level ≥ 1 (auto-unlock), hoặc Linh Địa |

### P5 — NPC Dialogs: Các Zone Chính (2026-05-08)

59. **NPC_DIALOGS 5 zone chính đã có 2 lore entry từ session trước, HANDOFF chưa cập nhật + thiếu lore thứ 3** → Các zone Vạn Linh Thị, Hắc Phong Lâm, Địa Phủ Môn, Ẩn Long Động, Linh Dược Cốc đã có `greeting`/`greetingDV`/`lore`/`lore_*` từ session trước nhưng chưa đạt "tối thiểu 2-3 dialog lines" mỗi zone. Fix: thêm lore thứ 3 cho từng NPC — `lore_trap` (Vạn Linh Thị: cảnh báo cạm bẫy chốn thị), `lore_track` (Hắc Phong Lâm: đọc dấu vết yêu thú), `lore_floors` (Địa Phủ Môn: cấu trúc các tầng sâu), `lore_danger` (Ẩn Long Động: nguy hiểm Long Uyên), `lore_caution` (Linh Dược Cốc: sai lầm phổ biến khi luyện đan); thêm option button tương ứng vào mỗi NPC. Giữ tone "tu tiên khắc nghiệt" — cảnh báo thật, không thưởng miễn phí. (`js/ui/location-popup.js`) ✅ ĐÃ FIX

**Files thay đổi trong P5:** `location-popup.js`, `HANDOFF.md`

### S-P4 — Nghề Phụ Gate Hoàn Chỉnh (2026-05-08)
32. 4 nghề tran_phap/phu_chu/khoi_loi/luyen_khi chỉ có flags-only, không có con đường mở cụ thể → bổ sung:
  - `js/core/co-duyen.js`: **phục hồi file bị truncate** (14 dòng cuối mất); thêm 4 cơ duyên tier-2 mở nghề (`cd_luyen_khi_lo_ren` baseChance 0.005, `cd_tran_kinh_phe_tich`/`cd_phu_chu_bi_thu`/`cd_khoi_loi_cuon_ky` baseChance 0.004 — tất cả yêu cầu LK4+, `extraCondition` check stage+realmIdx+chưa unlock); thêm `case 'unlock_profession'` trong `applyCoduyen` (push profId vào `G.flags.unlockedProfessions`, fallback +1000 exp nếu đã có)
  - `js/ui/tabs/nghe-nghiep-tab.js`: thêm `luyen_khi` auto-unlock trong `_tryAutoUnlock` (LK5+ = realmIdx>0 || stage≥5); đổi `unlockHint` của 4 nghề thành "Học từ cao nhân, hoặc chờ cơ duyên (LK tầng X+)" rõ ràng; đổi tên `_renderLuyenDanProgress` → `_renderLockedProfProgress` + mở rộng cho cả 4 nghề (mỗi nghề hiện progress block tương ứng — Luyện Khí có block auto-unlock LK5, ba nghề còn lại chỉ có block cơ duyên LK4+)
  ✅ ĐÃ FIX

### S-D — Quest System Redesign LK (2026-05-06)
30. Tab Nhiệm Vụ hiển thị danh sách quest dài sẵn có ngay từ đầu game, không ai giao → vi phạm Manifesto §6 → tạo hệ thống NPC-gated:
  - `js/quest/quest-data.js`: thêm `NPC_QUESTS` (5 quest LK, có `givenBy`, `giveCondition`, `unlocks`) và `NPC_QUEST_MAP`
  - `js/quest/quest-engine.js`: thêm `giveQuestFromNPC(G, npcId)`, `getNpcPendingQuest(G, npcId)`, `getActiveNpcQuests(G)`, `G.quests.npcActive[]`; bỏ auto-accept side quests trong `initQuestSystem`
  - `js/ui/tabs/quest-tab.js`: empty state "Ngươi chưa nhận nhiệm vụ từ ai", hiển thị `npcActive` riêng, ẩn "Available Quests"
  - `js/ui/location-popup.js`: NPC dialog nhận quest qua nút "Nghe Việc Nhờ", import `getNpcPendingQuest/giveQuestFromNPC`
  - `js/ui/starter-village.js`: indicator `!` (vòng tròn vàng) trên node NPC khi `getNpcPendingQuest` trả về quest
  ✅ ĐÃ FIX

**NPC Quest List (LK):**
| Quest ID | NPC | Làng | Điều kiện |
|---|---|---|---|
| `nq_01_clear_vermin` | `lao_duoc_su` | Thanh Phong Thôn | setupDone + LK tầng 1+ |
| `nq_02_herb_knowledge` | `lao_duoc_su` | Thanh Phong Thôn | `nq_01` hoàn thành |
| `nq_03_patrol_duty` | `lao_ngu_ong` | Lâm Hải Thôn | setupDone + LK tầng 1+ |
| `nq_04_river_secret` | `lao_ngu_ong` | Lâm Hải Thôn | `nq_03` hoàn thành |
| `nq_05_forge_test` | `dao_khach_gia` | Hỏa Diệm Thôn | setupDone + LK tầng 1+ |

**State mới:**
```js
G.quests.npcActive = [   // quest đã được NPC giao, đang thực hiện
  { questId, npcId, progress: {}, acceptedAt }
]
```

Migration cần thêm vào `persistence.js` (save cũ chưa có `G.quests.npcActive`):
```js
if (!G.quests.npcActive) G.quests.npcActive = [];
```
(Logic này đã có trong `initQuestSystem` — safe cho save cũ.)
29. Bottom nav hiển thị toàn bộ 19 tabs ngay từ đầu → vi phạm triết lý hardcore, overwhelm người mới → tạo `js/core/visibility.js` với `getVisibleTabs(G)`, wire vào `renderNav()` (ẩn button nếu tab chưa visible), wire vào `wireNavBtn` (toast nếu click button ẩn). Migration `_migrateFlags()` đảm bảo save cũ không mất tab. `G.flags` object thêm vào `fresh-state.js`. Programmatic tab switches (hunting, dungeon, combat end) KHÔNG bị gate. ✅ ĐÃ FIX

### S-A — Fix Tutorial Panel Re-trigger (2026-05-05)
27. Tutorial panel tự bật lại ngay sau khi đóng — `renderTutorialObjectivePanel()` gọi mỗi tick, không có guard cho trạng thái "người chơi đã đóng tay" → thêm `G.tutorial.panelDismissed` flag; khi user bấm X, `onClose` callback set flag `true`; `renderTutorialObjectivePanel` không auto-open nếu flag đang `true`; flag reset về `false` tự động khi `_advance()` chuyển step mới ✅ ĐÃ FIX

### S-C - Fix Shop + Linh Thu access ✅ ĐÃ FIX

28. Không có nút mở lại tutorial panel sau khi đóng (HANDOFF §4 spec) → thêm `_renderTutorialReopenBtn()` trong `render-core.js`: nút `#tutorial-reopen-btn` class `.tutorial-reopen-btn` fixed-position góc phải màn hình, chỉ hiện khi `panelDismissed=true`, click → reset flag + reopen panel; CSS thêm vào `tutorial.css` ✅ ĐÃ FIX

### S11
14. `calcCultivationMultiplier()` dùng `congPhap.rateMultiplier` (field không tồn tại) → xóa dead code khỏi `phap-dia.js` (Audit #3 ✅)
15. `doArray()` đã dùng `eventRateBonus`/`eventRateTimer` (buff 300s, tự expire) thay vì cộng `qiBonus` permanent — xác nhận đã fix, đánh dấu chính thức (Audit #4 ✅)

---

## AUDIT MISMATCHES (2026-04-01)

Các mục dưới đây là sai lệch đã xác minh giữa tài liệu và code hiện tại:

1. ~~**Scope Nhân Giới lệch:** `data.js` vẫn có realm sau Hóa Thần (Luyện Hư, Hợp Thể...).~~ ✅ **ĐÃ FIX** (S-F) — `tian_jie_dragon` và `heaven_collapse` (unlockRealm:5) xóa khỏi `combat-data.js`; REALMS đã đúng 0-4.
2. ~~**Thiên Kiếp lệch triết lý:** vẫn còn state/logic `tianJie` trong combat và content map.~~ ✅ **ĐÃ FIX** (S-F) — Xóa `startTianJie`, xóa `isTianJie/tianJieWave/tianJieTotalWaves/tianJieBoss` khỏi `fresh-state.js` và `combat-engine.js`; `combat-tab.js` flee button không còn check isTianJie.
3. ~~**Dead code lỗi:** `calcCultivationMultiplier()` dùng `congPhap.rateMultiplier` (không tồn tại) và không được dùng.~~ ✅ **ĐÃ FIX** (S11)
4. ~~**Stack vĩnh viễn:** `doArray()` cộng `qiBonus` permanent, chưa có cap/timer.~~ ✅ **ĐÃ FIX** (S11) — dùng `eventRateBonus`/`eventRateTimer` (buff 300s, tự expire)
5. ~~**Buff không có tác dụng:** `tay_tuy_quyet` tạo `canCotBonus` nhưng chưa được apply vào hệ stat/chance.~~ ✅ **ĐÃ FIX** — `calcEffectiveCanCot(G)` trong `computed.js`, `breakthrough.js` dùng hàm này
6. ~~**Linh Địa chưa có phí định kỳ:** hiện chỉ trừ stone một lần khi chuyển map.~~ ✅ **ĐÃ FIX** (S-F) — `checkLinhDiaFee(G)` trong `phap-dia.js` gọi mỗi tick, trừ 150💎/năm game; cảnh báo khi thiếu stone nhưng không kick; wired qua `gameTick` trong `tick.js`.
7. ~~**Prestige lệch mặc định lò:** `_freshMini()` đặt `furnaceLevel=1` trong khi state chuẩn là `0`.~~ ✅ **ĐÃ FIX** (S-F) — Sửa thành `furnaceLevel:0` trong `_freshMini()` (`tick.js`).
8. ~~**Sect rank check không đồng bộ:** `phap-dia.js` tự tính rank bằng `Math.floor(exp/500)` thay vì dùng rank helper tông môn.~~ ✅ **ĐÃ FIX** (S-F) — Import `SECT_RANKS` từ `sect-data.js`, dùng loop đúng thay vì hardcode.

---

## LƯU Ý KỸ THUẬT

```js
// ---- Tu Luyện Popup (S-H4) ----
// openTuLuyenPopup(G, cultivateActions) — mở/focus popup id 'tu-luyen' (300px, góc phải)
// updateTuLuyenPopup(G) — cập nhật values, gọi mỗi 2 ticks trong gameTick
// isTuLuyenPopupOpen() — PopupManager.isOpen('tu-luyen')
// Nav "Tu Luyện" button → openTuLuyenPopup (KHÔNG phải _switchTabWithPopup('cultivate'))
// _switchTabWithPopup('cultivate') vẫn dùng cho programmatic nav (combat end, flee, v.v.)
// Popup KHÔNG phải tab-popup: không dùng TAB_POPUP_CFG, không move panel DOM
// CSS: class .pm-tu-luyen trong systems.css, elements dùng prefix id tlp-*

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
rival:encounter, rival:start_combat
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
- ~~**NPC dialog cho zone chính** — Vạn Linh Thị, Hắc Phong Lâm, Địa Phủ Môn, Ẩn Long Động, Linh Dược Cốc~~ ✅ **DONE (P5)** — 5 zone có đủ 3 lore entry/NPC; thêm 1 lore nữa cho Thiên Kiếp Địa nếu cần
  File: `js/ui/location-popup.js` → thêm vào `NPC_DIALOGS`
- **Cơ Duyên events TC/KĐ/NA** — hiện 52 events hầu hết cho LK
  File: `js/core/co-duyen.js`
- **Công pháp bổ sung** — cần thêm nhiều loại phong phú hơn cho tán tu
  File: `js/core/phap-dia.js` → `CONG_PHAP_LIST`

### ⬜ Thiết kế còn lại (chưa code)
- ~~**Trận Pháp redesign**~~ ✅ **DONE (P9)** — materials mới (tran_ky/tran_ban/tran_nhan), 3 TRAN_MAT_RECIPES, shop items, craftTranMat action
- ~~**NPC Rivals encounter system**~~ ✅ **DONE (P11)** — rollRivalEncounter trigger, dialog popup 3 lựa chọn, combat integration, Danh Vọng reward
- ~~**Luyện Đan rào cản**~~ ✅ **DONE (P3)** — gate đã có: auto-unlock (Hỏa + ngoTinh≥40) + cơ duyên path (ngoTinh≥20); UI locked card 2 path boxes
- **6 nghề phụ cần cơ duyên** — không phải ai cũng theo được, cần rào cản mở nghề

### ⬜ Polish
- ~~**Combat log formatting**~~ ✅ Fix P2 #52-54 — 5 type mới (miss/heal/debuff/flee/combo), badge prefix, số highlight theo màu type
- **Mobile UI** — responsive improvements (panel-center bottom đã fix, còn touch drag/resize)
- ~~**Notification clickable**~~ ✅ Fix S-Phase2 #43 — dispatch `tab:open-popup` event
- ~~**Thông báo chớp liên tục**~~ ✅ Fix S-Phase1 #40 — stable `key` field
- ~~**Popup z-index / focus**~~ ✅ Fix S-Phase2 #44 — `_zCounter` stacking trong PopupManager

### ⬜ Kỹ thuật
- **Balance playtesting** — TC/KĐ/NA purityThresholds chưa calibrate
- **Thuần thục công pháp balance** — tốc độ tăng cần test thực tế
- **Firebase deploy** — Auth + Firestore production
- ~~**Auth typo cleanup**~~ — ✅ Đã fix toàn bộ `_onAuthReady` → `_onAnonReady`
- ~~**Cleanup scope**~~ ✅ Fix P1 #49,50 — `canPrestige` gate đúng realm 4; `portrait.js` clamp về 4; `tianJie` references còn lại là lore/map location hợp lệ, không phải combat mechanic cũ
- ~~**Apply canCotBonus từ tay_tuy_quyet**~~ ✅ Đã fix — `calcEffectiveCanCot(G)` trong `computed.js` + `breakthrough.js` (Audit #5)
- **Linh Địa monthly fee** — thêm cơ chế trừ phí định kỳ theo game-time
- ~~**Chuẩn hóa timer Trận Pháp**~~ ✅ Fix P1 #51 — comment cập nhật rõ "giây THỰC"; logic drain giữ nguyên (đã đúng)

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