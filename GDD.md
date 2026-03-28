# TU TIÊN IDLE — Game Design Document (GDD)
**Phiên bản:** v12 | **Cập nhật:** 2026-03-19

> **Tài liệu này dành cho ai?**
> Nhóm ý tưởng, game designer, product owner — những người **không cần biết code** nhưng cần hiểu game đang có gì, thiếu gì, và có thể phát triển thêm gì.
>
> Nếu bạn là developer, đọc `HANDOFF.md` thay thế.

---

## 1. Tổng quan game

**Thể loại:** Idle RPG (Incremental Game)
**Nền tảng:** Trình duyệt web (không cần cài đặt)
**Chủ đề:** Tu tiên — thế giới kiếm hiệp Trung Hoa, người chơi là một tu sĩ luyện khí để đạt đến cảnh giới tối cao

**Vòng lặp cốt lõi:**
```
Tu luyện → Tích lũy linh lực → Đột phá cảnh giới → Mạnh hơn → Tu luyện nhanh hơn
```

**Cảm giác mục tiêu:**
Người chơi bắt đầu là kẻ vô danh, từng bước leo lên 8 cảnh giới, chinh phục địa phủ, trở thành Chưởng Môn tông môn, và cuối cùng Thành Tiên.

---

## 2. Hành trình người chơi (Player Journey)

### Lần đầu mở game
1. Màn hình tạo nhân vật → đặt tên, chọn giới tính, **Khai Linh Căn** (cinematic, có thể thử lại 3 lần)
2. Nếu linh căn hiếm (Song/Biến Dị/Thiên): nhận **Thư Mời** từ tông môn — chọn gia nhập ngay hoặc tán tu
3. **Tán tu:** bắt đầu ở làng tân thủ ngẫu nhiên (4 làng), gặp NPC nhận quest đầu
4. **Gia nhập tông môn ngay:** bắt đầu tại zone tông môn, được cấp công pháp Hạ Phẩm, quest giới thiệu riêng
5. Bắt đầu ở cảnh giới **Luyện Khí tầng 1** với ~120 năm tuổi thọ — linh lực tự tăng theo thời gian
6. Đủ linh lực → bấm **Đột Phá** → lên tầng tiếp theo

### Vòng lặp hàng ngày
- Mở game → nhận **offline progress** (linh lực tích lũy khi tắt máy)
- Làm **nhiệm vụ hàng ngày** (4 loại)
- Đánh **quái** để lấy đồ, kinh nghiệm
- Luyện **đan dược** để tăng sức mạnh
- Đóng góp cho **tông môn**
- Khám phá **địa phủ** (dungeon)

### Vòng lặp dài hạn
- Leo 8 cảnh giới × 9 tầng = 72 bước tiến
- Mở khóa **passive skill tree** theo linh căn
- Đạt cảnh giới tối cao → **Luân Hồi** → reset nhưng giữ bonus → mạnh hơn vòng sau

---

## 3. Hệ thống Cảnh Giới (Realm System)

**8 cảnh giới**, mỗi cảnh có 9 tầng:

| # | Tên | Đặc điểm |
|---|-----|-----------|
| 0 | Luyện Khí | Khởi đầu, linh lực yếu |
| 1 | Trúc Cơ | Bắt đầu gặp quái mạnh hơn |
| 2 | Kim Đan | Mở khóa dungeon sơ cấp |
| 3 | Nguyên Anh | Nguyên anh xuất thể, mạnh vượt trội |
| 4 | Hóa Thần | Thần thức khai mở |
| 5 | Luyện Hư | Luyện hư hợp đạo |
| 6 | Hợp Thể | Hợp nhất với thiên địa |
| 7 | Đại Thừa | Cảnh giới cuối trước Thành Tiên |

**Thiên Kiếp:** Khi đột phá lên cảnh giới mới (từ realm 3+), có thể xảy ra **Thiên Kiếp** — buộc phải chiến đấu trước khi được đột phá. Thua = không được đột phá lần đó.

**Chỉ số tăng khi lên cảnh giới:** ATK, DEF, HP, tốc độ tích lũy linh lực.

---

## 4. Hệ thống Linh Căn (Spirit Root)

Chọn 1 lần khi tạo nhân vật, **không thể đổi**. Ảnh hưởng toàn bộ build.

| Linh Căn | Bonus chính | Passive Tree mạnh nhất |
|----------|-------------|----------------------|
| ⚔ Kim | +20% ATK | Kiếm đạo, sát thương |
| 🌿 Mộc | +30% HP | Sinh mệnh, hồi phục |
| 💧 Thủy | +25% tốc độ tu luyện | Tốc độ, mưu trí |
| 🔥 Hỏa | +15% ATK, +30% luyện đan | Tấn công, đan dược |
| 🗿 Thổ | +40% DEF | Phòng thủ, HP |
| ☯ Âm Dương | +10% tất cả | Cân bằng, toàn năng |
| 🌌 Hỗn Nguyên | +25% tất cả | Huyền thoại, mọi thứ |

**Hệ thống mới (v11):** Linh căn giờ dùng hệ điểm đa nguyên tố thay vì chọn 1 loại cố định. Mỗi linh căn có `mainElement` + điểm phân bổ cho các nguyên tố phụ. Phân loại theo số nguyên tố:
- **Thiên Linh Căn (1 nguyên tố, 90+ điểm)** — huyền thoại, tốc độ ×3.0
- **Biến Dị Linh Căn (1 nguyên tố đặc biệt)** — cực hiếm, ×2.8
- **Song Linh Căn (2 nguyên tố)** — cực hiếm, ×2.2
- **Tam Linh Căn (3 nguyên tố)** — **thường**, ×1.4 *(không phải "hiếm")*
- **Tứ Linh Căn (4 nguyên tố)** — thường, ×0.7
- **Ngũ Linh Căn (5 nguyên tố)** — thường, ×0.4

**Khí Vận** (0-100): Sinh ngẫu nhiên theo loại linh căn khi tạo nhân vật. Ảnh hưởng tần suất Cơ Duyên. Thiên Linh Căn/Biến Dị khởi đầu khí vận cao hơn.

> **Thiết kế note:** Người chơi có thể thử lại khai linh căn 3 lần. Hỗn Nguyên thực chất là Thiên Linh Căn với nguyên tố hiếm — rất khó roll được, không nên restart vì cơ chế này có thể nhận thư mời tông môn ngay cả với Song/Biến Dị.

---

## 5. Hệ thống Tông Môn (Sect)

**Chọn khi tạo nhân vật** (nếu nhận thư mời) hoặc gia nhập sau khi đạt Luyện Khí Tầng 3.

| Tông Môn | Vị trí trên Map | Công Pháp Hạ Phẩm | Hợp với Linh Căn |
|----------|-----------------|--------------------|-----------------|
| ⚔ Thanh Vân Kiếm Tông | Thanh Vân Sơn | Thanh Vân Kiếm Quyết | Kim |
| ⚗ Vạn Linh Đan Tông | Vạn Linh Thị | Vạn Linh Đan Kinh | Hỏa, Thủy |
| 🔮 Huyền Cơ Các | Thiên Kiếp Địa | Huyền Cơ Trận Pháp | Thổ |
| 💪 Thiết Cốt Môn | Ẩn Long Động | Thiết Cốt Tâm Pháp | Mộc, Thổ |

**Gia nhập ngay từ đầu (thư mời):**
- Bắt đầu tại zone tông môn, không qua làng tân thủ
- Được cấp Công Pháp Hạ Phẩm ngay (×1.0 tốc độ, thay vì Vô Danh ×0.7)
- Quest đầu tiên là quest giới thiệu tông môn riêng
- Có NPC 3 nhân vật: Trưởng Lão + 2 huynh đệ/sư muội với dialogue theo cảnh giới

**Tán tu:** Không có công pháp tốt, không có NPC huynh đệ, nhưng tự do hơn. Có thể gia nhập sau khi đạt điều kiện.

**Hoạt động Tông Môn** (tab 🏯):
- 11 loại đóng góp: cúng nạp đá, truyền công, tuần tra, tham gia tông chiến...
- Tích lũy **Công Lao** để lên 8 cấp bậc: Ngoại Môn Đệ Tử → Chưởng Môn
- Mỗi cấp bậc cho bonus stat vĩnh viễn (stoneBonus, ratePct, atkPct...)

> **Còn thiếu:** Tông Môn Chiến PvP, sự kiện tông môn định kỳ.

---

## 6. Hành Động Thủ Công (Manual Actions)

8 hành động trong tab **Tu Luyện**, có stamina cooldown:

| Hành động | Phần thưởng chính | Ghi chú |
|-----------|------------------|---------|
| 🧘 Bế Quan | ×1.6 tốc độ tu luyện | Toggle on/off |
| 💤 Nghỉ Ngơi | +stamina | Hồi phục thể lực |
| 🗺 Thám Hiểm | đá linh, vật phẩm ngẫu nhiên | Sự kiện ngẫu nhiên |
| 🎣 Câu Cá | nguyên liệu luyện đan | |
| 🔮 Bố Trận | kinh nghiệm, đá linh | |
| ⚔ Cắt Luyện | kinh nghiệm chiến đấu | |
| 🧘 Thiền Định | kinh nghiệm tu luyện | |
| ⚡ Đột Phá | lên tầng/cảnh giới | Cần đủ linh lực |

---

## 7. Hệ thống Chiến Đấu (Combat)

**Tab ⚔ Chiến Đấu** — Turn-based, người chơi chọn hành động mỗi lượt.

### Kẻ thù
- **Realm 0-2:** 9 enemy thông thường (yêu sói, thổ quỷ, hỏa hồ...)
- **Realm 3-7:** 10 enemy cấp cao (ma thú, thiên ma...)
- **Thiên Kiếp:** Boss đặc biệt xuất hiện khi đột phá

