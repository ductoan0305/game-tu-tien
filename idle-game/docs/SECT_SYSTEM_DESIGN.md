# SECT SYSTEM DESIGN — Hệ Thống Tông Môn

> Tài liệu thiết kế hệ thống tông môn cho game Tu Tiên Idle.  
> Đây là tài liệu lore/design thuần túy — chưa implement vào code.  
> Đọc kèm `WORLD_MAP_DESIGN.md` để hiểu bối cảnh thế giới.

---

## 1. Ba Cấp Bậc Tông Môn

Tất cả tông môn trong Nhân Giới đều thuộc một trong ba cấp:

| | Đại Tông | Trung Tông | Tiểu Tông |
|---|---|---|---|
| Tu vi đỉnh | Hóa Thần | Nguyên Anh | Kim Đan |
| Linh Mạch cao nhất | Cấp 5 (HT) | Cấp 3–4 (KĐ–NA) | Cấp 2–3 (TC–KĐ) |
| Tổng đệ tử | 50.000+ | 3.000–5.000 | 500–800 |
| Lãnh thổ | Vùng rộng lớn | Một sơn hệ / lưu vực | Một đỉnh / thung lũng |
| Bí Cảnh | Nhiều, cấp cao | 1–2, cấp trung | Không có hoặc 1 nhỏ |
| Vị thế | Định luật khu vực | Ổn định địa phương | Tồn tại nhờ bảo hộ |

### Cấu trúc phân cấp lệ thuộc

```
Đại Tông
├── Trung Tông A  (lệ thuộc trực tiếp)
│   ├── Tiểu Tông 1
│   ├── Tiểu Tông 2
│   └── ...
├── Trung Tông B
│   ├── Tiểu Tông 1
│   └── ...
└── Trung Tông C–E (tối đa 5)
```

**Quan hệ giữa cấp:** Đại Tông không giao dịch trực tiếp với Tiểu Tông (ngoại trừ chiêu mộ nhân tài xuất chúng hoặc xử lý vi phạm khế ước nghiêm trọng). Chuỗi chỉ huy đi qua Trung Tông.

---

## 2. Hệ Thống Chức Vụ

### Đại Tông — Chức vụ đầy đủ

| Chức vụ | Tu Vi | Số lượng | Ghi chú |
|---------|-------|----------|---------|
| Thái Thượng Trưởng Lão | Hóa Thần | 1–3 | Không tham chính, cố vấn tối cao |
| Chưởng Môn | Nguyên Anh Hậu Kỳ | 1 | Người nắm quyền thực tế |
| Phó Chưởng Môn | Nguyên Anh Trung–Hậu Kỳ | 1–2 | |
| Khách Khanh | Nguyên Anh Sơ Kỳ+ | 3–7 | Tu sĩ ngoài tông, ký hợp đồng dài hạn |
| Trưởng Lão | Nguyên Anh Sơ–Hậu Kỳ | 10–20 | Quản lý các bộ phận |
| Chân Truyền | Kim Đan Hậu Kỳ | 1–2 người / trưởng lão | Đệ tử thân truyền |
| Nội Môn | Trúc Cơ Sơ Kỳ+ | ~5.000 | |
| Ngoại Môn | Luyện Khí 7–9 | ~15.000 | |
| Tạp Dịch | Luyện Khí 1–9 | ~30.000 | Tuyệt đối không phải Trúc Cơ |

> ⚠️ **Quan trọng:** Tạp Dịch = Luyện Khí ONLY. Trúc Cơ trở lên tối thiểu là Ngoại Môn.  
> ⚠️ **Bỏ hoàn toàn:** Chức "Thái Thượng Chưởng Môn" — không tồn tại trong thiết kế này.

### Trung Tông — Chức vụ

| Chức vụ | Tu Vi | Số lượng |
|---------|-------|----------|
| Môn Chủ | Nguyên Anh Trung Kỳ | 1 |
| Phó Môn Chủ | Nguyên Anh Sơ Kỳ | 1 |
| Trưởng Lão | Kim Đan Hậu Kỳ – NA Sơ Kỳ | 4–6 |
| Chân Truyền | Kim Đan Trung–Hậu Kỳ | 8–15 |
| Nội Môn | Trúc Cơ+ | ~200 |
| Ngoại Môn | Luyện Khí 7+ | ~800 |
| Tạp Dịch | Luyện Khí 1–9 | ~2.000 |

### Tiểu Tông — Chức vụ

