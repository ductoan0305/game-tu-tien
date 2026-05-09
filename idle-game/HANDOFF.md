# HANDOFF — Tu Tiên Idle Game

## DESIGN MANIFESTO (tóm tắt)
- **§1** Tán tu (LK) là path hợp lệ — không bị block content sect-only.
- **§7** Sửa asymmetry data OK; không thêm power vượt cấp cùng tier.
- **Balance**: cost theo tier, element buff khớp nhỏ hơn sect cùng grade.

## STATE STRUCTURE (tóm tắt)
- `G.congPhap`: `{ currentId, unlockedIds[], activeIds[], mastery:{} }`
- `G.realmIdx`: 0=LK, 1=TC, 2=KĐ, 3=NA, 4=HT
- `G.sectId`: null = tán tu, string = tông môn
- Nghề phụ: `G.alchemy`, `G.talisman`, `G.puppet`, `G.array`, `G.linhThuc`

## BUGS ĐÃ FIX

### S-LK1 — Tán tu Kim/Hỏa LK không có công pháp Hạ phẩm (Session L4 phát hiện, L5 fix)
**Root cause:** `kiem_quyet_ha` và `dan_kinh_ha` là sect-only; không có buy option hệ Kim/Hỏa cho LK.
**Fix (L5):** Thêm vào `js/core/phap-dia.js > CONG_PHAP_LIST`:
- `kim_quang_jue` — Kim/Hạ, buy 1100💎, realmRange[0,0], ATK 55%/40% + rate 15%
- `hoa_diem_quyet` — Hỏa/Hạ, buy 1050💎, realmRange[0,0], rate 30% + danBonus 45%/25%

### T4-DAN — Asymmetry luyện đan Tier 1 hệ Thủy/Hỏa (L5 fix)
**Root cause:** Kim/Mộc có Tier 2 recipe unlockRealm 0; Thủy/Hỏa không có Tier 1 đặc hệ.
**Fix (L5):** Thêm vào `js/alchemy/alchemy-data.js`:
- PILL `thuy_tinh_dan` (Thủy, tier 1, permanent_rate +1.0)
- PILL `hoa_ky_dan` (Hỏa, tier 1, danBonus +10)
- RECIPE `thuy_tinh_dan` (moon_dew×2, spirit_herb×2, stone:18, realm 0)
- RECIPE `hoa_ky_dan` (fire_essence×2, spirit_herb×2, stone:20, realm 0)
- Tag `element:'tho'` vào recipe `bao_pi_dan`

### T4-TRAN — Thiếu ATK trận Tier 1 cho LK (L5 fix)
**Fix (L5):** Thêm `array_sword_qi` vào `js/alchemy/tran-phap-data.js`:
- Kiếm Khí Linh Trận, active, tier 1, realm 0, +18% ATK 10 phút, stone 65, Trận Kỳ×2

### T4-PHU — Phù Tier 2 dùng nguyên liệu realm 1 (L5 fix)
**Fix (L5):** Sửa `js/alchemy/phu-chu-data.js`:
- `draw_iron_talisman`: bỏ `serpent_scale×3` → `earth_stone×6, wolf_fang×3, spirit_herb×2`
- `draw_heal_talisman`: bỏ `blood_ginseng×2` → `jade_lotus×4, moon_dew×3, rabbit_fur×2`

