ROADMAP — PHÁT TRIỂN TIẾP THEO
SESSION P1 — Technical Cleanup: Realm Scope + Timer -- DONE
Mô tả cho AI:

Đọc HANDOFF.md và ARCHITECTURE.md. Nhiệm vụ: (1) Tìm và xóa tất cả dấu vết realm 5+ (Luyện Hư, Hợp Thể, Đại Thừa) còn sót trong code — kiểm tra data.js, combat-data.js, fresh-state.js, và toàn bộ js/ bằng grep. (2) Chuẩn hóa đơn vị timer Trận Pháp trong tran-phap-data.js và comment drain logic — thống nhất game-time vs real-time, đảm bảo drain formula dùng dtYears nhất quán như các engine khác. Không thay đổi balance, chỉ cleanup.


SESSION P2 — Combat Log Formatting -- DONE
Mô tả cho AI:

Đọc HANDOFF.md. Nhiệm vụ: Cải thiện combat log trong js/ui/tabs/combat-tab.js — hiện đang là text thuần. Thêm color-coding (damage đỏ, heal xanh lá, miss/dodge xám, crit vàng) và icon prefix tương ứng (⚔️💥🛡️✨). Dùng CSS class thay inline style, thêm CSS vào combat.css. Giữ nguyên toàn bộ combat logic, chỉ sửa phần render log.


SESSION P3 — Luyện Đan Gate Cứng -- DONE
Mô tả cho AI:

Đọc HANDOFF.md. Vấn đề: Hiện tại ai cũng có thể luyện đan ngay — vi phạm triết lý nghề phụ cần cơ duyên. Nhiệm vụ: (1) Nghề luyen_dan chỉ auto-unlock khi ngoTinh >= 40 VÀ có linh căn Hỏa (spiritData.points.huo > 0). (2) Người không đủ điều kiện có thể mở qua cơ duyên — thêm 1 event cơ duyên mới vào co-duyen.js (id: 'cd_dan_kinh_co_nhan', xác suất thấp, yêu cầu ngoTinh >= 20, effect: set flags.unlockedProfessions thêm luyen_dan). (3) UI nghe-nghiep-tab.js hiện điều kiện rõ trên locked card. Đừng thay đổi logic luyện đan hiện tại.


SESSION P4 — Nghề Phụ Gate: 4 Nghề Còn Lại -- DONE
Mô tả cho AI:

Đọc HANDOFF.md phần S-E. Bốn nghề tran_phap, phu_chu, khoi_loi, linh_khi hiện chỉ có flags only — chưa có con đường mở cụ thể ngoài NPC/tông môn chưa implement. Nhiệm vụ: (1) Thêm 4 cơ duyên events vào co-duyen.js để mở từng nghề (xác suất rất thấp, yêu cầu điều kiện cảnh giới tối thiểu LK4+). (2) Trong nghe-nghiep-tab.js, locked card hiện gợi ý cụ thể "Học từ cao nhân, hoặc chờ cơ duyên". (3) Thêm _tryAutoUnlock check cho linh_thuc (bếp level ≥ 1 đã có) và luyen_khi (LK5+ tự động). Không đụng balance.


SESSION P5 — NPC Dialogs: Các Zone Chính -- DONE
Mô tả cho AI:

Đọc HANDOFF.md. Nhiệm vụ: Thêm NPC dialog vào js/ui/location-popup.js trong object NPC_DIALOGS cho 5 zone hiện thiếu dialog: Vạn Linh Thị, Hắc Phong Lâm, Địa Phủ Môn, Ẩn Long Động, Linh Dược Cốc. Mỗi zone tối thiểu 2-3 dialog lines theo tone "tu tiên khắc nghiệt" (xem HANDOFF §G). Không cần thêm NPC quest, chỉ flavor text hiển thị khi player click vào NPC. Giữ format object hiện có.


SESSION P6 — Thêm NPC Quest: Zone 2 + 3
Mô tả cho AI:

Đọc HANDOFF.md phần S-D. Hiện có 5 NPC quest (cả LK), cần thêm quest cho người chơi đã lên Trúc Cơ. Nhiệm vụ: Thêm 3-4 NPC quest mới vào js/quest/quest-data.js trong NPC_QUESTS — giao từ NPC các zone cấp cao hơn (Vạn Linh Thị hoặc Hắc Phong Lâm), giveCondition yêu cầu realm >= 1 (Trúc Cơ). Quest nội dung phải theo Manifesto §6 (người giao cụ thể, nhu cầu thật, mở quan hệ/thông tin). Wire quest indicator ! vào node NPC tương ứng trong map-data nếu chưa có.


SESSION P7 — Cơ Duyên Events TC/KĐ/NA
Mô tả cho AI:

Đọc HANDOFF.md. Hiện co-duyen.js có ~52 events phần lớn cho LK. Nhiệm vụ: Thêm tối thiểu 15 events mới cho Trúc Cơ (realm 1), 10 events cho Kim Đan (realm 2), 5 events cho Nguyên Anh (realm 3). Events phải có unlockRealm đúng, không tạo power spike không có lore (HANDOFF §5), phần thưởng phải có rủi ro hoặc quan hệ xã hội tương ứng. Ưu tiên events mở công pháp bậc Trung/Thượng, events liên quan tông môn và đối thủ.


