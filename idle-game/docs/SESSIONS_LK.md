# SESSIONS LK TASKS — Plan thực thi (Owner approved 2026-05-09)

**Đối tượng:** AI session sau, mỗi session độc lập.
**Quy ước đọc trước:** HANDOFF.md §DESIGN MANIFESTO + §BALANCE + §STATE STRUCTURE. Không cần đọc lại nếu đã đọc.
**Quy ước chung sau mỗi session:**
- Cập nhật HANDOFF.md §BUGS ĐÃ FIX hoặc §ROADMAP — CÒN LẠI.
- Test smoke: load save cũ + tạo char mới, không crash.
- Không thay đổi balance vượt scope session.

---

## L1 — Gộp stone drain Linh Địa (T1)

**Mục tiêu:** Loại bỏ trùng lặp 2 cơ chế trừ stone ở Linh Địa. Giữ duy nhất phí thuê 150💎/năm game.

**Bối cảnh:** Hiện `tick.js` trừ liên tục 2💎/năm game (~365💎/năm thực) **VÀ** `phap-dia.js > checkLinhDiaFee` trừ 150💎/năm game. Tổng 152/năm game, gây mơ hồ kinh tế.

**Đọc trước:**
- `js/core/systems/tick.js` dòng 29-62 (block meditation drain)
- `js/core/phap-dia.js` dòng 613-644 (`LINH_DIA_ANNUAL_FEE`, `checkLinhDiaFee`)

**Edit:** `js/core/systems/tick.js`

**Spec sau khi sửa (block `if (G.meditating)`):**
```js
if (G.meditating) {
  const phapDiaId = G.phapDia?.currentId ?? 'pham_dia';
  let stoneMod = 1.0;
  if (phapDiaId !== 'pham_dia') {
    // KHÔNG drain stone ở đây — phí thuê quản lý qua checkLinhDiaFee 150💎/năm game
    // Chỉ giữ stoneMod: thiếu linh thạch thì tu Linh Địa kém
    const stone = G.stone ?? 0;
    stoneMod = stone > 50 ? 1.0 : stone > 10 ? 0.3 : 0.05;
    G.stoneStarved = (stone <= 0);
  } else {
    G.stoneStarved = false;
  }
  const effRate = rate * hungerMod * nghiepMod * stoneMod;
  // ... rest UNCHANGED (qi accumulation, purity logic, ...)
}
```

**Validation:**
1. Vào Linh Địa với 1000💎. Bế quan 5 phút thực. Stone giảm ≤ 0 (không 1-2💎/phút như trước).
2. Sau 1 năm game (≈4.87h thực), stone bị trừ 150💎ăn lần qua `checkLinhDiaFee`.
3. Nếu stone < 50: qi rate giảm về 30% (stoneMod). Nếu stone ≤ 10: 5%.
4. Stone = 0: notification stoneStarved hiện đúng.

**Manifesto §7:** PASS — không buff, không skip, chỉ gộp logic.

**HANDOFF cập nhật:** §BUGS ĐÃ FIX, mục mới sau P11 — "T1: Gộp stone drain Linh Địa thành 1 cơ chế phí thuê duy nhất."

---

## L2 — Cooldown đột phá fail liên tiếp (T2)

**Mục tiêu:** Chống spam đột phá fail trong vài giây. Mỗi fail tăng cooldown, success hoặc qua 1 năm game thì reset.

**Bối cảnh:** Hiện player có thể bấm nút Đột Phá ngay sau fail. UI đã có warning ở 50-74% purity nhưng không có cooldown → spam thử bừa làm mất "trọng đại" của đột phá.

**Đọc trước:**
- `js/core/systems/breakthrough.js` `doBreakthrough()` (dòng 128 trở đi, đặc biệt block fail dòng 158-193)
- `js/ui/tu-luyen-popup.js` — tìm button đột phá render + click handler
- `js/core/state/fresh-state.js` — chỗ khai báo state mới

