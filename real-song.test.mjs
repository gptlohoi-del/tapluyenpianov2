import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

await import('../web/phrase-engine.js');
const engine = globalThis.PianoPhrases;
const root = fileURLToPath(new URL('../', import.meta.url));
const songsDir = path.join(root, 'songs');
const supported = /\.(mxl|musicxml|xml)$/i;

function discover(dir = songsDir, subdir = '') {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (entry.name.startsWith('.') || entry.name.startsWith('_')) return [];
    const rel = path.posix.join(subdir, entry.name);
    if (entry.isDirectory()) return discover(path.join(dir, entry.name), rel);
    return entry.isFile() && supported.test(entry.name) ? [rel] : [];
  }).sort((a, b) => a.localeCompare(b, 'vi'));
}

function load(rel) {
  // execFileSync sends the real filename as one argument, even with spaces or accents.
  const raw = execFileSync('python3', ['scripts/verify_musicxml.py', '--json', rel], {
    cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024
  });
  return JSON.parse(raw);
}

function checkContinuousCoverage(phrases, total, rel, mode) {
  assert(phrases.length > 0, `${rel}: không nhận diện được câu (${mode})`);
  assert(Math.abs(phrases[0].startQuarter) < 0.001, `${rel}: câu đầu không bắt đầu ở 0 (${mode})`);
  assert(Math.abs(phrases.at(-1).endQuarter - total) < 0.001, `${rel}: mất đoạn kết (${mode})`);
  for (let i = 0; i < phrases.length; i++) {
    const p = phrases[i];
    assert(p.endQuarter > p.startQuarter, `${rel}: câu không hợp lệ #${i + 1} (${mode})`);
    if (i > 0) assert(Math.abs(p.startQuarter - phrases[i - 1].endQuarter) < 0.001,
      `${rel}: khoảng trống giữa câu ${i} và ${i + 1} (${mode})`);
  }
}

test('all files in songs/ parse correctly and both phrase modes retain the full timeline', async t => {
  const files = discover();
  assert(files.length > 0, 'Hãy thêm tối thiểu một bài nhạc vào songs/');
  for (const rel of files) {
    await t.test(rel, () => {
      const song = load(rel);
      assert(song.measuresInfo.length > 0, `${rel}: không có ô nhịp`);
      assert(song.rawRightNotes.length + song.rawLeftNotes.length > 0, `${rel}: không có nốt nhạc`);
      assert(song.totalQuarters > 0, `${rel}: thời lượng không hợp lệ`);
      for (const mode of ['lyrics', 'music']) {
        const phrases = engine.build(song, mode);
        checkContinuousCoverage(phrases, song.totalQuarters, rel, mode);
      }
      // Important regression: when the right hand rests in the last bar,
      // the left-hand notes must remain inside the final practice phrase.
      const lastBar = song.measuresInfo.at(-1).startQuarter;
      const rh = song.rawRightNotes.filter(n => n.startQuarter >= lastBar);
      const lh = song.rawLeftNotes.filter(n => n.startQuarter >= lastBar);
      if (lh.length && !rh.length) {
        for (const mode of ['lyrics', 'music']) {
          const phrases = engine.build(song, mode);
          assert(phrases.some(p => p.startQuarter <= lastBar && p.endQuarter > lastBar),
            `${rel}: bỏ sót phần tay trái ở ô nhịp cuối (${mode})`);
        }
      }
    });
  }
});
