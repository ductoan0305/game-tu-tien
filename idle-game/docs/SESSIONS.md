# TU TIÊN — SESSION SPRINT BOARD
**Quy tắc cho AI:** Đọc `HANDOFF.md` trước. Sau đó đọc đúng task được giao. Khi xong: đổi `⬜` → `✅`, ghi ngắn gọn những gì đã làm vào phần `Done note:`.

---

## [S-H1] Bug: Khí Vận hiển thị sai giá trị ✅

**Files cần đọc:** `js/core/co-duyen.js`, `js/core/systems/cultivation.js` (hàm `applyCharacterSetup`)
**Vấn đề:** Nhân vật mới tạo Ngũ Linh Căn hiển thị `G.khiVan = 100`. Không đúng — theo code `applyCharacterSetup`, Ngũ LC fallback range `[15,40]`, max = 40. Không có path nào trong setup tạo ra 100.
**Nghi vấn:** Một co-duyen event có thể fire sớm và set khiVan lên max. Cần kiểm tra `co-duyen.js` xem có event nào gán `G.khiVan = 100` hoặc tương tự không.
**Fix:** Xác định nguồn gốc → clamp khiVan sau mọi modification theo đúng range của linh căn. Ngũ LC không được > 45.
**Done khi:** Tạo char mới Ngũ LC nhiều lần, khiVan luôn nằm trong [15,40].
**Done note:** Root cause: tick regen trong `main.js` dùng `Math.min(100, ...)` hardcode cho mọi loại LC → NGU có thể leo lên 100 sau đủ thời gian. Thêm nữa, `kvRanges` trong `applyCharacterSetup` dùng key cũ (`jin`, `mu`) không match với element mới (`kim`, `moc`) từ spirit-root.js. Fix: (1) Thêm `getKhiVanMax(G)` xuất từ `co-duyen.js` — trả về trần theo type: NGU=45, TU=55, TAM=65, SONG=75, BIEN_DI=90, TIEN=100; (2) Thay `Math.min(100,…)` bằng `Math.min(getKhiVanMax(G),…)` ở 3 chỗ: tick regen (`main.js`), tier boost & khivan_boost trong `applyCoduyen`; (3) Fix `kvRanges` trong `cultivation.js` — thêm type-based ranges (ưu tiên) và key mới `kim`, `moc`.

---

## [S-H2] Bug: Nhập Định báo "hết linh thạch" khi mới tạo char ✅

**Files cần đọc:** `js/core/systems/tick.js`, `js/core/phap-dia.js` (hàm `checkLinhDiaFee`), `js/main.js` (handler `cp-btn-meditate`)
**Vấn đề:** Ngay sau tạo nhân vật, bấm nhập định xuất hiện thông báo hết linh thạch. Nhưng `toggleMeditate()` không check stone gì cả.
**Nghi vấn 1:** `checkLinhDiaFee` có thể không check `costType !== 'none'` → cảnh báo dù đang ở Phàm Địa (cost=0).
**Nghi vấn 2:** `tranPhap.activeArrays` có data cũ từ migration → drain stone ngay tick đầu tiên.
**Nghi vấn 3:** Toast cảnh báo stone thấp fire độc lập, người chơi nhầm tưởng do nhập định.
**Fix:** Tìm đúng nguồn → sửa điều kiện check. Phàm Địa không được có stone warning. Char mới không có active arrays.
**Done khi:** Tạo char mới, bấm nhập định không có thông báo stone.
**Done note:** Root cause: `fresh-state.js` khởi tạo `stone:0`. Khi char mới bấm nhập định, notification check `if (G.meditating && stone <= 0)` trong `render-core.js` fires ngay lập tức. Song song đó, `stoneMod=0.05` trong `tick.js` cũng áp dụng → qi rate -95% mà không có cảnh báo rõ. Fix 2 chỗ: (1) `tick.js`: R1 stone drain + stoneMod chỉ áp dụng khi `phapDia !== 'pham_dia'`; ở Phàm Địa `stoneMod=1.0`, `stoneStarved=false` — nhất quán với `costType:'none'` của Phàm Địa. (2) `render-core.js`: guard notification R1 thêm điều kiện `phapDia !== 'pham_dia'`. Stone warning chỉ còn hiện từ Linh Địa trở lên.

---

## [S-H3] UX: Redesign section "Thành Tích" trong Char Popup ✅