### Hành động chiến đấu
- **Tấn công thường** — không tốn MP
- **Kỹ năng** (9 loại) — tốn MP, hiệu ứng đặc biệt
- **Dùng vật phẩm** — dùng đan dược từ túi đồ
- **Bỏ chạy** — có thể thất bại

### Status Effects
- 🔥 Burn — mất HP mỗi lượt
- 💫 Stun — mất lượt
- ❄ Freeze — giảm tốc độ

### Loot sau chiến đấu
- Đá linh, kinh nghiệm
- **Trang bị** (drop ngẫu nhiên theo rarity: thường → huyền thoại)

> **Còn thiếu:** PvP với rival, chiến đấu theo đội, boss world.

---

## 8. Hệ thống Địa Phủ (Dungeon)

**Tab ☠ Địa Phủ** — 10 tầng, tăng độ khó.

| Tầng | Tên | Yêu cầu | Đặc biệt |
|------|-----|---------|---------|
| 1-4 | Ngoại Tầng | Luyện Khí+ | Enemy thường |
| **5** | **Điện Diêm La** | Kim Đan+ | **BOSS 1** |
| 6-9 | Thâm Tầng | Nguyên Anh+ | Enemy mạnh |
| **10** | **Ngự Tọa Diêm Điện** | Đại Thừa+ | **BOSS CUỐI** |

**Cơ chế:**
- Thắng tầng → lên tầng tiếp, nhận reward
- Thua/bỏ chạy → lui về tầng trước
- Boss tầng 10 có kỹ năng **Hồi Sinh** (hồi 30% HP, chỉ dùng 1 lần)

**Reward đặc biệt:** Vật phẩm dungeon-exclusive (Diêm La Phong Ấn, Yama Crown...)

> **Còn thiếu:** Random room events (kho báu, bẫy, NPC bán đồ trong dungeon), dungeon weekly leaderboard, recipe dùng dungeon items.

---

## 9. Hệ thống Luyện Đan (Alchemy)

**Tab ⚗ Luyện Đan**

- Thu thảo dược từ **5 vùng** khác nhau
- Luyện đan theo công thức đã mở khóa
- **Rủi ro nổ lò** — thất bại mất nguyên liệu
- Lò đan có thể nâng cấp (giảm rủi ro, tăng hiệu quả)
- Đan dược dùng trong chiến đấu hoặc tu luyện

> **Còn thiếu:** Recipe dùng vật liệu dungeon, "Thần đan" tier cao (realm 5+), transmute vật liệu.

---

## 10. Hệ thống Trang Bị (Equipment)

**Tab ⚔ Trang Bị** — 9 slot: Đầu / Thân / Tay Trái / Tay Phải / Thắt Lưng / **Chân** / Nhẫn T / Nhẫn P / Pháp Bảo *(bỏ Mặt và Cổ từ v11)*

- **Trang bị mặc định khi bắt đầu:** Áo Vải Thô (zero stat, giữ ấm) + random Gậy Gỗ/Kiếm Sắt (đánh quái được)
- Items với 5 mức độ hiếm: Thường → Huyền Thoại
- Drop sau khi thắng chiến đấu (ngẫu nhiên)
- Click item trong túi trang bị = equip ngay vào slot tương ứng
- Bán đồ thừa lấy đá linh

---

## 11. Hệ thống Kỹ Năng (Skills)

**Tab ✦ Kỹ Năng** — 9 kỹ năng active, mua bằng đá linh

Chia 3 tier theo cảnh giới yêu cầu:
- **Tier 1** (Luyện Khí): Ngự Khí, Thể Tôi, Tốc Hành
- **Tier 2** (Trúc Cơ): Kiếm Tâm, Đan Hỏa, Thiết Giáp
- **Tier 3** (Kim Đan): Trận Pháp, Thần Thức, Thiên Nhãn

> **Còn thiếu:** Kỹ năng combat đặc biệt theo linh căn, skill combo system mở rộng.

---

## 12. Hệ thống Passive Skill Tree (Thiên Phú)

**Tab ✦ Thiên Phú** — cây kỹ năng thụ động theo linh căn

Mỗi linh căn có **9 nodes** (3 nhánh × 3 tầng):
- Tầng 1: 3 node cơ bản, mở tự do
- Tầng 2: 3 node mạnh hơn, cần tầng 1 tương ứng
- Tầng 3: 1 node đỉnh duy nhất, cần cả 3 node tầng 2

Mỗi node có tối đa **3 rank**, mua bằng đá linh.

> **Còn thiếu:** Node unlock theo dungeon boss, passive combo khi kết hợp nhiều node.

---

## 13. Hệ thống Nhiệm Vụ (Quest)

**Tab 📜 Nhiệm Vụ**

| Loại | Số lượng | Reset |
|------|---------|-------|
| Story (main chain) | 10 quest (+ 4 intro tông môn) | Không |
| Side quest | 15 quest | Không |
| Daily quest | 12 quest | Hàng ngày |
| Bounty (truy nã) | 8 quest | Cooldown sau hoàn thành |
| Sect quest | 5 quest | Cooldown sau hoàn thành |

**Quest đầu tiên theo loại nhân vật:**
- **Tán tu:** `sq_00_meet_elder` — Gặp NPC làng, sau đó chuỗi story chính
- **Gia nhập tông môn:** `sq_sect_intro_{sectId}` — Gặp Trưởng Lão tông, riêng cho từng tông

> **Còn thiếu:** Quest cho dungeon boss, quest liên quan passive tree.

---

## 14. Hệ thống Danh Hiệu (Title)

**25 danh hiệu** unlock khi đạt thành tích:
- Realm milestones (Kiếm Đồng, Kiếm Sĩ...)
- Combat (Sát Thần, Vô Song...)
- Alchemy (Đan Đồng, Đan Sư...)
- Prestige (Vĩnh Hằng, Bất Diệt...)
- Special (Thiên Kiêu, Vô Danh Đạo Nhân...)

Người chơi chọn 1 danh hiệu để hiển thị bên cạnh tên.

---

## 15. Hệ thống Luân Hồi (Prestige)

Khi đạt **Đại Thừa** (realm 7) → có thể Luân Hồi:
- Reset toàn bộ tiến trình về Luyện Khí
- Giữ lại: bonus vĩnh viễn (+rate%, +atk%, +stone%)
- Mỗi lần luân hồi bonus tăng thêm

> **Còn thiếu:** Chọn "Thiên Đạo" (buff đặc biệt mỗi lần luân hồi), narrative event khi luân hồi, mục tiêu rõ ràng cho lần luân hồi thứ N.

---

## 16. Hệ thống Xếp Hạng (Ranking)

**Tab 🏆 Xếp Hạng** — NPC rivals cạnh tranh realtime

- 9 NPC rivals tự động tu luyện song song
- Người chơi thấy mình đứng ở đâu trong bảng xếp hạng
- Rivals tăng cảnh giới theo thời gian thực

> **Còn thiếu:** PvP thực sự với rival, thách đấu thư, rival có dungeon progress riêng.

---

## 17. Tổng hợp — Chỗ còn trống (Content Gaps)

### Thiếu hệ thống hoàn toàn
| Hệ thống | Độ ưu tiên | Lý do |
|----------|-----------|-------|
| Achievement UI | 🔴 Cao | Data đã có nhưng không hiển thị — người chơi không biết mục tiêu |
| Tông Môn Chiến | 🟡 Trung | Tăng engagement hàng ngày |
| Dungeon room events | 🟡 Trung | Làm dungeon thú vị hơn |
| Luân Hồi mở rộng | 🔴 Cao | Lý do chính để chơi lại |
| World Boss | 🟢 Thấp | Cần multiplayer foundation trước |

### Thiếu nội dung trong hệ thống hiện có
| Hệ thống | Thiếu gì |
|----------|---------|
| Dungeon | Random events, weekly leaderboard, dungeon-only recipes |
| Alchemy | Thần đan tier cao, transmute, dungeon material recipes |
| Quest | Quest dungeon, quest tông môn, quest passive tree |
| Skills | Skill theo linh căn, mở rộng combat skills |
| Shop | Vật phẩm theo cảnh giới, bundle deals |

### Thiếu polish / UX
| Vấn đề | Trạng thái |
|--------|-----------|
| Tutorial | ✅ v11: Cẩm nang + banner hướng dẫn tân thủ trong quest tab |
| Quest không rõ nguồn gốc | ✅ v11: Mỗi quest có npcHint chỉ đường cụ thể |
| World Events spam | ✅ v11: Đã xóa hoàn toàn |
| Tuổi thọ sai (70 vs 120) | ✅ v11: Khởi đầu 120 năm đúng với Luyện Khí |
| KhíVận cứng = 20 | ✅ v11: Random theo loại linh căn |
| Achievement không hiển thị | ⬜ Vẫn còn thiếu |
| Offline progress quá đơn giản | ⬜ Vẫn còn thiếu |
| Notification đột phá/quest | ⬜ Vẫn còn thiếu |

---

## 18. Thống kê nhanh (Quick Stats)

| Loại nội dung | Số lượng hiện có |
|--------------|-----------------|
| Cảnh giới | 8 × 9 tầng = 72 bước |
| Kẻ thù | 42 (realm 0-4) + boss dungeon |
| Trang bị | 19+ items, 9 slot (thêm slot Chân) |
| Kỹ năng active | 9 |
| Passive nodes | 7 linh căn × 9 = 63 nodes |
| Công thức đan | ~15 |
| Quest | 10 story + 4 sect-intro + 15 side + 12 daily + 8 bounty + 5 sect |
| Danh hiệu | 25 |
| Dungeon tầng | 10 (2 boss) |
| Hoạt động tông môn | 11 |
| Cấp bậc tông môn | 7 |

