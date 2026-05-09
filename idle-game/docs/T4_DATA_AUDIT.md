# T4 DATA AUDIT — LK Coverage
**Scope:** Tán tu (LK = realmRange [0,0], acquireType 'buy') ONLY. Không touch TC/KĐ/NA/HT, không touch sect.
**Ngày audit:** 2026-05-09 (Session L4)
**Nguồn phát hiện:** S-LK1 — kim_quyet_ha và dan_kinh_ha là sect-only, tán tu Kim/Hỏa không có Hạ phẩm mua được.

---

## 1. CÔNG PHÁP

### Ma trận grade × element (LK tán tu mua được — acquireType='buy', realmRange bao gồm [0,0])

| element | Tạp (0) | Hạ (1) | Trung (2) | Thượng (3) |
|---|---|---|---|---|
| null (không hệ) | `vo_danh` (default) | `tay_tuy_quyet` (buy, 1500💎, LK+TC) | — | — |
| Kim  | — | **THIẾU** | `thanh_nguyen_kiem_quyet` (buy, 8000💎, TC+) | — |
| Mộc  | — | `truong_xuan_cong` (buy, 800💎, LK only) | — | — |
| Thủy | — | `hoi_thuy_quyet` (buy, 900💎, LK only) | — | — |
| Hỏa  | — | **THIẾU** | — | — |
| Thổ  | — | `cuong_tho_kinh` (buy, 1000💎, LK only) | — | — |

**Ghi chú phân tích:**
- `thanh_nguyen_kiem_quyet` là Trung Phẩm, realmRange [1,4] — tán tu LK không dùng được.
- `tay_tuy_quyet` không thuộc hệ, realmRange [0,1] — OK cho LK nhưng không bù đắp hệ Kim/Hỏa.
- Sect-only: `kiem_quyet_ha` (Kim, sect), `dan_kinh_ha` (Hỏa, sect) — tán tu bị block hoàn toàn.

### THIẾU:

- [ ] **Kim/Hạ tán tu LK** — Đề xuất `kim_quang_jue` (Kim Quang Quyết):
  - `id`: `kim_quang_jue`
  - `name`: Kim Quang Quyết
  - `emoji`: ⚔
  - `grade`: 1, `gradeName`: Hạ Phẩm
  - `element`: 'kim'
  - `stages`: 9, `realmRange`: [0, 0]
  - `acquireType`: 'buy', `cost`: 1100
  - `sectId`: null
  - `desc`: 'Hệ Kim. Kiếm khí sơ khai, rèn luyện ý chí cứng rắn. Tán tu phù hợp.'
  - `lore`: 'Bí quyết lưu truyền trong giới thương nhân buôn pháp bảo — tàm tạm nhưng đủ dùng hết LK.'
  - `buffs`: `(mastery, match) => ({ atkPct: Math.floor(mastery * (match ? 0.55 : 0.40)), ratePct: Math.floor(mastery * 0.15) })`
  - **Cân bằng:** max 55% ATK (khớp Kim) / 40% (không khớp) + 15% rate — so sánh với `truong_xuan_cong` (60%/45% rate + 15% HP): thấp hơn nhẹ do Kim là hệ tấn công.

- [ ] **Hỏa/Hạ tán tu LK** — Đề xuất `hoa_diem_quyet` (Hỏa Diệm Quyết):
  - `id`: `hoa_diem_quyet`
  - `name`: Hỏa Diệm Quyết
  - `emoji`: 🔥
  - `grade`: 1, `gradeName`: Hạ Phẩm
  - `element`: 'huo'
  - `stages`: 9, `realmRange`: [0, 0]
  - `acquireType`: 'buy', `cost`: 1050
  - `sectId`: null
  - `desc`: 'Hệ Hỏa. Nội công đốt linh khí như lửa — luyện đan tốt hơn, công kích mạnh hơn. Tán tu phù hợp.'
  - `lore`: 'Học lỏm từ một đan sư phế đồ — không hoàn chỉnh nhưng đủ để tán tu Hỏa linh dùng hết LK.'
  - `buffs`: `(mastery, match) => ({ ratePct: Math.floor(mastery * 0.30), danBonus: Math.floor(mastery * (match ? 0.45 : 0.25)) })`
  - **Cân bằng:** 30% rate + danBonus 45% (khớp Hỏa) / 25% — thấp hơn `dan_kinh_ha` (sect: 30% rate + 50% dan), hợp lý.