**Edit:**
1. `js/core/state/fresh-state.js` — thêm field
2. `js/core/state/persistence.js` — migration cho save cũ
3. `js/core/systems/breakthrough.js` — gate trong `doBreakthrough` + ghi state khi fail/success
4. `js/core/systems/tick.js` hoặc `time-engine.js` — reset streak nếu qua 1 năm game không fail
5. `js/ui/tu-luyen-popup.js` — disable button khi cooldown active + hiển thị countdown

**Spec state mới:**
```js
// Trong fresh-state createFreshState():
_btFailStreak: 0,           // số lần fail liên tiếp
_btFailCooldownUntil: 0,    // timestamp ms; nếu Date.now() < giá trị này → khoá nút
_btLastFailYear: 0,         // năm game lần fail cuối — reset streak nếu currentYear vượt +1
```

**Spec migration (`persistence.js _migrate*` mới):**
```js
if (G._btFailStreak == null) G._btFailStreak = 0;
if (G._btFailCooldownUntil == null) G._btFailCooldownUntil = 0;
if (G._btLastFailYear == null) G._btLastFailYear = G.gameTime?.currentYear ?? 0;
```

**Spec gate đầu `doBreakthrough(G)`:**
```js
if (Date.now() < (G._btFailCooldownUntil || 0)) {
  const wait = Math.ceil((G._btFailCooldownUntil - Date.now()) / 1000);
  return { ok:false, msg:`Tâm còn xáo trộn, cần ${wait}s tịnh tâm trước khi thử lại.`, type:'warning' };
}
```

**Spec ghi state khi fail (sau khi tính xong qiLossPct/tamCanhLoss/...):**
```js
G._btFailStreak = (G._btFailStreak || 0) + 1;
G._btLastFailYear = G.gameTime?.currentYear ?? 0;
const cdSec = Math.min(30 * G._btFailStreak, 300); // 30s → 60 → 90 → ... cap 5 phút
G._btFailCooldownUntil = Date.now() + cdSec * 1000;
```

**Spec ghi state khi success (sau khi gán qi/purity về 0):**
```js
G._btFailStreak = 0;
G._btFailCooldownUntil = 0;
```

**Spec auto-reset (đặt trong `tick.js` hoặc cuối `tickTime`):**
```js
// Nếu qua >1 năm game không có fail mới, reset streak (cho phép thử lại trong sạch)
if (G._btFailStreak > 0 && G.gameTime?.currentYear - (G._btLastFailYear || 0) >= 1) {
  G._btFailStreak = 0;
  G._btFailCooldownUntil = 0;
}
```

**Spec UI tu-luyen-popup:**
- Trong `updateTuLuyenPopup(G)`: nếu `Date.now() < G._btFailCooldownUntil` → button class `disabled`, text `"Tịnh Tâm (${wait}s)"`, không cho click.
- Pulse animation tắt khi cooldown active.

**Validation:**
1. Fail liên tiếp 3 lần → cooldown lần 3 = 90s. Đếm ngược trên button.
2. Success 1 lần → button mở khoá ngay.
3. Fail 1 lần, đợi 1 năm game (~4.87h thực hoặc fast-forward) → streak reset.
4. Save/reload không mất state.

**Manifesto §7:** PASS — chống spam, không thay xác suất, không skip.

**HANDOFF cập nhật:** §BUGS ĐÃ FIX và §LƯU Ý KỸ THUẬT (thêm comment về `_btFailStreak`).

---

## L3 — Visual marker Thuần Độ bar (T9)

**Mục tiêu:** Bar Thuần Độ trong Tu Luyện popup hiển thị 5 vùng màu thấy rõ, để player hiểu "vượt 100% có lợi".

**Bối cảnh:** Hiện bar 1 màu. Player không biết overflow đến 200% có F_purity 1.4. Visual cue → player tự chọn chiến thuật chờ overflow.

**5 vùng:**
- 0-50%: xám đậm — không thử được (F_purity = 0)
- 50-75%: vàng nhạt — chance giảm mạnh (F_purity = 0.5)
- 75-100%: xanh dương — chuẩn (F_purity = 0.85 → 1.0)
- 100-200%: xanh ngọc + viền glow — vượt ngưỡng (F_purity = 1.2)
- >200%: vàng kim + glow mạnh — đỉnh (F_purity = 1.4)

