# WORLD MAP DESIGN — Nhân Giới Toàn Đồ

> Tài liệu thiết kế bản đồ thế giới cho game Tu Tiên Idle.  
> Đây là tài liệu lore/design thuần túy — chưa implement vào code.  
> Đọc kèm `SECT_SYSTEM_DESIGN.md` để hiểu hệ thống tông môn.

---

## 1. Triết Lý Thiết Kế

### Thế giới phải cảm thấy bao la

Nhân Giới không phải bản đồ node. Nhân Giới là một thế giới thực sự rộng lớn, nơi người thường đi bộ cả đời không hết một châu. Tu sĩ bay kiếm vài ngày mới qua một vùng. Đại tông kiểm soát lãnh thổ rộng bằng một quốc gia hiện đại.

Bản đồ trong game thể hiện điều này bằng **màu sắc lãnh thổ**, không phải node kết nối. Mỗi màu = một thế lực kiểm soát vùng đất đó. Không phải tất cả đất đều có chủ — hiểm địa, hoang mạc, đại dương là những khoảng trắng/xám trên bản đồ.

### Tham khảo PNTT nhưng không dùng tên gốc

Cấu trúc thế giới lấy cảm hứng từ Phàm Nhân Tu Tiên (Thiên Nam, Loạn Tinh Hải, Đại Tấn, Mộ Lan Thảo Nguyên, Cực Tây Chi Địa). Tất cả tên địa danh trong game đều là **tên gốc, không trùng PNTT**.

### Triết lý đặt tên

Tên địa danh phải **gợi cảm xúc, không mô tả chức năng**.

- ❌ SAI: "Tiểu Quốc Vùng", "Đông Thổ Châu", "Bắc Hoang Nguyên"
- ✅ ĐÚNG: "Khuyết Vực", "Vĩnh Dạ Hàn Nguyên", "Thiên Tinh Hải Vực", "Man Hoang"

Tên tốt: ngắn, có âm thanh mạnh, gợi hình ảnh hoặc cảm giác. Không cần giải thích nghĩa trong tên.

---

## 2. Cấu Trúc 3 Tầng

### Tầng 1 — Nhân Giới Toàn Đồ

Toàn bộ thế giới Nhân Giới. Hiển thị 5 đại vùng lớn bằng màu sắc tổng thể.  
Người chơi click vào vùng → vào Tầng 2.

### Tầng 2 — Đại Vùng (Territorial Map)

Bản đồ lãnh thổ của một đại vùng. Hiển thị bằng màu sắc theo thế lực kiểm soát:
- Chính Đạo: xanh lam / ngọc
- Ma Đạo: đỏ thẫm / tím
- Trung Lập: vàng / nâu
- Hiểm địa / vô chủ: xám / đen

Người chơi click vào khu vực của một tông môn → vào Tầng 3.

### Tầng 3 — Chi Tiết Tông Môn / Địa Điểm

Bản đồ nội bộ khu vực: sơn môn, mỏ linh thạch, động thiên, làng xóm lân cận.

---

## 3. Năm Đại Vùng Nhân Giới

### Vùng 1: KHUYẾT VỰC

**Tính chất:** Vùng văn minh chính của Nhân Giới. Nhiều tông môn, nhiều chiến tranh, nhiều cơ duyên. Đây là nơi người chơi bắt đầu.

**Địa hình:** Núi non, thung lũng, bình nguyên. Khí hậu ôn hòa ở trung tâm, khắc nghiệt ở biên giới.

**Thế lực:**

*Chính Đạo (3 đại tông):*
- **Thái Thanh Kiếm Tông** — bá chủ kiếm đạo, kiểm soát Thanh Phong Lĩnh và vùng phụ cận
- *(2 đại tông chính đạo khác — chưa đặt tên)*

*Ma Đạo (6 đại tông):*
- *(Chưa thiết kế chi tiết)*

*Trung Lập (5 đại tông):*
- *(Chưa thiết kế chi tiết)*

**Hiểm địa:**
- Vùng núi phía bắc — yêu thú cấp cao, vô chủ
- Đầm lầy độc phía đông — nguyên liệu hiếm nhưng nguy hiểm
- Sa mạc linh thạch phía tây — mỏ tự nhiên không có thế lực nào kiểm soát được lâu dài