---

---

## 19. Triết lý thiết kế cốt lõi (v12)

> **Đọc phần này trước khi code bất cứ thứ gì.**

Game Tu Tiên Idle **không phải game giải trí đại chúng**. Độ khó cực cao là có chủ đích. Người chơi nghỉ vì game quá khó không phải đối tượng hướng đến.

**Ba trụ cột không thứ nào thay thế được thứ kia:**

| Yếu tố | Ý nghĩa | Có thể bù bằng? |
|--------|---------|----------------|
| Thiên Phú (Linh Căn) | Tốc độ và giới hạn tự nhiên | Không — chỉ bù một phần bởi nỗ lực |
| Nỗ Lực (Quest, Rèn luyện) | Tích lũy chỉ số theo thời gian | Không — thiên phú tốt mà lười vẫn thất bại |
| Cơ Duyên | Bước ngoặt thay đổi số phận | Không — con đường tắt duy nhất, không thể cầu được |

**Khó kiểu đúng:** Người chơi hiểu rõ mình cần gì, nhưng con đường để đạt được đó dài và không chắc chắn — như ý nghĩa "cùng trời tranh mệnh".

---

## 20. Hệ thống 5 Chỉ Số Nhân Vật (v12)

Các field này đã tồn tại trong G state (`khiVan, ngoTinh, canCot, tamCanh, huongTu`) nhưng cần được implement đầy đủ cơ chế.

**Nguyên tắc quan trọng:** Mỗi chỉ số KHÔNG thể tăng đồng thời — mỗi hành động chỉ tăng 1-2 chỉ số. Đây là trade-off chiến lược cốt lõi.

### Khí Vận (khiVan) — 0 đến 100
Sinh ngẫu nhiên khi tạo nhân vật theo loại linh căn. Ảnh hưởng **tần suất và chất lượng Cơ Duyên**.
- Tăng qua: nhận Cơ Duyên đặc biệt, hoàn thành danh hiệu, một số quest bí ẩn
- **KHÔNG** tăng qua bế quan hay chiến đấu thông thường
- Công thức cooldown Cơ Duyên: khiVan=100 → 1 năm game; khiVan=30 → 5 năm game

### Ngộ Tính (ngoTinh) — 0 đến cap theo cảnh giới
Tốc độ học kỹ năng, chất lượng bế quan, hiệu quả học Công Pháp. Người Ngộ Tính cao cùng thời gian bế quan hiểu công pháp sâu hơn — tích thêm "Cảm Ngộ Điểm" ẩn.
- Tăng qua: Thiền Định (tốn stamina, cooldown dài), đọc Cổ Thư (vật phẩm hiếm), quest loại "học hỏi"
- Cap theo cảnh giới: LK→60 | TC→75 | KĐ→85 | NA→92 | HT→100
- Ảnh hưởng đột phá qua F_ngotinh trong công thức

### Căn Cốt (canCot) — 0 đến cap theo cảnh giới
Chất lượng kinh mạch và đan điền — khả năng chứa linh lực, kháng đan độc, và sức chiến đấu thực sự.
- Tăng qua: Chiến đấu thắng enemy mạnh hơn mình, Rèn Thể (cooldown 3-5 ngày game), quest "sinh tử luyện thể"
- Tốc độ tăng cực chậm — tối đa 1-2 điểm/ngày thực từ chiến đấu
- **Quan trọng nhất:** Giảm tích lũy Đan Độc — mỗi 10 điểm Căn Cốt trên chuẩn → giảm 5% `danDoc` tích lũy

### Tâm Cảnh (tamCanh) — 0 đến 100
Trạng thái tinh thần. Ảnh hưởng trực tiếp xác suất đột phá (F_tamcanh). Người bế quan liên tục KHÔNG tăng được Tâm Cảnh — phải ra ngoài trải nghiệm thực tế.
- Tăng qua: hoàn thành quest **THÀNH CÔNG**, thiền định, tương tác NPC có ý nghĩa
- **GIẢM** khi: thất bại quest hoặc bỏ nửa chừng, thất bại đột phá, bị tấn công bất ngờ
- Range ảnh hưởng đột phá: 0-20→×0.7 | 21-50→×0.9 | 51-80→×1.1 | 81-100→×1.3

### Hướng Tu (huongTu) — Định hướng tích lũy
Không chọn tường minh. Tích lũy theo hành động người chơi thực hiện nhiều nhất. Ảnh hưởng passive bonus và NPC nhận xét.

---

## 21. Linh Căn — Thiết kế chi tiết (v12)

### Tỷ lệ xuất hiện mới (thay thế tỷ lệ cũ)

| Linh Căn | Rate × | Xác suất mới | Xác suất cũ |
|----------|--------|-------------|------------|
| Thiên Linh Căn | ×3.0 | **0.01%** | 3% |
| Biến Dị Linh Căn | ×2.8 | **1.5%** | 2% |
| Song Linh Căn | ×2.2 | **3.5%** | 10% |
| Tam Linh Căn | ×1.4 | **21%** | 25% |
| Tứ Linh Căn | ×0.7 | **39%** | 35% |
| Ngũ Linh Căn | ×0.4 | **35%** | 25% |

> ⚠️ **Cần cập nhật trong `spirit-root.js` hàm `rollSpiritRoot()`**

### Rate base = 0.06 qi/s (thay thế 1.0)

Với người chơi active 5h/ngày + offline bế quan 19h (20% hiệu suất offline):

| Linh Căn | Ngày đạt LK9 | Tuổi ước tính |
|----------|-------------|--------------|
| Thiên (tông môn) | ~2.2 ngày | ~tuổi 27 |
| Song (tông môn) | ~3.0 ngày | ~tuổi 31 |
| Tam (tán tu) | ~9.5 ngày | ~tuổi 62 |
| Tứ (tán tu) | ~19 ngày (chết trước) | Kẹt LK8 tuổi 70 |
| Ngũ (tán tu) | Không đạt được | LK6 khi chết |

> ⚠️ **Linh căn KHÔNG có hard cap.** Ngũ linh căn vẫn có thể Trúc Cơ nếu có đủ cơ duyên + đan dược + nỗ lực. Linh căn chỉ quyết định tốc độ và xác suất, không phải giới hạn tuyệt đối.

### Điều kiện gia nhập tông môn (cập nhật)

| Điều kiện | Kết quả |
|-----------|---------|
| Ngũ linh căn | **Không bao giờ được nhận** |
| Thiên/Song/Biến Dị + LK tầng 3 + tuổi ≤ 20 | Thư mời ngay từ đầu |
| Tam/Tứ linh căn + LK tầng 3 + tuổi ≤ 20 | Được nhận (tuyển thông thường) |
| Bất kỳ + đã Trúc Cơ | Bất kỳ tông nào đều đón nhận |
| Song/Biến Dị/Thiên + LK hậu kỳ + tuổi < 30 | Được nhận (tài năng muộn) |

---

## 22. Công thức Đột Phá Đa Thông Số (v12)

Thay thế hoàn toàn cơ chế hiện tại "đủ 100% qi bấm là được".

### Công thức tổng quát
```
P(thành công) = P_base × F_lingcan × F_tuoi × F_qivuot × F_cancot × F_ngotinh × F_tamcanh × F_danduoc + Bonus_coduyen
```

### P_base — Xác suất nền theo vị trí cảnh giới

| Đột phá | P_base |
|---------|--------|
| LK sơ kỳ (tầng 1→2→3) | 90% |
| LK sơ → trung (tầng 3→4) | 75% |
| LK trung (4→5→6) | 80% |
| LK trung → hậu (6→7) | 55% |
| LK hậu (7→8→9) | 70% |
| **LK hậu → Trúc Cơ (9→TC1)** | **15%** |
| TC sơ → trung | 65% |
| TC trung → hậu | 40% |
| **TC viên mãn → Kim Đan** | **8%** |
| KĐ → Nguyên Anh | 5% |
| NA → Hóa Thần | 2% |

### Các nhân tố F

**F_lingcan:** Thiên×1.5 | Biến Dị×1.4 | Song×1.2 | Tam×1.0 | Tứ×0.7 | Ngũ×0.4

**F_tuoi:** 16-40→×1.0 | 41-55→×0.85 | 56-65→×0.65 | 66-70→×0.30 | >70 (LK→TC)→×0

**F_qivuot:** 100%→×1.0 | 120%→×1.15 | 150%→×1.35 | 200%→×1.6 | 300%+→×2.0(cap)

**F_cancot:** mỗi 10pt Căn Cốt trên chuẩn cảnh giới → cộng thêm +5% vào P cuối

**F_ngotinh:** Ngộ Tính thấp(<20)→×0.85 | trung(20-60)→×1.0 | cao(>60)→×1.15

**F_tamcanh:** 0-20→×0.7 | 21-50→×0.9 | 51-80→×1.1 | 81-100→×1.3

**F_danduoc:** Không dùng→×1.0 | Trúc Cơ Đan thường→×1.5 | Hóa Nguyên Đan hiếm→×2.0 | Thiên Đạo Đan cực hiếm→×3.0

**Bonus_coduyen:** Thiên Đạo Cảm Ngộ→+40% | Tiền Bối Ký Ức→+25% (cộng thêm vào P cuối, dùng 1 lần)

### Hậu quả thất bại

