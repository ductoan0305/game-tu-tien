// ============================================================
// ui/tabs/combat-tab.js — Combat tab v4
// Fix: persistent event listeners, không one-shot
// #2: Damage floats, fighter animations, partial re-render
// ============================================================
import { getAvailableEnemies, getUnlockedSkills } from '../../combat/combat-engine.js';
import { fmtNum, pct } from '../../utils/helpers.js';
import { calcAtk, calcDef, calcMaxHp } from '../../core/state.js';
import { buildPortraitSVG } from '../portrait.js';

// Module-level state
let _lastEnemyId   = null;
let _combatActive  = false;
let _eventsWired   = false;   // skill-bar + flee đã wire chưa
let _actionsRef    = null;    // giữ reference để partial update vẫn gọi được

export function renderCombatTab(G, actions) {
  const panel = document.getElementById('panel-combat');
  if (!panel) return;
  _actionsRef = actions;

  if (G.combat.active) {
    const needFullBuild = !_combatActive || G.combat.enemy?.id !== _lastEnemyId;
    _combatActive = true;
    _lastEnemyId  = G.combat.enemy?.id || null;

    if (needFullBuild) {
      _eventsWired = false;
      panel.innerHTML = renderActiveCombat(G);
      wireCombatEvents(G, actions);
      _eventsWired = true;
    } else {
      // Chỉ update bars/log/skill states — DOM không rebuild
      updateCombatUI(G);
      // Luôn re-wire vì innerHTML của skill-bar không đổi nhưng listener có thể bị mất
      // khi renderCurrentTab được gọi từ nhiều path → wire lại an toàn
      if (!_eventsWired) {
        wireCombatEvents(G, actions);
        _eventsWired = true;
      }
    }
  } else {
    _combatActive = false;
    _lastEnemyId  = null;
    _eventsWired  = false;
    panel.innerHTML = renderEnemySelect(G);
    wireEnemySelectEvents(G, actions);
  }
}

// ---- Partial update ----
function updateCombatUI(G) {
  const c = G.combat;
  const enemy = c.enemy;
  if (!enemy) return;

  const ehpPct = pct(Math.max(0, enemy.currentHp), enemy.maxHp);
  const phpPct = pct(Math.max(0, c.playerHp), c.playerMaxHp);
  const mpPct  = pct(c.playerMp, c.playerMaxMp);

  setEl('enemy-hp-fill',  el => el.style.width = `${ehpPct}%`);
  setEl('player-hp-fill', el => el.style.width = `${phpPct}%`);
  setEl('player-mp-fill', el => el.style.width = `${mpPct}%`);

  setEl('enemy-hp-txt',  el => el.textContent = `${fmtNum(Math.max(0,Math.floor(enemy.currentHp)))} / ${fmtNum(enemy.maxHp)}`);
  setEl('player-hp-txt', el => el.textContent = `HP ${Math.floor(c.playerHp)} / ${c.playerMaxHp}`);
  setEl('player-mp-txt', el => el.textContent = `MP ${c.playerMp} / ${c.playerMaxMp}`);

  setEl('combat-log', el => {
    el.innerHTML = c.log.slice(-12).reverse().map(l => {
      const text = _formatLogLine(l.text, l.type);
      return `<div class="log-line log-${l.type}">${text}</div>`;
    }).join('');
  });

  const isMyTurn = c.phase === 'player';
  setEl('turn-indicator', el => {
    el.className = `stage-vs ${isMyTurn ? 'stage-my-turn' : 'stage-enemy-turn'}`;
    el.textContent = isMyTurn ? '⚡ LƯỢT NGƯƠI' : '💢 ĐANG BỊ TẤN CÔNG';
  });

  setEl('turn-num', el => el.textContent = `Lượt ${c.turn}`);

  setEl('combo-badge', el => {
    if (c.comboCount > 0) {
      el.style.display = '';
      el.className = `combo-badge combo-badge-${Math.min(c.comboCount, 3)}`;
      el.innerHTML = `🔥 COMBO <span class="combo-count">×${c.comboCount}</span>`;
    } else {
      el.style.display = 'none';
    }
  });

  // Hiện hint khi có skill sẵn sàng combo
  const skills = getUnlockedSkills(G.realmIdx);
  const comboReadySkill = skills.find(sk => sk.combo && c.lastSkillUsed === sk.combo.after);
  setEl('combo-hint', el => {
    if (comboReadySkill && c.phase === 'player') {
      el.style.display = '';
      const bonusLabel = {
        extra_hit: '×1.3 DMG',
        def_break: 'Phá Giáp',
        instant_counter: '×1.5 DMG',
        combo_finish: '×2.0 DMG',
      }[comboReadySkill.combo.bonus] || 'Bonus';
      el.innerHTML = `⚡ ${comboReadySkill.name} sẵn sàng COMBO — ${bonusLabel}!`;
    } else {
      el.style.display = 'none';
    }
  });

  setEl('enemy-debuffs', el => el.innerHTML = renderDebuffs(enemy.debuffs||[]));
  setEl('player-debuffs', el => el.innerHTML = renderDebuffs(c.playerDebuffs||[], true));

  // Update skill button states (disabled / combo highlight)
  document.querySelectorAll('.skill-btn').forEach(btn => {
    const sk = skills.find(s => s.id === btn.dataset.skillId);
    if (!sk) return;
    const noMp     = c.playerMp < sk.mpCost;
    const disabled = noMp || !isMyTurn;
    btn.disabled = disabled;
    btn.classList.toggle('skill-disabled', disabled);
    btn.classList.toggle('skill-combo',    !!(sk.combo && c.lastSkillUsed === sk.combo.after));
    btn.classList.toggle('skill-last',     c.lastSkillUsed === sk.id);
  });
}

