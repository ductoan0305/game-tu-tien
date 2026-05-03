# TU TIÊN IDLE — Architecture v2

## Mục đích file này
Đây là bản đồ tổng thể. Bất kỳ AI nào nhận tiếp tác vụ đều phải đọc file này trước.
Sau khi hoàn thành 1 module, cập nhật trạng thái ở phần STATUS bên dưới.

---

## Cấu trúc thư mục

```
tutien_v2/
├── ARCHITECTURE.md          ← bạn đang đọc file này
├── index.html               ← entry point, import module chính
├── css/
│   └── style.css            ← toàn bộ CSS (copy từ v1, mở rộng)
└── js/
    ├── core/
    │   ├── data.js          ← DONE: tất cả game content (realms, items...)
    │   ├── state.js         ← DONE: createFreshState, save/load, computed values
    │   └── actions.js       ← DONE: mọi mutation của G (tick, breakthrough...)
    ├── combat/
    │   ├── combat-data.js   ← DONE: enemies, skills, combos
    │   ├── combat-engine.js ← DONE: turn-based engine (không có side effects UI)
    │   └── combat-ui.js     ← TODO: render combat screen, animations
    ├── alchemy/
    │   ├── alchemy-data.js  ← DONE: recipes, ingredients, pill catalog
    │   ├── alchemy-engine.js← DONE: luyện đan logic
    │   └── alchemy-ui.js    ← TODO: render alchemy tab
    ├── quest/
    │   ├── quest-data.js    ← DONE: quest definitions
    │   ├── quest-engine.js  ← DONE: quest state machine
    │   └── quest-ui.js      ← TODO: render quest panel
    ├── world/
    │   ├── rival-engine.js  ← TODO: NPC rival AI movement
    │   └── prestige.js      ← TODO: Luân Hồi / prestige system
    ├── ui/
    │   ├── render-core.js   ← DONE: header, bars, tabs (tick-based)
    │   ├── render-tabs.js   ← TODO: tab content renderers
    │   └── modals.js        ← TODO: breakthrough modal, event modal
    ├── utils/
    │   └── helpers.js       ← DONE: fmtNum, fmtTime, clamp, eventBus
    └── main.js              ← DONE: game loop, event wiring
```

---

## Module Status (cập nhật khi hoàn thành)

| Module | File | Status | Ghi chú |
|--------|------|--------|---------|
| Core Data | js/core/data.js | ✅ DONE | Copy + mở rộng từ v1 |
| Core State | js/core/state.js | ✅ DONE | Thêm quest/combat state |
| Core Actions | js/core/actions.js | ✅ DONE | Thêm combat/quest hooks |
| Combat Data | js/combat/combat-data.js | ✅ DONE | Enemies, skills, combos |
| Combat Engine | js/combat/combat-engine.js | ✅ DONE | Turn-based logic |
| Combat UI | js/ui/tabs/combat-tab.js | ✅ DONE | Enemy select + arena |
| Alchemy Data | js/alchemy/alchemy-data.js | ✅ DONE | Recipes, ingredients |
| Alchemy Engine | js/alchemy/alchemy-engine.js | ✅ DONE | Luyện đan có rủi ro |
| Alchemy UI | js/ui/tabs/alchemy-tab.js | ✅ DONE | Tab UI |
| Quest Data | js/quest/quest-data.js | ✅ DONE | Quest definitions |
| Quest Engine | js/quest/quest-engine.js | ✅ DONE | State machine |
| Quest UI | js/ui/tabs/quest-tab.js | ✅ DONE | Panel UI |
| Skills UI | js/ui/tabs/skills-tab.js | ✅ DONE | Skills tab |
| Inventory UI | js/ui/tabs/inventory-tab.js | ✅ DONE | Inventory tab |
| Shop UI | js/ui/tabs/shop-tab.js | ✅ DONE | Shop tab |
| Ranking UI | js/ui/tabs/ranking-tab.js | ✅ DONE | Live NPC rivals |
| Rival Engine | (tích hợp trong ranking-tab.js) | ✅ DONE | NPC AI đơn giản |
| Prestige | (tích hợp trong core/actions.js) | ✅ DONE | Luân Hồi |
| Render Core | js/ui/render-core.js | ✅ DONE | Header + bars |
| Setup Screen | js/ui/setup-screen.js | ✅ DONE | Character creation |
| Modals | (tích hợp trong main.js) | ✅ DONE | Breakthrough, event |
| Helpers | js/utils/helpers.js | ✅ DONE | Utilities |
| Main | js/main.js | ✅ DONE | Game loop |
| HTML | index.html | ✅ DONE | Entry point |
| CSS | css/style.css | ✅ DONE | Copy từ v1 + thêm |

---

## Interfaces quan trọng (đọc để biết cách kết nối)

### EventBus (utils/helpers.js)
```js
import { bus } from '../utils/helpers.js';
bus.on('combat:start', handler);   // lắng nghe event
bus.emit('combat:start', data);    // phát event
```

### Game State G (core/state.js)
State có thêm các field mới so với v1:
```js
G.combat = {
  active: false,
  enemy: null,        // current enemy object
  playerHp: 0,
  turn: 0,
  log: [],            // [{text, type}]
  selectedSkill: null,
}
G.quests = {
  active: [],         // [{questId, progress:{}}]
  completed: [],      // [questId]
  daily: [],          // daily objectives
}
G.alchemy = {
  knownRecipes: [],   // [recipeId]
  ingredients: {},    // {ingredientId: qty}
}
G.prestige = {
  count: 0,
  bonuses: {},
}
```

### Combat Engine API (combat/combat-engine.js)
```js
import { startCombat, playerAction, flee } from '../combat/combat-engine.js';
startCombat(G, enemyId)           // → { ok, enemy } | { ok:false, msg }
playerAction(G, actionType, data) // → CombatResult
flee(G)                           // → { ok, msg }
```

### Alchemy Engine API (alchemy/alchemy-engine.js)
```js
import { craftPill, gatherIngredient } from '../alchemy/alchemy-engine.js';
craftPill(G, recipeId)            // → { ok, result, pill?, msg }
gatherIngredient(G, zone)         // → { ok, items[], msg }
```

### Quest Engine API (quest/quest-engine.js)
```js
import { acceptQuest, updateQuest, completeQuest } from '../quest/quest-engine.js';
acceptQuest(G, questId)           // → { ok, msg }
updateQuest(G, eventType, data)   // gọi sau mỗi action
completeQuest(G, questId)         // → { ok, rewards, msg }
```

---

## Quy ước code

1. **Không import chéo** giữa các domain (combat không import alchemy)
2. **Mọi mutation** đi qua actions.js hoặc engine tương ứng — UI chỉ đọc, không ghi G
3. **Bus events** để giao tiếp cross-module: `bus.emit('quest:update', {type:'hunt', qty:1})`
4. **Không hardcode string** trong engine — text luôn đến từ data file
5. **Mỗi engine function** return `{ok: bool, msg: string, ...}` — không throw exception

---

## Hướng dẫn cho AI tiếp nhận

Để tiếp tục, hãy:
1. Đọc file này
2. Xem bảng STATUS ở trên — tìm module đầu tiên có status ⬜ TODO
3. Đọc file interface liên quan trong phần "Interfaces quan trọng"
4. Viết module đó
5. Cập nhật STATUS thành ✅ DONE
6. Thông báo cho người dùng biết đã xong module nào, module tiếp theo là gì
