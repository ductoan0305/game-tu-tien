// ============================================================
// ui/tabs/passive-tab.js — Passive skill tree tab UI
// ============================================================
import { PASSIVE_NODES, getPassiveNodesForRoot } from '../../core/passive-data.js';
import { getPassiveRank, canUpgradeNode, getTotalPassiveBonus } from '../../core/passive-engine.js';
import { SPIRIT_ROOTS } from '../../core/data.js';

export function renderPassiveTab(G, actions) {
  const panel = document.getElementById('panel-passive');
  if (!panel) return;

  const root = SPIRIT_ROOTS.find(r => r.id === G.spiritRoot);
  if (!root) {
    panel.innerHTML = `<div class="tab-content"><p class="info-text">Chưa chọn linh căn.</p></div>`;
    return;
  }

  const nodes = getPassiveNodesForRoot(G.spiritRoot);
  const totalPoints = G.passiveTree?.totalPoints || 0;

  // Group by branch and tier
  const grid = {}; // grid[branch][tier] = node
  for (const n of nodes) {
    if (!grid[n.branch]) grid[n.branch] = {};
    grid[n.branch][n.tier] = n;
  }

  // Render tree
  const tiers = [1, 2, 3];
  const branches = [0, 1, 2];

  const treeHtml = `
    <div class="passive-tree-grid">
      ${tiers.map(tier => `
        <div class="passive-tier passive-tier-${tier}">
          <span class="passive-tier-label">Tầng ${tier}</span>
          <div class="passive-tier-nodes">
            ${branches.map(branch => {
              const node = grid[branch]?.[tier];
              if (!node) return `<div class="passive-node passive-node-empty"></div>`;
              return renderPassiveNode(G, node);
            }).join('')}
          </div>
        </div>
      `).join('')}
    </div>`;

  // Stats summary from passive tree
  const statsShown = ['atkPct','defPct','hpPct','ratePct','qiBonus','stoneBonus','danBonus','spdBonus'];
  const statLabels = {
    atkPct: '⚔ Công Kích', defPct: '🛡 Phòng Thủ', hpPct: '❤ HP',
    ratePct: '⚡ Tu Luyện', qiBonus: '🌀 Linh Lực/s', stoneBonus: '💎 Linh Thạch/s',
    danBonus: '⚗ Luyện Đan', spdBonus: '💨 Tốc Độ',
  };
  const statsHtml = statsShown.map(s => {
    const total = getTotalPassiveBonus(G, s);
    if (total === 0) return '';
    const unit = s.endsWith('Pct') ? '%' : s.endsWith('Bonus') ? '/s' : 'x';
    return `<div class="pt-stat"><span>${statLabels[s]}</span><span class="pt-stat-val">+${total}${unit}</span></div>`;
  }).filter(Boolean).join('');

  panel.innerHTML = `
    <div class="tab-content">
      <h2 class="tab-title">✦ Thiên Phú Linh Căn</h2>

      <div class="passive-header">
        <div class="passive-root-badge" style="border-color:${root.color}55; background:${root.color}15">
          <span class="prb-emoji" style="color:${root.color}">${root.emoji}</span>
          <div>
            <div class="prb-name" style="color:${root.color}">${root.name} — ${root.element}</div>
            <div class="prb-desc">${root.desc}</div>
            <div class="prb-rarity">Độ hiếm: <span style="color:${root.color}">${root.rarity}</span></div>
          </div>
        </div>
        <div class="passive-points">
          <span>Điểm đã dùng: <strong>${totalPoints}</strong></span>
        </div>
      </div>

      ${statsHtml ? `
        <div class="passive-stats-summary">
          <h3 class="section-title">📊 Tổng Bonus Thiên Phú</h3>
          <div class="pt-stats-grid">${statsHtml}</div>
        </div>` : ''}

      <div class="passive-tree-section">
        <h3 class="section-title">🌳 Cây Kỹ Năng Thụ Động</h3>
        <p class="passive-hint">Mỗi node yêu cầu node tầng trước đã đạt cấp tối đa trước khi mở khóa.</p>
        ${treeHtml}
      </div>
    </div>`;

  // Wire events
  panel.querySelectorAll('.btn-passive-upgrade').forEach(btn => {
    btn.addEventListener('click', () => actions.upgradePassive(btn.dataset.nodeId));
  });

  // Custom tooltip on hover
  _setupPassiveTooltips(panel, G);
}