| Loại | Điều kiện | Hậu quả |
|------|-----------|---------|
| Thất bại thường | Phổ biến | Qi→80%, Tâm Cảnh -5 đến -10, mất 1-3 năm tuổi thọ |
| Thất bại nghiêm trọng | Qi chỉ 100-110% khi thử | Qi→60%, Tâm Cảnh -20, nguy cơ Tẩu Hỏa Nhập Ma |
| Đại thất bại | Cảnh giới lớn, chuẩn bị kém | HP mất mạnh, Qi→30%, Tẩu Hỏa Nhập Ma nặng |

### UI Tooltip đột phá (cần implement)
Khi hover vào nút Đột Phá, hiển thị xác suất và breakdown từng nhân tố + gợi ý cải thiện. Ví dụ:
```
🎯 Cơ hội thành công: 34%
Nền 55% × Linh căn(×0.7) × Tuổi 52t(×0.85) × Qi 110%(×1.0) × Tâm Cảnh 45(×0.9)
💡 Tích qi lên 200% → ~55% | Dùng Trúc Cơ Đan → ×1.5
⚠️ danDoc = 65 — cân nhắc thanh tẩy trước
```

> ⚠️ **Cần thêm field `danDoc: 0` vào `createFreshState()` trong state.js. Tăng SAVE_VERSION lên 11.**

---

## 23. Hệ thống Đan Dược — 7 Phần Dược 3 Phần Độc (v12)

Lạm dụng đan dược làm cảnh giới bất ổn. Sử dụng đúng cách kết hợp với Căn Cốt và chiến đấu mới phát huy tối đa.

### Chỉ số Đan Độc (danDoc) — 0 đến 100

- Mỗi lần dùng đan tăng danDoc theo mức độ
- Tự giảm cực chậm — 1 điểm mỗi 5 năm game khi không dùng đan
- Căn Cốt cao giảm lượng tích lũy: mỗi 10pt Căn Cốt trên chuẩn → -5% danDoc tích lũy
- Chiến đấu thắng enemy mạnh hơn → giảm 0.5-1 điểm danDoc

| Mức danDoc | Hiệu ứng |
|------------|---------|
| 0-40 | Bình thường |
| 41-70 | Tốc độ tích qi giảm nhẹ (-10%) |
| 71-90 | Cảnh báo vàng, F_qivuot giảm trong đột phá |
| 91-100 | Cảnh báo đỏ, xác suất Tẩu Hỏa Nhập Ma tăng mạnh |

### Mức danDoc tích lũy theo loại đan

| Loại đan | danDoc + |
|----------|---------|
| Đan hồi qi thông thường | +3 |
| Đan tăng tốc tu luyện | +8 |
| Trúc Cơ Đan / Đột Phá Đan | +15 |
| Đan cực phẩm hiếm | +25 |
| Đan Thể Tu (rèn Căn Cốt) | +1 |
| **Thanh Tẩy Đan (giải độc)** | **-20** |

---

## 24. Công Pháp — 5 Trường Phái (v12)

Mở rộng từ hệ thống tốc độ đơn giản thành hệ thống đa chiều.

| Loại | Ví dụ | Ảnh hưởng chính |
|------|-------|----------------|
| Khí Công (tu luyện) | Thanh Vân Kiếm Quyết | Tốc độ tích qi, chất lượng linh lực |
| Chiến Công (chiến đấu) | Thiết Cốt Tâm Pháp | ATK, DEF, Căn Cốt tăng qua chiến đấu |
| **Thân Pháp (tốc độ)** | Lăng Vân Bộ, Thoát Ảnh Thuật | **Giảm thời gian di chuyển**, né tránh combat |
| Luyện Thể (thể chất) | Kim Cương Bất Hoại | Giảm đan độc, tăng sức chịu đựng, Căn Cốt |
| Hỗn Hợp (cân bằng) | Vạn Linh Đan Kinh | Cân bằng nhiều mặt, không đỉnh mặt nào |

**Nguyên tắc:** Chỉ tu 1 công pháp chính tại một thời điểm. Có thể học thêm công pháp phụ ở mức sơ cấp nhưng không bao giờ mạnh bằng chính.

---

## 25. Di Chuyển Có Trọng Lượng (v12)

Hiện tại di chuyển gần như tức thì — cần thêm chi phí thời gian thực sự. Đây là nền tảng để quest có ý nghĩa và Kiếp Tu có thể xảy ra trên đường.

- Làng tân thủ → Thanh Vân Sơn: ~2-3 năm game đi bộ
- Thân Pháp cao → giảm thời gian di chuyển đáng kể
- Linh Thú bay → giảm thêm 40-70%
- Quest xa xôi: phần thưởng cao hơn tương xứng rủi ro

---

## 26. Hệ thống Linh Thú (v12 — chưa implement)

Linh Thú không phải pet đơn giản — là hợp đồng bình đẳng. **Linh Thú chết là mất vĩnh viễn.**

### Cách nhận
- Cơ Duyên tier 2-3 (gặp Linh Thú bị thương, cứu → nó theo)
- Dungeon drop (trứng Linh Thú hiếm)
- Quest đặc biệt dài nhiều bước
- Thương Hội bán (giá cao, chất lượng trung bình)

### Phân loại theo ảnh hưởng

| Loại | Ví dụ | Bonus chủ nhân |
|------|-------|---------------|
| Linh Thú Bay | Thanh Vân Hạc, Hỏa Phụng | Giảm 40-70% thời gian di chuyển |
| Linh Thú Chiến | Huyền Hổ, Thạch Hùng | +ATK/DEF, tham chiến như đồng đội |
| Linh Thú Ngửi | Linh Hồ, Tiên Thỏ | Tăng tần suất Cơ Duyên, tìm thảo dược hiếm |
| Linh Thú Thủy | Giao Long Con | Tăng hiệu quả luyện đan, giảm tỷ lệ nổ lò |
| Linh Thú Thổ | Địa Thử Tinh | Tăng tốc thu thập tài nguyên |

### Cơ chế nuôi dưỡng
- Linh Thú có cảnh giới riêng, cần cho ăn linh thảo và dẫn vào dungeon
- Linh Thú yếu không thể theo chủ vào vùng nguy hiểm — phải để lại hoặc chấp nhận rủi ro chết

---

## 27. Hệ thống Kiếp Tu (v12 — chưa implement)

### Kiếp Tu chủ động
Tán tu có thể chủ động chọn con đường Kiếp Tu — sống ngoài vòng pháp luật các thế lực lớn.

**Lợi ích:** Nhận nhiệm vụ từ Hắc Thị (thưởng ×3-5 lần), học công pháp Ma Đạo, tiếp cận vật phẩm cấm

**Rủi ro:** Bị tông môn truy sát, không vào thành lớn công khai, bị bắt = tịch thu tài sản / Game Over đặc biệt. Karma hắc ám → khó đột phá theo chính đạo (Ma Đạo có con đường riêng).

### Gặp Kiếp Tu trên đường — Sự kiện ngẫu nhiên

**Xác suất phụ thuộc:**
- Đi một mình vs đoàn đội: một mình ×2.5
- Vùng xa xôi hoang vắng: ×2.0
- Cảnh giới thấp đi vùng cao: ×1.8
- Mang nhiều tài nguyên quý: ×1.5
- Có Linh Thú chiến: ×0.6
- Mặc phục tông môn mạnh: ×0.4

**4 kịch bản khi gặp:**
1. Tống tiền → nộp hoặc chiến đấu
2. Chiến đấu bắt buộc → thắng loot, thua mất tài sản + bị thương
3. Bỏ chạy → cần Thân Pháp/Linh Thú bay
4. **Mất mạng** — Game Over đột ngột nếu cảnh giới chênh lệch quá lớn

> Cái chết đột ngột này là **thiết kế có chủ đích**. Đây là áp lực tâm lý thực sự — không phải chỉ chờ tuổi thọ cạn.

---

## 28. Thương Hội (v12 — chưa implement)

Thế lực thứ ba trong thế giới tu tiên. Trung lập tuyệt đối, chỉ theo tiền. Có mặt khắp nơi vì tất cả đều cần.

### Hai cách tham gia
- **Khách hàng:** Bất kỳ ai cũng mua được, dùng Thương Phiếu (tiền tệ thứ hai ngoài linh thạch)
- **Thành viên:** Tán tu hoặc tu sĩ rời tông môn gia nhập như lựa chọn thay thế tông môn

### Các hoạt động

| Hoạt động | Mô tả | Rủi ro |
|-----------|-------|--------|
| Vận Tiêu | Áp tải hàng A→B, thưởng cao | Có thể gặp Kiếp Tu trên đường |
| Thu Mua | Bán đồ giá cao hơn shop | Phải đến chi nhánh — tốn di chuyển |
| Đấu Giá | Mua/bán vật phẩm hiếm định kỳ | Cần Thương Phiếu |
| Thám Báo | Mua thông tin vị trí cơ duyên, vùng nguy hiểm | Thông tin có hạn sử dụng |
| Hợp Tác Thương Đoàn | Bỏ vốn nhận lãi sau X ngày | Có thể mất vốn nếu bị cướp |

### Tam giác quan hệ
- Tông Môn mua thông tin Kiếp Tu từ Thương Hội (nếu trả tiền)
- Thương Hội mua đồ cướp từ Kiếp Tu (cắt 30% hoa hồng, không hỏi nguồn gốc)
- Thương Hội đôi khi thuê Kiếp Tu đánh Tông Môn đối thủ

---

## 29. Quest — Thiết kế chiều sâu (v12)

### Không thể spam — Mỗi quest có chi phí thực sự

