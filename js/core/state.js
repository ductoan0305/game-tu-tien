// ============================================================
// core/state.js — SHIM: backward-compat re-export
// Nội dung thực nằm trong core/state/
//   fresh-state.js     — createFreshState
//   persistence.js     — saveGame, loadGame, migration
//   computed.js        — calcQiRate, calcAtk, ...
//   offline.js         — calcOfflineSec, applyOfflineMeditate,
//                        applyOfflineSkip, calcOfflineProgress
//   offline-simulate.js — logic simulate nội bộ
// ============================================================
export { SAVE_KEY, SAVE_VERSION, createFreshState }     from './state/fresh-state.js';
export { saveGame, loadGame }                            from './state/persistence.js';
export { calcOfflineProgress,
         calcOfflineSec,
         applyOfflineMeditate,
         applyOfflineSkip }                             from './state/offline.js';
export { calcQiRate, calcMaxQi, calcPurityThreshold,
         calcPurityRate, calcAtk, calcDef, calcMaxHp,
         calcDmgReduce, calcSpeed }                     from './state/computed.js';