**Đọc trước:**
- `js/ui/tu-luyen-popup.js` — render bar Thuần Độ (id `tlp-purity-bar` hoặc tương tự)
- `js/core/state/computed.js` `calcPurityThreshold`, `calcThuanDoCeiling` (dòng 81-85, 234-246)
- `css/systems.css` — class `.pm-tu-luyen` và descendants

**Edit:**
1. `js/ui/tu-luyen-popup.js` — thêm logic chia vùng cho bar render
2. `css/systems.css` — thêm 5 class `.tlp-purity-zone-1...5` với gradient/glow tương ứng

**Spec render bar:**
```js
// Trong updateTuLuyenPopup:
const purity = G.purity ?? 0;
const threshold = calcPurityThreshold(G);
const ratio = purity / threshold; // 0..2+ thông thường
const ceiling = calcThuanDoCeiling(G); // trần theo grade công pháp
const visualMax = Math.max(ceiling, threshold * 2.5); // bar scale tới 250% threshold
const fillPct = Math.min(100, (purity / visualMax) * 100);

let zone;
if      (ratio < 0.5)  zone = 1; // xám
else if (ratio < 0.75) zone = 2; // vàng nhạt
else if (ratio < 1.0)  zone = 3; // xanh dương
else if (ratio < 2.0)  zone = 4; // xanh ngọc + glow
else                   zone = 5; // vàng kim

// Render: bar có class `tlp-purity-zone-${zone}` + width fillPct
// Markers (vạch dọc) tại 50%/75%/100%/200% threshold nếu nằm trong visualMax
```

**Spec markers:** vẽ `<div class="tlp-purity-marker">` absolute positioned tại các vị trí phần trăm tương ứng với threshold ratio. Mỗi marker có nhãn nhỏ (50/75/100/200) trên đỉnh.

**Spec tooltip:** hover bar hiển thị: `"Thuần Độ ${Math.floor(purity)}/${threshold} (${Math.round(ratio*100)}%) — F_purity ×${Fpurity}"`. Có thể dùng attribute `title` để đơn giản.

**Validation:**
1. Bar đổi màu khi qua mỗi mốc 50/75/100/200%.
2. Mốc threshold (vạch dọc) hiển thị đúng vị trí.
3. Khi `calcThuanDoCeiling` thấp hơn 200% threshold (vd Tạp phẩm × 0.85): bar không thể vượt, marker 200% nằm ngoài bar — vẫn render đúng.

**Manifesto §7:** PASS — UI hint cho cơ chế đã tồn tại, không thêm power.

**HANDOFF cập nhật:** §POLISH, đánh dấu T9 done.

---

## L4 — Audit data thiếu sót cho LK (T4 mở rộng — Phần 1: SPEC ONLY)

**Mục tiêu:** Đọc toàn bộ data công pháp + 5 nghề phụ. Output 1 file spec liệt kê chỗ thiếu/lệch + đề xuất bổ sung cụ thể (ID, name, stats, gate). KHÔNG edit code.

**Bối cảnh phát hiện S-LK1:** Tán tu Kim/Hỏa LK không có công pháp Hạ phẩm match hệ (kim_quyet_ha và dan_kinh_ha là sect-only). Nghi vấn các nghề phụ cũng có lệch tương tự.

**Đọc:**
- `js/core/phap-dia.js` `CONG_PHAP_LIST` — toàn bộ
- `js/alchemy/alchemy-data.js` — `RECIPES`, `INGREDIENTS`
- `js/alchemy/crafting-data.js` — `CRAFTING_RECIPES`, `TRAN_MAT_RECIPES`
- `js/alchemy/tran-phap-data.js` — `ARRAY_RECIPES`
- `js/alchemy/phu-chu-data.js`
- `js/alchemy/khoi-loi-data.js`
- `js/alchemy/linh-thuc-data.js`
- `js/core/data.js` `ITEMS` (shop items)