---

## 2. LUYỆN ĐAN (RECIPES)

### Định nghĩa "LK only" cho audit này
Recipe có thể luyện ở LK = `unlockRealm: 0` (realm gate 0, không cần TC+).

### Ma trận tier × element ingredients (unlockRealm: 0, tán tu)

| Tier | Không hệ | Kim | Mộc | Thủy | Hỏa | Thổ |
|---|---|---|---|---|---|---|
| 1 | basic_qi, healing, qing_shen, vigor, ming_mu, an_shen, sha_qi, bao_pi, zhu_ji_small | — | moc_sinh (via jade_lotus+rabbit_fur) | — | sha_qi (wolf+fire_essence, tạm) | bao_pi (earth_stone) |
| 2 | cultivate, strength, defense, shou_yuan_1, ling_tri, zhu_qi, jing_xue, han_bing, lei_dao | `kim_linh_dan` ✅ | `moc_sinh_dan` ✅ | `thuy_nguyen_dan` (unlockRealm:1 ❌) | `hoa_linh_dan` (unlockRealm:1 ❌) | `tho_thu_dan` (unlockRealm:1 ❌) |
| 3 | truc_co_dan (unlockRealm:0 ✅) | — | shou_yuan_2 (moc, realm 2 ❌) | — | — | — |

**Vấn đề phát hiện:**

1. **Tier 2 hệ Thủy/Hỏa/Thổ có `unlockRealm: 1`** — tán tu LK không luyện được ngay:
   - `thuy_nguyen_dan`: Thủy, unlockRealm 1 → tán tu LK bị block
   - `hoa_linh_dan`: Hỏa, unlockRealm 1 → tán tu LK bị block
   - `tho_thu_dan`: Thổ, unlockRealm 1 → tán tu LK bị block
   - Trong khi `kim_linh_dan` (Kim, unlockRealm 0) và `moc_sinh_dan` (Mộc, unlockRealm 0) đã mở sẵn.

2. **Hệ Thủy không có Tier 1 recipe rõ ràng** — sha_qi dùng fire_essence (Hỏa concept), không phải Thủy.

3. **Hệ Hỏa Tier 1 không có recipe chuyên biệt** — sha_qi dùng wolf_fang + fire_essence nhưng không đánh dấu `element: 'hoa'`.

### THIẾU / CẦN SỬA:

- [ ] **Sửa unlockRealm của Tier 2 hệ phụ xuống 0** — hoặc thêm recipe Tier 1 bù vào:

**Option A (đề xuất — giữ cân bằng tốt hơn):** Thêm Tier 1 recipe hệ chuyên biệt cho Thủy/Hỏa/Thổ (unlock 0), cho Tier 2 vẫn giữ unlock 1.

- [ ] **Tier 1 Thủy chuyên biệt** — Đề xuất `thuy_tinh_dan` (Thủy Tinh Đan):
  - `id`: `thuy_tinh_dan`, `pillId`: `thuy_tinh_dan`
  - `name`: Thủy Tinh Đan (cần thêm vào PILLS với effect `permanent_rate`, value 1.0)
  - `tier`: 1, `unlockRealm`: 0, `element`: 'thuy'
  - `ingredients`: `[{id:'moon_dew', qty:2}, {id:'spirit_herb', qty:2}]`
  - `stoneCost`: 18, `successChance`: 0.78, `failEffect`: 'nothing', `craftTime`: 4
  - `desc`: 'Đan hệ Thủy đơn giản — tốc tu luyện +1.0/s vĩnh viễn. Thủy linh căn dùng hiệu quả hơn.'
  - **PILL cần thêm:** `{id:'thuy_tinh_dan', name:'Thủy Tinh Đan', emoji:'💧', tier:1, rarity:'common', element:'thuy', effect:{type:'permanent_rate', value:1.0}, desc:'Đan hệ Thủy đơn giản, tốc tu tăng nhẹ.'}`