function setEl(id, fn) {
  const el = document.getElementById(id);
  if (el) fn(el);
}

// ---- Combat float / animation exports ----
export function showCombatFloat(text, target = 'enemy', type = 'dmg') {
  const container = document.getElementById(target === 'enemy' ? 'float-enemy' : 'float-player');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `cfloat cfloat-${type}`;
  el.textContent = text;
  el.style.left = `${15 + Math.random() * 60}%`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

export function animateFighter(target, animType) {
  const el = document.getElementById(target === 'player' ? 'fighter-player' : 'fighter-enemy');
  if (!el) return;
  el.classList.remove('fanim-attack', 'fanim-hit', 'fanim-crit');
  void el.offsetWidth; // reflow
  el.classList.add(`fanim-${animType}`);
  setTimeout(() => el.classList.remove(`fanim-${animType}`), 500);
}

export function flashScreen(type = 'hit') {
  const el = document.getElementById('combat-flash');
  if (!el) return;
  el.className = `combat-flash flash-${type}`;
  void el.offsetWidth;
  el.classList.add('flash-active');
  setTimeout(() => { el.className = 'combat-flash'; }, 400);
}

// ---- Render helpers ----
function renderDebuffs(debuffs, isPlayer = false) {
  return (debuffs || []).map(d => {
    const icon = d.type==='burn'?'🔥':d.type==='stun'?'💫':d.type==='freeze'?'❄':'⬇';
    return `<span class="debuff-badge${isPlayer?' player-debuff':''}">${icon}${d.turns}</span>`;
  }).join('');
}

// ---- Enemy select screen ----
function renderEnemySelect(G) {
  const atk = calcAtk(G), def = calcDef(G), maxHp = calcMaxHp(G);
  return `
    <div class="tab-content">
      <h2 class="tab-title">⚔ Chiến Đấu</h2>
      <div class="combat-my-stats">
        <span>⚔ ATK <strong>${atk}</strong></span>
        <span>🛡 DEF <strong>${def}</strong></span>
        <span>❤ HP <strong>${Math.floor(G.hp)}/${maxHp}</strong></span>
        <span>🎯 Kills <strong>${G.totalKills||0}</strong></span>
      </div>
      <div class="empty-state-box" style="margin-top:20px">
        <div style="font-size:48px;margin-bottom:12px">🗺</div>
        <h3 style="color:var(--gold);margin-bottom:8px">Chưa có trận chiến</h3>
        <p style="color:var(--text-dim);font-size:12px;line-height:1.8">
          Để chiến đấu, hãy:<br>
          <strong>1.</strong> Vào <strong>🗺 Bản Đồ</strong><br>
          <strong>2.</strong> Di chuyển đến vùng có yêu thú<br>
          <strong>3.</strong> Bấm <strong>⚔ Săn Thú</strong> tại khu vực săn bắn
        </p>
        <button class="btn-primary" style="margin-top:14px;padding:10px 24px"
          onclick="document.querySelector('.bnav-btn[data-tab=cultivate]')?.click()">
          🗺 Đến Bản Đồ
        </button>
      </div>
    </div>
  `;
}

function renderEnemyCard(G, enemy) {
  const TC = {1:'#888',2:'#56c46a',3:'#c8a84b',4:'#e05c1a',5:'#a855f7',6:'#e91e8c',7:'#00bcd4',8:'#ff5722',9:'#f0d47a',10:'#7b68ee'};
  const color = TC[enemy.tier]||'#888';
  const atk = calcAtk(G);
  const turns = Math.ceil(enemy.hpBase / Math.max(1, atk - enemy.defBase*0.5));
  const diffColor = turns<=5?'#56c46a':turns<=15?'#c8a84b':'#e05c1a';
  const diffLabel = turns<=5?'Dễ':turns<=15?'Vừa':'Khó';
  const drops = (enemy.drops||[]).map(d=>`${d.itemId}(${Math.floor(d.chance*100)}%)`).join(' · ');

  return `
    <div class="enemy-card" style="border-color:${color}55;background:linear-gradient(135deg,${color}0a,transparent)">
      <div class="enemy-card-header">
        <span style="color:${color}">Tier ${enemy.tier}</span>
        <span style="color:${diffColor}">${diffLabel}</span>
      </div>
      <div class="enemy-emoji-large">${enemy.emoji}</div>
      <h3 style="color:${color};margin:4px 0">${enemy.name}</h3>
      <p class="enemy-lore-short">${enemy.lore}</p>
      <div class="enemy-stats-row">
        <span>❤ ${fmtNum(enemy.hpBase)}</span>
        <span>⚔ ${enemy.atkBase}</span>
        <span>🛡 ${enemy.defBase}</span>
        <span>💎 ${enemy.stoneReward[0]}-${enemy.stoneReward[1]}</span>
      </div>
      ${drops?`<div class="enemy-drops-list">${drops}</div>`:''}
      <button class="btn-hunt btn-primary" data-enemy-id="${enemy.id}" style="margin-top:8px;width:100%">⚔ Chiến Đấu</button>
    </div>
  `;
}

// ---- Active combat screen (full build) ----
function renderActiveCombat(G) {
  const c = G.combat;
  const enemy = c.enemy;
  if (!enemy) return '<p>Lỗi: không có enemy</p>';

  const skills   = getUnlockedSkills(G.realmIdx);
  const ehpPct   = pct(Math.max(0, enemy.currentHp), enemy.maxHp);
  const phpPct   = pct(Math.max(0, c.playerHp), c.playerMaxHp);
  const mpPct    = pct(c.playerMp, c.playerMaxMp);
  const isMyTurn = c.phase === 'player';

  const EFFECT_LABEL = {
    pierce_def:'穿甲', burn_3turn:'🔥灼烧×3',
    dodge_next:'💨闪避', stun_1turn:'💫眩晕×1',
  };

  // Mini portrait cho player
  const miniSvg = buildPortraitSVG(G)
    .replace('width="160"','width="72"')
    .replace('height="200"','height="90"')
    .replace('viewBox="0 0 160 200"','viewBox="0 30 160 140"');

  return `
    <div class="combat-arena" id="combat-arena">
      <div class="combat-flash" id="combat-flash"></div>

      <!-- ENEMY HP BAR -->
      <div class="arena-combatant enemy-combatant">
        <div class="arena-meta">
          <span class="arena-name">${enemy.emoji} ${enemy.name}</span>
          <span class="arena-hp-num" id="enemy-hp-txt">${fmtNum(Math.max(0,Math.floor(enemy.currentHp)))} / ${fmtNum(enemy.maxHp)}</span>
          <span id="enemy-debuffs">${renderDebuffs(enemy.debuffs||[])}</span>
        </div>
        <div class="arena-bar-track">
          <div class="arena-bar-fill arena-hp-enemy" id="enemy-hp-fill" style="width:${ehpPct}%"></div>
        </div>
      </div>

      <!-- FIGHTER STAGE -->
      <div class="fighter-stage" id="fighter-stage">
        <!-- Player -->
        <div class="fighter-col" id="fighter-player">
          <div class="fighter-portrait-mini ${isMyTurn?'fighter-turn':''}">${miniSvg}</div>
          <div class="fighter-name-tag">${G.name}</div>
          <div id="combo-badge" class="combo-badge" style="display:${c.comboCount>0?'':'none'}">🔥 COMBO <span class="combo-count">×${c.comboCount}</span></div>
          <div id="combo-hint" class="combo-hint" style="display:none"></div>
          <div id="player-debuffs">${renderDebuffs(c.playerDebuffs||[], true)}</div>
          <div class="cfloat-container" id="float-player"></div>
        </div>

        <!-- VS indicator -->
        <div id="turn-indicator" class="stage-vs ${isMyTurn?'stage-my-turn':'stage-enemy-turn'}">
          ${isMyTurn ? '⚡ LƯỢT NGƯƠI' : '💢 ĐANG BỊ TẤN CÔNG'}
        </div>

        <!-- Enemy -->
        <div class="fighter-col" id="fighter-enemy">
          <div class="fighter-enemy-avatar ${!isMyTurn?'fighter-turn':''}">${enemy.emoji}</div>
          <div class="fighter-name-tag">${enemy.name}</div>
          <div class="cfloat-container" id="float-enemy"></div>
        </div>
      </div>

      <!-- COMBAT LOG -->
      <div class="combat-log" id="combat-log">
        ${c.log.slice(-10).reverse().map(l =>
          `<div class="log-line log-${l.type}">${l.text}</div>`
        ).join('')}
      </div>

      <!-- PLAYER HP/MP -->
      <div class="arena-combatant player-combatant">
        <div class="arena-meta">
          <span class="arena-name">🧘 ${G.name}</span>
          <span class="arena-hp-num" id="player-hp-txt">HP ${Math.floor(c.playerHp)} / ${c.playerMaxHp}</span>
          <span id="player-debuffs-bar">${renderDebuffs(c.playerDebuffs||[], true)}</span>
        </div>
        <div class="arena-bar-track">
          <div class="arena-bar-fill arena-hp-player" id="player-hp-fill" style="width:${phpPct}%"></div>
        </div>
        <div class="arena-bar-track arena-mp-track">
          <div class="arena-bar-fill arena-mp-fill" id="player-mp-fill" style="width:${mpPct}%"></div>
        </div>
        <div class="arena-mp-text" id="player-mp-txt">MP ${c.playerMp} / ${c.playerMaxMp}</div>
      </div>

      <!-- SKILL BAR -->
      <div class="skill-bar" id="skill-bar">
        ${skills.map(sk => {
          const noMp     = c.playerMp < sk.mpCost;
          const comboRdy = sk.combo && c.lastSkillUsed === sk.combo.after;
          const isLast   = c.lastSkillUsed === sk.id;
          const efLabel  = EFFECT_LABEL[sk.effect] || '';
          const disabled = noMp || !isMyTurn;
          return `
            <button
              class="skill-btn${disabled?' skill-disabled':''}${isLast?' skill-last':''}${comboRdy?' skill-combo':''}"
              data-skill-id="${sk.id}"
              ${disabled?'disabled':''}
              title="${sk.desc}"
            >
              <span class="sk-emoji">${sk.emoji}</span>
              <span class="sk-name">${sk.name}</span>
              <span class="sk-tags">
                ${sk.mpCost>0?`<em class="sk-mp">${sk.mpCost}MP</em>`:'<em class="sk-free">Free</em>'}
                ${sk.dmgMult>0?`<em class="sk-dmg">${sk.dmgMult}x</em>`:'<em class="sk-util">Hỗ trợ</em>'}
                ${efLabel?`<em class="sk-ef">${efLabel}</em>`:''}
              </span>
              ${comboRdy?'<span class="sk-combo-flash">COMBO!</span>':''}
            </button>
          `;
        }).join('')}
      </div>

      <!-- BOTTOM BAR -->
      <div class="combat-bottom-bar">
        <button id="btn-combat-flee" class="btn-secondary btn-flee-combat" ${c.isTianJie?'disabled':''}>
          💨 Thoát ${c.isTianJie?'(Không thể!)':'(60%)'}
        </button>
        <span class="turn-label" id="turn-num">Lượt ${c.turn}</span>
      </div>
    </div>
  `;
}

// ---- Wire events — dùng persistent delegation, KHÔNG one-shot ----
function wireCombatEvents(G, actions) {
  // Skill bar: persistent click delegation
  const skillBar = document.getElementById('skill-bar');
  if (skillBar) {
    // Xóa listener cũ bằng cách clone node
    const newBar = skillBar.cloneNode(true);
    skillBar.parentNode.replaceChild(newBar, skillBar);
    newBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.skill-btn');
      if (!btn || btn.disabled) return;
      if (_actionsRef) _actionsRef.action('skill', { skillId: btn.dataset.skillId });
    });
  }

  // Flee button
  const fleeBtn = document.getElementById('btn-combat-flee');
  if (fleeBtn) {
    const newFlee = fleeBtn.cloneNode(true);
    fleeBtn.parentNode.replaceChild(newFlee, fleeBtn);
    newFlee.addEventListener('click', () => {
      if (_actionsRef) _actionsRef.flee();
    });
  }
}

