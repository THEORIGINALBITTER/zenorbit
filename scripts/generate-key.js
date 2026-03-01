#!/usr/bin/env node
/**
 * ZenOrbit Pro License Key Generator
 * Usage:
 *   node scripts/generate-key.js            → generate a random key
 *   node scripts/generate-key.js AB12 XY34  → generate a specific key
 *   node scripts/generate-key.js 5           → generate 5 random keys
 */

const KEY_PREFIX = 'ZNPRO';
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function computeChecksum(str) {
  const sum = [...str].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return (sum % 1296).toString(36).toUpperCase().padStart(2, '0');
}

function generateKey(s1, s2) {
  const seg1 = (s1 || '').toUpperCase().padEnd(4, '0').slice(0, 4);
  const seg2 = (s2 || '').toUpperCase().padEnd(4, '0').slice(0, 4);
  const checksum = computeChecksum(seg1 + seg2);
  return `${KEY_PREFIX}-${seg1}-${seg2}-${checksum}`;
}

function randomSegment() {
  return Array.from({ length: 4 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
}

function validateKey(key) {
  if (!key) return false;
  const parts = key.trim().toUpperCase().split('-');
  if (parts.length !== 4) return false;
  if (parts[0] !== KEY_PREFIX) return false;
  if (!/^[A-Z0-9]{4}$/.test(parts[1])) return false;
  if (!/^[A-Z0-9]{4}$/.test(parts[2])) return false;
  return parts[3] === computeChecksum(parts[1] + parts[2]);
}

// ── CLI ──────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);

// validate mode: node generate-key.js --validate ZNPRO-XXXX-XXXX-XX
if (args[0] === '--validate') {
  const key = args[1];
  const valid = validateKey(key);
  console.log(`${key}  →  ${valid ? '✓ VALID' : '✗ INVALID'}`);
  process.exit(valid ? 0 : 1);
}

// count mode: node generate-key.js 5
const count = Number.isInteger(parseInt(args[0])) && args[1] === undefined
  ? parseInt(args[0])
  : 1;

if (count > 1) {
  console.log(`Generating ${count} keys:\n`);
  for (let i = 0; i < count; i++) {
    console.log(generateKey(randomSegment(), randomSegment()));
  }
} else if (args[0] && args[1]) {
  // specific segments mode
  console.log(generateKey(args[0], args[1]));
} else {
  // single random key
  console.log(generateKey(randomSegment(), randomSegment()));
}