- [ ] **Tier 1 Hỏa chuyên biệt** — Đề xuất `hoa_ky_dan` (Hỏa Khí Đan):
  - `id`: `hoa_ky_dan`, `pillId`: `hoa_ky_dan`
  - `name`: Hỏa Khí Đan (cần thêm vào PILLS với effect `danBonus`, value 10)
  - `tier`: 1, `unlockRealm`: 0, `element`: 'hoa'
  - `ingredients`: `[{id:'fire_essence', qty:2}, {id:'spirit_herb', qty:2}]`
  - `stoneCost`: 20, `successChance`: 0.75, `failEffect`: 'nothing', `craftTime`: 4
  - `desc`: 'Đan hệ Hỏa đơn giản — hiệu quả luyện đan +10. Hỏa linh căn tăng thêm.'
  - **PILL cần thêm:** `{id:'hoa_ky_dan', name:'Hỏa Khí Đan', emoji:'🔥', tier:1, rarity:'common', element:'hoa', effect:{type:'danBonus', value:10}, desc:'Đan hệ Hỏa cơ bản, bổ trợ đan đạo.'}`

- [ ] **Tier 1 Thổ chuyên biệt (không thuần)** — `bao_pi_dan` đã dùng earth_stone, gần Thổ concept — có thể đánh dấu thêm `element:'tho'` vào recipe. Nếu muốn strict: thêm recipe mới.
  - Đề xuất thêm `element: 'tho'` vào `bao_pi_dan` recipe (change nhỏ, không cần recipe mới).

- [ ] **Option B: Hạ unlockRealm Tier 2 Thủy/Hỏa/Thổ xuống 0** (ít recommended — làm tier 2 quá dễ):
  - `thuy_nguyen_dan`: unlockRealm 1 → 0
  - `hoa_linh_dan`: unlockRealm 1 → 0
  - `tho_thu_dan`: unlockRealm 1 → 0

---

## 3. TRẬN PHÁP (ARRAY_RECIPES)

### Ma trận tier × loại trận (unlock realm 0 → LK có thể dùng)

| Tier | Realm gate | Có recipe? | Loại phủ |
|---|---|---|---|
| 1 | realm 0 | ✅ 6 recipe | passive×3, active×2, defense×1 |
| 2 | realm 0 | ✅ 5 recipe | passive×2, active×2, defense×1 |
| 3 | realm 1 | ✅ 6 recipe (TC+) | — LK không dùng |
| 4 | realm 2 | ✅ 5 recipe (KĐ+) | — |
| 5 | realm 3 | ✅ 5 recipe (NA+) | — |

### Phân tích element/hệ coverage Tier 1-2 (LK):

| effect type | Tier 1 | Tier 2 |
|---|---|---|
| rate_pct | ✅ array_qi_field, array_burst_qi | ✅ array_dual_rate |
| exp_pct | ✅ array_exp_field | ✅ (trong array_dual_rate) |
| atk_pct | — | ✅ array_war_field |
| def_pct | ✅ (trong array_shield_basic) | ✅ (trong array_iron_wall) |
| dmg_reduce | ✅ array_shield_basic | ✅ array_iron_wall |
| stone_pct | ✅ array_stone_boost | ✅ array_speed_hunt |
| hp_regen | ✅ array_hp_regen | — |
| hp_max_pct | — | ✅ array_hp_mountain |
| stamina_regen | — | — |

### THIẾU:

- [ ] **ATK-focused trận Tier 1** — Tán tu Kim/Hỏa ở LK không có trận ATK đơn giản.
  - Đề xuất `array_sword_qi` (Kiếm Khí Linh Trận):
  - `id`: `array_sword_qi`, `name`: 'Kiếm Khí Linh Trận', `emoji`: '⚔', `category`: 'active', `tier`: 1
  - `requireRealm`: 0, `requireRank`: 0
  - `materials`: `[{id:'tran_ky', qty:2}]`
  - `stoneCostOnce`: 65, `duration`: 600
  - `effect`: `{type:'atk_pct', value:18}`
  - `desc`: 'Kiếm khí ngưng tụ. +18% ATK trong 10 phút. Tốn 65💎.'
  - `lore`: 'Trận pháp đơn giản nhất để tăng sát thương — phù hợp Kim/Hỏa linh căn LK.'

- **Nhận xét:** Coverage Tier 1-2 tổng thể tốt. Lệch nhẹ thiếu ATK tier 1. Không có lệch hệ nghiêm trọng.

---

## 4. PHÙ CHÚ

### Ma trận tier × effect type (unlock realm 0 — LK)

