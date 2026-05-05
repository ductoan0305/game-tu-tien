# SESSION PLAN — Tu Tiên Idle Game
**Tạo lúc:** 2026-05-05  
**Mục tiêu:** Làm chắc nền tảng Luyện Khí trước khi mở rộng  
**Nguyên tắc:** Mỗi session = 1 việc duy nhất. Đọc HANDOFF.md trước khi làm bất cứ thứ gì.

---

## TRẠNG THÁI CÁC SESSION

| # | Tên | Trạng thái | Ghi chú |
|---|-----|-----------|---------|
| S-A | Fix Tutorial Panel | ⬜ Chưa làm | |
| S-B | Xây Visibility Gate System | ✅ Xong (2026-05-05) | visibility.js, flags, migration, renderNav |
| S-C | Fix Shop + Linh Thu access | ⬜ Chưa làm | Cần S-B xong trước |
| S-D | Quest System redesign LK | ⬜ Chưa làm | Cần S-B xong trước |
| S-E | Profession Gates (Nghề nghiệp) | ⬜ Chưa làm | Cần S-B xong trước |
| S-F | Technical Debt Cleanup | ⬜ Chưa làm | Độc lập, làm bất cứ lúc nào |
| S-G | LK End-to-end Playtest & Balance | ⬜ Chưa làm | Làm sau cùng |

---

---

## SESSION S-A — Fix Tutorial Panel

**Trạng thái:** ⬜ Chưa làm

### Context cho AI

Đây là game tu tiên idle hardcore chạy trên browser, Vanilla JS + Firebase, không framework. Save key `tutien_v10`, version v12.

**Vấn đề cần fix trong session này:**

1. **Tutorial panel tự bật lại sau khi đóng.** Popup `data-popup-id="tutorial-panel"` khi người chơi bấm đóng thì tắt, nhưng ngay lập tức bật lại. Nguyên nhân: `updateTutorialStep()` được gọi mỗi game tick và re-trigger hiển thị panel mà không kiểm tra `seenHints`.

2. **Không có nút để mở lại tutorial.** Spec trong HANDOFF.md §4 quy định: "Nếu người chơi đóng panel, vẫn cho mở lại bằng nút 'Cẩm nang tân đạo hữu'." Nút này chưa tồn tại.

### Files cần đọc trước khi làm

```
idle-game/docs/HANDOFF.md          → Toàn bộ, đặc biệt phần IMPLEMENTATION SPEC V1
js/core/tutorial-engine.js         → Logic updateTutorialStep, seenHints
js/ui/render-core.js               → renderTutorialObjectivePanel()
js/main.js                         → Nơi gọi updateTutorialStep trong tick loop
js/ui/popup-manager.js             → PopupManager singleton, open/close/onClose
```

### Việc cần làm

1. **Fix re-trigger:** Trong `updateTutorialStep()` hoặc nơi gọi nó, thêm guard: nếu người chơi đã manually close panel (cần 1 flag `G.tutorial.panelDismissed = true`), thì không auto-show lại. Flag này chỉ reset khi step thay đổi (tức là khi người chơi hoàn thành điều kiện của step hiện tại).

2. **Thêm nút reopen:** Thêm 1 nút nhỏ cố định (ví dụ góc trái màn hình, hoặc trong HUD) có text "📖 Cẩm nang" — khi click thì mở lại tutorial panel và set `panelDismissed = false`.

3. **Giữ nguyên toàn bộ logic step 0-6**, không thay đổi balance hay flow tutorial.

### Tiêu chí nghiệm thu

- [ ] Bấm X đóng tutorial panel → panel tắt, KHÔNG tự bật lại
- [ ] Nút "Cẩm nang tân đạo hữu" (hoặc tương đương) tồn tại và mở lại panel khi click
- [ ] Sau khi mở lại, panel hiển thị đúng step hiện tại của tutorial
- [ ] Không có thay đổi nào ảnh hưởng đến balance hay game logic khác

### Sau khi xong

Cập nhật bảng SESSION PLAN phía trên: đổi S-A thành `✅ Xong` và ghi ngày. Thêm entry vào `BUGS ĐÃ FIX` trong HANDOFF.md.

---

---

## SESSION S-B — Xây Visibility Gate System

**Trạng thái:** ⬜ Chưa làm  
**Cần:** S-A hoàn thành trước

### Context cho AI

