// ============================================================
// utils/helpers.js — Shared utilities + EventBus
// Không import gì từ các module khác
// ============================================================

// ---- Formatting ----

export function fmtNum(n) {
  n = Math.floor(n);
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9)  return (n / 1e9).toFixed(2)  + 'B';
  if (n >= 1e6)  return (n / 1e6).toFixed(2)  + 'M';
  if (n >= 1e3)  return (n / 1e3).toFixed(1)  + 'K';
  return n.toString();
}

export function fmtTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return [h, m, s].map(x => x.toString().padStart(2, '0')).join(':');
}

export function fmtDuration(sec) {
  if (sec < 60)   return `${sec}s`;
  if (sec < 3600) return `${Math.floor(sec/60)}m${sec%60}s`;
  return `${Math.floor(sec/3600)}h${Math.floor((sec%3600)/60)}m`;
}

// ---- Math helpers ----

export function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

export function weightedRandom(weights) {
  // weights = { key: number } — returns chosen key
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (const [key, w] of Object.entries(weights)) {
    r -= w;
    if (r <= 0) return key;
  }
  return Object.keys(weights)[0];
}

// ---- EventBus ----
// Dùng để giao tiếp cross-module mà không cần import nhau
//
// Usage:
//   bus.on('quest:update', ({type, qty}) => { ... })
//   bus.emit('quest:update', {type:'hunt', qty:1})
//   bus.off('quest:update', handler)

class EventBus {
  constructor() {
    this._listeners = {};
  }

  on(event, handler) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(handler);
    return () => this.off(event, handler); // returns unsubscribe fn
  }

  off(event, handler) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(h => h !== handler);
  }

  emit(event, data) {
    if (!this._listeners[event]) return;
    this._listeners[event].forEach(h => {
      try { h(data); } catch(e) { console.error(`EventBus error [${event}]:`, e); }
    });
  }

  once(event, handler) {
    const unsub = this.on(event, (data) => {
      handler(data);
      unsub();
    });
  }
}

export const bus = new EventBus();

// ---- DOM helpers ----

export function el(id) {
  return document.getElementById(id);
}

export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

export function qsa(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

export function createElement(tag, className, html = '') {
  const elem = document.createElement(tag);
  if (className) elem.className = className;
  if (html) elem.innerHTML = html;
  return elem;
}

// ---- Misc ----

export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function pct(current, max) {
  if (max <= 0) return 0;
  return Math.min(100, Math.max(0, (current / max) * 100));
}

// Tạo ID ngẫu nhiên ngắn
export function uid() {
  return Math.random().toString(36).slice(2, 9);
}