| Tier | realm gate | effect coverage |
|---|---|---|
| 1 | realm 0 | rate_pct, def_pct, hp_instant, atk_pct, stone_pct |
| 2 | realm 0 | rate_pct, def+dmg_reduce, atk_pct, hp+regen, stone+exp |
| 3 | realm 1 | atk_pct, dmg+def, rate+exp, hp_full+regen, atk+def+rate |
| 4 | realm 2 | dmg_reduce, atk_pct, rate+exp, stone+exp, hp+def+regen |
| 5 | realm 3 | atk+dmg_reduce, rate+exp, atk+def+rate, stone+exp, dmg+def+regen |

### Phân tích ingredient LK Tier 1-2:

**Tier 1 ingredients:**
- `draw_qi_talisman`: spirit_herb×3, wolf_fang×1 ✅ (realm 0 gather)
- `draw_shield_talisman`: earth_stone×4, spirit_herb×2 ✅
- `draw_hp_talisman`: jade_lotus×3, spirit_herb×2 ✅
- `draw_atk_talisman`: wolf_fang×4, fire_essence×2 ✅
- `draw_stone_talisman`: earth_stone×3, spirit_herb×3 ✅

**Tier 2 ingredients:**
- `draw_speed_talisman`: hawk_feather×3, moon_dew×2, spirit_herb×3 ✅ (cloud_valley + thunder_peak → realm 0)
- `draw_iron_talisman`: serpent_scale×3, earth_stone×5 — serpent_scale zone: ice_mountain, **unlockRealm:1** → tán tu LK không gather được!
- `draw_war_talisman`: wolf_fang×5, fire_essence×4, hawk_feather×2 ✅
- `draw_heal_talisman`: blood_ginseng×2, jade_lotus×4, moon_dew×2 — blood_ginseng zone: ice_mountain (realm 1 unlock)!
- `draw_wealth_talisman`: moon_dew×3, jade_lotus×3, cloud_mushroom×3 ✅

### THIẾU / VẤN ĐỀ:

- [ ] **Tier 2 `draw_iron_talisman`** dùng `serpent_scale` (zone ice_mountain, unlockRealm 1) — tán tu LK chưa thu được. Đề xuất thay thế hoặc thêm alternative recipe:
  - Thay `serpent_scale×3` bằng `earth_stone×6, wolf_fang×2` (giữ tier 2 feeling nhưng dùng nguyên liệu realm 0):
  - `draw_iron_talisman` adjusted: `materials:[{id:'earth_stone',qty:6},{id:'wolf_fang',qty:3},{id:'spirit_herb',qty:2}]`

- [ ] **Tier 2 `draw_heal_talisman`** dùng `blood_ginseng` (zone ice_mountain, realm 1) — tương tự. Đề xuất:
  - Thay `blood_ginseng×2` bằng `jade_lotus×3, moon_dew×2, rabbit_fur×2`:
  - `draw_heal_talisman` adjusted: `materials:[{id:'jade_lotus',qty:4},{id:'moon_dew',qty:3},{id:'rabbit_fur',qty:2}]`

- **Nhận xét:** Ngoài 2 vấn đề ingredient trên, phù chú Tier 1-2 coverage tốt, cân bằng các effect. Không thiếu hệ element nào đặc biệt (phù chú là buff tạm thời, không phân hệ).

---

## 5. KHÔI LỖI

### Ma trận tier × rank (unlock LK)

| Tier | realm gate | rank gate | Count |
|---|---|---|---|
| 1 | realm 0 | rank 0 | 5 recipe ✅ |
| 2 | realm 0 | rank 1 | 5 recipe ✅ |
| 3 | realm 1 | rank 2 | 5 recipe (TC+) |
| 4 | realm 2 | rank 3 | 5 recipe (KĐ+) |
| 5 | realm 3 | rank 4-5 | 5 recipe (NA+) |

### Phân tích ingredient Tier 1-2 (realm 0):

**Tier 1:**
- `craft_copper_puppet`: earth_stone×5, wolf_fang×3 ✅
- `craft_iron_puppet`: earth_stone×8, serpent_scale×3, wolf_fang×2 — **serpent_scale realm 1!**
- `craft_shield_puppet`: earth_stone×10, hawk_feather×2, spirit_herb×4 ✅
- `craft_swift_puppet`: hawk_feather×5, moon_dew×3 ✅
- `craft_balanced_puppet`: earth_stone×6, wolf_fang×3, spirit_herb×3 ✅