| Chức vụ | Tu Vi | Số lượng |
|---------|-------|----------|
| Đường Chủ / Tông Chủ | Kim Đan Trung–Hậu Kỳ | 1 |
| Phó | Kim Đan Sơ–Trung Kỳ | 1 |
| Trưởng Lão | Trúc Cơ Hậu Kỳ – KĐ Sơ Kỳ | 2–3 |
| Chân Truyền | Trúc Cơ Trung–Hậu Kỳ | 3–5 |
| Nội Môn | Trúc Cơ Sơ Kỳ+ | ~50 |
| Ngoại Môn | Luyện Khí 7+ | ~200 |
| Tạp Dịch | Luyện Khí 1–9 | ~500 |

---

## 3. Tài Nguyên Tông Môn

### Phân loại tài nguyên

**Linh Mạch** (xem bảng cấp bậc trong WORLD_MAP_DESIGN.md)

**Mỏ linh thạch:**
- Hạ phẩm, trung phẩm, thượng phẩm, đặc phẩm
- Đại tông kiểm soát: 85+ mỏ các loại
- Trung tông: 12–25 mỏ
- Tiểu tông: 3–8 mỏ

**Linh Điền / Dược Viên:**
- Trồng linh thảo, linh dược
- Quy mô tỉ lệ thuận với cấp tông môn

**Động Thiên Phúc Địa:**
- Không gian đặc biệt, linh khí cô đặc cực cao
- Tốc độ tu luyện bên trong tăng đáng kể
- Đại tông có nhiều, trung tông có 1–2 nhỏ, tiểu tông thường không có

**Bí Cảnh:**
- Không gian dị giới, mở theo chu kỳ hoặc điều kiện đặc biệt
- Chứa cơ duyên, công pháp, linh bảo cổ đại
- Nguy hiểm tương xứng với phần thưởng
- Đại tông kiểm soát quyền vào Bí Cảnh là đặc quyền lớn

**Nguyên liệu đặc thù:**
- Linh thú / yêu thú trong vùng kiểm soát (da, xương, linh hạch)
- Khoáng vật đặc biệt (thiên kim, hàn thiết, linh ngọc...)
- Linh tuyền, linh hồ (nước có linh khí)

---

## 4. Hệ Thống Cống Nộp

Quan hệ lệ thuộc được duy trì bằng khế ước thần thệ và nghĩa vụ cống nộp định kỳ.

### Tiểu Tông → Trung Tông

- Linh thạch hàng năm (chủ yếu hạ phẩm, một phần trung phẩm)
- Nhân lực phục dịch (đệ tử Luyện Khí phục vụ theo mùa vụ)
- Ưu tiên bán nguyên liệu thô cho trung tông trước khi ra ngoài
- Hỗ trợ quân sự khi trung tông có chiến tranh (theo tỷ lệ quy định trong khế ước)

### Trung Tông → Đại Tông

- Linh thạch trung phẩm hàng năm
- Linh dược / đan dược cấp 3+
- Hoặc tài nguyên đặc thù (theo chuyên môn của trung tông)
- Điều động lực lượng chiến đấu khi đại tông cần (tối đa 30% lực lượng)
- Tuần tra biên cương theo lịch luân phiên

### Đổi lại, cấp trên cung cấp

- Bảo hộ quân sự
- Quyền tiếp cận tài nguyên cấp cao (hạn chế, theo công lao)
- Danh nghĩa: "lệ thuộc X" = có X làm bảo đảm trong mọi giao dịch
- Ưu tiên thu mua hoặc giá ưu đãi cho một số hàng hóa

---

## 5. Ba Phe Phái

### Chính Đạo

- Công khai tuyên bố bảo vệ Nhân Giới, trừ tà diệt ma
- Có hội đồng liên minh — các đại tông họp định kỳ để quyết sách chung
- Nội bộ không nhất thiết trong sạch — tranh quyền đoạt lợi vẫn xảy ra, nhưng dưới lớp vỏ ngoài trang nghiêm
- Tối thiểu 3 đại tông tại Khuyết Vực

### Ma Đạo

- Không có liên minh thực sự — hợp tác tạm thời vì lợi ích, phản bội khi cần
- Quan hệ lệ thuộc dựa trên sợ hãi, không phải khế ước bình đẳng
- Nội bộ: giết chóc để thăng tiến là bình thường, được chấp nhận
- Chưởng Môn giữ ngôi bằng sức mạnh tuyệt đối
- Đệ tử tạp dịch thường là nô lệ, tù nhân, người bị bắt
- Tối thiểu 6 đại tông tại Khuyết Vực (đông hơn chính đạo, nhưng phân tán hơn)