function wireEnemySelectEvents(G, actions) {
  document.querySelectorAll('.btn-hunt').forEach(btn => {
    btn.addEventListener('click', () => actions.startHunt(btn.dataset.enemyId));
  });
}
// ── Combat log formatter ──────────────────────────────────────────────────
function _formatLogLine(text, type) {
  // Escape HTML
  let t = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  // Highlight numbers (damage/heal amounts) — wrap in span
  // Pattern: digits preceded by space and followed by space/end, e.g. "mất 123 HP" or "nhận 500"
  t = t.replace(/\b(\d+)\s*(HP|linh thạch|EXP|MP)/g,
    (_, n, unit) => `<span class="log-num">${n}</span> ${unit}`);

  // Badge prefix by type
  const badges = {
    player:  '<span class="log-badge log-badge-player">TÔI</span> ',
    enemy:   '<span class="log-badge log-badge-enemy">ĐỊCH</span> ',
    system:  '',
    gold:    '<span class="log-badge log-badge-gold">⭐</span> ',
  };

  // Critical / special keyword highlights
  if (/chiến thắng|victory/i.test(text)) {
    t = `<span class="log-hl-win">${t}</span>`;
  } else if (/bại trận|thoát hiểm/i.test(text)) {
    t = `<span class="log-hl-lose">${t}</span>`;
  } else if (/combo/i.test(text)) {
    t = `<span class="log-hl-combo">${t}</span>`;
  } else if (/né đòn|né /i.test(text)) {
    t = `<span class="log-hl-dodge">${t}</span>`;
  } else if (/choáng|bị đốt|bạo nộ/i.test(text)) {
    t = `<span class="log-hl-debuff">${t}</span>`;
  }

  return (badges[type] || '') + t;
}