| Loại quest | Chỉ số tăng | Chi phí thực | Cooldown |
|------------|------------|-------------|---------|
| Chiến đấu / săn thú | Căn Cốt, Tâm Cảnh | HP mất, di chuyển tốn thời gian | Cooldown theo zone |
| Khám phá / thám hiểm | Khí Vận, Ngộ Tính nhỏ | Stamina lớn, thời gian di chuyển | 2-3 ngày game |
| Học hỏi / thiền định | Ngộ Tính, Tâm Cảnh | Thời gian bế quan bị chiếm | Cooldown dài |
| Đóng góp tông môn | Công Lao, Tâm Cảnh | Linh thạch hoặc nguyên liệu | 1 ngày game |
| Sinh tử thử thách | Căn Cốt lớn | HP về gần 0, rủi ro mất đồ | 1 tuần game |
| Vận Tiêu Thương Hội | Linh thạch | Thời gian dài + rủi ro Kiếp Tu | Theo chuyến |

**Nguyên tắc:** Tâm Cảnh chỉ tăng khi THÀNH CÔNG thực sự. Thất bại hoặc bỏ nửa chừng thì Tâm Cảnh GIẢM.

### Trade-off thời gian — Người chơi tự khám phá

Không ai có thể tối ưu tất cả trong 1 ngày. Nhịp điệu tối ưu khoảng `60% bế quan + 25% chiến đấu + 15% quest` — nhưng game KHÔNG chỉ thẳng điều này. Người chơi phải tự tìm ra.

---

## 30. Roadmap kỹ thuật (v12) — Thứ tự triển khai

### Ưu tiên 🔴 (làm ngay — ảnh hưởng time balance toàn game)
1. `data.js` — `REALMS[0].rate: 1 → 0.06`
2. `spirit-root.js` — cập nhật xác suất linh căn mới (0.01/1.5/3.5/21/39/35%)
3. `state.js` — thêm `danDoc: 0` vào `createFreshState()`, tăng SAVE_VERSION→11
4. `actions.js` — viết lại `doBreakthrough()` theo công thức đa thông số

### Ưu tiên 🟡 (làm sau — cải thiện UX)
5. Tooltip xác suất đột phá trong render
6. Check tuổi >70 trong đột phá LK→TC
7. Block Ngũ linh căn khỏi gia nhập tông môn
8. Di chuyển tốn thời gian trong `world-map.js`

### Ưu tiên 🟢 (trung hạn)
9. Hệ thống Linh Thú (`linh-thu-engine.js` mới)
10. Thương Hội (tab mới)
11. Sự kiện gặp Kiếp Tu trên đường
12. Nghề Nghiệp có gameplay thực (Linh Thực trước)

---

---

## 31. Kinh Tế — Một Đồng Tiền (v12)

Game chỉ dùng **một đồng tiền duy nhất: Linh Thạch**. Không có tiền tệ thứ hai.

Thay vào đó, tông môn và Thương Hội dùng **hệ thống điểm cống hiến** — không thể mua bằng linh thạch, chỉ kiếm được bằng hành động thực sự:

| Tổ chức | Tên điểm | Cách kiếm | Dùng để đổi |
|---------|---------|-----------|------------|
| Tông Môn | Công Lao | Đóng góp nguyên liệu, hoàn thành quest tông môn, bảo vệ tông môn | Công pháp độc quyền, đan dược tông môn, trang bị tông môn |
| Thương Hội | Điểm Tín Nhiệm | Hoàn thành Vận Tiêu, Đấu Giá thành công, Hợp Tác Thương Đoàn | Thông tin độc quyền, hàng hiếm không bán công khai, ưu tiên Đấu Giá |

**Nguyên tắc:** Hai loại điểm này phản ánh **uy tín tích lũy** — không thể mua, chỉ có thể kiếm. Linh thạch là phương tiện giao dịch phổ thông. Điểm cống hiến là thứ tiền không thể mua được.

### Vòng tuần hoàn linh thạch

```
Đánh quái → Item drop → Bán → Linh Thạch
                ↓
    Sink nhỏ liên tục: đan dược hồi qi, gather zone tốt hơn, đóng góp tông môn
    Sink lớn định kỳ: nâng cấp lò đan (200→8000), kỹ năng tier cao, Passive node rank 3
    Sink chiến lược: mua công pháp tốt hơn, đầu tư Thương Đoàn, mua Linh Thú
```

**Economy phải thưởng cho nỗ lực:** Người Tứ/Ngũ linh căn chăm đánh quái phải kiếm được nhiều linh thạch hơn người Thiên linh căn lười biếng. Đây là cơ chế bù đắp tự nhiên.

---

## 32. Không Có Luân Hồi — Chết Là Hết (v12)

Game **không có cơ chế Luân Hồi/Prestige**. Chết là tạo nhân vật mới hoàn toàn — linh căn mới, tuổi mới, tên mới, bắt đầu từ đầu.

### Hệ quả thiết kế

Mọi quyết định đều có trọng lượng thực sự vì không có "lần sau làm lại". Cái chết có ý nghĩa thực sự.

### Hall of Fame — Giữ Động Lực Sau Khi Chết

Khi nhân vật chết (dù vì tuổi thọ hay Kiếp Tu), toàn bộ hành trình được lưu vào **Hall of Fame**:

- Tên, linh căn, tuổi thọ đã sống, cảnh giới cao nhất
- Số cơ duyên đã gặp, số Kiếp Tu đã đánh bại
- Kỳ tích nổi bật (Ngũ linh căn đạt Trúc Cơ, thắng Kiếp Tu cao hơn 1 cảnh giới...)
- Chronicle tóm tắt 5 khoảnh khắc đáng nhớ nhất

Người chơi tạo nhân vật mới nhưng luôn thấy danh sách những người đã đi trước. Đây là nguồn động lực — vừa là kỷ lục để phá, vừa là câu chuyện để kể.

### Chronicle cuối — Khoảnh khắc cảm xúc

Khi nhân vật chết, hiển thị tóm tắt hành trình trước khi về màn hình tạo nhân vật:
> *"Ngươi đã sống 67 năm, đạt Trúc Cơ tầng 3, đánh bại 847 kẻ thù, gặp 12 cơ duyên. Một đời tu luyện — dù chưa thành tiên, cũng đã vượt qua phần lớn người đời."*

---

## 33. Kiếp Tu — Logic Chặt Chẽ (v12)

### Nguyên tắc cốt lõi: Cảnh giới chênh lệch = kết quả tiền định

Trong thế giới tu tiên, cảnh giới là khoảng cách **không thể vượt qua bằng nỗ lực thuần túy**. Trúc Cơ vs Luyện Khí không phải "khó hơn" — mà là khác chiều về bản chất.

### 4 Trường hợp gặp Kiếp Tu

**Trường hợp 1 — Kiếp Tu cao hơn 1 cảnh giới (ví dụ TC gặp LK):**

Không có cơ hội chiến thắng. Không có cơ hội bỏ chạy nếu Kiếp Tu muốn giết. Kết quả phụ thuộc **ý định của Kiếp Tu**:

| Ý định | Xác suất | Kết quả |
|--------|---------|---------|
| Chỉ muốn cướp đồ | 50% | Mất tài sản, sống sót |
| Muốn giết diệt khẩu | 30% | **Game Over** |
| Muốn thu làm tay sai | 15% | Quest đặc biệt — phục vụ hoặc chết |
| Không thèm để ý | 5% | Thoát |

Xác suất thay đổi theo Danh Vọng người chơi — nổi tiếng là thiên tài linh căn, Kiếp Tu có thể cân nhắc giữ lại thay vì giết.

**Trường hợp 2 — Kiếp Tu cùng cảnh giới nhưng tầng cao hơn:**

Kết quả phụ thuộc chênh lệch **sức mạnh thực tế**:
```
Sức mạnh thực tế = Tầng × hệ số + Căn Cốt bonus + Trang bị + Kỹ năng + Linh Thú
```

| Chênh lệch sức mạnh | Kết quả |
|--------------------|---------|
| < 20% | Chiến đấu cân bằng, kết quả ngẫu nhiên có trọng số |
| 20-50% | Người yếu chỉ có thể thoát, không thể thắng |
| > 50% | Giống Trường hợp 1 — phụ thuộc ý định Kiếp Tu |

**Trường hợp 3 — Kiếp Tu cùng tầng:**

Chiến đấu thực sự. Kết quả phụ thuộc hoàn toàn vào chuẩn bị: trang bị, kỹ năng, đan dược, Căn Cốt, Linh Thú. Thắng Kiếp Tu cùng tầng là cột mốc đáng tự hào — loot tốt hơn monster thường.

**Trường hợp 4 — Người chơi mạnh hơn Kiếp Tu:**

Kiếp Tu **bỏ chạy** nếu cảm nhận được nguy hiểm. Từ con mồi thành thợ săn — khoảnh khắc thỏa mãn quan trọng trong hành trình.

### Xác suất gặp Kiếp Tu

| Yếu tố | Ảnh hưởng |
|--------|---------|
| Đi một mình | ×2.5 xác suất |
| Vùng xa xôi hoang vắng | ×2.0 |
| Cảnh giới thấp đi vùng cao | ×1.8 |
| Mang nhiều tài nguyên quý | ×1.5 |
| Có Linh Thú chiến | ×0.6 |
| Mặc phục tông môn mạnh | ×0.4 |
| Danh Vọng cao | ×0.5 |

### 4 Kịch bản khi gặp

1. **Tống tiền** — nộp X linh thạch → được đi. Từ chối → chiến đấu bắt buộc
2. **Chiến đấu** — thắng loot Kiếp Tu, thua mất tài sản + bị thương nặng
3. **Bỏ chạy** — cần Thân Pháp/Linh Thú bay. Thành công → thoát mất stamina. Thất bại → bị đánh trong lúc chạy, thiệt hại nặng hơn
4. **Mất mạng** — cảnh giới chênh lệch quá lớn, không có đường thoát → **Game Over đột ngột**