### T4-KLOI — Khôi Lỗi Tier 1+2 dùng nguyên liệu realm 1-2 (L5 fix — nghiêm trọng nhất)
**Root cause:** Hầu hết recipe Tier 2 dùng `serpent_scale`, `lightning_core`, `blood_ginseng` — tất cả realm 1+.
**Fix (L5):** Sửa `js/alchemy/khoi-loi-data.js`:
- `craft_iron_puppet` (tier 1): `serpent_scale×3` → `wolf_fang×5, demon_core_1×1`
- `craft_silver_blade` (tier 2): `serpent_scale×5, lightning_core×2` → `wolf_fang×8, demon_core_1×2, fire_essence×4`
- `craft_silver_tower` (tier 2): `serpent_scale×4, blood_ginseng×2, earth_stone×15` → `earth_stone×20, wolf_fang×4, jade_lotus×3`
- `craft_dual_puppet` (tier 2): `lightning_core×2` → `fire_essence×3, demon_core_1×2` (giữ moon_dew+hawk_feather)
- `craft_regen_puppet` (tier 2): `blood_ginseng×2, jade_lotus×5` → `jade_lotus×6, moon_dew×4, spirit_herb×3`
- `craft_fire_puppet` (tier 2): `lightning_core×2, fire_essence×6` → `fire_essence×8, wolf_fang×5, demon_core_1×2`

### T4-LT — Linh Thực Tier 2 dùng nguyên liệu realm 1 (L5 fix)
**Fix (L5):** Sửa `js/alchemy/linh-thuc-data.js`:
- `cook_tuyet_nham_canh`: `tuyet_linh_nhung×3` → `linh_thao×4, nguyet_lo_thao×2`
- `cook_xa_linh_lau`: `xa_ngạnh_linh×2` → `ung_vu_linh×2`

---

## BẢNG CÔNG PHÁP / NGHỀ PHỤ (LK tán tu coverage)

| Element | Công Pháp LK | Đan Tier 1 | Đan Tier 2 (realm 0) | Khôi Lỗi T2 OK? | Trận T1 |
|---|---|---|---|---|---|
| Kim  | `kim_quang_jue` ✅ (L5) | `kim_linh_dan` (tier 2, realm 0) ✅ | ✅ | ✅ (L5 fix) | `array_sword_qi` ✅ |
| Mộc  | `truong_xuan_cong` ✅ | `moc_sinh_dan` (tier 2, realm 0) ✅ | ✅ | ✅ | ✅ |
| Thủy | `hoi_thuy_quyet` ✅ | `thuy_tinh_dan` (tier 1) ✅ (L5) | `thuy_nguyen_dan` (realm 1) | ✅ (L5 fix) | ✅ |
| Hỏa  | `hoa_diem_quyet` ✅ (L5) | `hoa_ky_dan` (tier 1) ✅ (L5) | `hoa_linh_dan` (realm 1) | ✅ (L5 fix) | ✅ |
| Thổ  | `cuong_tho_kinh` ✅ | `bao_pi_dan` (tier 1, element tho) ✅ | `tho_thu_dan` (realm 1) | ✅ (L5 fix) | ✅ |

---

## ROADMAP — CÒN LẠI

### Đã xong L1–L5 (T4 Data Audit hoàn tất)
Mọi mục trong `docs/T4_DATA_AUDIT.md` đã implement đầy đủ.

### Hướng tiếp theo (chưa có session):
- **L6** — UI polish: hiển thị element tag trên card công pháp/đan dược trong shop.
- **L6** — Validation tự động: script check ingredient realm vs recipe requireRealm.
- **Balance review**: Phù Chú Tier 3+ vẫn dùng serpent_scale/blood_ginseng — OK vì requireRealm:1.
- **Content**: Thêm công pháp Trung Phẩm Kim/Hỏa cho TC (hiện chỉ có Thủy và null).

---

## GHI CHÚ KỸ THUẬT
- Element keys trong code: `'kim'`, `'mu'` (Mộc), `'shui'` (Thủy), `'huo'` (Hỏa), `'tu'` (Thổ)
- `acquireType: 'buy'` + `sectId: null` = hiện trong shop tán tu tự động qua `getAvailableCongPhap()`
- `demon_core_1` drop từ `demon_wilds` zone (realm 0) — safe dùng cho recipe LK
- `hawk_feather` drop từ `thunder_peak` zone nhưng zone này unlockRealm:2 — **KHÔNG dùng cho recipe LK tier 1-2**. Tuy nhiên `craft_dual_puppet` đã có hawk_feather từ trước (bug tiềm ẩn, để nguyên theo audit không đề cập).