**Linh Mạch tổng thể:** Dày đặc ở trung tâm, thưa dần ra biên giới. Một số Linh Mạch Cấp 5 nằm trong vùng hiểm địa, chưa ai khai thác được.

---

### Vùng 2: THẦN CHÂU LINH THỔ

**Tính chất:** Vùng linh khí phong phú nhất Nhân Giới. Trung tâm văn minh tu tiên. Các đại tông ở đây tồn tại hàng nghìn năm, ổn định hơn Khuyết Vực.

**Địa hình:** Cao nguyên bằng phẳng, sông linh lớn, rừng linh dược cổ thụ.

**Thế lực:** Chính Đạo chiếm ưu thế. Ma Đạo có nhưng bị áp chế mạnh.

**Đặc trưng:** Đây là nơi có nhiều Bí Cảnh nhất. Một số Bí Cảnh mở theo chu kỳ, thu hút tu sĩ từ khắp Nhân Giới đến.

*(Chưa thiết kế chi tiết tông môn)*

---

### Vùng 3: VĨNH DẠ HÀN NGUYÊN

**Tính chất:** Thảo nguyên băng giá rộng lớn. Dài đêm, ngắn ngày. Linh khí lạnh, thích hợp tu luyện băng hệ và âm hệ.

**Địa hình:** Thảo nguyên vô tận, bão tuyết, hồ nước đóng băng quanh năm.

**Thế lực:** Các tông môn phân tán hơn, lãnh thổ rộng nhưng dân số thưa. Ma Đạo chiếm ưu thế do môi trường khắc nghiệt.

**Hiểm địa:** Trung tâm Vĩnh Dạ — vùng băng vĩnh cửu, không ai sống được quá 3 ngày nếu không có công pháp đặc biệt.

*(Chưa thiết kế chi tiết tông môn)*

---

### Vùng 4: THIÊN TINH HẢI VỰC

**Tính chất:** Quần đảo và đại dương. Phần lớn diện tích là nước. Các tông môn trú trên đảo lớn, kiểm soát đảo nhỏ xung quanh.

**Địa hình:** Hàng nghìn đảo lớn nhỏ. Dòng chảy linh khí theo hải lưu, biến đổi theo mùa.

**Thế lực:** Cân bằng hơn giữa Chính Đạo, Ma Đạo, Trung Lập. Chiến tranh trên biển khác hẳn trên bộ.

**Đặc trưng:** Thương mại phát triển. Trung Lập chiếm ưu thế vì vị trí trung gian.

*(Chưa thiết kế chi tiết tông môn)*

---

### Vùng 5: CỔ VỰC

**Tính chất:** Vùng đất cổ đại, tàn tích văn minh tu tiên từ thời kỳ trước. Nguy hiểm bậc nhất Nhân Giới. Không có tông môn thực sự kiểm soát — chỉ có các thế lực tạm thời đóng trú.

**Địa hình:** Rừng nguyên sinh khổng lồ, tàn tích thành phố cổ, vực thẳm không đáy.

**Thế lực:** Không có chủ. Ai đủ mạnh thì tạm thời kiểm soát một khu. Yêu thú cổ đại mạnh hơn bất kỳ nơi nào khác.

**Đặc trưng:** Nơi có cơ duyên lớn nhất — và tỷ lệ tử vong cao nhất.

*(Không thiết kế tông môn cho vùng này — đây là nội dung endgame)*

---

## 4. Làng Khởi Đầu (Starter Villages)

### Nguyên tắc cốt lõi

- Số lượng: **50–100+ làng** rải rác khắp Khuyết Vực
- Người chơi được **phân ngẫu nhiên** vào một làng khi bắt đầu
- **KHÔNG có buff cơ học** — mỗi làng không cho ưu thế gì đặc biệt
- Làng chỉ là điểm xuất phát về mặt narrative, không có ý nghĩa balance

### Thiết kế làng

Mỗi làng là một thôn nhỏ nằm ở vùng ảnh hưởng (nhưng không trực thuộc) của một tông môn nào đó. Dân thường sinh sống, có chợ nhỏ, có lão tu sĩ ẩn cư đây đó.

Tên làng: ngắn, dân dã, không hoa mỹ. Ví dụ: Thanh Hà Trấn, Vân Lộc Thôn, Thạch Tuyền Ải...

*(Danh sách đầy đủ 50-100 làng chưa thiết kế)*

---

## 5. Hệ Thống Linh Mạch

