SESSION C — Breakthrough Purity Warning

CONTEXT:
Game tu tiên idle browser (Vanilla JS, Firebase). Không framework.
File chính: idle-game/ trong workspace.
Đọc idle-game/docs/HANDOFF.md trước khi code. Đây là bug đã ghi nhận trong HANDOFF §S-G.

MỤC TIÊU SESSION C:
Thêm warning rõ ràng khi người chơi muốn đột phá ở vùng purity 50-74%
(guaranteed fail nhưng vẫn mất tamCanh + tuổi thọ + purity).

=== BUG ANALYSIS ===

Trong breakthrough.js — F_purity calculation (~line 60-80):
  purityRatio = purity / threshold
  if purityRatio < 0.75   → F_purity = 0.0   (guaranteed fail!)
  if 0.75 ≤ ratio < 1.0   → F_purity = 0.8
  if ratio >= 1.0          → F_purity = 1.0
  if ratio >= 1.5          → F_purity = 1.2
  if ratio >= 2.0          → F_purity = 1.4

Gate trong doBreakthrough:
  if purity < threshold × 0.5 → blocked (return error)
  if purity >= threshold × 0.5 → ALLOWED dù F_purity = 0.0 (range 50-74%)

Kết quả: purity 50-74% → chance = ... × 0.0 = 0% guaranteed fail
Hậu quả khi fail severe (isSevere = purityRatio < 0.75):
  - qi mất 40%, purity mất 50%, tamCanh -15 đến -25, tuổi thọ -3 đến -7 năm

Trong world-map.js — _renderBreakthroughBtn(G) (~line 65-75):
  // Chỉ check G.qi >= maxQi, không check purity state
  // Hiển thị "⚡ ĐỘT PHÁ — SẴN SÀNG!" bất kể purity có đủ hay không

=== TASK 1: Thêm purity warning vào _renderBreakthroughBtn ===

File: idle-game/js/ui/world-map.js

Thêm import ở đầu file (sau các import hiện có):
  import { calcPurityThreshold, calcMaxQi } from '../core/state.js';
  // calcMaxQi đã import, calcPurityThreshold cần thêm nếu chưa có

Sửa _renderBreakthroughBtn(G) — thay toàn bộ function:

function _renderBreakthroughBtn(G) {
  const maxQi    = calcMaxQi(G);
  const pctFull  = G.qi >= maxQi;
  const pctVal   = Math.floor(Math.min(100, (G.qi / Math.max(1, maxQi)) * 100));
  
  if (!pctFull) {
    return `<button id="btn-breakthrough" class="btn-breakthrough-map" disabled
      title="Tích lũy linh lực để đột phá (${pctVal}%)">
      ⚡ Đột Phá (${pctVal}%)
    </button>`;
  }
  
  // Qi đầy — kiểm tra purity
  const threshold = calcPurityThreshold(G);
  const purity    = G.purity ?? 0;
  const ratio     = purity / Math.max(1, threshold);
  const purityPct = Math.floor(ratio * 100);
  
  if (ratio < 0.5) {
    // Bị block hoàn toàn (doBreakthrough sẽ reject)
    return `<button id="btn-breakthrough" class="btn-breakthrough-map" disabled
      title="Thuần Độ chưa đủ tối thiểu 50% ngưỡng (${purityPct}%)">
      ⚡ Đột Phá (Thuần Độ ${purityPct}%)
    </button>`;
  }
  
  if (ratio < 0.75) {
    // NGUY HIỂM: allowed nhưng guaranteed fail (F_purity = 0.0)
    return `<button id="btn-breakthrough" class="btn-breakthrough-map btn-breakthrough-danger"
      title="CẢNH BÁO: Thuần Độ ${purityPct}% — xác suất đột phá = 0%! Sẽ mất tamCanh và tuổi thọ.">
      ⚠ Đột Phá (${purityPct}% — Guaranteed Fail!)
    </button>`;
  }
  
  if (ratio < 1.0) {
    // Thuần độ 75-99%: thấp nhưng có xác suất
    return `<button id="btn-breakthrough" class="btn-breakthrough-map btn-breakthrough-warn ready"
      title="Thuần Độ ${purityPct}%/100% ngưỡng — có thể đột phá nhưng xác suất thấp">
      ⚡ Đột Phá (Thuần Độ ${purityPct}%)
    </button>`;
  }
  
  // Đủ ngưỡng: sẵn sàng
  return `<button id="btn-breakthrough" class="btn-breakthrough-map ready"
    title="Thuần Độ ${purityPct}% — đủ điều kiện đột phá!">
    ⚡ ĐỘT PHÁ — SẴN SÀNG!
  </button>`;
}

=== TASK 2: Thêm CSS cho trạng thái mới ===