**Output:** Tạo file mới `docs/T4_DATA_AUDIT.md` với cấu trúc:

```markdown
# T4 DATA AUDIT — LK Coverage

## 1. CÔNG PHÁP
### Ma trận grade × element × realmRange (LK only):
| element | Tạp | Hạ | Trung | Thượng |
|---|---|---|---|---|
| kim    | — | sect-only | — | — |
| moc    | — | truong_xuan_cong (buy) | — | — |
| ...

### THIẾU:
- [ ] Kim/Hạ tán tu LK (mua được) — đề xuất ID `kim_thiet_quyet`, cost 1100, buffs ...
- [ ] Hỏa/Hạ tán tu LK (mua được) — đề xuất ID ...
- ...

## 2. LUYỆN ĐAN (RECIPES)
### Ma trận tier × element ingredients (LK only — realm 0):
...
### THIẾU:
- ...

## 3. TRẬN PHÁP (ARRAY_RECIPES)
...

## 4. PHÙ CHÚ
...

## 5. KHÔI LỖI
...

## 6. LINH THỰC
...

## 7. SHOP ITEMS LK
Liệt kê items có realm gate 0 và đối chiếu với coverage trên.

## TỔNG KẾT ĐỀ XUẤT BỔ SUNG
[bullet list rút ngắn từ các phần trên — đây là input cho L5]
```

**Tiêu chí audit cho mỗi nghề:**
- Mỗi tier (1-5) có công thức cho LK chưa?
- Mỗi hệ ngũ hành (kim/moc/shui/huo/tu) có ít nhất 1 recipe match cho LK chưa?
- Cost gating có hợp lý không (tránh spike đột ngột)?
- Có lệch về 1 hệ không (ví dụ: nghề toàn Hỏa, không có Thủy)?

**Quan trọng — KHÔNG được:**
- Thêm recipe cho TC/KĐ/NA/HT trong audit này (chỉ LK).
- Đề xuất buff power vượt scope đã có (chỉ fix asymmetry).
- Đề xuất cơ chế mới (state, system) — chỉ data.

**Validation:** File `T4_DATA_AUDIT.md` tồn tại, đủ 7 mục, mỗi mục có ma trận coverage + danh sách thiếu cụ thể + đề xuất đầy đủ params (ID, name, stats, materials, cost, gating).

**Manifesto §7:** PASS — chỉ audit + đề xuất, không touch code.

**HANDOFF cập nhật:** không.

---

## L5 — Implement T4 data theo audit (Phần 2)

**Mục tiêu:** Thực hiện toàn bộ đề xuất từ `docs/T4_DATA_AUDIT.md`. Làm hết tất cả không cherry-pick (theo yêu cầu owner).

**Đọc trước:**
- `docs/T4_DATA_AUDIT.md` (input chính, từ L4)
- File data tương ứng cho từng phần đề xuất

**Edit:** mọi file data có entry mới, theo từng mục audit:
1. Công pháp mới → `js/core/phap-dia.js > CONG_PHAP_LIST`
2. Recipe luyện đan mới → `js/alchemy/alchemy-data.js`
3. Trận pháp mới → `js/alchemy/tran-phap-data.js`
4. Phù chú mới → `js/alchemy/phu-chu-data.js`
5. Khôi lỗi mới → `js/alchemy/khoi-loi-data.js`
6. Linh thực mới → `js/alchemy/linh-thuc-data.js`
7. Shop items mới → `js/core/data.js > ITEMS`

**Quy ước thêm entry:**
- Giữ sort order (tier ↑, grade ↑, element bảng chữ cái).
- Comment lore ngắn (1-2 dòng tiếng Việt) cho mỗi entry mới — không spam.
- Cost không vượt cùng tier hiện có (không power creep).
- ID dạng snake_case, prefix theo nghề (`kim_*`, `huo_*`, `tran_*`, `bua_*`, `kloi_*`, `lt_*`).