Đây là game tu tiên idle hardcore, Vanilla JS + Firebase. Game hiện tại expose toàn bộ 19 tabs từ đầu game — đây là vấn đề cốt lõi phá hỏng trải nghiệm. Session này xây module kiểm soát tập trung.

**Vấn đề:** Bottom nav hiển thị tất cả tabs ngay từ đầu. Người chơi mới chưa gặp NPC nào đã thấy shop, chưa học nghề đã thấy trận pháp. Điều này vi phạm triết lý hardcore của game.

### Files cần đọc trước khi làm

```
idle-game/docs/HANDOFF.md          → Toàn bộ: state G, TAB_IDS, triết lý
js/main.js                         → wireNavBtn, _switchTabWithPopup
js/ui/tab-popup.js                 → TAB_POPUP_CFG, openTabPopup
js/core/state/fresh-state.js       → createFreshState để biết default state
```

### Việc cần làm

Tạo file mới: `js/core/visibility.js`

Module này export 1 hàm duy nhất: `getVisibleTabs(G)` — trả về array các tabId được phép truy cập tại trạng thái hiện tại của người chơi.

**Logic gate theo thứ tự ưu tiên:**

```
LUÔN visible (không cần điều kiện):
  - cultivate     (màn hình chính)
  - skills        (kỹ năng cơ bản)
  - inventory     (túi đồ)
  - passive       (passive tree)
  - ranking       (bảng xếp hạng)

Mở khi setupDone === true:
  - quests        (chỉ sau khi có quest đầu tiên — xem S-D)
  - phapdia       (pháp địa)

Mở khi có tương tác NPC shop (G.flags?.shopUnlocked === true):
  - shop

Mở khi realmIdx >= 0 && stage >= 3 (LK trung kỳ):
  - alchemy
  - equipment

Mở khi realmIdx >= 0 && đã hoàn thành dungeon quest đầu:
  - dungeon

Mở khi đã join sect (G.sectId !== null):
  - sect

Mở khi có linh thú đầu tiên (G.linhThu.slots có ít nhất 1 non-null):
  - linh_thu

Mở khi đã mở nghề tương ứng (xem S-E):
  - nghe_nghiep
  - tran_phap
  - phu_chu
  - khoi_loi
  - linh_thuc

Mở khi realmIdx >= 1 (Trúc Cơ+):
  - combat (đầy đủ)
```

**Wiring vào main.js:**
- Sau khi tạo `visibility.js`, import `getVisibleTabs` vào `main.js`
- Trong hàm render bottom nav: ẩn/hiện buttons dựa theo `getVisibleTabs(G)`
- Trong `_switchTabWithPopup`: nếu tab không trong `getVisibleTabs(G)` → không mở, optionally show toast "Chưa mở khóa"

**Lưu ý quan trọng:**
- Thêm `flags: {}` vào `G` trong `fresh-state.js` nếu chưa có (để lưu `shopUnlocked` etc.)
- Thêm migration trong `persistence.js` để save cũ không bị lỗi
- Không thay đổi logic game, chỉ thay đổi visibility

### Tiêu chí nghiệm thu

- [ ] Save mới: bottom nav chỉ hiển thị tabs đúng điều kiện
- [ ] Shop KHÔNG xuất hiện trong nav khi chưa gặp NPC
- [ ] Các tabs unlock dần theo progression
- [ ] Save cũ vẫn load được (migration hoạt động)
- [ ] Không ảnh hưởng đến bất kỳ game logic nào

### Sau khi xong

Cập nhật SESSION_PLAN.md: S-B → `✅ Xong`. Thêm `visibility.js` vào ARCHITECTURE trong HANDOFF.md.

---

---

## SESSION S-C — Fix Shop + Linh Thu Access

**Trạng thái:** ⬜ Chưa làm  
**Cần:** S-B hoàn thành trước

### Context cho AI

Đây là game tu tiên idle hardcore, Vanilla JS + Firebase. Session S-B đã tạo `visibility.js` để gate tabs. Session này xử lý 2 vấn đề cụ thể còn lại:

1. **Shop** phải chỉ mở qua NPC interaction, không qua bottom nav trực tiếp.
2. **Linh Thu** tab có section "mua linh thú" ngay cả khi chưa unlock — cần ẩn section đó.

### Files cần đọc trước khi làm

```
idle-game/docs/HANDOFF.md
idle-game/docs/SESSION_PLAN.md     → Đọc để biết S-B đã làm gì
js/core/visibility.js              → Đã tạo ở S-B
js/ui/tabs/shop-tab.js (hoặc tương đương)
js/ui/tabs/linh-thu-tab.js (hoặc tương đương)
js/ui/starter-village.js           → NPC interaction logic
```