Linh Mạch là nguồn linh khí tự nhiên trong lòng đất. Cấp Linh Mạch quyết định **trần tu luyện có thể đạt được** tại khu vực đó nếu không có hỗ trợ đặc biệt.

| Cấp | Tên gọi | Cảnh giới tương ứng | Ghi chú |
|-----|---------|---------------------|---------|
| Cấp 1 | Linh Khí (LK) | Luyện Khí | Phổ biến, hầu hết làng xóm |
| Cấp 2 | Trung Cấp (TC) | Trúc Cơ | Tiểu tông thường có |
| Cấp 3 | Kỳ Đặc (KĐ) | Kim Đan | Trung tông cần ít nhất 1 |
| Cấp 4 | Nguyên Anh (NA) | Nguyên Anh | Chỉ đại tông hoặc hiểm địa đặc biệt |
| Cấp 5 | Hóa Thần (HT) | Hóa Thần | Cực kỳ hiếm, thường trong Bí Cảnh hoặc hiểm địa |

**Cơ chế:** Tu sĩ có thể tu luyện vượt cấp Linh Mạch bằng cách dùng linh dược, đan dược đặc biệt — nhưng tốc độ chậm hơn nhiều và tốn kém hơn nhiều.

---

## 6. Trạng Thái Lãnh Thổ

Không phải tất cả đất đều có thế lực kiểm soát. Phân loại:

| Loại | Màu bản đồ | Mô tả |
|------|-----------|-------|
| Chính Đạo | Xanh lam / Ngọc | Tông môn chính đạo kiểm soát |
| Ma Đạo | Đỏ thẫm / Tím | Tông môn ma đạo kiểm soát |
| Trung Lập | Vàng / Nâu | Tông môn không theo phe nào |
| Hiểm Địa | Xám đậm | Vô chủ, nguy hiểm cao, tài nguyên hiếm |
| Hoang Địa | Xám nhạt | Vô chủ, ít tài nguyên, an toàn tương đối |
| Đại Dương / Hồ lớn | Xanh navy | Thiên Tinh Hải Vực và các vùng nước |

---

## 7. Trạng Thái Thiết Kế

| Hạng mục | Trạng thái |
|----------|-----------|
| 5 Đại Vùng — tên và tính chất | ✅ Hoàn thành |
| Khuyết Vực — thế lực tổng quan | ✅ Hoàn thành |
| Thái Thanh Kiếm Tông (mẫu đại tông) | ✅ Hoàn thành (xem SECT_SYSTEM_DESIGN.md) |
| Tên sub-region trong Khuyết Vực | 🔲 Chưa làm |
| 4 vùng còn lại — chi tiết tông môn | 🔲 Chưa làm |
| Danh sách 50-100 làng khởi đầu | 🔲 Chưa làm |
| Implement code | 🔲 Chưa làm |

---

## 8. Hướng Visual Mới — "Painted Scroll Map" (quyết định từ Session L7+)

> **Tóm tắt quyết định:** Bỏ SVG polygon flat color. Chuyển sang phong cách bản đồ cổ phong Trung Hoa — painted scroll, terrain illustrations, con dấu chữ Hán. Bắt đầu từ Tầng 1, lần lượt xuống.

### 8.1 Phong Cách Tham Khảo

Bản đồ thế giới Tu Tiên phong cách "Painted Scroll Map" với các đặc trưng:

- **Nền Parchment:** Giấy cũ màu kem/be, có grain texture (SVG feTurbulence filter). Không phải solid CSS gradient.
- **Terrain Illustrations:** Núi = tam giác xếp chồng có bóng (không phải polygon flat). Rừng = cụm cây tròn clustered. Biển/hồ = vùng teal flat với tên in nghiêng.
- **Cloud Border:** Viền mây cuộn bao quanh toàn bộ map ở 4 góc/cạnh — dùng SVG path hoặc repeating pattern.
- **Con Dấu Chữ Hán (印章):** Mỗi đại tông/đại vùng có 1 chữ Hán lớn trên nền vuông, màu theo phe:
  - Đỏ thẫm `#8B1A1A` bg + `#FFD700` border = Ma Đạo
  - Xanh đậm `#1A3A6B` bg + `#7EB8D4` border = Chính Đạo
  - Teal `#0F4A3A` bg + `#2DD4BF` border = Trung Lập
