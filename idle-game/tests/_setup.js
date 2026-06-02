// ============================================================
// tests/_setup.js — Node test environment shims
// The game runs in a browser; under Node we stub the only two
// browser globals the *core* modules touch at call-time:
//   - localStorage (persistence.js save/load)
//   - console      (already exists in Node, left as-is)
// Import this module BEFORE calling saveGame/loadGame.
// ============================================================

class MemoryStorage {
  constructor() { this._m = new Map(); }
  getItem(k)        { return this._m.has(k) ? this._m.get(k) : null; }
  setItem(k, v)     { this._m.set(k, String(v)); }
  removeItem(k)     { this._m.delete(k); }
  clear()           { this._m.clear(); }
}

/** Install a fresh in-memory localStorage on globalThis and return it. */
export function installLocalStorage() {
  const store = new MemoryStorage();
  globalThis.localStorage = store;
  return store;
}

// Install eagerly on import so persistence.js works the moment it's used.
if (!globalThis.localStorage) installLocalStorage();
