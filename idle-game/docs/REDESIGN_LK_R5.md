SESSION R5 — Thuần Độ Decay + UI Polish
Đọc trước: idle-game/docs/REDESIGN_LK_COMMON.md. R3 phải hoàn thành trước. Session này là refinement, có thể làm sau cùng.
Mục tiêu
Thuần Độ không nên "đóng băng" khi không tu luyện. Linh lực để lâu sẽ lẫn tạp chất dần. Tạo thêm lý do để duy trì bế quan liên tục.
Decay mechanic — tick.js
Khi !G.meditating và G.purity > 0:
jsconst purityDecayRate = 0.001; // nhỏ, không gây khó chịu quá mức
G.purity = Math.max(0, G.purity - purityDecayRate × dt × 10);
Tốc độ decay: khoảng 1% Thuần Độ mất sau ~1 năm game không tu luyện — cảm nhận được nhưng không quá phạt.
Pill override — inventory.js
Khi dùng các đan dược tăng purity (Tẩy Tủy Đan nếu có):

Set flag G._purityCeilingOverride = true với timer
Trong tick.js, khi flag active: không áp dụng ceiling từ công pháp
Flag tự hết sau X giây game

UI feedback — render-core.js
Khi không meditating và purity > 0: hiển thị text nhỏ "Thuần Độ đang phân tán..." dưới thanh purity.
Không làm trong session này

Không thay đổi breakthrough chance formula
Không thay đổi purity thresholds (đã calibrate từ Session 9)


Tóm tắt thứ tự thực hiện
R1 ──────────────────────────────── (độc lập, làm ngay)
R2 ──────────────────────────────── (độc lập, làm ngay)
         R3 ─────── (sau R2)
                  R4 ─── (sau R2 + R3)
         R3 ─────── R5 ─── (sau R3)
R1 và R2 có thể giao cho 2 AI làm song song. R3 phải đợi R2 xong. R4 phải đợi cả R2 lẫn R3.