# STATE_MAP.md — Bản đồ Game State
**Phiên bản:** v10 | **Cập nhật:** 2026-03-14

> **Tài liệu này dành cho developer.**
> Tra cứu nhanh: `G.xyz` là gì, ai đọc, ai ghi, UI nào hiển thị.
> Khi thêm field mới vào `G`, **bắt buộc cập nhật file này**.

---

## Cách đọc bảng

| Cột | Ý nghĩa |
|-----|---------|
| **Field** | Tên property trong object `G` |
| **Type** | Kiểu dữ liệu |
| **Default** | Giá trị mặc định trong `createFreshState()` |
| **Ghi bởi** | Engine/action nào được phép thay đổi |
| **Đọc bởi** | UI tab nào hiển thị |
| **Ghi chú** | Lưu ý quan trọng |

---

## 1. Character — Nhân vật cơ bản

| Field | Type | Default | Ghi bởi | Đọc bởi | Ghi chú |
|-------|------|---------|---------|---------|---------|
| `name` | string | `'Vô Danh Đạo Nhân'` | `applyCharacterSetup()` | Header, cultivate | Đặt lúc tạo nhân vật |
| `spiritRoot` | string\|null | `null` | `applyCharacterSetup()` | Cultivate, passive tab | id từ `SPIRIT_ROOTS` |
| `sectId` | string\|null | `null` | `applyCharacterSetup()` | Cultivate, sect tab | id từ `SECTS` |
| `setupDone` | bool | `false` | `applyCharacterSetup()` | `main.js` (guard) | `false` = hiện setup screen |

---

## 2. Realm — Cảnh giới

| Field | Type | Default | Ghi bởi | Đọc bởi | Ghi chú |
|-------|------|---------|---------|---------|---------|
| `realmIdx` | number | `0` | `applyRealmBreakthrough()` | Header, cultivate, combat, dungeon | 0-7, index vào `REALMS[]` |
| `stage` | number | `1` | `doBreakthrough()` | Header, cultivate | 1-9, tầng trong cảnh giới |
| `_pendingRealmIdx` | number\|null | `null` | `doBreakthrough()` | `applyRealmBreakthrough()` | Dùng cho Thiên Kiếp flow. `null` = không có gì chờ |

---

## 3. Resources — Tài nguyên

| Field | Type | Default | Ghi bởi | Đọc bởi | Ghi chú |
|-------|------|---------|---------|---------|---------|
| `qi` | number | `0` | `gameTick()`, actions | Header (bar) | Linh lực hiện tại. Tự tăng theo thời gian |
| `stone` | number | `0` | Nhiều nơi | Header | Linh thạch. Dùng để mua/craft |
| `hp` | number | `100` | `doRest()`, combat end | Cultivate, combat | HP hiện tại ngoài combat |
| `maxHp` | number | `100` | `applyRealmBreakthrough()` | Cultivate | HP tối đa. Dùng `calcMaxHp(G)` để tính thực |
| `stamina` | number | `100` | `gameTick()`, actions | Cultivate (bar) | Hồi tự nhiên. Một số action tốn stamina |
| `maxStamina` | number | `100` | — | Cultivate | Hiện tại cố định 100 |
| `exp` | number | `0` | `gameTick()`, combat | Cultivate (bar) | Kinh nghiệm hiện tại |
| `maxExp` | number | `200` | `doBreakthrough()` | Cultivate | EXP cần để đột phá tầng |

---

## 4. Combat Stats — Chỉ số chiến đấu

> ⚠️ Không đọc trực tiếp `G.atk` trong combat — luôn dùng `calcAtk(G)`, `calcDef(G)`, `calcMaxHp(G)`

