SESSION R1 — Resource Gate cho Bế Quan
Đọc trước: idle-game/docs/REDESIGN_LK_COMMON.md. Đọc idle-game/docs/HANDOFF.md. Session này độc lập, không phụ thuộc R2-R5.
Mục tiêu
Bế quan phải tiêu hao linh thạch. Không có tài nguyên → tu tốc gần bằng 0. Tạo áp lực kinh tế ngay từ đầu game.
Thay đổi cụ thể
tick.js — trong block if (G.meditating):
Thêm logic tiêu hao linh thạch mỗi tick. Định nghĩa:

stoneCostPerYear = 2 (2 linh thạch/năm game khi bế quan — tán tu không tông môn)
Quy ra per tick: stoneCostPerTick = stoneCostPerYear × YEARS_PER_TICK × dt × 10
Trừ G.stone mỗi tick khi meditating
Nếu G.stone <= 0: thêm modifier stoneStarved = true, nhân rate × 0.05

Thêm vào effRate calculation:
const stoneMod = G.stone > 50 ? 1.0
               : G.stone > 10 ? 0.3
               : 0.05;
const effRate = rate × hungerMod × nghiepMod × stoneMod;
render-core.js — tab cultivate:
Thêm cảnh báo khi G.stone < 50 && G.meditating:

Hiển thị text nhỏ màu vàng: "⚠ Linh thạch thấp — tu tốc giảm 70%"
Khi G.stone <= 0: text đỏ "⛔ Hết linh thạch — tu luyện gần như vô hiệu"

fresh-state.js: Không cần thay đổi, stone đã có.
persistence.js: Không cần migration vì chỉ thay đổi logic tick, không thay đổi state structure.
Không làm trong session này

Không thay đổi hungerMod hay hunger system
Không thêm Kiên Cố
Không thay đổi purity hay breakthrough chance
Không thêm UI mới phức tạp, chỉ warning text nhỏ

Verify

Tạo nhân vật mới, stone = 0 → bế quan → qi tăng rất chậm (~5% tốc bình thường)
Stone đủ → tốc bình thường
Stone giảm dần khi bế quan (kiểm tra sau 1 năm game bế quan liên tục, trừ 2 stone)
Warning hiện đúng lúc