- **Location Labels:** Text nằm trực tiếp trên SVG (không phải tooltip/card). Tên vùng lớn = font lớn bold. Tên địa điểm nhỏ = font nhỏ gần icon.
- **Dotted Paths:** Đường chấm `stroke-dasharray="3,5"` kết nối locations/regions — trade routes.
- **Không có hard borders giữa vùng:** Terrain tự phân ranh giới (núi = biên giới tự nhiên).

### 8.2 Vấn Đề Hiện Tại Cần Fix (phát hiện Session L7+)

#### Bug MAP-1: Logic "Làng Lân Cận" Sai Design

**File:** `js/ui/world-map.js`, function `_renderTier2Territory`, dòng ~1336–1355

**Vấn đề:** Code filter `STARTER_VILLAGES` theo `v.nearZone === nodeId` rồi nhét vào cuối Tầng 3 với label "LÀNG LÂN CẬN". Sai vì:
- Tân Thủ Thôn KHÔNG phải bộ phận của territory tông môn
- Tân Thủ Thôn là màn hình riêng (flow `renderStarterVillage` khi `!leftStarter`) — đã đúng rồi
- Việc hiển thị trong territory map gây confusion

**Fix cần làm:**
- Xóa block `villageLocations`, `zoneVillages`, `inStarterPhase` khỏi `_renderTier2Territory`
- Xóa separator `<line>` và label "LÀNG LÂN CẬN"
- `const allLocs = interior.locations` (không còn village)
- Xóa handler click village trong territory
- KHÔNG xóa `STARTER_VILLAGES` data — vẫn cần cho `renderStarterVillage`

#### Bug MAP-2: Tầng 3 Visual Không Nhất Quán

**File:** `js/ui/world-map.js`, function `_renderTier2Territory`, phần render locations

**Vấn đề:** Tầng 1 và 2 đã upgrade lên "territory polygon map" nhưng Tầng 3 vẫn dùng `<circle r="24">` đơn lẻ floating trên background — trông như "node map cũ".

**Fix:** Được giải quyết khi implement Painted Scroll Map style cho Tầng 3 (xem 8.3).

### 8.3 Kế Hoạch Implement Theo Tầng

Thứ tự: **Tầng 1 → 2 → 3 → (Tầng 4 nếu cần)**.

---

#### TẦNG 1 — Nhân Giới Toàn Đồ (ưu tiên đầu tiên)

**Mục tiêu:** Rewrite `_buildKhuyetVucHtml` và `renderKhuyetVucMap` để render theo Painted Scroll style.

> **Lưu ý kiến trúc:** Hiện tại `renderTier1` → `renderKhuyetVucMap` (Tầng 1 đang hiển thị Khuyết Vực, không phải Nhân Giới Toàn Đồ). Cần tách ra:
> - `renderNhanGioiMap()` — Tầng 1 thực sự: 5 đại vùng từ `NHAN_GIOI_REGIONS`
> - `renderKhuyetVucMap()` — Tầng 2: lãnh thổ Khuyết Vực từ `KHUYETVUC_TERRITORIES`

**Các thành phần SVG cần build (thuần SVG, không cần PNG):**

1. **Parchment Background**
   ```svg
   <filter id="parchment">
     <feTurbulence baseFrequency="0.65" numOctaves="3" type="fractalNoise"/>
     <feColorMatrix type="saturate" values="0"/>
     <feBlend in="SourceGraphic" mode="multiply"/>
   </filter>
   <rect width="100%" height="100%" fill="#E8D5A3" filter="url(#parchment)"/>
   ```

2. **Cloud Border** — SVG path cuộn tròn trang trí 4 góc + 4 cạnh.

3. **5 Đại Vùng** — Dùng `NHAN_GIOI_REGIONS[].points` (đã có), nhưng thay vì flat polygon, render với:
   - Fill = màu terrain (xanh lá đậm cho đất, teal cho biển, trắng xám cho băng)
   - Không có stroke border — hoặc stroke rất mờ
   - Terrain icons overlay (mountain symbols, tree clusters, wave lines cho biển)

4. **Con Dấu Vùng** — Mỗi đại vùng có 1 chữ Hán đặc trưng:
   - Khuyết Vực: 缺 (teal stamp, đã có `implemented:true`)
   - Vĩnh Dạ Hàn Nguyên: 寒 (xanh băng)
   - Thần Châu Linh Thổ: 聖 (vàng gold)
   - Thiên Tinh Hải Vực: 海 (xanh navy)
   - Cổ Vực: 古 (tím/đen)

