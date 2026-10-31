import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Protect against accidentally removing mandatory checksum from native OTA bridge.
test('Capgo manual ZIP updater uses SHA-256 from latest.json', () => {
  const code=fs.readFileSync(new URL('../src/ota-entry.js', import.meta.url), 'utf8');
  assert.match(code, /CapacitorUpdater\.download\s*\(\s*\{[\s\S]*?checksum\s*:\s*manifest\.sha256[\s\S]*?\}\s*\)/);
  assert.match(code, /if\s*\(actual\.toLowerCase\(\)!==manifest\.sha256\.toLowerCase\(\)\)/);
});