### Việc cần làm

**Part 1 — Shop:**
- Trong `starter-village.js` hoặc NPC interaction handler: khi player tương tác với NPC có shop → set `G.flags.shopUnlocked = true` → save → re-render nav
- Nút shop trong bottom nav giờ sẽ tự ẩn/hiện qua `visibility.js` (đã làm ở S-B)
- Thêm dialog NPC có dạng: "Ngươi muốn xem hàng hóa của ta?" → confirm → mở shop popup

**Part 2 — Linh Thu:**
- Trong render function của linh-thu tab: kiểm tra `G.linhThu.slots` có slot nào unlocked chưa
- Nếu chưa có linh thú → ẩn toàn bộ section "mua linh thú", chỉ hiện text mô tả và điều kiện mở khóa
- Section mua chỉ hiện khi đã có ít nhất 1 slot linh thú (do quest/cơ duyên mở)

### Tiêu chí nghiệm thu

- [ ] Shop không xuất hiện trong bottom nav khi chưa gặp NPC shop
- [ ] Sau khi gặp NPC shop → nút shop xuất hiện trong nav
- [ ] Linh Thu tab không có nút/section mua khi chưa có slot
- [ ] UX rõ ràng: người chơi hiểu tại sao họ chưa thấy shop

### Sau khi xong

Cập nhật SESSION_PLAN.md: S-C → `✅ Xong`.

---

---

## SESSION S-D — Quest System Redesign (LK)

**Trạng thái:** ⬜ Chưa làm  
**Cần:** S-B hoàn thành trước

### Context cho AI

Đây là game tu tiên idle hardcore. Triết lý quest trong Manifesto §6: "Nhiệm vụ phải có người giao cụ thể. Người chơi nhận thưởng vì giải quyết nhu cầu thật của NPC/faction."

**Vấn đề:** Hiện tại tab Nhiệm Vụ hiển thị danh sách quest dài sẵn có ngay từ đầu game, không ai giao. Đây là vi phạm triết lý cốt lõi.

### Files cần đọc trước khi làm

```
idle-game/docs/HANDOFF.md          → §6 Triết lý nhiệm vụ, Quest state trong G
idle-game/docs/SESSION_PLAN.md
js/quest/                          → Toàn bộ folder quest
js/ui/tabs/quests-tab.js (hoặc tương đương)
js/ui/starter-village.js           → NPC list trong làng
```

### Việc cần làm

**KHÔNG xóa hệ thống quest cũ** — refactor để quest chỉ xuất hiện khi được NPC giao.

**Bước 1 — Audit quest hiện tại:**
Đọc toàn bộ quest data và phân loại: quest nào có lore/NPC phù hợp LK, quest nào là checklist arcade không có context.

**Bước 2 — Thiết kế 3-5 quest LK đầu tiên có NPC:**
Mỗi quest cần có:
- `givenBy`: NPC id (ví dụ: `truong_thon`, `quan_su`, `lao_tu`)  
- `giveCondition`: điều kiện NPC này giao quest (ví dụ: `setupDone && stage >= 1`)
- `description`: text có giọng tu tiên, không casual
- `reward`: có lore, không phải "mưa tài nguyên"
- `unlocks`: quest này mở ra gì tiếp theo (quan hệ, thông tin, cơ hội)

**Bước 3 — Cơ chế nhận quest:**
- Quest chỉ xuất hiện trong tab khi đã được NPC giao (`quest.state === 'active'`)
- Để nhận quest: player phải interact với NPC trong bản đồ (qua `starter-village.js`)
- Khi NPC có quest chờ → hiển thị indicator trên bản đồ (ví dụ dấu `!`)

**Bước 4 — Render tab Nhiệm Vụ:**
- Nếu chưa có quest nào active → hiển thị text: "Ngươi chưa nhận nhiệm vụ từ ai. Hãy nói chuyện với người trong thôn."
- Không hiển thị danh sách trống hoặc danh sách quest chưa nhận

### Tiêu chí nghiệm thu

- [ ] Tab Nhiệm Vụ trống khi chưa nhận quest từ NPC
- [ ] Ít nhất 3 NPC trong làng có quest giao được
- [ ] Quest text giữ giọng tu tiên, không casual
- [ ] Quest có điều kiện giao hợp lý (không phải mở toang ngay từ đầu)
- [ ] Reward có lore, không vi phạm Manifesto §5

