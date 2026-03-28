// ============================================================
// core/actions.js — SHIM: backward-compat re-export
// Nội dung thực nằm trong core/systems/
//   cultivation.js  — applyCharacterSetup, toggleMeditate, doRest, doExplore, doFish, doArray, doSpar, doMeditation
//   breakthrough.js — calcBreakthroughChance, doBreakthrough, applyRealmBreakthrough
//   inventory.js    — addToInventory, buyItem, useItem, claimWorldEvent
//   tick.js         — gameTick, checkAchievements, learnSkill, canPrestige, doPrestige
// ============================================================
export { applyCharacterSetup, toggleMeditate, doRest,
         doExplore, doFish, doArray, doSpar, doMeditation } from './systems/cultivation.js';

export { calcBreakthroughChance, doBreakthrough,
         applyRealmBreakthrough }                           from './systems/breakthrough.js';

export { addToInventory, buyItem, useItem,
         claimWorldEvent }                                  from './systems/inventory.js';

export { gameTick, checkAchievements, learnSkill,
         canPrestige, doPrestige }                          from './systems/tick.js';