**Validation:**
1. Game load không crash, console không error sau khi vào shop / mở từng tab nghề phụ.
2. Mỗi item mới có thể mua/craft thành công (test 1 ID/loại).
3. UI hiển thị đầy đủ trong tab tương ứng.
4. Tán tu Kim căn LK4 mở shop có ít nhất 1 công pháp match Kim Hạ phẩm.
5. Tương tự Hỏa, và mọi nghề phụ — mỗi linh căn chính có ít nhất 1 đường tu LK match.

**Manifesto §7:** PASS — sửa asymmetry data, không thêm power vượt cấp.

**HANDOFF cập nhật:** §BUGS ĐÃ FIX (T4) + cập nhật bảng "công pháp / nghề phụ" nếu HANDOFF có.

---

## L6 — H3 NPC Reputation Foundation

**Mục tiêu:** Hệ thống reputation per-NPC cho starter villages. Bước 1: state + hooks tăng rep + threshold detection. Chưa có rewards (để L7).

**Bối cảnh:** Game đã có 5 NPC quest LK (xem HANDOFF "NPC Quest List"). Hiện không có khái niệm "thân thiện" với NPC — quest hoàn thành là xong. Reputation tạo độ sâu xã hội.

**Đọc trước:**
- HANDOFF.md §NPC Quest List (5 NPC: lao_duoc_su, lao_ngu_ong, dao_khach_gia)
- `js/quest/quest-data.js` `NPC_QUESTS`
- `js/quest/quest-engine.js` (tìm chỗ quest completed → để hook rep+10)
- `js/ui/location-popup.js` (NPC dialog render)
- `js/app/event-bus-handlers.js` (chỗ wire quest:completed)

**Edit:**
1. `js/core/state/fresh-state.js` — thêm `npcReputation: {}` (map npcId → number 0-100)
2. `js/core/state/persistence.js` — migration: `if (!G.npcReputation) G.npcReputation = {}`
3. `js/core/data.js` hoặc tạo file mới `js/core/npc-data.js` — định nghĩa `NPC_REPUTATION_TIERS` và `NPC_LIST` (id, name, villageId, dialogVariant)
4. `js/quest/quest-engine.js` — hook tăng rep khi `completeQuest(G, questId)` cho NPC quest
5. Tạo file mới `js/core/npc-reputation-engine.js`:
   - `getNpcRep(G, npcId)` → 0-100
   - `gainNpcRep(G, npcId, amount)` → cap 100
   - `getNpcRepTier(G, npcId)` → 0/1/2/3/4 (tiers 0/25/50/80/100)
   - `getRepTierName(tier)` → 'Lạ Mặt' / 'Quen Mặt' / 'Tin Cậy' / 'Tâm Giao' / 'Khẩu Khẩu'
   - `tickNpcRepVisit(G)` — gọi từ `tick.js`, mỗi 5 năm game cộng +1 cho NPC ở zone hiện tại
6. `js/core/systems/tick.js` — gọi `tickNpcRepVisit(G)` cuối tick

**Spec tier scale:**
| Tier | Tên | Range | Mô tả |
|---|---|---|---|
| 0 | Lạ Mặt | 0-24 | Mới gặp |
| 1 | Quen Mặt | 25-49 | Đã làm vài việc cho NPC |
| 2 | Tin Cậy | 50-79 | NPC bắt đầu chia sẻ thông tin riêng |
| 3 | Tâm Giao | 80-99 | NPC sẵn sàng tặng vật phẩm hiếm |
| 4 | Khẩu Khẩu | 100 | NPC nhận làm "đệ tử khẩu khẩu" |

**Spec gain rule (Foundation only — chưa rewards):**
- NPC quest hoàn thành: +10 cho NPC giao quest
- Trao đổi vật phẩm tại NPC (nếu đã có cơ chế): +1~3 (1 lần / vật phẩm / năm game; tracked qua cooldown)
- Visit periodic: mỗi 5 năm game, NPC ở zone hiện tại +1 (cap 1/lần). Track qua `G._npcRepLastVisit[npcId] = year`.
- Cap rate-limit: tổng rep tăng tối đa +20/năm game cho 1 NPC (chống farm).