### Trung Lập

- Không tham gia cuộc chiến Chính–Ma
- Thường chuyên về thương mại, luyện đan, luyện khí, học thuật
- Có thể bán dịch vụ cho cả hai phe
- Đôi khi bị cả hai phe gây áp lực
- Tối thiểu 5 đại tông tại Khuyết Vực

---

## 6. Template Đại Tông: THÁI THANH KIẾM TÔNG

*Đây là tông môn mẫu đầy đủ nhất, dùng làm chuẩn cho các tông môn khác.*

**Phân loại:** Đại Tông Chính Đạo  
**Trú địa:** Thái Thanh Sơn và vùng phụ cận, trung tâm Khuyết Vực  
**Chuyên hướng:** Kiếm đạo, đặc biệt kiếm pháp thuần dương và phong hệ  
**Lịch sử:** Hàng nghìn năm, từng là bá chủ Khuyết Vực trước khi ma đạo trỗi dậy

### Lãnh Thổ & Tài Nguyên

**Linh Mạch:**
- 1× Linh Mạch Cấp 5 (Hóa Thần) — nằm sâu trong Thái Thanh Sơn, bí mật tuyệt đối
- 3× Linh Mạch Cấp 4 (Nguyên Anh) — các đỉnh chính của sơn môn
- 8× Linh Mạch Cấp 3 (Kim Đan) — rải rác vùng kiểm soát
- 20+ Linh Mạch Cấp 1–2 — vùng ngoại vi, cho đệ tử cấp thấp tu luyện

**Mỏ Linh Thạch:** 85+ mỏ (hạ, trung, thượng phẩm và một số đặc phẩm)

**Tài nguyên đặc biệt:**
- Thái Thanh Kiếm Trúc — nguyên liệu chế kiếm pháp khí hàng đầu
- Thanh Phong Linh Tuyền — nước linh, tăng hiệu quả tu luyện phong hệ
- Thiên Kiếm Đài — Động Thiên Phúc Địa lớn, tu luyện +40% hiệu quả
- 3 Bí Cảnh đã kiểm soát, chu kỳ mở khác nhau
- Rừng Thái Thanh — yêu thú phong hệ cấp cao, linh thảo cổ thụ

### Nhân Lực

| Chức vụ | Tu Vi | Số lượng |
|---------|-------|----------|
| Thái Thượng Trưởng Lão | Hóa Thần Sơ–Trung Kỳ | 2 |
| Chưởng Môn | Nguyên Anh Hậu Kỳ | 1 |
| Phó Chưởng Môn | Nguyên Anh Trung Kỳ | 2 |
| Khách Khanh | Nguyên Anh Sơ Kỳ+ | 5 |
| Trưởng Lão | Nguyên Anh Sơ–Hậu Kỳ | 15 |
| Chân Truyền | Kim Đan Hậu Kỳ | ~20 (1–2/trưởng lão) |
| Nội Môn | Trúc Cơ+ | ~5.000 |
| Ngoại Môn | Luyện Khí 7+ | ~15.000 |
| Tạp Dịch | Luyện Khí 1–9 | ~30.000 |

### Cơ Cấu Lệ Thuộc

**4 Trung Tông lệ thuộc trực tiếp:**

| Trung Tông | Chuyên môn | Tiểu Tông lệ thuộc | Cống nộp |
|-----------|-----------|-------------------|---------|
| Thanh Phong Kiếm Môn | Kiếm pháp phong hệ | 7 | 3.000 linh thạch TC + 50 linh dược cấp 3/năm |
| Ngọc Hư Đạo Viện | Luyện đan hỗ trợ | 6 | 500 đan dược cấp 3 + 1.000 linh thảo hiếm/năm |
| Huyết Kiếm Doanh | Chiến đấu biên cương | 8 | 200 linh hạch yêu thú cấp 3+ + tuần tra 6 tháng/năm |
| Linh Quang Thư Viện | Bảo tồn công pháp | 5 | 200 quyển công pháp cấp thấp + 50 bí kíp cấp 3/thế hệ |

**Tổng:** 4 Trung Tông → 26 Tiểu Tông  
**Quan hệ:** Thái Thanh không giao dịch trực tiếp với Tiểu Tông

---

## 7. Template Trung Tông: THANH PHONG KIẾM MÔN

**Phân loại:** Trung Tông Chính Đạo | Lệ thuộc Thái Thanh Kiếm Tông  
**Trú địa:** Thanh Phong Lĩnh, tây bắc vùng Thái Thanh kiểm soát  
**Chuyên hướng:** Kiếm pháp phong hệ, luyện khí cấp tốc