**File cần sửa:** `js/app/popups/char-popup.js` (phần cuối `bodyEl.innerHTML`, section `📊 Thành Tích`)
**Vấn đề:** Section này gộp lẫn nhiều thứ không liên quan, label "Thành Tích" không mô tả đúng nội dung.
**Thay đổi cần làm:**
1. Đổi tên section → `📜 Hành Trình`
2. Di chuyển **Tuổi** lên phần header nhân vật (kế bên tên, format: `10 tuổi | Cửa sổ < 70`)
3. Thêm sub-label nhỏ cho từng counter để có context (ví dụ: Đột Phá thêm "lần", Danh Vọng thêm tier name đầy đủ hơn)
4. Section Danh Vọng: hiển thị progress bar đến tier tiếp theo (dữ liệu tier đã có trong `danh-vong.js`)
**Không đụng:** logic, state, các file khác.
**Done khi:** Char popup hiển thị Tuổi ở header, section cuối đọc hiểu được không cần giải thích.
**Done note:** Import thêm `DANH_VONG_TIERS` từ `danh-vong.js`. Thêm biến `currentAge`/`ageColor`/`ageWindowText` (xanh <70, vàng 70-74, đỏ 75+) và `dvProgressHtml` (progress bar tính từ min tier hiện tại → min tier tiếp theo, fallback "đạt tối cao" nếu Lừng Lẫy). Tuổi hiển thị trong header ngay dưới dòng realm. Section `📜 Hành Trình`: xóa row Tuổi, thêm unit nhỏ (lần/con/viên/hoàn thành) cho 4 counter, Danh Vọng wrap thành block riêng với progress bar bên dưới. Không đụng logic/state.

---

## [S-H4] Feature: Tách Nav + Popup Tu Luyện mới ✅

**Đọc thêm:** `js/ui/render-core.js` (hàm `renderNav`), `js/core/visibility.js`, `js/ui/popup-manager.js`, `js/ui/tab-popup.js`
**Done note:** Tạo `js/ui/tu-luyen-popup.js` — floating popup via PopupManager (id `tu-luyen`), width 300px, vị trí góc phải. Popup chứa: header (realm/stage + tuổi có màu theo cửa sổ), 3 progress bars (Linh Lực/HP/Thể Năng), stats grid 2×2 (tu tốc/thuần độ/công kích/phòng thủ), Pháp Địa + số Công Pháp, hunger/ám thương indicators, 6 action buttons (Nhập Định span toàn hàng, + Nghỉ Ngơi/Khám Phá/Tỉ Thí/Câu Cá/Cảm Ngộ), Đột Phá button với animation pulse. `wireNavBtn` trong `main.js`: special-case `tabId === 'cultivate'` → gọi `openTuLuyenPopup(G, cultivateActions)` thay vì `_switchTabWithPopup('cultivate')` (programmatic nav về map vẫn giữ nguyên). `updateTuLuyenPopup(G)` được thêm vào gameTick mỗi 2 ticks (≈0.2s). CSS thêm vào `systems.css`. Tab `cultivate` vẫn là background canvas — không popup-ize.
**Context quan trọng:** Tab `cultivate` luôn là background canvas — KHÔNG popup-ize (xem HANDOFF lưu ý kỹ thuật). `_switchTabWithPopup('cultivate')` hiện switch về canvas chính, đó là lý do nav button mở map.

**Phần A — Tách nav button (2 nút thay 1):**
- Xóa nút `cultivate` hiện tại khỏi bottom nav
- Thêm nút **📍 Địa Điểm**: click → mở SV side popup hoặc world map (behavior hiện tại của cultivate button)
- Thêm nút **🧘 Tu Luyện**: click → mở `CultivatePopup` mới (xem Phần B)
- Sửa `renderNav()` trong `render-core.js` và `wireNavBtn` trong `main.js`

**Phần B — CultivatePopup mới (`js/app/popups/cultivate-popup.js`):**
Dùng `PopupManager.open(...)`, 4 sections:
1. **Trạng thái tu luyện** (rate breakdown, nút Nhập Định/Xuất Định — move từ char popup sang đây)
2. **Công Pháp** (active slots 1-4, mastery bar, add/remove — UI hiện đã có ở phapdia-tab, có thể tái dùng logic)
3. **Hỗ Trợ** (đan dược trong inventory có `boostCultivation` effect — click để dùng; có tooltip danDoc warning)
4. **Trận Pháp** (active arrays, stone drain/giờ, toggle)

**Ràng buộc thiết kế (KHÔNG vi phạm):**
- Không tạo loop linh thạch → boost vô hạn. Mọi boost phải có cap hoặc cooldown.
- Không hiển thị nút đột phá ở đây (giữ trong char popup hoặc cultivate canvas).
- Nút Nhập Định sau khi move sang popup này thì XÓA khỏi char popup.

**Done khi:** Nav có 2 nút riêng biệt, popup tu luyện mở được, nhập định hoạt động từ popup mới.
**Done note:** _(để trống)_

---

## Thứ tự đề xuất

| Ưu tiên | Task | Lý do |
|---------|------|-------|
| 1 | S-H1 Bug khiVan | Ảnh hưởng balance, dễ fix |
| 2 | S-H2 Bug stone | UX blocker cho người chơi mới |
| 3 | S-H3 Char popup | UI polish, không rủi ro |
| 4 | S-H4 Nav + popup | Feature lớn nhất, làm sau khi 1-3 ổn định |