> **Cái chết đột ngột là thiết kế có chủ đích.** Không phải chỉ chờ tuổi thọ cạn — kẻ liều lĩnh có thể chết bất kỳ lúc nào.

### Phân loại Kiếp Tu

| Loại | Đặc điểm | Nguy hiểm |
|------|---------|---------|
| Kiếp Tu Lẻ | Hành động một mình, thường là tán tu thất bại | Trung bình — có thể đoán được |
| Kiếp Tu Băng Nhóm | 3-5 người, phân công rõ (chặn đường/tấn công/canh) | Cao — cần Thân Pháp hoặc Linh Thú bay để thoát |
| Kiếp Tu Danh Tiếng | Có biệt danh, nổi tiếng trong vùng | Rất cao — mini-boss thế giới mở |
| Thiên Ma / Ma Tu | Tu Ma Đạo, có thể hút linh lực nạn nhân | Cực cao — ác mộng với người đang chuẩn bị đột phá |

### Kiếp Tu chủ động — Con đường lãng du

Tán tu có thể chủ động chọn trở thành Kiếp Tu:

**Lợi ích:** Nhận nhiệm vụ từ Hắc Thị (thưởng ×3-5 lần thường), học công pháp Ma Đạo, tiếp cận vật phẩm cấm

**Rủi ro:** Bị tông môn truy sát, không vào thành lớn công khai, bị bắt = tịch thu tài sản / Game Over đặc biệt. Karma hắc ám tích lũy → khó đột phá theo Chính Đạo.

### Hệ thống Truy Nã Hai Chiều

- **Người chơi truy nã Kiếp Tu:** Nhận bounty từ tông môn/Thương Hội, đi tìm và tiêu diệt Kiếp Tu cụ thể
- **Kiếp Tu truy nã người chơi:** Nếu giết nhiều Kiếp Tu, các băng nhóm đặt bounty lên đầu người chơi — đi đâu cũng có thể bị phục kích kể cả vùng "an toàn"

---

## 34. Linh Lực Thuần Độ — Cơ Chế Thay Thế Vượt 100% (v12)

### Triết lý

**100% linh lực = Chạm tới cánh cửa.** Từ đó không phải "tích thêm" mà là **tinh luyện** — nén linh lực thô thành tinh thuần. Lực đẩy mở cánh cửa mạnh hay yếu phụ thuộc vào chất lượng này.

> ⚠️ **Thay đổi kỹ thuật quan trọng:** Loại bỏ hoàn toàn cơ chế "vượt 100% qi". Khi đạt 100%, qi dừng tích lũy và chuyển sang tích lũy `purity` (Thuần Độ).

### Chỉ số Thuần Độ (purity) — 0% đến 100%

**Cách tăng:**
- Tiếp tục bế quan sau khi đạt 100% qi — bế quan lúc này tăng Thuần Độ thay vì qi
- Thiền định sâu (tốn stamina, tăng nhanh hơn bế quan thường)
- Đan dược đặc biệt tăng Thuần Độ trực tiếp
- Cơ Duyên "Linh Mạch Ngộ Đạo"

**Tốc độ tăng Thuần Độ:**
Căn Cốt cao → tăng Thuần Độ nhanh hơn. Kinh mạch tốt → lọc linh lực hiệu quả hơn. Đây là lý do thực sự để rèn Căn Cốt từ sớm.

### Ảnh hưởng đến đột phá

| Thuần Độ | F_purity | Ghi chú |
|---------|---------|---------|
| 0-30% | ×0.6 | Linh lực thô, không ổn định — dễ Tẩy Hỏa |
| 31-60% | ×1.0 | Trung bình |
| 61-85% | ×1.3 | Linh lực tinh thuần |
| 86-100% | ×1.6 | Hoàn hảo — tỷ lệ đột phá tối đa |

### Quyết định chiến lược

Người chơi có một quyết định quan trọng: **đột phá khi Thuần Độ bao nhiêu?**
- Đột phá sớm (Thuần Độ thấp): tiết kiệm thời gian nhưng tỷ lệ thất bại cao
- Chờ Thuần Độ cao: tốn thêm ngày thực nhưng an toàn hơn

Người Tứ/Ngũ linh căn **bắt buộc phải chờ** Thuần Độ cao vì F_lingcan đã thấp — không thể bù thêm rủi ro từ Thuần Độ kém.

### UI

Thanh qi hiển thị 0-100%. Khi đạt 100%, thanh **chuyển thành thanh Thuần Độ** với màu khác — từ xanh lam (thô) dần sang vàng (tinh thuần). Người chơi thấy trực quan quá trình tinh luyện.

> ⚠️ **Cần thêm field `purity: 0` vào `createFreshState()` trong state.js.**

---

## 35. Danh Vọng — Uy Tín Toàn Thế Giới (v12)

Khác với **Danh Dự tông môn** (uy tín nội bộ), **Danh Vọng** là uy tín của nhân vật trong toàn bộ thế giới tu tiên.

### Ảnh hưởng của Danh Vọng

- NPC xa lạ đối xử khác — Danh Vọng cao được kính trọng, thấp bị xem thường
- Xác suất Kiếp Tu tấn công — Danh Vọng cao ×0.5
- Điều kiện một số quest — "Chỉ nhận người có danh tiếng đáng kể"
- Giá Thương Hội — Danh Vọng cao được bán rẻ hơn 5-10%

### Tăng / Giảm Danh Vọng

**Tăng:** Đột phá cảnh giới mới, thắng Kiếp Tu có tên tuổi, hoàn thành quest khó hiếm người làm, vào top 3 xếp hạng NPC rivals

**Giảm:** Bỏ chạy khỏi Kiếp Tu yếu hơn mình, thất bại nhiệm vụ quan trọng công khai, bị Kiếp Tu cướp công khai

---

## 36. Ma Đạo — Con Đường Thứ Ba (v12)

### Triết lý

Ma Đạo không phải "ác" đơn giản — đây là con đường tu luyện **đi ngược lại tự nhiên**: thay vì thuận theo thiên địa linh khí, Ma Tu cưỡng đoạt linh lực từ bên ngoài. Nhanh hơn ở giai đoạn đầu, nhưng nền tảng không vững và Tâm Cảnh dần sụp đổ.

### So sánh Chính Đạo vs Ma Đạo

| | Chính Đạo | Ma Đạo |
|---|---|---|
| Nguồn linh lực | Thiên địa linh khí | Hấp thu từ sinh linh khác |
| Tốc độ ban đầu | Chuẩn | Nhanh hơn 30-50% |
| Tâm Cảnh | Tăng được bình thường | Giảm dần, không thể ngăn |
| Đột phá | Công thức đa thông số + Thuần Độ | Tích Ma Khí — cơ chế riêng |
| Xã hội | Bình thường | Bị truy sát nếu bị phát hiện |

### Tiếp cận Ma Đạo — Không thể chủ động chọn từ đầu

1. **Cơ Duyên tăm tối:** Tìm được "Ma Công Bí Lục" trong dungeon/thám hiểm. Đọc → mở Ma Đạo, Tâm Cảnh -20 ngay lập tức
2. **Tuyệt vọng:** Sắp chết vì tuổi thọ cạn, NPC bí ẩn xuất hiện đề nghị "pháp môn đặc biệt"
3. **Bị cưỡng ép:** Bị Thiên Ma "trồng Ma Căn" — có thể giải trừ (quest dài) hoặc chấp nhận

### Cơ chế đột phá Ma Đạo — Ma Khí (demonicQi)

Thay vì Thuần Độ, Ma Đạo tích lũy **Ma Khí** qua:
- Giết quái vật hấp thu linh lực (hiệu quả thấp)
- Giết tu sĩ khác hấp thu (hiệu quả cao — lý do Ma Tu nguy hiểm)
- Dùng Ma Đan (không có danDoc thường nhưng có Ma Khí riêng)

Khi Ma Khí đạt ngưỡng → đột phá ngay, không cần nhiều điều kiện phụ. **Nhanh hơn Chính Đạo đáng kể** — đây là cám dỗ thực sự.

**Cái giá:** Mỗi lần tích Ma Khí, Tâm Cảnh giảm một lượng nhỏ — không thể ngăn, không thể đảo ngược bằng thiền định thông thường. Tâm Cảnh về 0 → **Tẩu Hỏa Ma Tính vĩnh viễn**: mất kiểm soát combat, đôi khi tự tấn công, dần dần chết nếu không giải.

### Sống như Ma Tu

- Cần kỹ năng **Ẩn Ma** — tốn linh lực duy trì, giúp trông như tu sĩ bình thường. Nếu hết linh lực hoặc bị phá → lộ tẩy
- Bị phát hiện trong tông môn → trục xuất ngay, mất tất cả Công Lao và buff
- Danh Vọng giảm mạnh — bị gán nhãn "Ma Tu" trên xếp hạng
- Chỉ giao dịch được qua Hắc Thị — nhưng Hắc Thị có hàng Chính Đạo không bao giờ có

### Giải trừ Ma Đạo — Quay về Chính Đạo

Có thể nhưng cực khó:
- Quest đặc biệt dài nhiều bước
- Cần "Tịnh Tâm Đan" cực hiếm — chỉ từ dungeon tầng cao hoặc Đấu Giá đặc biệt
- Tâm Cảnh xây lại từ đầu
- Ma Khí không mất hoàn toàn → chuyển thành "Hỗn Nguyên Khí" cho bonus nhỏ vĩnh viễn

Người đã trải qua Ma Đạo rồi quay về Chính Đạo có nền tảng **khác người tu thuần Chính Đạo** — vừa mạnh hơn vừa mang vết sẹo. Đây là arc nhân vật thực sự.

### Thiên Kiếp của Ma Tu — Ma Kiếp

