// Tu Tien Ky — Cloudflare Worker
// Endpoints:
//   POST /      ← gọi AI (có rate limit)
//   POST /save  ← lưu data vào D1 (không rate limit)
//
// wrangler.toml cần có:
//   [ai]
//   binding = "AI"
//
//   [[d1_databases]]
//   binding = "tu_tien_ky_db"
//   database_name = "tu-tien-ky-db"
//   database_id = "9e351e7f-24de-4710-85e9-628b0418dda8"

const RATE_LIMIT_PER_IP = 30;
const RATE_LIMIT_WINDOW = 60 * 60;

const PROVIDERS = {
  anthropic: { model: "claude-haiku-4-5-20251001",             maxTokens: 600 },
  cfai:      { model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast", maxTokens: 600 },
  gemini:    { model: "gemini-2.0-flash",                      maxTokens: 600 },
};

// ── Rate limit ──────────────────────────────────────────
const rateLimitStore = new Map();

function getRateLimit(ip) {
  const now = Math.floor(Date.now() / 1000);
  const entry = rateLimitStore.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: RATE_LIMIT_PER_IP - 1 };
  }
  if (entry.count >= RATE_LIMIT_PER_IP) {
    return { allowed: false, resetIn: RATE_LIMIT_WINDOW - (now - entry.windowStart) };
  }
  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_PER_IP - entry.count };
}

// ── AI providers ────────────────────────────────────────
async function callAnthropic(apiKey, system, messages) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: PROVIDERS.anthropic.model,
      max_tokens: PROVIDERS.anthropic.maxTokens,
      system,
      messages,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `Anthropic error ${res.status}`);
  return data;
}

async function callCfAI(ai, system, messages) {
  const result = await ai.run(PROVIDERS.cfai.model, {
    messages: [{ role: "system", content: system }, ...messages.map(m => ({ role: m.role, content: m.content }))],
    max_tokens: PROVIDERS.cfai.maxTokens,
  });
  return { content: [{ type: "text", text: result?.response || "" }], model: PROVIDERS.cfai.model, _provider: "cfai" };
}

async function callGemini(apiKey, system, messages) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${PROVIDERS.gemini.model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: messages.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
        generationConfig: { maxOutputTokens: PROVIDERS.gemini.maxTokens, temperature: 0.9 },
      }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `Gemini error ${res.status}`);
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return { content: [{ type: "text", text }], model: PROVIDERS.gemini.model, _provider: "gemini" };
}

// ── Lưu data vào D1 ─────────────────────────────────────
async function handleSave(body, db) {
  const { player_id, type, payload } = body;
  if (!player_id || !type || !payload) {
    return { error: "Thiếu player_id, type hoặc payload" };
  }

  const now = Math.floor(Date.now() / 1000);

  if (type === "snapshot") {
    await db.prepare(`
      INSERT INTO snapshots (player_id, realm_level, faction_id, root_id, turns, companions, skills, events, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      player_id,
      payload.realm_level ?? 1,
      payload.faction_id  ?? "",
      payload.root_id     ?? "",
      payload.turns       ?? 0,
      JSON.stringify(payload.companions ?? []),
      JSON.stringify(payload.skills     ?? []),
      JSON.stringify(payload.events     ?? []),
      now
    ).run();
  } else if (["companion", "item", "skill", "event"].includes(type)) {
    await db.prepare(`
      INSERT INTO ai_generated (player_id, type, value, context, realm_level, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      player_id,
      type,
      payload.value       ?? "",
      payload.context     ?? "",
      payload.realm_level ?? 1,
      now
    ).run();
  } else {
    return { error: `Type không hợp lệ: ${type}` };
  }

  return { ok: true };
}

// ── Main handler ────────────────────────────────────────
export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    if (request.method !== "POST")    return new Response("Method not allowed", { status: 405 });

    const path = new URL(request.url).pathname;

    let body;
    try { body = await request.json(); }
    catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── POST /save ──────────────────────────────────────
    if (path === "/save") {
      if (!env.tu_tien_ky_db) {
        return new Response(JSON.stringify({ error: "D1 chưa được binding" }), {
          status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      try {
        const result = await handleSave(body, env.tu_tien_ky_db);
        return new Response(JSON.stringify(result), {
          status: result.error ? 400 : 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ── POST / (gọi AI) ─────────────────────────────────
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const rl = getRateLimit(ip);
    if (!rl.allowed) {
      return new Response(
        JSON.stringify({ error: `Quá nhiều request. Thử lại sau ${Math.ceil(rl.resetIn / 60)} phút.` }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { system, messages } = body;
    if (!system || !messages) {
      return new Response(JSON.stringify({ error: "Thiếu system hoặc messages" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const trimmedMessages = messages.slice(-14);
    const useAnthropic = !!env.ANTHROPIC_API_KEY;
    const useCfAI      = !!env.AI;
    const useGemini    = !!env.GEMINI_API_KEY;

    if (!useAnthropic && !useCfAI && !useGemini) {
      return new Response(
        JSON.stringify({ error: "Chưa cấu hình provider." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const providerQueue = [
      useAnthropic && { name: "anthropic", fn: () => callAnthropic(env.ANTHROPIC_API_KEY, system, trimmedMessages) },
      useCfAI      && { name: "cfai",      fn: () => callCfAI(env.AI, system, trimmedMessages) },
      useGemini    && { name: "gemini",    fn: () => callGemini(env.GEMINI_API_KEY, system, trimmedMessages) },
    ].filter(Boolean);

    const errors = [];
    for (const provider of providerQueue) {
      try {
        const data = await provider.fn();
        return new Response(JSON.stringify(data), {
          headers: {
            ...corsHeaders,
            "Content-Type":          "application/json",
            "X-RateLimit-Remaining": String(rl.remaining),
            "X-AI-Provider":         provider.name,
          },
        });
      } catch (e) {
        const msg = `[${provider.name}] ${e.message}`;
        console.error(msg);
        errors.push(msg);
      }
    }

    return new Response(JSON.stringify({ error: "Tất cả provider đều lỗi.", details: errors }), {
      status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  },
};