function _setupPassiveTooltips(panel, G) {
  const tip = _getOrCreateTooltip();

  panel.querySelectorAll('.passive-node:not(.passive-node-empty)').forEach(el => {
    const nodeId = el.querySelector('[data-node-id]')?.dataset.nodeId
      || el.querySelector('.btn-passive-upgrade')?.dataset.nodeId;
    const node = nodeId
      ? PASSIVE_NODES.find(n => n.id === nodeId)
      : null;

    // Fallback: lấy node từ data attribute nếu có
    const nid = el.dataset.nodeId;
    const n = node || (nid ? PASSIVE_NODES.find(x => x.id === nid) : null);
    if (!n) return;

    const rank = getPassiveRank(G, n.id);
    const totalEffect = (n.effect.perRank * rank).toFixed(1);

    el.addEventListener('mouseenter', (e) => {
      tip.innerHTML = `
        <div class="ptip-header">
          <span style="font-size:18px">${n.emoji}</span>
          <div>
            <div class="ptip-name">${n.name}</div>
            <div class="ptip-rank">Cấp ${rank} / ${n.maxRank}</div>
          </div>
        </div>
        <div class="ptip-desc">${n.desc}</div>
        <div class="ptip-effect">
          ✦ +${n.effect.perRank}${n.effect.unit} ${n.effect.stat} / cấp
          ${rank > 0 ? `<br>✦ Hiện tại: +${totalEffect}${n.effect.unit}` : ''}
        </div>
        <div class="ptip-cost">Chi phí: ${n.costPerRank} ${n.costType === 'stone' ? '💎' : '🌀'} / cấp</div>
        ${n.requires?.length ? `<div class="ptip-req">Yêu cầu: ${n.requires.join(', ')}</div>` : ''}`;
      tip.style.display = 'block';
      _positionTooltip(tip, e);
    });

    el.addEventListener('mousemove', (e) => _positionTooltip(tip, e));
    el.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
  });
}

function _getOrCreateTooltip() {
  let tip = document.getElementById('passive-tooltip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'passive-tooltip';
    tip.className = 'passive-tooltip';
    document.body.appendChild(tip);
  }
  return tip;
}

function _positionTooltip(tip, e) {
  const pad = 12;
  const tw = tip.offsetWidth || 220;
  const th = tip.offsetHeight || 120;
  let x = e.clientX + pad;
  let y = e.clientY + pad;
  if (x + tw > window.innerWidth  - pad) x = e.clientX - tw - pad;
  if (y + th > window.innerHeight - pad) y = e.clientY - th - pad;
  tip.style.left = x + 'px';
  tip.style.top  = y + 'px';
}

function renderPassiveNode(G, node) {
  const rank = getPassiveRank(G, node.id);
  const check = canUpgradeNode(G, node.id);
  const isMaxed = rank >= node.maxRank;
  const canBuy = check.ok;

  const rankDots = Array.from({ length: node.maxRank }, (_, i) =>
    `<span class="rank-dot ${i < rank ? 'rank-dot-filled' : ''}"></span>`
  ).join('');

  let nodeClass = 'passive-node';
  if (isMaxed) nodeClass += ' passive-node-maxed';
  else if (rank > 0) nodeClass += ' passive-node-partial';
  else if (canBuy) nodeClass += ' passive-node-available';
  else nodeClass += ' passive-node-locked';

  const statLabel = `+${node.effect.perRank}${node.effect.unit} ${node.effect.stat} / cấp`;

  return `
    <div class="${nodeClass}" data-node-id="${node.id}">
      <span class="pn-emoji">${node.emoji}</span>
      <div class="pn-info">
        <span class="pn-name">${node.name}</span>
        <span class="pn-stat">${statLabel}</span>
        <div class="pn-ranks">${rankDots}</div>
      </div>
      <div class="pn-footer">
        <span class="pn-cost">${isMaxed ? '✅ Tối Đa' : `${node.costPerRank} đá`}</span>
        ${!isMaxed ? `<button class="btn-passive-upgrade btn-sm ${canBuy ? 'btn-primary' : 'btn-disabled'}"
          data-node-id="${node.id}" ${canBuy ? '' : 'disabled'}
          title="${canBuy ? 'Nâng cấp' : check.msg}">
          ${canBuy ? '+' : '🔒'}
        </button>` : ''}
      </div>
    </div>`;
}