### Sau khi xong

Cập nhật SESSION_PLAN.md: S-D → `✅ Xong`. Ghi NPC quest list vào HANDOFF.md.

---

---

## SESSION S-E — Profession Gates (Nghề nghiệp)

**Trạng thái:** ⬜ Chưa làm  
**Cần:** S-B hoàn thành trước

### Context cho AI

Đây là game tu tiên idle hardcore. Có 6 nghề phụ: Luyện Đan, Trận Pháp, Phù Chú, Khôi Lỗi, Linh Thực, và Linh Thú (liên quan). Roadmap trong HANDOFF.md đã ghi: "6 nghề phụ cần cơ duyên — không phải ai cũng theo được, cần rào cản mở nghề."

**Vấn đề:** Khi bấm vào tab Nghề Nghiệp, người chơi thấy ngay nội dung của Trận Pháp, Phù Chú, Khôi Lỗi dù chưa học, chưa unlock gì cả.

### Files cần đọc trước khi làm

```
idle-game/docs/HANDOFF.md          → State G (tranPhap, phuChu, khoiLoi, linhThuc)
idle-game/docs/SESSION_PLAN.md
js/ui/tabs/nghe-nghiep-tab.js
js/ui/tabs/professions/            → Các sub-tab nghề phụ
js/core/visibility.js              → Đã tạo ở S-B
```

### Việc cần làm

**Bước 1 — Định nghĩa điều kiện mở nghề:**

```
Luyện Đan:    cần ngộ tính (ngoTinh >= 40) + linh căn Hỏa, HOẶC cơ duyên đặc biệt
              (Roadmap đã ghi: "cần thiên phú ngộ tính + hệ Hỏa để mở nghề")
Trận Pháp:    cần học từ NPC/tông môn, HOẶC tìm được trận kinh qua cơ duyên
Phù Chú:      cần học từ NPC/tông môn, HOẶC cơ duyên phù chú
Khôi Lỗi:    cần học từ NPC/tông môn, HOẶC cơ duyên khôi lỗi
Linh Thực:    mở khi vào được Linh Địa hoặc có bếp (hunger system)
```

Lưu unlock state trong `G.flags.unlockedProfessions: []` (array of profession ids).

**Bước 2 — Sửa render nghề nghiệp tab:**
- Hiển thị 6 nghề như 6 ô trong grid
- Nghề chưa unlock: hiển thị tên + mô tả mờ + điều kiện mở khóa
- Nghề đã unlock: hiển thị content bình thường
- KHÔNG hiển thị data/list của nghề chưa unlock

**Bước 3 — Thêm migration:**
- Save cũ: ai đã dùng nghề nào → tự unlock nghề đó trong `G.flags.unlockedProfessions`

### Tiêu chí nghiệm thu

- [ ] Tab Nghề Nghiệp hiển thị 6 ô, chưa unlock thì mờ + điều kiện
- [ ] Không có data/list trong nghề chưa unlock
- [ ] Luyện Đan có gate ngộ tính/linh căn
- [ ] Save cũ vẫn load, không mất nghề đã dùng
- [ ] Triết lý: không phải ai cũng có thể theo mọi nghề

### Sau khi xong

Cập nhật SESSION_PLAN.md: S-E → `✅ Xong`.

---

---

## SESSION S-F — Technical Debt Cleanup

**Trạng thái:** ⬜ Chưa làm  
**Độc lập:** Có thể làm bất cứ lúc nào, không phụ thuộc session khác

### Context cho AI

Đây là game tu tiên idle hardcore. Session này dọn kỹ thuật, không thêm tính năng mới. Các mục dưới đây là Audit Mismatches đã được ghi trong HANDOFF.md nhưng chưa fix.

### Files cần đọc trước khi làm

```
idle-game/docs/HANDOFF.md          → Section AUDIT MISMATCHES
js/core/data.js                    → Realm data
js/combat/combat-data.js           → tianJie references
js/combat/combat-engine.js         → tianJie logic
js/core/state/fresh-state.js       → _freshMini() furnaceLevel
js/ui/starter-village.js hoặc map  → Linh Địa logic
```

### Việc cần làm (theo thứ tự)