**Spec UI (Foundation):**
- `location-popup.js` NPC dialog hiển thị tag tier + thanh progress nhỏ tới tier sau.
- Không có button đặc biệt nào yet (rewards ở L7).

**Validation:**
1. Hoàn thành `nq_01_clear_vermin` từ `lao_duoc_su` → rep `lao_duoc_su` = 10.
2. Đứng tại Thanh Phong Thôn 5 năm game → rep `lao_duoc_su` +1.
3. Save/reload preserve `G.npcReputation`.
4. UI NPC dialog hiển thị tag "Lạ Mặt 10/25" hoặc tương đương.
5. Cap rate-limit hoạt động: gain 20 trong 1 năm game không tăng nữa.

**Manifesto §7:** PASS — mở chiều sâu xã hội, không buff power, không skip rào cản.

**HANDOFF cập nhật:** §STATE STRUCTURE thêm `npcReputation`. §LƯU Ý KỸ THUẬT thêm comment về `npc-reputation-engine`. §BUS EVENTS nếu thêm event mới (đề xuất `npc:rep_gained`, `npc:rep_tier_up`).

---

## L7 — H3 NPC Reputation Rewards

**Mục tiêu:** Implement 3 layer rewards của reputation system. Yêu cầu L6 đã hoàn thành.

**Đọc trước:**
- L6 deliverables (state, engine functions)
- `js/ui/starter-village.js` — render world map starter zone (chỗ thêm "secret zone" indicator)
- `js/core/data.js` `ITEMS` (cho vật phẩm hiếm tặng tại tier 3)
- `js/ui/location-popup.js` (NPC dialog — thêm dialog options theo tier)

**Edit:**
1. `js/core/npc-data.js` — thêm `NPC_REWARDS` per NPC:
   ```js
   NPC_REWARDS = {
     lao_duoc_su: {
       tier2_secret: { zoneId: 'duoc_thao_bi_canh_thanh_phong', ... },
       tier3_gift:   { itemId: 'item_id_unique', once: true },
       tier4_buff:   { type: 'danBonus', value: 5, label: 'Đệ tử khẩu khẩu Lão Dược Sư' }
     },
     // tương tự cho lao_ngu_ong, dao_khach_gia, ...
   };
   ```
2. `js/ui/location-popup.js` — thêm dialog options theo tier:
   - Tier 2 (rep ≥ 50): button "Hỏi về vùng đất bí mật" → mở zone (set flag `G.flags.unlockedSecretZones[zoneId] = true`)
   - Tier 3 (rep ≥ 80): button "Nhận quà từ ${NPC.name}" — chỉ hiện 1 lần (track qua `G._npcGiftClaimed[npcId] = true`), trao item.
   - Tier 4 (rep = 100): button "Bái sư khẩu khẩu" → set `G._npcKhauKhau[npcId] = true`, apply buff vĩnh viễn (qua passive bonus pipeline).
3. `js/ui/starter-village.js` — render secret zone indicator (icon mới, chỉ hiện nếu unlock).
4. `js/core/state/computed.js` hoặc tương ứng — thêm bonus pipeline cho `_npcKhauKhau` buffs.
5. Định nghĩa 3 secret zones mới trong `js/ui/map-data.js` (1 zone / village có NPC quest):
   - `duoc_thao_bi_canh_thanh_phong` — vùng dược thảo hiếm cho Thanh Phong Thôn
   - `linh_ngu_dam_lam_hai` — đầm linh ngư cho Lâm Hải Thôn
   - `co_lo_phe_tich_hoa_diem` — phế tích lò cổ cho Hỏa Diệm Thôn