SESSION P8 — Công Pháp Bổ Sung Tán Tu -- DONE
Mô tả cho AI:

Đọc HANDOFF.md phần CÔNG PHÁP. Nhiệm vụ: Thêm 4-6 công pháp mới vào CONG_PHAP_LIST trong js/core/phap-dia.js hướng tới tán tu (acquireType: 'co_duyen' hoặc 'buy'). Cần đa dạng hệ (Thủy, Thổ, không hệ), đa dạng cảnh giới. Mỗi công pháp có buffs(mastery, elementMatch) function trả về buff cân bằng với các công pháp hiện có — không vượt buff của công pháp tông môn cùng cấp. Thêm entry vào bảng công pháp trong HANDOFF.md cuối session.


SESSION P9 — Trận Pháp Redesign -- DONE
Mô tả cho AI:

Đọc HANDOFF.md. Nhiệm vụ: Redesign hệ Trận Pháp. Đổi vật liệu từ nguyên liệu hiện tại sang: trận kỳ + trận bàn + trận nhãn + linh thạch. Trận kỳ là item mới chế tạo từ nguyên liệu thô hoặc mua shop/cơ duyên. Cập nhật tran-phap-data.js (materials mới), tran-phap-tab.js (UI hiển thị vật liệu mới), crafting-data.js (recipe trận kỳ). Đảm bảo triết lý: Trận Pháp cần đầu tư và cơ duyên, không phải ai cũng deploy được. Không thay đổi combat bonus của active arrays.


SESSION P10 — Balance Calibration TC/KĐ/NA
Mô tả cho AI:

Đọc HANDOFF.md phần BALANCE và STATE STRUCTURE. Nhiệm vụ: Calibrate purityThresholds cho Trúc Cơ (4 tầng), Kim Đan (4 tầng), Nguyên Anh (4 tầng) trong js/core/data.js — dựa theo nguyên tắc đã calibrate LK: Song LC tán tu LK tiêu thụ ~110 tuổi game. TC cần ~200 năm game, KĐ ~500, NA ~1000 (xem bảng tuổi thọ HANDOFF). Tính ngược từ qi rate tiêu chuẩn ở mỗi cảnh giới. Cũng calibrate thuần thục công pháp: tốc độ gain trong calcMasteryGainPerTick để đạt 50% thuần thục sau ~30 ngày thực casual play.


SESSION P11 — NPC Rivals System
Mô tả cho AI:

Đọc HANDOFF.md phần STATE STRUCTURE. data.js đã định nghĩa NPC_RIVALS (9 đối thủ) nhưng chưa có encounter logic. Nhiệm vụ: (1) Thêm encounter trigger vào co-duyen.js — đối thủ xuất hiện theo cảnh giới tương đương player, xác suất thấp. (2) Khi gặp đối thủ, hiện dialog + 3 lựa chọn: "Thi đấu" (bắt đầu combat), "Trao đổi" (mua/đổi vật phẩm), "Bỏ qua". (3) Thắng đối thủ tăng Danh Vọng tương ứng tier. Wire vào event-bus-handlers.js. Không thêm đối thủ mới, chỉ dùng 9 NPC đã có.


SESSION P12 — Multi-device Session Lock
Mô tả cho AI:

Đọc HANDOFF.md phần ⬜ Multi-device Session Lock. Implement đúng theo spec đã có trong HANDOFF: (1) Khi login, ghi sessionToken (UUID v4) + timestamp lên Firestore sessions/{uid}. (2) Polling mỗi 30s: nếu token không khớp → logout + toast "Tài khoản đăng nhập từ thiết bị khác". (3) Login mới → ghi token mới → kick thiết bị cũ. (4) Timeout 5 phút cho browser crash. Files: js/firebase/auth-ui.js, js/firebase/cloud-save.js. Test cả trường hợp offline.


SESSION P13 — Mobile UI Polish
Mô tả cho AI:

Đọc HANDOFF.md phần LƯU Ý KỸ THUẬT (Layout S15). Nhiệm vụ: Cải thiện UX mobile. (1) Touch drag cho PopupManager — _makeDraggable() hiện dùng mousedown/mousemove/mouseup, thêm touchstart/touchmove/touchend tương đương. (2) Touch resize 8-direction trong _makeResizable() — tương tự. (3) Kiểm tra .panel-center trên màn hình nhỏ (<400px width) — đảm bảo bottom nav không che nội dung. (4) Test .sv-side-popup trên mobile — đảm bảo không overflow viewport. CSS trong layout.css và systems.css.


Ghi Chú Về Thứ Tự
Các session P1→P4 là nên làm trước vì P1 là cleanup, P2-P4 là hoàn thiện hệ thống đang thiếu. P5→P8 là content work có thể song song. P9 là redesign lớn nên để sau khi content ổn định. P10-P11 là depth sau khi có đủ content để test. P12-P13 là production/polish làm cuối cùng.