File: idle-game/css/map.css (hoặc components.css — tìm `.btn-breakthrough-map`)

Thêm sau style hiện tại của .btn-breakthrough-map:
  .btn-breakthrough-map.btn-breakthrough-danger {
    background: rgba(180, 30, 30, 0.15);
    border-color: #c0392b;
    color: #e74c3c;
    cursor: pointer;  /* vẫn clickable để người chơi thấy warning popup */
    animation: pulse-danger 1.5s infinite;
  }
  .btn-breakthrough-map.btn-breakthrough-warn {
    background: rgba(180, 120, 0, 0.15);
    border-color: #d4a017;
    color: #d4a017;
  }
  @keyframes pulse-danger {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.6; }
  }

=== TASK 3: Warning trong doBreakthrough response ===

File: idle-game/js/core/systems/breakthrough.js — trong doBreakthrough(G):

Tìm đoạn check purity (~line 124-128):
  if (purity < threshold * 0.5) {
    return { ok:false, msg:`Thuần Độ chưa đủ...`, type:'warning' };
  }

Thêm NGAY SAU đó (trước khi gọi calcBreakthroughChance):
  if (purityRatio < 0.75) {
    // Guaranteed fail — nhưng vẫn cho thực hiện (người chơi đã được cảnh báo)
    // Thêm flag vào result để UI có thể hiện warning đặc biệt
  }
  
Sửa fail result để phân biệt rõ severe case — tìm đoạn (~line 133-158):
  const isSevere = purityRatio < 0.75 || (G.danDoc ?? 0) > 80;
  
Thêm vào fail message khi isSevere && purityRatio < 0.75:
  msg: purityRatio < 0.75
    ? `Đại thất bại! Thuần Độ quá thấp (${Math.floor(purityRatio*100)}% / cần 75%+ để có cơ hội). Kinh mạch hỗn loạn nghiêm trọng. TâmCảnh -${tamCanhLoss}, mất ${lifeLoss} năm tuổi thọ.`
    : `Đại thất bại! Linh lực hỗn loạn, kinh mạch tổn thương nặng. Tâm Cảnh -${tamCanhLoss}, mất ${lifeLoss} năm tuổi thọ.`

=== TASK 4: Warning trong char-popup breakthrough button ===

File: idle-game/js/app/popups/char-popup.js — tìm phần render breakthrough button (~line 119-122):

Thay toàn bộ đoạn:
  ${qiFull
    ? `<button class="cp-bt-btn cp-bt-ready" id="cp-btn-breakthrough">⚡ ĐỦ LINH LỰC...</button>`
    : `<div class="cp-bt-status">...Kiên Nhẫn...</div>`}

Thành:
  ${(() => {
    if (!qiFull) return `<div class="cp-bt-status">⏳ Kiên Nhẫn Bế Quan — Tích Linh Lực...</div>`;
    const threshold = REALMS[G.realmIdx]?.purityThresholds?.[(G.stage??1)-1] ?? 999999;
    const purity    = G.purity ?? 0;
    const ratio     = purity / Math.max(1, threshold);
    const purityPct = Math.floor(ratio * 100);
    if (ratio < 0.5) return `<div class="cp-bt-status" style="color:#888">
      ⚡ Qi đầy — đang tích Thuần Độ (${purityPct}% / cần 50%+)</div>`;
    if (ratio < 0.75) return `<button class="cp-bt-btn" id="cp-btn-breakthrough"
      style="background:rgba(180,30,30,0.2);border-color:#c0392b;color:#e74c3c">
      ⚠ CẢNH BÁO: Thuần Độ ${purityPct}% — Xác Suất 0%! (Guaranteed Fail)</button>`;
    return `<button class="cp-bt-btn cp-bt-ready" id="cp-btn-breakthrough">
      ⚡ ĐỦ ĐIỀU KIỆN — ĐỘT PHÁ (Thuần Độ ${purityPct}%)</button>`;
  })()}

=== KHÔNG LÀM trong session này ===
- Không thay đổi F_purity values hay breakthrough chance formula
- Không thay đổi gate (50% minimum) — đây là intentional design
- Không thêm "confirm dialog" thêm bước (chỉ cảnh báo visual, không block)

=== VERIFY ===
Tạo save test với purity ở 3 mức:
1. purity = 40% threshold → button disabled, không có màu đỏ
2. purity = 60% threshold → button màu đỏ, text "Guaranteed Fail!", vẫn clickable
   → Click → fail severe, message có giải thích "Thuần Độ quá thấp"
3. purity = 80% threshold → button màu vàng, text "Thuần Độ 80%"
   → Click → fail nhẹ (isSevere=false), message thông thường
4. purity = 110% threshold → button xanh tím, text "SẴN SÀNG!"