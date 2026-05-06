SESSION R4 — Bottleneck Mechanics (LK3→4, LK6→7, LK9→TC)
Đọc trước: idle-game/docs/REDESIGN_LK_COMMON.md. R2 và R3 phải hoàn thành trước. Đọc kỹ breakthrough.js và world-map.js.
Mục tiêu
Ba mốc LK3→4, LK6→7, LK9→TC trở nên khác biệt cơ bản: yêu cầu Kiên Cố đạt ngưỡng cứng. Thiếu Kiên Cố → thất bại nghiêm trọng, không phải fail thường.
Định nghĩa bottleneck
Trong breakthrough.js, thêm helper:
jsfunction _isBottleneck(G) {
  if (G.realmIdx !== 0) return false; // Chỉ áp dụng LK hiện tại
  return G.stage === 3 || G.stage === 6 || G.stage === 9;
}
Ngưỡng Kiên Cố tại bottleneck
jsconst KIENCOC_BOTTLENECK = {
  3: 40,  // LK3→4: Sơ→Trung kỳ
  6: 70,  // LK6→7: Trung→Hậu kỳ
  9: 90,  // LK9→TC: bottleneck lớn nhất
};
Thay đổi doBreakthrough(G)
Sau block check purity (hiện tại ~line 124), thêm:
jsif (_isBottleneck(G)) {
  const required = KIENCOC_BOTTLENECK[G.stage];
  const kienCo   = G.kienCo ?? 0;
  if (kienCo < required) {
    return {
      ok: false,
      type: 'bottleneck_blocked',
      msg: `Bình Cảnh! Kiên Cố chưa đủ (${Math.floor(kienCo)}/${required}). Linh lực chưa đủ vững — cần rèn luyện qua chiến đấu và nhiệm vụ trước khi đột phá.`
    };
  }
}
Khi bottleneck fail severe (kienCo đủ nhưng purityRatio thấp hoặc ngẫu nhiên fail):

Kiên Cố giảm 30% (bình cảnh phản ứng ngược)
Thêm vào fail message: "Kinh mạch tổn thương, Kiên Cố suy giảm."

Thay đổi _renderBreakthroughBtn — world-map.js
Thêm detection bottleneck và Kiên Cố check:

Nếu là bottleneck stage VÀ kienCo < required: button màu tím/xanh đậm, text "⚠ Bình Cảnh — Kiên Cố chưa đủ (X/Y)"
Nếu là bottleneck stage VÀ kienCo đủ: button có border đặc biệt, text thêm "【Bình Cảnh】"

Thay đổi char-popup.js
Tại bottleneck stage, hiển thị progress Kiên Cố rõ ràng với text giải thích.
Không làm trong session này

Không thêm action "Nén Khí" đặc biệt (để sau nếu cần)
Không thay đổi công thức breakthrough chance (chỉ thêm hard gate)

Verify

LK3, Kiên Cố = 20 (< 40) → click đột phá → blocked, message giải thích
LK3, Kiên Cố = 45 (> 40) → không bị blocked bởi Kiên Cố, các check khác vẫn chạy
LK6→7 threshold = 70, LK9→TC = 90 đúng
Sau fail tại bottleneck → Kiên Cố giảm 30%