**Linh Mạch:**
- 2× Cấp 3 (Kim Đan) — mỏ chính
- 4× Cấp 1–2 — phân tán

**Mỏ linh thạch:** 12 mỏ (trung + hạ phẩm)

**Tài nguyên đặc trưng:**
- Phong Linh Thảo Nguyên — thảo dược phong hệ
- 1 Động Thiên nhỏ (+20% tu luyện, chỉ nội môn)
- Rừng Thanh Phong — yêu thú phong hệ

**Nhân lực:** (xem bảng Trung Tông ở mục 2)

**7 Tiểu Tông lệ thuộc:**  
Vân Tiêu Đường, Phi Kiếm Các, Lăng Vân Trai, Tuyết Kiếm Xã, Bắc Phong Đường, Sương Kiếm Môn, Thanh Lãnh Tông

---

## 8. Template Tiểu Tông: VÂN TIÊU ĐƯỜNG

**Phân loại:** Tiểu Tông Chính Đạo | Lệ thuộc Thanh Phong Kiếm Môn  
**Trú địa:** Vân Tiêu Phong, một đỉnh nhỏ thuộc Thanh Phong Lĩnh  
**Chuyên hướng:** Kiếm thuật nhẹ thân, ám khí phong hệ

**Linh Mạch:**
- 1× Cấp 2 (Trúc Cơ) — mỏ duy nhất
- 3 mỏ linh thạch hạ phẩm

**Tài nguyên:** Vân Tiêu Thảo (thảo dược thường), rừng nhỏ yêu thú cấp thấp

**Nhân lực:** (xem bảng Tiểu Tông ở mục 2)

**Nghĩa vụ nộp cống:**
- 300 linh thạch hạ phẩm/năm
- 10 đệ tử Luyện Khí phục dịch tại Thanh Phong 3 tháng/năm

**Cơ chế nhân tài chảy ngược lên:**  
Đệ tử đột phá Kim Đan tại Vân Tiêu Đường → linh khí cấp 2 không đủ để tiến thêm → tự nguyện hoặc được tiến cử lên Thanh Phong hoặc Thái Thanh. Đây là động lực tự nhiên để tài năng tập trung ở cấp cao hơn.

---

## 9. Đặc Thù Ma Đạo

Cùng khung 3 cấp bậc, nhưng khác biệt căn bản:

**Quan hệ lệ thuộc:** Không phải khế ước bình đẳng — phục tùng hoặc bị diệt.

**Nội bộ:**
- Tranh đoạt, ám sát để thăng tiến: bình thường, được chấp nhận ngầm
- Chưởng Môn giữ ngôi bằng sức mạnh tuyệt đối, không phải uy tín hay bầu bán
- Không có "hội đồng" — Chưởng Môn quyết định một mình

**Tài nguyên:**
- Khai thác tận kiệt thay vì bền vững
- Chiếm mỏ tiểu tông khi cần, không cần lý do

**Đệ tử tạp dịch:** Thường là nô lệ, tù nhân chiến tranh, người thường bị bắt — không tự nguyện gia nhập.

**Liên minh:** Tạm thời, vì lợi ích. Phản bội là chiến lược hợp lệ.

---

## 10. Trạng Thái Thiết Kế

| Hạng mục | Trạng thái |
|----------|-----------|
| Hệ thống 3 cấp bậc tông môn | ✅ Hoàn thành |
| Bảng chức vụ 3 cấp | ✅ Hoàn thành |
| Hệ thống Linh Mạch 5 cấp | ✅ Hoàn thành |
| Phân loại tài nguyên | ✅ Hoàn thành |
| Hệ thống cống nộp | ✅ Hoàn thành |
| Template Đại Tông — Thái Thanh Kiếm Tông | ✅ Hoàn thành |
| Template Trung Tông — Thanh Phong Kiếm Môn | ✅ Hoàn thành |
| Template Tiểu Tông — Vân Tiêu Đường | ✅ Hoàn thành |
| Đặc thù Ma Đạo (tổng quan) | ✅ Hoàn thành |
| Mẫu đại tông Ma Đạo cụ thể | 🔲 Chưa làm |
| Mẫu đại tông Trung Lập cụ thể | 🔲 Chưa làm |
| Các đại tông còn lại trong Khuyết Vực | 🔲 Chưa làm |
| Tông môn các vùng khác (Thần Châu, Vĩnh Dạ...) | 🔲 Chưa làm |