| Field | Type | Default | Ghi bởi | Ghi chú |
|-------|------|---------|---------|---------|
| `atk` | number | `10` | `applyRealmBreakthrough()` | Base ATK trước khi cộng equipment/buff |
| `def` | number | `5` | `applyRealmBreakthrough()` | Base DEF |
| `atkPct` | number | `0` | Skills, passive tree, sect | % tăng ATK |
| `defPct` | number | `0` | Skills, passive tree | % tăng DEF |
| `hpPct` | number | `0` | Passive tree | % tăng maxHP |
| `ratePct` | number | `0` | Skills, passive tree | % tăng tốc độ tu luyện |
| `spdBonus` | number | `0` | Skills | Multiplier tốc độ |
| `hpBonus` | number | `0` | Skills, passive tree | Flat +maxHP |
| `defBonus` | number | `0` | Skills, passive tree | Flat +DEF |
| `qiBonus` | number | `0` | Skills, passive tree | Flat +qi/s |
| `stoneBonus` | number | `0` | Skills, passive tree, sect | Flat +stone/s |
| `danBonus` | number | `0` | Skills, passive tree | % hiệu quả luyện đan |
| `arrayBonus` | number | `0` | Skills, passive tree | % hiệu quả bố trận |
| `expBonus` | number | `0` | Skills, passive tree | % tăng EXP nhận được |

---

## 5. Timed Buffs — Buff có thời hạn

| Field | Type | Default | Ghi chú |
|-------|------|---------|---------|
| `atkBuff` | number | `0` | % ATK tạm thời. `calcAtk()` nhân thêm |
| `atkBuffTimer` | number | `0` | Giây còn lại. `gameTick()` đếm xuống |
| `eventRateBonus` | number | `0` | % tu luyện từ world event |
| `eventRateTimer` | number | `0` | Giây còn lại |
| `eventExpBonus` | number | `0` | % EXP từ world event / sect |
| `eventExpTimer` | number | `0` | Giây còn lại |

---

## 6. Passive State — Trạng thái hành động

| Field | Type | Default | Ghi bởi | Ghi chú |
|-------|------|---------|---------|---------|
| `meditating` | bool | `false` | `toggleMeditate()` | `true` = đang bế quan, ×1.6 qi rate |

---

## 7. Skills — Kỹ năng active

| Field | Type | Default | Ghi bởi | Đọc bởi |
|-------|------|---------|---------|---------|
| `skills` | object | `{}` | `learnSkill()` | Skills tab, combat tab |

**Cấu trúc:** `{ skillId: level }` — ví dụ `{ qi_control: 3, sword_heart: 1 }`

Kỹ năng active trong combat được tra từ `COMBAT_SKILLS` trong `combat-data.js`.

---

## 8. Inventory — Túi đồ

| Field | Type | Default | Ghi bởi | Đọc bởi |
|-------|------|---------|---------|---------|
| `inventory` | array[24] | `Array(24).fill(null)` | actions, combat | Inventory tab, combat (use item) |

**Cấu trúc mỗi slot:** `null` hoặc `{ id, qty }` hoặc `{ id, qty, name, emoji, type: 'dungeon_item' }`

---

## 9. Combat State — Trạng thái chiến đấu

> Field này thay đổi nhanh, chỉ tồn tại trong lúc đang đánh.

| Field | Type | Ghi chú |
|-------|------|---------|
| `combat.active` | bool | `true` = đang trong trận đánh |
| `combat.enemy` | object\|null | Snapshot của enemy instance (có `currentHp`, `debuffs`, v.v.) |
| `combat.playerHp` | number | HP của player trong combat (khác `G.hp`) |
| `combat.playerMaxHp` | number | maxHP lúc bắt đầu combat |
| `combat.playerMp` | number | MP dùng cho skills |
| `combat.turn` | number | Số lượt hiện tại |
| `combat.phase` | string | `'idle'│'player'│'enemy'│'result'` |
| `combat.log` | array | Mảng `{text, type}`, tối đa 50 dòng |
| `combat.selectedSkill` | string\|null | Skill đang chọn |
| `combat.comboCount` | number | Đòn combo liên tiếp |
| `combat.playerDebuffs` | array | Debuffs đang tác động lên player |
| `combat.isTianJie` | bool | `true` = đây là Thiên Kiếp |
| `combat.isDungeonCombat` | bool | `true` = đang đánh trong dungeon |
| `combat.dungeonFloor` | number | Tầng dungeon đang đánh |

