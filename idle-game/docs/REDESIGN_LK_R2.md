SESSION R2 — Kiên Cố: New Stat Foundation
Đọc trước: idle-game/docs/REDESIGN_LK_COMMON.md. Đọc idle-game/docs/HANDOFF.md. Session này độc lập, R3 và R4 phụ thuộc vào output của session này.
Mục tiêu
Thêm stat G.kienCo — đo độ vững chắc linh lực. Tích qua hoạt động tiêu hao qi, không tích qua bế quan thụ động. Hiển thị trong UI. Chưa dùng trong breakthrough (R4 sẽ làm).
State mới — fresh-state.js
Thêm vào G:
jskienCo: 0,          // Kiên Cố hiện tại
kienCoMax: 100,     // Trần tạm thời (sẽ tính động từ công pháp ở R3)
Migration — persistence.js
Trong _migrateAll() thêm:
jsif (G.kienCo === undefined) G.kienCo = 0;
if (G.kienCoMax === undefined) G.kienCoMax = 100;
Tích Kiên Cố — cultivation.js
Thêm hàm helper gainKienCo(G, base) trong helpers-internal.js:

base là lượng qi đã tiêu trong action đó
Công thức: G.kienCo = Math.min(G.kienCoMax, G.kienCo + base × 0.01)
Gọi trong: doExplore (+8), doSpar (+15), doArray (+10), doFish (+3), doMeditation không gọi

Tích Kiên Cố — combat
Sau khi kết thúc chiến đấu thắng (combat-engine.js hoặc nơi xử lý combat end):

Tính qi đã dùng trong trận (có thể dùng turns × avgQiCost ước lượng)
gainKienCo(G, qiUsed × 0.5) — chiến đấu hiệu quả hơn cultivation actions

Tích Kiên Cố — quest completion
Trong quest-engine.js, khi complete quest:

Quest thường: gainKienCo(G, 5)
Quest nguy hiểm (có combat): gainKienCo(G, 15)

Kiên Cố reset khi breakthrough thành công
Trong breakthrough.js, khi thành công: G.kienCo = 0 (phải rèn lại từ đầu cho tầng mới).
Hiển thị
render-core.js — thêm vào cultivate panel, ngay dưới thanh Thuần Độ:
Kiên Cố: [bar] X / Y
Label nhỏ, màu khác với Thuần Độ (gợi ý: màu cam/đất, phân biệt với màu xanh của Thuần Độ).
char-popup.js — thêm vào section Tu Luyện, 1 dòng stat đơn giản.
Không làm trong session này

Không dùng kienCo trong breakthrough chance (R4 làm)
Không tính ceiling từ công pháp (R3 làm)
Không thêm bottleneck logic

Verify

Sau 1 trận đánh → kienCo tăng
Bế quan 10 phút → kienCo không tăng
Sau breakthrough thành công → kienCo reset về 0
Bar hiển thị đúng trong cultivate tab và char-popup