**Tier 2 (realm 0, rank 1):**
- `craft_silver_blade`: serpent_scale×5, lightning_core×2, wolf_fang×5 — **serpent_scale + lightning_core realm 1+/2**!
- `craft_silver_tower`: earth_stone×15, serpent_scale×4, blood_ginseng×2 — **serpent_scale + blood_ginseng realm 1**!
- `craft_dual_puppet`: moon_dew×5, hawk_feather×4, lightning_core×2 — **lightning_core realm 2**!
- `craft_regen_puppet`: jade_lotus×5, blood_ginseng×2, moon_dew×3 — **blood_ginseng realm 1**!
- `craft_fire_puppet`: fire_essence×6, wolf_fang×4, lightning_core×2 — **lightning_core realm 2**!

### THIẾU / VẤN ĐỀ:

- [ ] **Tier 1 `craft_iron_puppet`** dùng `serpent_scale` (realm 1). Tán tu LK chưa có nguyên liệu này. Đề xuất:
  - Thay `serpent_scale×3` bằng `earth_stone×5, wolf_fang×3` (hoặc `demon_core_1×1` để giữ cảm giác khó hơn `copper_puppet`):
  - `craft_iron_puppet` adjusted: `materials:[{id:'earth_stone',qty:8},{id:'wolf_fang',qty:5},{id:'demon_core_1',qty:1}]`
  - Ghi chú: `demon_core_1` drop từ `demon_wilds` (realm 0) — hợp lý.

- [ ] **Tier 2 — Toàn bộ 5 recipe đều dùng ingredient realm 1 hoặc 2.** Đây là vấn đề nghiêm trọng — tán tu LK (realm 0) không thể luyện Tier 2 khôi lỗi dù rank 1 đã đạt (rank 1 chỉ cần 5 crafts). Đề xuất thay thế ingredient hoặc thêm 2-3 Tier 2 recipe dùng realm-0 materials:

  - [ ] `craft_silver_blade` adjusted: thay `serpent_scale×5, lightning_core×2` bằng `wolf_fang×8, demon_core_1×2, fire_essence×4`:
    - `materials:[{id:'wolf_fang',qty:8},{id:'demon_core_1',qty:2},{id:'fire_essence',qty:4}]`

  - [ ] `craft_silver_tower` adjusted: thay `serpent_scale×4, blood_ginseng×2` bằng `earth_stone×20, wolf_fang×4, jade_lotus×3`:
    - `materials:[{id:'earth_stone',qty:20},{id:'wolf_fang',qty:4},{id:'jade_lotus',qty:3}]`

  - [ ] `craft_dual_puppet` adjusted: thay `lightning_core×2` bằng `fire_essence×3, demon_core_1×2`:
    - `materials:[{id:'moon_dew',qty:5},{id:'hawk_feather',qty:4},{id:'fire_essence',qty:3},{id:'demon_core_1',qty:2}]`

  - [ ] `craft_regen_puppet` adjusted: thay `blood_ginseng×2` bằng `jade_lotus×6, moon_dew×2` (gần gần concept hồi phục):
    - `materials:[{id:'jade_lotus',qty:6},{id:'moon_dew',qty:4},{id:'spirit_herb',qty:3}]`

  - [ ] `craft_fire_puppet` adjusted: thay `lightning_core×2` bằng `wolf_fang×4, demon_core_1×2`:
    - `materials:[{id:'fire_essence',qty:8},{id:'wolf_fang',qty:5},{id:'demon_core_1',qty:2}]`

- **Nhận xét:** Khôi Lỗi có vấn đề ingredient lớn nhất trong tất cả nghề phụ cho LK. Gần như 100% Tier 2 block tán tu LK.

---

## 6. LINH THỰC

### Ma trận tier × realm gate (LK cook được)

| Tier | realm gate | rank gate | Count | LK accessible? |
|---|---|---|---|---|
| 1 | realm 0 | rank 0 | 6 recipe | ✅ Đầy đủ |
| 2 | realm 0 | rank 1 | 8 recipe (kể cả `regen_feast`, `combat_banh`) | ✅ Phần lớn |
| 3 | realm 1 | rank 2 | 7 recipe | ❌ TC+ |
| 4 | realm 2 | rank 3 | 6 recipe | ❌ KĐ+ |
| 5 | realm 3 | rank 4-5 | 5 recipe | ❌ NA+ |

### Phân tích ingredient Tier 1-2 (realm 0):

