import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const songsDir = path.join(root, 'songs');
const supported = /\.(mxl|musicxml|xml)$/i;

// Use precisely the discovery rules of scripts/build-web.mjs.
function discover(dir = songsDir, subdir = '') {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (entry.name.startsWith('.') || entry.name.startsWith('_')) return [];
    const rel = path.posix.join(subdir, entry.name);
    if (entry.isDirectory()) return discover(path.join(dir, entry.name), rel);
    return entry.isFile() && supported.test(entry.name) ? [rel] : [];
  });
}

test('song names are discovered automatically; JSZip is available offline', () => {
  assert(fs.existsSync(songsDir), 'Thiếu thư mục songs/');
  const files = discover();
  assert(files.length > 0, 'Thư mục songs/ chưa có file MusicXML/MXL');
  assert.equal(new Set(files).size, files.length);
  for (const rel of files) {
    assert(fs.statSync(path.join(songsDir, rel)).size > 0, `File bài hát rỗng: ${rel}`);
  }
  const jszip = path.join(root, 'web/vendor/jszip.min.js');
  assert(fs.existsSync(jszip), 'Thiếu thư viện JSZip hoạt động offline');
  assert(fs.statSync(jszip).size > 20000, 'JSZip có thể bị thiếu nội dung');
});
