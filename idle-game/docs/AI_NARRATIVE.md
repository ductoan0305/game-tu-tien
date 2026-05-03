# AI_NARRATIVE.md — Tích hợp AI vào Tu Tiên Idle

## Triết lý tích hợp

AI KHÔNG thay thế engine. AI chỉ là **lớp cảm xúc** bọc quanh kết quả engine đã tính xong.

```
Engine tính toán kết quả (số liệu, logic, xác suất)
        ↓
AI nhận kết quả + context nhân vật
        ↓
AI sinh 2-3 câu văn tiên hiệp mô tả khoảnh khắc đó
        ↓
Hiển thị như flavor text — KHÔNG ảnh hưởng gì đến state
```

AI không được và không cần biết đến balance, purityThresholds, hay bất kỳ con số nội bộ nào.

---

## Các khoảnh khắc kích hoạt AI (Trigger Points)

Chỉ gọi AI ở những khoảnh khắc có cảm xúc cao — không gọi mỗi tick.

| Trigger | Event Bus | Ưu tiên |
|---|---|---|
| Đột phá thành công | `lifespan:breakthrough` | 🔴 Cao nhất |
| Đột phá thất bại | (từ engine trả về fail) | 🔴 Cao nhất |
| Nhân vật sắp hết tuổi | `lifespan:warning` | 🔴 Cao nhất |
| Cơ Duyên xuất hiện | `coduyen:triggered` | 🟠 Cao |
| Vào location mới lần đầu | `map:moved` (lần đầu) | 🟠 Cao |
| Boss dungeon bị tiêu diệt | `dungeon:boss_cleared` | 🟡 Trung |
| Nhân vật chết/kết thúc | `game:over` | 🔴 Cao nhất |

**Không gọi AI khi:** tick thường, mua đồ shop, nâng rank tông môn, craft thông thường.

---

## Context truyền vào AI

Mỗi lần gọi, truyền object context nhỏ gọn — không truyền toàn bộ G:

```js
function buildNarrativeContext(G, trigger) {
  return {
    trigger,                        // tên sự kiện
    name: G.name,
    gender: G.gender,
    age: G.age,
    maxAge: G.maxAge,
    realm: G.realm,
    realmLevel: G.realmLevel,       // tầng hiện tại 1-9
    rootName: G.rootName,           // tên linh căn
    factionName: G.factionName,     // tên môn phái (nếu có)
    location: G.location,           // vị trí hiện tại
    companions: G.companions        // đạo lữ đã gặp [{name, desc}]
  };
}
```

---

## System Prompt gọi AI

```
Ngươi là Thiên Đạo — người kể chuyện toàn tri của thế giới tu tiên.
Nhiệm vụ: viết đúng 2-3 câu văn tiên hiệp mô tả khoảnh khắc [trigger] của nhân vật.

Quy tắc bắt buộc:
- Xưng "ngươi" với nhân vật, không dùng tên trực tiếp
- Văn phong cổ điển Hán-Việt, không dùng từ hiện đại
- Tham chiếu linh căn, tuổi, vị trí nếu phù hợp
- Mỗi lần viết phải khác nhau — thay đổi thời tiết, cảm giác, chi tiết nhỏ
- Không đề cập số liệu cụ thể (exp, hp, linh thạch)
- Chỉ trả về đoạn văn, không giải thích thêm
```

---

## Ví dụ output mong muốn

**Trigger: đột phá thành công (LK3 → LK4)**
> "Linh lực trong đan điền bỗng vỡ tung như đê vỡ, xuyên suốt bách mạch chỉ trong một hơi thở. Ngươi ngã người ra sau, mồ hôi ướt đẫm, nhưng trong lồng ngực là cảm giác rỗng rang chưa từng có. Tầng thứ tư — ngươi đã đến được."

**Trigger: đột phá thất bại**
> "Linh khí dâng lên đến cực điểm rồi sụp đổ như núi lở, phản xuyên vào kinh mạch khiến ngươi nôn ra một ngụm máu tanh. Thiên mệnh hôm nay chưa thuận — hoặc là ngươi còn thiếu điều gì đó."

**Trigger: lifespan:warning (còn ~10 tuổi)**
> "Tóc mai đã điểm bạc từ bao giờ. Ngươi nhìn vào bóng nước và thấy một người già đang nhìn lại mình — người mà hai mươi năm trước chưa từng nghĩ sẽ tồn tại đến hôm nay."

**Trigger: game:over (chết già, chưa đột phá)**
> "Ngọn nến tắt lặng lẽ vào một đêm đông không ai hay biết. Luyện Khí tầng năm — đó là nơi ngươi dừng lại. Không phải vì không cố, mà vì thiên đạo vốn không công bằng."

---

## Cài đặt kỹ thuật

### File cần tạo mới
```
js/ai/narrative-client.js   ← gọi Anthropic API
js/ai/narrative-trigger.js  ← lắng nghe bus events, quyết định khi nào gọi
```

### File cần sửa
```
js/core/engine.js           ← emit đúng event sau breakthrough
js/ui/log.js                ← thêm hàm addNarrativeLog(text) với style riêng
```

### Gọi API
```js
// narrative-client.js
export async function getNarrative(context) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      system: buildSystemPrompt(),
      messages: [{ role: 'user', content: JSON.stringify(context) }]
    })
  });
  const data = await response.json();
  return data.content[0].text;
}
```

### Hiển thị
- Narrative text hiển thị **tách biệt** khỏi combat log thường
- Font chữ in nghiêng, màu khác (gold/amber) để phân biệt
- Fade in animation nhẹ
- Không block UI — gọi async, hiện khi có kết quả

### Phòng thủ khi AI fail
```js
try {
  const text = await getNarrative(context);
  addNarrativeLog(text);
} catch (e) {
  // Silent fail — game vẫn chạy bình thường, chỉ không có flavor text
  console.warn('Narrative AI unavailable:', e);
}
```

---

## API Key

Game dùng Anthropic API trực tiếp từ browser.
API key được nhập bởi người chơi tại màn hình setup (giống cách game đang dùng Worker URL).
Lưu vào `G.apiKey` hoặc `localStorage` riêng, không lưu vào cloud save.

---

## Những gì KHÔNG làm

- ❌ Không để AI ảnh hưởng đến số liệu (exp, hp, linh thạch...)
- ❌ Không gọi AI mỗi tick hay mỗi hành động nhỏ
- ❌ Không hiển thị loading spinner chặn UI
- ❌ Không retry tự động nếu fail — silent fail là đủ
- ❌ Không lưu narrative vào save file