**Tier 1 — OK:**
- Tất cả dùng: linh_thao, van_linh_co, bach_ngoc_lien, nguyet_lo_thao, linh_thu_nhuc, linh_thu_xuong — toàn realm 0 hoặc drop zone. ✅

**Tier 2 — Một số vấn đề:**
- `cook_bach_lien_tra`: bach_ngoc_lien×2, cam_lo_linh×1, linh_thao×2 — **cam_lo_linh** zone: spirit_forest (realm 0) ✅ nhưng rarity 'rare'. OK.
- `cook_tuyet_nham_canh`: tuyet_linh_nhung×3, linh_thu_xuong×3, ngũ_hanh_yen×1 — **tuyet_linh_nhung** zone: ice_mountain (realm 1 gather!)
- `cook_xa_linh_lau`: xa_ngạnh_linh×2, linh_thu_nhuc×4, linh_tuong×1 — **xa_ngạnh_linh** là alias `serpent_scale` zone ice_mountain (realm 1)!
- `cook_regen_feast`: cam_lo_linh×2, van_linh_co×4, linh_thu_xuong×4 ✅ (realm 0)
- Các recipe còn lại Tier 2 dùng realm 0 ingredients ✅

### THIẾU / VẤN ĐỀ:

- [ ] **`cook_tuyet_nham_canh`** dùng `tuyet_linh_nhung` (zone: ice_mountain, realm 1). Đề xuất:
  - Thay `tuyet_linh_nhung×3` bằng `linh_thao×4, nguyet_lo_thao×2` (giữ ý nghĩa "lạnh/mát"):
  - `materials:[{id:'linh_thao',qty:4},{id:'nguyet_lo_thao',qty:2},{id:'linh_thu_xuong',qty:3},{id:'ngũ_hanh_yen',qty:1}]`

- [ ] **`cook_xa_linh_lau`** dùng `xa_ngạnh_linh` (serpent_scale, zone ice_mountain, realm 1). Đề xuất:
  - Thay `xa_ngạnh_linh×2` bằng `linh_thu_nhuc×3, wolf_fang×2` (giữ ý nghĩa "thịt linh vật"):
  - Hoặc đổi id ingredient sang `ung_vu_linh` (zone: drop) nếu muốn giữ vật liệu thú:
  - `materials:[{id:'ung_vu_linh',qty:2},{id:'linh_thu_nhuc',qty:4},{id:'linh_tuong',qty:1}]`

- **Nhận xét:** Linh Thực Tier 1-2 phần lớn OK. Chỉ 2 recipe Tier 2 có ingredient lậu realm 1. Không thiếu hệ. Coverage element/effect đa dạng.

---

## 7. SHOP ITEMS LK

### Items có `unlockRealm: 0` (mua được ở LK)

| Category | Items | Ghi chú |
|---|---|---|
| Food | linh_me, linh_me_seed, ich_coc_dan | ✅ Đầy đủ lương thực |
| Consume/Restore | lingrong (HP), linghidan (qi), stamina_pill | ✅ 3 loại cơ bản |
| Furnace | lo_dan_1 (200💎), lo_dan_2 (500💎) | ✅ Mở được luyện đan |
| Forge | bei_ren_1 (250💎), bei_ren_2 (600💎) | ✅ Mở được rèn bảo |
| Kitchen | bep_lt_1 (200💎), bep_lt_2 (550💎) | ✅ Mở được linh thực |
| Tran mat | shop_tran_ky (200💎), shop_tran_ban (700💎) | ✅ Mở được trận pháp |
| Công Pháp | truong_xuan_cong (800💎), hoi_thuy_quyet (900💎), cuong_tho_kinh (1000💎), tay_tuy_quyet (1500💎) | **Kim/Hỏa THIẾU** |

### Đối chiếu với coverage audit trên:

- Công pháp shop: **Kim và Hỏa không có** Hạ phẩm mua được. Khi thêm `kim_quang_jue` và `hoa_diem_quyet`, cần thêm vào shop (hoặc tự động mở trong `getAvailableCongPhap`).
- Cost escalation shop: 800 → 900 → 1000 → 1500 — hợp lý (tăng dần). Kim (1100) và Hỏa (1050) nằm trong range phù hợp.
- Trận Nhãn (3000💎) chỉ unlock realm 1 trong shop — OK, Tier 3 trận pháp đã là realm 1.
- Tất cả equipment shop: unlock realm 1+ → không block LK.