**1. Xóa realm 5+ khỏi data.js** (Audit #1)
- Giữ realm 0-4 (LK → Hóa Thần)
- Xóa Luyện Hư, Hợp Thể và bất kỳ realm nào sau Hóa Thần
- Đảm bảo không có reference bị hỏng sau khi xóa

**2. Xóa tianJie path** (Audit #2)
- Tìm tất cả `tianJie` trong combat và content map
- Xóa hoàn toàn (Manifesto: "Đột phá Nhân Giới = quá trình nội tâm thuần túy — KHÔNG boss, KHÔNG Thiên Kiếp")
- Kiểm tra không có chỗ nào còn dùng

**3. Fix _freshMini() furnaceLevel** (Audit #7)
- `_freshMini()` đang set `furnaceLevel=1` — sửa thành `0`
- Confirm `|| 1` fallback không xuất hiện ở bất kỳ đâu

**4. Fix Linh Địa monthly fee** (Audit #6)
- Hiện chỉ trừ stone 1 lần khi chuyển map
- Thêm cơ chế kiểm tra game-time định kỳ (mỗi năm game?) và trừ phí
- Nếu không đủ stone: hiển thị cảnh báo, không kick ra ngay

**5. Fix Sect rank check** (Audit #8)  
- `phap-dia.js` tự tính rank bằng `Math.floor(exp/500)` — thay bằng helper tông môn thật sự

### Tiêu chí nghiệm thu

- [ ] data.js không còn realm sau Hóa Thần
- [ ] Grep `tianJie` toàn bộ codebase = 0 kết quả
- [ ] `furnaceLevel` default = 0 trong mọi fresh state
- [ ] Linh Địa có phí định kỳ hoạt động
- [ ] Sect rank tính đúng theo helper

### Sau khi xong

Cập nhật SESSION_PLAN.md: S-F → `✅ Xong`. Đánh dấu các Audit Mismatch tương ứng trong HANDOFF.md là `✅ ĐÃ FIX`.

---

---

## SESSION S-G — LK End-to-End Playtest & Balance

**Trạng thái:** ⬜ Chưa làm  
**Cần:** Tất cả S-A đến S-F hoàn thành trước

### Context cho AI

Session cuối của giai đoạn "làm chắc nền tảng LK." Mục tiêu: chơi thử toàn bộ flow LK từ đầu và kiểm tra mọi thứ hoạt động đúng triết lý.

### Files cần đọc trước khi làm

```
idle-game/docs/HANDOFF.md          → Toàn bộ: balance, purityThresholds, onboarding spec
idle-game/docs/SESSION_PLAN.md     → Xem tất cả session đã làm gì
js/core/state/computed.js          → calcQiRate, calcBreakthroughChance
js/core/systems/breakthrough.js
js/core/tutorial-engine.js
```

### Việc cần làm

**Checklist playtest theo flow onboarding spec (HANDOFF §E):**

- [ ] Phút 0-1: Tạo nhân vật → tutorial step 0 hiện đúng → bế quan
- [ ] Phút 1-3: Tutorial step 1 → thử hành động tiêu hao thể năng
- [ ] Phút 3-5: Tutorial step 2 → thử đột phá
- [ ] Phút 5-7: Tutorial step 3+4 → mở Pháp Địa, mở Nhiệm Vụ
- [ ] Phút 7-10: Tutorial step 5 → popup cảnh báo tuổi

**Kiểm tra gate system:**
- [ ] Shop không thấy khi chưa gặp NPC
- [ ] Nghề chưa unlock hiển thị đúng
- [ ] Quest tab trống đến khi nhận từ NPC

**Kiểm tra balance LK1:**
- [ ] purityThresholds LK1 = 107 — đạt được trong thời gian hợp lý?
- [ ] Tuổi tăng đúng tốc độ (1 giây thực = 30 phút game)
- [ ] Breakthrough chance ở LK1 cho Ngũ Linh Căn: thấp nhưng không bằng 0

**Ghi lại issues:**
Mọi vấn đề phát hiện → ghi vào HANDOFF.md section BUGS, tạo session mới nếu cần.

### Sau khi xong

Cập nhật SESSION_PLAN.md: S-G → `✅ Xong`. Ghi kết quả playtest vào HANDOFF.md.

---

## GHI CHÚ QUAN TRỌNG CHO MỌI SESSION

1. **Luôn đọc HANDOFF.md trước khi viết bất kỳ dòng code nào.**
2. **Không thêm tính năng ngoài scope của session đó.**
3. **Không thay đổi balance đã calibrate trừ khi session đó yêu cầu.**
4. **Sau mỗi session: cập nhật bảng trạng thái ở đầu file này.**
5. **Nếu phát hiện bug ngoài scope → ghi vào HANDOFF.md, không fix ngay.**
