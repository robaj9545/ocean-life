/**
 * Suppress non-actionable warnings from Three.js internals and EXGL.
 * This file MUST be imported before any Three.js module to catch
 * warnings that fire during module initialization.
 */
const _origWarn = console.warn;
const _origLog = console.log;

const SUPPRESSED = [
  'THREE.WARNING',
  'THREE.THREE.Clock',
  'THREE.WebGLShadowMap',
  'setBehaviorAsync',
  'setBackgroundColorAsync',
  'EXGL',
];

console.warn = (...args: any[]) => {
  if (typeof args[0] === 'string' && SUPPRESSED.some(p => args[0].includes(p))) return;
  _origWarn.apply(console, args);
};

console.log = (...args: any[]) => {
  if (typeof args[0] === 'string' && SUPPRESSED.some(p => args[0].includes(p))) return;
  _origLog.apply(console, args);
};

export const SUPPRESSED_PATTERNS = SUPPRESSED;
