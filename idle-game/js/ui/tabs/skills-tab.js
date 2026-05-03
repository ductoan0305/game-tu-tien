// ============================================================
// ui/tabs/skills-tab.js
// ============================================================
import { SKILLS, REALMS } from '../../core/data.js';
import { fmtNum } from '../../utils/helpers.js';

export function renderSkillsTab(G, actions) {
  const panel = document.getElementById('panel-skills');
  if (!panel) return;

  const tierLabels = { 1: 'Nhập Môn', 2: 'Luyện Khí', 3: 'Trúc Cơ+', 4: 'Kim Đan+' };

  // Group by tier
  const byTier = {};
  for (const sk of SKILLS) {
    if (!byTier[sk.tier]) byTier[sk.tier] = [];
    byTier[sk.tier].push(sk);
  }

  panel.innerHTML = `
    <div class="tab-content">
      <h2 class="tab-title">✦ Kỹ Năng Tu Luyện</h2>
      <p class="tab-desc">Linh thạch: 💎 ${fmtNum(G.stone)}</p>

      ${Object.entries(byTier).map(([tier, skills]) => `
        <div class="skill-tier">
          <h3 class="tier-label">— Tier ${tier}: ${tierLabels[tier] || ''} —</h3>
          <div class="skill-grid">
            ${skills.map(sk => renderSkillCard(G, sk)).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  document.querySelectorAll('.btn-learn-skill').forEach(btn => {
    btn.addEventListener('click', () => actions.learn(btn.dataset.skillId));
  });
}

function renderSkillCard(G, sk) {
  const lv = G.skills[sk.id] || 0;
  const maxed = lv >= sk.maxLv;
  const locked = G.realmIdx < sk.unlockRealm;
  const cost = Math.floor(sk.costBase * Math.pow(sk.costScale, lv));
  const canAfford = G.stone >= cost;

  return `
    <div class="skill-card ${locked ? 'locked' : ''} ${maxed ? 'maxed' : ''}">
      <div class="skill-emoji">${sk.emoji}</div>
      <h4>${sk.name}</h4>
      <p class="skill-namecn">${sk.nameCN}</p>
      <p class="skill-desc">${sk.desc}</p>
      <div class="skill-effect">+${sk.perLv * (lv || 1)}${sk.unit} (Lv${lv}/${sk.maxLv})</div>
      ${locked
        ? `<div class="lock-msg">🔒 Cần ${REALMS[sk.unlockRealm]?.name}</div>`
        : maxed
          ? '<div class="maxed-badge">✦ TỐI ĐA</div>'
          : `<button class="btn-learn-skill btn-primary ${canAfford ? '' : 'disabled'}"
               data-skill-id="${sk.id}" ${canAfford ? '' : 'disabled'}>
               Lv${lv+1} — ${fmtNum(cost)}💎
             </button>`
      }
    </div>
  `;
}