---

## TỔNG KẾT ĐỀ XUẤT BỔ SUNG

### Input cho Session L5 (implement data):

#### A. CÔNG PHÁP — Thêm mới:
- [ ] Thêm `kim_quang_jue` (Kim/Hạ, buy, 1100💎, realmRange[0,0])
- [ ] Thêm `hoa_diem_quyet` (Hỏa/Hạ, buy, 1050💎, realmRange[0,0])

#### B. LUYỆN ĐAN — Thêm PILL + RECIPE:
- [ ] Thêm PILL `thuy_tinh_dan` (Thủy, tier 1, permanent_rate +1.0)
- [ ] Thêm RECIPE `thuy_tinh_dan` (moon_dew×2, spirit_herb×2, stone:18, realm 0)
- [ ] Thêm PILL `hoa_ky_dan` (Hỏa, tier 1, danBonus +10)
- [ ] Thêm RECIPE `hoa_ky_dan` (fire_essence×2, spirit_herb×2, stone:20, realm 0)
- [ ] (Optional) Đánh dấu `element:'tho'` vào recipe `bao_pi_dan` hiện có

#### C. TRẬN PHÁP — Thêm mới:
- [ ] Thêm `array_sword_qi` (Kiếm Khí Linh Trận, active, tier 1, realm 0, +18% ATK 10 phút, stone:65, Trận Kỳ×2)

#### D. PHÙ CHÚ — Sửa ingredient:
- [ ] Sửa `draw_iron_talisman` materials: bỏ serpent_scale → thay earth_stone×6, wolf_fang×3, spirit_herb×2
- [ ] Sửa `draw_heal_talisman` materials: bỏ blood_ginseng×2 → thay jade_lotus×4, moon_dew×3, rabbit_fur×2

#### E. KHÔI LỖI — Sửa ingredient (ưu tiên cao nhất):
- [ ] Sửa `craft_iron_puppet` (tier 1): bỏ serpent_scale → thay earth_stone×8, wolf_fang×5, demon_core_1×1
- [ ] Sửa `craft_silver_blade` (tier 2): bỏ serpent_scale+lightning_core → thay wolf_fang×8, demon_core_1×2, fire_essence×4
- [ ] Sửa `craft_silver_tower` (tier 2): bỏ serpent_scale+blood_ginseng → thay earth_stone×20, wolf_fang×4, jade_lotus×3
- [ ] Sửa `craft_dual_puppet` (tier 2): bỏ lightning_core → thay fire_essence×3, demon_core_1×2 (giữ moon_dew+hawk_feather)
- [ ] Sửa `craft_regen_puppet` (tier 2): bỏ blood_ginseng → thay jade_lotus×6, moon_dew×4, spirit_herb×3
- [ ] Sửa `craft_fire_puppet` (tier 2): bỏ lightning_core → thay wolf_fang×4, demon_core_1×2 (giữ fire_essence)

#### F. LINH THỰC — Sửa ingredient:
- [ ] Sửa `cook_tuyet_nham_canh`: bỏ tuyet_linh_nhung → thay linh_thao×4, nguyet_lo_thao×2
- [ ] Sửa `cook_xa_linh_lau`: bỏ xa_ngạnh_linh → thay ung_vu_linh×2

#### G. SHOP — Thêm công pháp mới:
- [ ] Sau khi thêm `kim_quang_jue` và `hoa_diem_quyet` vào `CONG_PHAP_LIST`, `getAvailableCongPhap()` tự động hiển thị (acquireType='buy', sectId=null). Không cần sửa shop logic.

---

**Ưu tiên implement L5:**
1. 🔴 KHÔI LỖI Tier 2 ingredients (5 fixes) — bị block hoàn toàn, quan trọng nhất
2. 🔴 CÔNG PHÁP Kim/Hỏa (2 thêm mới) — bug gốc S-LK1
3. 🟡 PHÙ CHÚ Tier 2 ingredients (2 fixes) — minor nhưng không thể gather
4. 🟡 LUYỆN ĐAN Tier 1 Thủy/Hỏa (2 pills + 2 recipes) — asymmetry element
5. 🟢 LINH THỰC Tier 2 ingredients (2 fixes) — minor
6. 🟢 TRẬN PHÁP Tier 1 ATK (1 thêm mới) — optional, coverage đã tạm đủ