---

## 10. Quest State

| Field | Type | Default | Ghi bởi | Đọc bởi |
|-------|------|---------|---------|---------|
| `quests.active` | array | `[]` | `acceptQuest()` | Quest tab |
| `quests.completed` | array | `[]` | `completeQuest()` | Quest tab |
| `quests.daily` | array | `[]` | Quest engine | Quest tab |
| `quests.lastDailyReset` | number | `0` | Quest engine | — |

**Cấu trúc active quest:** `{ questId, progress: { key: number } }`

---

## 11. Alchemy State

| Field | Type | Default | Ghi bởi | Đọc bởi |
|-------|------|---------|---------|---------|
| `alchemy.knownRecipes` | array | `['basic_qi_pill']` | `unlockRecipe()` | Alchemy tab |
| `alchemy.ingredients` | object | `{}` | `gatherIngredient()` | Alchemy tab |
| `alchemy.furnaceLevel` | number | `1` | `upgradeFurnace()` | Alchemy tab |
| `alchemy.totalCrafted` | number | `0` | `craftPill()` | Achievements |
| `alchemy.successStreak` | number | `0` | `craftPill()` | — |

---

## 12. Prestige — Luân Hồi

| Field | Type | Default | Ghi bởi | Đọc bởi |
|-------|------|---------|---------|---------|
| `prestige.count` | number | `0` | `doPrestige()` | Cultivate |
| `prestige.totalAscensions` | number | `0` | `doPrestige()` | — |
| `prestige.bonuses.ratePct` | number | `0` | `doPrestige()` | `calcQiRate()` |
| `prestige.bonuses.atkPct` | number | `0` | `doPrestige()` | `calcAtk()` |
| `prestige.bonuses.stonePct` | number | `0` | `doPrestige()` | `gameTick()` |

---

## 13. Progress Counters — Đếm thành tích

| Field | Đếm cái gì | Dùng bởi |
|-------|-----------|---------|
| `breakthroughs` | Số lần đột phá | Achievements, titles |
| `hunts` | Số trận chiến đấu | Achievements |
| `alchemySuccess` | Lần luyện đan thành công | Achievements, titles |
| `skillsLearned` | Số kỹ năng đã học | Achievements |
| `totalTime` | Tổng giây chơi | — |
| `totalKills` | Tổng số quái đã giết | Combat tab, titles |
| `totalQuestsCompleted` | Tổng quest đã xong | Achievements |

---

## 14. Achievements & Titles

| Field | Type | Default | Ghi chú |
|-------|------|---------|---------|
| `achievements` | object | `{}` | `{ achievementId: true }` |
| `titles.unlocked` | array | `[]` | Danh sách titleId đã mở |
| `titles.active` | string\|null | `null` | TitleId đang hiển thị |

> ⚠️ `achievements` đã có data và logic nhưng **chưa có UI tab** để hiển thị.

---

## 15. Equipment — Trang bị

| Field | Type | Default | Ghi bởi | Đọc bởi |
|-------|------|---------|---------|---------|
| `equipment.slots.weapon` | object\|null | `null` | `equipFromBag()` | Equipment tab, `calcAtk()` |
| `equipment.slots.armor` | object\|null | `null` | `equipFromBag()` | Equipment tab, `calcDef()`, `calcMaxHp()` |
| `equipment.slots.accessory` | object\|null | `null` | `equipFromBag()` | Equipment tab |
| `equipment.bag` | array | `[]` | Combat (drop) | Equipment tab |
| `equipment.totalDropped` | number | `0` | Combat | — |

**Cấu trúc slot:** `{ itemId, name, emoji, rarity, stats: { atk?, def?, hp?, atkPct?, defPct?, hpPct? } }`