Ma Tu khi đột phá không có Thiên Kiếp thông thường. Thay vào đó là **Ma Kiếp** — các Ma Tu mạnh hơn xuất hiện và tấn công. Thiên đạo không thừa nhận Ma Đạo nên không "kiểm tra" — thay vào đó là đồng loại tranh giành vị trí.

---

## 37. Thiên Kiếp — Thử Thách Của Trời (v12)

### Triết lý

Thiên Kiếp là **phản ứng của thiên đạo** đối với sinh linh vượt qua giới hạn tự nhiên. Không ghét bạn — chỉ là quy luật. Tác động lên tất cả như nhau.

### Khi nào xuất hiện

Chỉ tại các **cột mốc cảnh giới lớn**:

| Đột phá | Có Thiên Kiếp | Lý do |
|---------|-------------|-------|
| Trong nội bộ LK (tầng 1-9) | Không | Vẫn trong phạm vi phàm nhân |
| **LK → Trúc Cơ** | **Có** | Lần đầu vượt giới hạn phàm nhân |
| Trong nội bộ TC | Không | Đã được thiên đạo công nhận |
| **TC → Kim Đan** | **Có** | Kết đan = bước vào thế giới tu sĩ |
| **KĐ → Nguyên Anh** | **Có — mạnh hơn** | Nguyên Anh xuất thể |
| **NA → Hóa Thần** | **Có — rất mạnh** | Thần thức khai mở |

### 3 Giai đoạn Thiên Kiếp

**Giai đoạn 1 — Thiên Uy:**
Bầu trời chuyển màu, linh khí hỗn loạn. Trong X năm game, tất cả chỉ số giảm nhẹ — cảnh báo. Người chơi cần chuẩn bị: uống đan dược, triệu hồi Linh Thú, kiểm tra trang bị.

**Giai đoạn 2 — Kiếp Lôi:**
Sét thiên kiếp đánh liên tiếp. Số làn sét tùy cảnh giới:
- LK → TC: 3 làn sét đánh thể xác (giảm HP)
- TC → KĐ: 6 làn sét, xen kẽ thể xác và tinh thần (giảm HP + Tâm Cảnh)
- KĐ → NA: 9 làn sét + hiệu ứng "phong ấn linh lực" tạm thời
- NA → HT: 12 làn sét + 1 "Tử Kiếp" cuối — không chặn được Tử Kiếp = thất bại

Người chơi dùng kỹ năng, đan dược, và Linh Thú Chiến để chống đỡ.

**Giai đoạn 3 — Tâm Ma:**
Sau Kiếp Lôi, xuất hiện hóa thân từ nỗi sợ hãi và ký ức tăm tối nhất của nhân vật. Tâm Ma đánh vào **Tâm Cảnh** — không phải HP. Tâm Cảnh về 0 trong giai đoạn này = thất bại dù đã qua Kiếp Lôi.

Chống Tâm Ma cần: Tâm Cảnh cao, Ngộ Tính cao, kỹ năng "Định Tâm Quyết".

### Hậu quả thất bại Thiên Kiếp

Thất bại Thiên Kiếp **không phải Game Over** (trừ khi HP về 0):
- Linh lực Thuần Độ về 0 — phải tinh luyện lại
- Tâm Cảnh giảm mạnh
- Tuổi thọ tiêu hao thêm 5-10 năm game

**Thất bại 3 lần liên tiếp:** Cơ thể bị "Thiên Đạo Phong Ấn" — không thể thử lại cho đến khi tìm được "Giải Phong Đan" hoặc đợi thêm 20 năm game.

---

## 38. Dungeon — Chiều Sâu Thực Sự (v12)

### Thiết kế lại: Dungeon là thế giới sống

Mỗi tầng dungeon là một "tiểu thế giới" với địa hình, sinh thái, và lịch sử riêng. Không phải hành lang tuyến tính.

### Hệ thống Room ngẫu nhiên

Mỗi lần vào tầng, người chơi gặp **5-7 phòng ngẫu nhiên** trước cửa tiếp theo:

| Loại phòng | Tỷ lệ | Mô tả |
|-----------|-------|-------|
| Chiến đấu | 40% | Enemy thông thường của tầng. Thắng → loot + tiến. Thua → lui về phòng trước |
| Kho Báu | 15% | Rương đồ. 30% có bẫy — Ngộ Tính cao phát hiện tốt hơn |
| NPC Ẩn | 10% | Tu sĩ bị thương trong dungeon. Giúp → Danh Vọng + thông tin. Cướp → Ma Khí tăng |
| Phòng Bí Ẩn | 10% | Dấu hiệu người từng đến trước — đọc được tăng Ngộ Tính, manh mối phòng ẩn |
| Phục Kích | 15% | Enemy đặc biệt mạnh hơn. Thắng → loot đặc biệt |
| Nghỉ Ngơi | 10% | Linh khí đặc biệt — hồi HP/stamina. Có thể bế quan ngắn tăng Thuần Độ |

### Dungeon có bộ nhớ — Khám phá dài hạn

Mỗi tầng có **bản đồ ẩn** dần mở qua nhiều lần vào. Sau đủ số lần khám phá tầng thường → xuất hiện **Phòng Ẩn** chứa: công thức đan dược dungeon-exclusive, mảnh công pháp thất truyền (cần 5 mảnh từ 5 tầng khác nhau), hoặc NPC đặc biệt.

### Lý do farm dungeon liên tục

- **Nguyên liệu dungeon-exclusive** — không gather được bên ngoài
- **Điểm Dungeon** — tích lũy theo số lần clear, đổi lấy trang bị exclusive hoặc nâng số lần vào/ngày
- **Sự kiện Linh Khí Bùng Phát** — mỗi X ngày game, một tầng cụ thể có loot ×2 và Cơ Duyên tỷ lệ cao hơn
- **Thành tích Dungeon** — clear trong thời gian giới hạn, không dùng đan dược, HP trên 80%... → danh hiệu và Danh Vọng

### Boss — Cơ chế riêng từng boss

**Boss tầng 5 — Điện Diêm La (cập nhật):**
Mỗi lượt triệu hồi thêm quái nhỏ. Không tiêu diệt quái nhỏ → chúng hợp nhất tăng sức Điện Diêm La. Người chơi quyết định: tập trung boss hay dọn quái trước.

**Boss tầng 10 — Ngự Tọa Diêm Điện (cập nhật):**
3 giai đoạn sức mạnh, mỗi giai đoạn đổi chiến thuật hoàn toàn. Giai đoạn 3 dùng "Địa Phủ Phong Ấn" — khóa tất cả kỹ năng người chơi 3 lượt, chỉ còn đan dược và tấn công thường.

---

## 39. Endgame — Hóa Thần (v12)

### Nghịch lý cốt lõi

Hóa Thần không phải "chiến thắng" — đây là **khởi đầu của giai đoạn khó khăn hoàn toàn khác**. Toàn bộ những gì đã làm ở các cảnh giới thấp hơn — đánh quái, luyện đan, tích linh thạch — đều trở nên **không đủ phẩm chất** cho Hóa Thần tu luyện tiếp. Linh khí Nhân Giới quá loãng, tài nguyên quá thô.

### Thực tế tuổi thọ Hóa Thần

Tuổi thọ Hóa Thần là 2000 năm — nhưng từ Luyện Khí đến hết Nguyên Anh đã tốn 500-700 năm. Khi đạt Hóa Thần, **chỉ còn ~1300-1500 năm**.

Bảng tiêu hao ước tính:

| Hoạt động | Tuổi thọ tiêu hao |
|-----------|-----------------|
| Bế quan sơ kỳ (tầng 1-3), 50 năm/lần × 3 | ~150 năm |
| Bế quan trung kỳ (tầng 4-6), 80 năm/lần × 3 | ~240 năm |
| Bế quan hậu kỳ (tầng 7-9), 120 năm/lần × 3 | ~360 năm |
| Chiến đấu lớn (Thiên Kiếp, tranh chấp Linh Giới Lỗ) | ~300 năm |
| Thám hiểm Cổ Địa, xử lý việc thế gian | ~200 năm |
| **Tổng ước tính** | **~1,250 năm** |

Còn lại ~50-250 năm buffer — **rất ít**. Đây là sức ép thực sự của Hóa Thần: không phải đua với Kiếp Tu nữa mà đua với tuổi thọ đang cạn dần trong khi mỗi bước tiến đòi hỏi nhiều thời gian hơn bước trước.

### Cơ chế đặc thù Hóa Thần

**Liên kết thiên địa linh khí — Mỗi lần ra tay tốn tuổi thọ:**

Thần thức đã khai mở, mỗi hành động của Hóa Thần kéo linh khí xung quanh vào cơ thể theo cách cưỡng bức. Hệ quả:
- Mỗi lần chiến đấu lớn hoặc dùng đại pháp → tiêu hao tuổi thọ trực tiếp (không phải stamina)
- Một trận chiến lớn có thể tốn vài năm đến vài chục năm tuổi thọ
- Hóa Thần không ra tay tùy tiện — mỗi lần động thủ là quyết định có trọng lượng

**Bế quan theo đơn vị thế kỷ:**

Một lần bế quan hiệu quả cần ít nhất 50-100 năm game. Nhịp điệu hoàn toàn khác các cảnh giới thấp — bế quan một lần rồi ra ngoài xử lý việc, rồi lại bế quan. Không thể "cày" theo kiểu thường.

**Linh khí vùng ảnh hưởng đột phá — F_linghki (chỉ từ Hóa Thần):**

| Môi trường tu luyện | F_linghki |
|--------------------|---------|
| Vùng linh khí cạn kiệt (bị rút nhiều) | ×0.3 |
| Vùng bình thường Nhân Giới | ×0.6 |
| Gần Linh Giới Lỗ | ×1.2 |
| Trong Cổ Địa đặc biệt | ×1.0 đến ×1.5 |

