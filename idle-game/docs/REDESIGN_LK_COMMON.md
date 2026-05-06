FILE CHUNG — REDESIGN HỆ THỐNG LUYỆN KHÍ (LK)
Vấn đề cốt lõi cần giải quyết
Game hiện tại cho phép người chơi tạo nhân vật → bấm bế quan → ngồi đợi qi tự tăng → đột phá. Không cần tài nguyên, không cần hoạt động, không có rủi ro. Điều này mâu thuẫn trực tiếp với triết lý hardcore của game.
Mục tiêu redesign: Bế quan phải tiêu tốn tài nguyên. Vững chắc linh lực phải được rèn qua hoạt động. Bottleneck giữa các kỳ phải có cơ chế riêng biệt.
Hai hệ thống mới sẽ được thêm vào
1. Kiên Cố (G.kienCo) — đo "độ nén, độ vững" của linh lực

Tích qua: chiến đấu, nhiệm vụ, hành động tiêu hao qi
KHÔNG tích qua bế quan thụ động
Có trần (ceiling) theo grade công pháp đang tu
Bắt buộc tại bottleneck: LK3→4, LK6→7, LK9→TC

2. Trần Thuần Độ theo công pháp — Thuần Độ không thể vượt quá giới hạn của công pháp

Tạp phẩm: trần 85% ngưỡng
Hạ phẩm: trần 115%
Trung phẩm: trần 150%
Thượng phẩm: trần 190%
Thiên phẩm (mới): không trần

Hệ thống tài nguyên bế quan (mới)
Mỗi tick bế quan sẽ tiêu tốn linh thạch nhỏ. Không có linh thạch → tu tốc giảm mạnh. Cụ thể:

Có linh thạch đủ: rate bình thường
Linh thạch < ngưỡng thấp: rate × 0.3
Linh thạch = 0: rate × 0.05 (gần như không tu được)

Hunger (tích cốc đan / linh mễ) đã có trong game và đã ảnh hưởng hungerMod — giữ nguyên, không thay đổi công thức.
Thứ tự phụ thuộc giữa các session
R1 (Resource Gate) — độc lập, làm trước
R2 (Kiên Cố foundation) — độc lập, làm trước
R3 (Công pháp ceilings) — làm sau R2
R4 (Bottleneck mechanics) — làm sau R2 + R3
R5 (Thuần Độ decay + polish) — làm sau R3
R1 và R2 có thể làm song song. R4 phải làm sau cùng.
Files quan trọng cần biết

idle-game/js/core/systems/tick.js — vòng lặp chính, xử lý qi và purity mỗi tick
idle-game/js/core/systems/breakthrough.js — calcBreakthroughChance + doBreakthrough
idle-game/js/core/state/computed.js — calcQiRate, calcPurityRate, calcPurityThreshold
idle-game/js/core/state/fresh-state.js — state mặc định nhân vật mới
idle-game/js/core/state/persistence.js — migration save cũ
idle-game/js/core/phap-dia.js — CONG_PHAP_LIST, grade, calcCongPhapBaseMult
idle-game/js/core/systems/cultivation.js — doExplore, doSpar, doArray, doFish, doMeditation
idle-game/js/core/systems/combat-engine.js hoặc combat/ — kết thúc chiến đấu
idle-game/js/ui/world-map.js — _renderBreakthroughBtn
idle-game/js/app/popups/char-popup.js — hiển thị stats nhân vật
idle-game/js/ui/render-core.js — render tab cultivate chính
idle-game/docs/HANDOFF.md — đọc trước khi code bất cứ thứ gì