---

## 16. Dungeon — Địa Phủ

| Field | Type | Default | Ghi bởi | Đọc bởi |
|-------|------|---------|---------|---------|
| `dungeon.currentFloor` | number | `0` | `enterDungeon()`, `onDungeonFloorClear()`, `exitDungeon()` | Dungeon tab |
| `dungeon.maxFloorReached` | number | `0` | `onDungeonFloorClear()` | Dungeon tab |
| `dungeon.active` | bool | `false` | `enterDungeon()` | `main.js` combat:end handler |
| `dungeon.activeEnemyId` | string\|null | `null` | `enterDungeon()` | — |
| `dungeon.runsToday` | number | `0` | `onDungeonFloorClear()` | — |
| `dungeon.lastRunAt` | number | `0` | `onDungeonFloorClear()` | — |

---

## 17. Sect — Tông Môn

| Field | Type | Default | Ghi bởi | Đọc bởi |
|-------|------|---------|---------|---------|
| `sect.exp` | number | `0` | `doSectContribution()` | Sect tab |
| `sect.cooldowns` | object | `{}` | `doSectContribution()` | Sect tab (hiển thị countdown) |
| `sect.totalContributions` | number | `0` | `doSectContribution()` | Sect tab |

**Cấu trúc cooldowns:** `{ contribId: timestamp_ms }`

---

## 18. Passive Skill Tree — Thiên Phú

| Field | Type | Default | Ghi bởi | Đọc bởi |
|-------|------|---------|---------|---------|
| `passiveTree.ranks` | object | `{}` | `upgradePassiveNode()` | Passive tab |
| `passiveTree.totalPoints` | number | `0` | `upgradePassiveNode()` | Passive tab |

**Cấu trúc ranks:** `{ nodeId: rank }` — ví dụ `{ jin_1a: 3, jin_2a: 1 }`

---

## 19. Temporary / Internal Fields

| Field | Ghi chú |
|-------|---------|
| `_pendingRealmIdx` | Xem mục 2. Dùng cho Thiên Kiếp flow |
| `_dungeonPendingEnemy` | Object enemy tạm thời, inject vào combat engine khi vào dungeon. Được xóa ngay sau khi combat start |

---

## 20. UI / Meta

| Field | Type | Default | Ghi chú |
|-------|------|---------|---------|
| `lastSave` | number | `Date.now()` | Timestamp lần lưu cuối |
| `activeTab` | string | `'cultivate'` | Tab đang hiển thị |

---

## Computed Values — Hàm tính toán (KHÔNG lưu vào G)

> Các hàm này trong `core/state.js`. Luôn gọi hàm, không đọc raw field.

| Hàm | Trả về | Dùng khi |
|-----|--------|---------|
| `calcAtk(G)` | ATK thực = base + equipment + buffs + prestige | Mọi tính toán ATK |
| `calcDef(G)` | DEF thực | Mọi tính toán DEF |
| `calcMaxHp(G)` | MaxHP thực | Mọi tính toán HP |
| `calcQiRate(G)` | Qi/s thực | Hiển thị tốc độ, gameTick |
| `calcMaxQi(G)` | Qi tối đa của stage hiện tại | Kiểm tra đủ đột phá chưa |
| `calcSpeed(G)` | Tốc độ combat | Combat engine |

---

## Checklist khi thêm hệ thống mới

- [ ] Thêm field vào `createFreshState()` trong `state.js`
- [ ] Thêm field vào bảng trong file này (`STATE_MAP.md`)
- [ ] Thêm entry vào `GDD.md` (mô tả bằng tiếng người)
- [ ] Thêm entry vào bảng update log trong `HANDOFF.md`
- [ ] Đảm bảo `loadGame()` không bị lỗi với save cũ (deepMerge đã xử lý, nhưng kiểm tra lại)

---

*File này do developer maintain. Cập nhật sau mỗi lần thêm field vào G.*