**Tài nguyên Nhân Giới không đủ:**

Đan dược Nhân Giới cao nhất chỉ hỗ trợ được một phần nhỏ. Để tu luyện hiệu quả cần tài nguyên từ **Linh Giới** — rò rỉ qua Linh Giới Lỗ. Đây là động lực phi thăng.

### Hành trình 3 giai đoạn Hóa Thần

**Sơ Kỳ (tầng 1-3) — Thích nghi:**
Vẫn còn dùng được tài nguyên Nguyên Anh tier cao. Thiết lập nền tảng: chiếm vùng linh khí tốt, thanh toán mối thù cũ, thiết lập quan hệ Thương Hội tier cao. Cảm giác mạnh hơn tất cả — nhưng bắt đầu nhận ra giới hạn Nhân Giới.

**Trung Kỳ (tầng 4-6) — Khủng hoảng tài nguyên:**
Tài nguyên Nguyên Anh không còn tác dụng. Tài nguyên Linh Giới chưa có đủ. Phải:
- Cạnh tranh với Hóa Thần NPC kiểm soát Linh Giới Lỗ
- Thám hiểm Cổ Địa — vùng đất cổ đại còn tồn đọng linh khí đặc biệt
- Giao dịch với các thế lực Hóa Thần khác — Danh Vọng và Danh Dự tông môn thực sự có giá trị ở đây

**Hậu Kỳ (tầng 7-9) — Chuẩn bị phi thăng:**
Không có tương lai ở Nhân Giới nữa. Phi thăng không phải lựa chọn — đó là con đường duy nhất. Chuẩn bị cần:
- Tích lũy đủ "Linh Giới Dẫn Đạo Phù" — chỉ từ Linh Giới Lỗ hoặc Cổ Địa
- Hiểu được "Phi Thăng Trận Pháp" — kiến thức thất truyền, quest dài để thu thập
- Đủ sức mạnh để sinh tồn ngay khi bước vào Linh Giới

### Linh Giới Lỗ — Nội dung cốt lõi Hóa Thần

Điểm giao thoa giữa Nhân Giới và Linh Giới — xuất hiện ngẫu nhiên ở Vùng Nguy Hiểm, tồn tại X ngày game rồi đóng lại.

**Bên trong:** Tài nguyên Linh Giới cấp thấp, Linh Thú từ Linh Giới (mạnh hơn Nhân Giới), mảnh Phi Thăng Trận Pháp. Nguy hiểm với tu sĩ dưới Hóa Thần — linh khí quá đặc gây tẩu hỏa ngay.

**Tranh chấp:** Khi Linh Giới Lỗ xuất hiện, các Hóa Thần NPC đổ về. Người chơi quyết định: tranh giành (tiêu hao tuổi thọ, rủi ro bị thương) hay nhường (mất tài nguyên, bảo toàn tuổi thọ). Đây là quyết định chiến lược thực sự.

### Nội dung Endgame cụ thể

**Tranh Bá — Chưởng Môn Thực Sự:**
Thu thập đủ sự ủng hộ từ Trưởng Lão → thách đấu Chưởng Môn cũ (3 thử thách: tài năng, trí tuệ, combat) → thắng nhận vị trí Chưởng Môn với buff cực mạnh kèm trách nhiệm thực sự.

**Cổ Địa Thám Hiểm:**
Vùng đất cổ đại bị phong ấn, chỉ Hóa Thần phá được: công pháp thất truyền, Linh Thú cổ đại, mảnh Phi Thăng Trận Pháp, Cơ Duyên tier 4 (tier cao nhất trong Nhân Giới).

**Phi Thăng — Kết thúc Nhân Giới:**
Khi chuẩn bị đủ, nhân vật phi thăng lên Linh Giới. Đây là **kết thúc của hành trình Nhân Giới** — được lưu vào Hall of Fame với danh hiệu đặc biệt "Phi Thăng Thành Công". Linh Giới là content của tương lai, chỉ phát triển khi Nhân Giới hoàn thiện.

> **Lưu ý thiết kế:** Không có cơ chế "tiếp tục chơi sandbox ở Nhân Giới sau phi thăng". Phi thăng là kết thúc thực sự — nhân vật đó đã hoàn thành hành trình. Người chơi tạo nhân vật mới, và tên nhân vật cũ xuất hiện trong Hall of Fame như huyền thoại.

---

## 40. Thế Giới — Map Phân Tầng (v12)

### 4 Tầng địa lý

| Tầng | Cảnh giới phù hợp | Đặc điểm |
|------|-----------------|---------|
| Vùng An Toàn | Luyện Khí | Kiếp Tu hiếm. Thương Hội chi nhánh nhỏ. Tông môn đặt cổng tuyển đệ tử |
| Vùng Tranh Chấp | Trúc Cơ | Không ai bảo vệ bạn. Kiếp Tu công khai. Tài nguyên phong phú nhưng phải tranh giành |
| Vùng Nguy Hiểm | Kim Đan+ | Chỉ tu sĩ mạnh mới dám vào. Cơ Duyên tier 3. Không có Thương Hội công khai — chỉ Hắc Thị |
| Vùng Cấm | Hóa Thần / Linh Giới | Chưa mở |

### Đặc sản độc quyền theo vùng

- **Thanh Vân Sơn:** Kiếm khí dày → tu Kiếm Công nhanh hơn 20%, có Kiếm Linh Thảo độc quyền
- **Vạn Linh Thị:** Trung tâm thương mại → Thương Hội hàng hiếm nhất, đan dược rẻ hơn 15%
- **Thiên Kiếp Địa:** Thiên lôi thường xuyên → Rèn thể nhanh hơn, nhưng có xác suất bị sét đánh
- **Ẩn Long Động:** Hang động sâu → Linh Thú hang động, nguyên liệu khoáng thạch hiếm
- **Cổ Tích Di Tích:** Tầng 2/3 → Dungeon đặc biệt, công pháp thất truyền, Cơ Duyên tier cao

---

## 41. Tông Môn — Chiều Sâu Quan Hệ (v12)

### NPC tông môn có arc riêng

**Trưởng Lão:** Lạnh lùng ban đầu, dần công nhận nếu bạn tiến bộ. Dialogue thay đổi theo cảnh giới. Đạt Trúc Cơ sớm → nói điều gì đó thực sự khác.

**Sư Huynh/Tỷ:** Cùng cảnh giới, đang cạnh tranh. Có thể thành đồng minh hoặc địch thủ. Họ đột phá trước → nhận xét. Bạn đột phá trước → thái độ thay đổi.

**Sư Đệ/Muội:** Nhìn lên bạn như hình mẫu. Giúp đỡ họ → nhận buff quan hệ.

### Danh Dự tông môn

Ngoài Công Lao (tài nguyên), thêm chỉ số **Danh Dự** — uy tín nội bộ:

**Tăng:** Đột phá cảnh giới mới, thắng Kiếp Tu bảo vệ đệ tử tông môn, hoàn thành quest khó, top 3 xếp hạng nội bộ

**Giảm:** Thất bại nhiệm vụ tông môn, bỏ nhiệm vụ nửa chừng, bị Kiếp Tu tấn công không chống trả

**Ảnh hưởng:** NPC đối xử khác với bạn, một số quest chỉ mở khi Danh Dự cao, khi rời tông môn — Danh Dự cao rời "trong danh dự" (giữ 50% buff), Danh Dự thấp bị trục xuất (mất tất cả).

### Rời Tông Môn

- **Trong danh dự:** Mất Công Lao, giữ 50% buff (coi như "cựu đệ tử")
- **Bị trục xuất:** Mất tất cả, thêm debuff "Phản Đồ" — một số NPC không giao dịch

---

## 42. Progression Cảm Xúc — Khoảnh Khắc Đáng Nhớ (v12)

### 3 tầng cảm giác tiến bộ

**Micro (hàng giờ):** Đánh thắng enemy mới lần đầu, luyện đan thành công, hoàn thành quest nhận thưởng, thanh qi tăng nhìn thấy được

**Meso (hàng ngày):** Lên 1 tầng cảnh giới, mở tab/tính năng mới, tăng chỉ số nhân vật đáng kể, nhận cơ duyên dù nhỏ

**Macro (hàng tuần):** Đột phá cảnh giới thành công sau nhiều lần thất bại, gia nhập tông môn, lần đầu đánh boss dungeon, tìm được Linh Thú

### 4 khoảnh khắc đáng nhớ cần thiết kế có chủ đích

1. **Lần đầu gặp Kiếp Tu** — dù thắng hay thua, Chronicle ghi lại. Nhận ra "thế giới này nguy hiểm thật"
2. **Thất bại đột phá lần đầu** — qi về 80%, Tâm Cảnh giảm. Học được "đừng vội"
3. **Cơ Duyên tier 2 lần đầu** — dù là gì, cảm giác "vũ trụ quan tâm đến mình"
4. **Đột phá thành công sau nhiều lần thất bại** — thông điệp đặc biệt, không chỉ "+1 tầng". Ví dụ: *"Sau 3 lần thất bại, kinh mạch cuối cùng thông suốt."*

### Chronicle — Nhật Ký Tu Luyện

Chronicle phải là **câu chuyện của nhân vật**, không phải log kỹ thuật:
- ❌ "Đột phá Trúc Cơ thành công"
- ✅ *"Tuổi 34, tại Thanh Vân Sơn, sau 3 năm tu luyện — ngộ ra Trúc Cơ trong một đêm mưa."*

---

*Cập nhật tài liệu này sau mỗi sprint. Ghi rõ ngày và người cập nhật.*