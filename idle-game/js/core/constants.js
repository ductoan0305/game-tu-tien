// ============================================================
// core/constants.js ? Shared constants used across modules
// ============================================================

export const REALM_NAMES = [
  'Luy?n Kh?',
  'Tr?c C?',
  'Kim ?an',
  'Nguy?n Anh',
  'H?a Th?n',
];

export function getRealmName(realmIdx, fallback = 'Ph?m Nh?n') {
  return REALM_NAMES[realmIdx] || fallback;
}
