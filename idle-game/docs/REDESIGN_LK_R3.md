SESSION R3 — Công Pháp Grade → Trần Kiên Cố & Thuần Độ
Đọc trước: idle-game/docs/REDESIGN_LK_COMMON.md. R2 phải hoàn thành trước session này. Đọc phap-dia.js và computed.js đầy đủ.
Mục tiêu
Công pháp grade quyết định trần tối đa của cả Kiên Cố và Thuần Độ. Người dùng công pháp kém không thể đạt chất lượng linh lực cao dù cố gắng nhiều.
Thêm 2 hàm vào computed.js
calcKienCoCeiling(G):
Tạp (grade 0): ceiling = 60
Hạ  (grade 1): ceiling = 100
Trung (grade 2): ceiling = 150
Thượng (grade 3): ceiling = 220
Thiên (grade 4): ceiling = 350
Lấy grade cao nhất trong congPhap.activeIds hiện tại.
calcThuanDoCeiling(G):
Tạp:    ceiling = threshold × 0.85
Hạ:     ceiling = threshold × 1.15
Trung:  ceiling = threshold × 1.50
Thượng: ceiling = threshold × 1.90
Thiên:  ceiling = không giới hạn (threshold × 999)
Cập nhật tick.js
Trong block tích Thuần Độ (khi qi đầy):
jsconst thuanDoCeiling = calcThuanDoCeiling(G);
if ((G.purity ?? 0) < thuanDoCeiling) {
  G.purity += pRate × dt × 10;
  G.purity = Math.min(G.purity, thuanDoCeiling); // hard cap
}
Cập nhật cultivation.js — gainKienCo
Trong hàm gainKienCo đã tạo ở R2, thay G.kienCoMax = 100 hardcode bằng:
jsimport { calcKienCoCeiling } from '../state/computed.js';
// ...
G.kienCo = Math.min(calcKienCoCeiling(G), G.kienCo + delta);
Export — state.js shim
Export calcKienCoCeiling và calcThuanDoCeiling từ state.js.
Không làm trong session này

Không thêm Thiên phẩm công pháp vào CONG_PHAP_LIST (chỉ định nghĩa grade=4 là valid)
Không thay đổi breakthrough logic

Verify

Nhân vật dùng Vô Danh (Tạp): Thuần Độ dừng ở 85% threshold, không tăng thêm
Kiên Cố không vượt 60
Đổi sang công pháp Hạ phẩm: ceiling tăng lên đúng giá trị