5. **Region Labels** — Tên vùng = chữ Hán + tên Việt, đặt trực tiếp trên terrain.

6. **"Chưa khám phá" state** — Vùng chưa `implemented` render mờ/desaturated, stamp có overlay `opacity:0.4`, kèm text nhỏ "Chưa khám phá".

**Data đã sẵn sàng:** `NHAN_GIOI_REGIONS` trong `map-data.js` đã có `points`, `lx`, `ly`, `chName`, `fill`, `stroke` — chỉ cần đổi cách render.

---

#### TẦNG 2 — Khuyết Vực Territory Map

**Mục tiêu:** Rewrite `_buildKhuyetVucHtml` theo Painted Scroll style.

**Thay đổi chính:**
- Background = parchment nhẹ hơn (warm beige, có grain)
- Polygon territories giữ nguyên shape từ `KHUYETVUC_TERRITORIES[].points` — nhưng fill = terrain color thay vì faction flat color
- Con dấu tông môn thay cho polygon faction label: mỗi territory có 1 stamp nhỏ đặt tại `lx, ly`
- Terrain icons: mountain icons cho terrain:'mountain', tree clusters cho terrain:'land'/forest, swamp texture cho terrain:'swamp'
- Hiểm địa render với cross-hatching pattern (xám tối)

**Data đã sẵn sàng:** `KHUYETVUC_TERRITORIES` đầy đủ, `FACTION_COLORS` cần update thêm terrain colors.

---

#### TẦNG 3 — Territory Interior Map

**Mục tiêu:** Rewrite `_renderTier2Territory` — bỏ circles, dùng illustrated location markers.

**Thay đổi chính:**
- Fix Bug MAP-1 (xóa làng lân cận) **trước**
- Location nodes dùng SVG symbols thay circles:
  - `sect_gate` = building icon (nhà có mái cong)
  - `hunt_zone` = tree cluster hoặc crossed swords
  - `market` = building nhỏ hơn
  - `cultivate_spot` = pillar/altar icon
  - `gather_zone` = herb icon
  - `dungeon` = cave/gate icon
  - `npc` = person silhouette
- Text label trực tiếp trên SVG (không phải element HTML riêng)
- Connecting dotted paths giữa các locations
- Background terrain phong phú hơn theo faction

**Data đã sẵn sàng:** `TERRITORY_INTERIORS` đầy đủ trong `map-data.js`.

---

#### TẦNG 4 — Tân Thủ Thôn (nếu cần)

Xem `js/ui/starter-village.js`. Hiện tại render riêng với SVG + gradient. Có thể upgrade sang parchment style sau khi 3 tầng trên xong.

### 8.4 Quy Tắc Kỹ Thuật

- **Thuần SVG** — không dùng ảnh PNG ngoại trừ nếu cần icon phức tạp
- **Reuse symbols** — define `<symbol>` trong `<defs>` cho mountain, tree, building icons
- **Filter dùng id unique** — tránh conflict giữa các tầng (vd: `parchment-t1`, `parchment-t2`)
- **Giữ nguyên data layer** — `NHAN_GIOI_REGIONS`, `KHUYETVUC_TERRITORIES`, `TERRITORY_INTERIORS` không thay đổi structure — chỉ thay render logic
- **Giữ nguyên interaction** — click handlers, `_showingKhuyetVuc`, `_mapLevel` state — chỉ thay visual output
- **Không dùng emoji** trong SVG map mới — thay bằng SVG path icons
- **Cloud border** — define 1 lần, reuse ở cả 3 tầng với scale khác nhau

### 8.5 Trạng Thái Implement

| Tầng | Mô tả | Trạng thái |
|------|-------|-----------|
| Fix MAP-1 (làng lân cận) | Xóa khỏi `_renderTier2Territory` | 🔲 Chưa làm |
| Tầng 1 — Nhân Giới Toàn Đồ | Painted Scroll, parchment, 5 vùng, stamps | 🔲 Chưa làm |
| Tầng 2 — Khuyết Vực Territory | Painted Scroll, terrain icons, stamps | 🔲 Chưa làm |
| Tầng 3 — Territory Interior | SVG symbols, dotted paths, no circles | 🔲 Chưa làm |
| Tầng 4 — Tân Thủ Thôn | Parchment village map | 🔲 Chưa làm (thấp ưu tiên) |