**Spec balance reward:**
- Secret zone: chứa nguyên liệu hiếm (1 tier cao hơn vùng thường), drop rate giới hạn (mỗi 30 ngày thực mới refresh stock — track qua `G._secretZoneCooldown[zoneId]`). Không phải resource farm vô hạn.
- Tier 3 gift: chọn theo NPC theme:
  - Lão Dược Sư: 1 viên `linhdan` cao cấp (hoặc tương đương đan dược tier 2)
  - Lão Ngư Ông: 1 vật phẩm có công dụng độc quyền — vd "Linh Mạch Đồ" (cho phép xem 1 lần linh mạch zone hiện tại)
  - Đạo Khách Già: 1 nguyên liệu rèn quý (vd `tran_nhan` ×1)
  Mỗi NPC chỉ tặng 1 lần / run.
- Tier 4 buff: nhỏ và đặc thù, không stack giữa NPC:
  - Lão Dược Sư khẩu khẩu: `danBonus +5%` (giúp luyện đan)
  - Lão Ngư Ông khẩu khẩu: `eventRateBonus +3%` luôn (luôn có buff thấp)
  - Đạo Khách Già khẩu khẩu: `atkPct +5%`
  Player chỉ được khẩu khẩu **1 NPC/run** — chọn 1 trong 3, không thể tất cả. Tăng trọng lượng lựa chọn.

**Spec gate khẩu khẩu:**
```js
if (G._npcKhauKhau && Object.keys(G._npcKhauKhau).length > 0 && !G._npcKhauKhau[npcId]) {
  return { ok:false, msg:'Đã bái sư khẩu khẩu với NPC khác — không thể đổi.', type:'danger' };
}
```

**Validation:**
1. Rep `lao_duoc_su` đạt 50 → dialog có button "Hỏi về vùng đất bí mật" → click mở zone trên world map.
2. Rep 80 → button "Nhận quà" hiện 1 lần, click trao item, button biến mất sau đó.
3. Rep 100 → button "Bái sư khẩu khẩu" → confirm dialog (vĩnh viễn) → buff áp dụng.
4. Bái sư xong, NPC khác đạt 100 cũng không cho bái lại.
5. Save/reload preserve mọi state mới (`unlockedSecretZones`, `_npcGiftClaimed`, `_npcKhauKhau`, `_secretZoneCooldown`).

**Manifesto §7:** PASS:
1. Đa số thất bại bình thường? — Có (chỉ 1/3 NPC có thể đạt 100/khẩu khẩu/run, đa số người chơi không đủ thời gian).
2. Không ngắn game? — Đúng, đạt rep 100 cần ~50+ năm game cho 1 NPC.
3. Không tuyến tính chắc thắng? — Đúng, chọn 1 NPC = bỏ 2 NPC khác.
4. Không mờ vai trò linh căn/cơ duyên/tuổi? — Đúng, rep gain qua quest và visit, không liên quan power roll.
5. Không vi phạm kinh tế tu tiên? — Đúng, secret zone có cooldown, gift 1 lần, buff khẩu khẩu giới hạn 1.

**HANDOFF cập nhật:** §ROADMAP đánh dấu H3 done. §STATE STRUCTURE thêm các flag mới. §FILE chỗ thêm `npc-data.js` và update `map-data.js`.

---

## TỔNG KẾT THỨ TỰ THỰC HIỆN

| # | Session | Phụ thuộc | Files edit |
|---|---|---|---|
| L1 | Stone drain fix | — | 1 |
| L2 | Cooldown đột phá fail | — | 5 |
| L3 | Visual marker Thuần Độ | — | 2 |
| L4 | Audit data spec | — | 1 (tạo file docs) |
| L5 | Implement data | L4 | 7+ |
| L6 | Reputation foundation | — | 6 |
| L7 | Reputation rewards | L6 | 5 |

**Đề xuất nhóm chạy:**
- **Sprint 1:** L1, L2, L3 song song (độc lập, fix nhanh).
- **Sprint 2:** L4 (đơn lẻ, output là spec).
- **Sprint 3:** L5 (theo spec L4).
- **Sprint 4:** L6.
- **Sprint 5:** L7.

Mỗi session khi done: cập nhật HANDOFF + mark task hoàn thành ở mục §ROADMAP.
