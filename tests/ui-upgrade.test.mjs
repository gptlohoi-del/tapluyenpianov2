import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
test('all visual size changes use live pixel sliders',()=>{
  for(const id of ['toolbarHeightRange','keyboardHeightRange','noteHeightRange','tempoRange','countInRange','fallingAccidentalIntensityRange','fallingNoteFontRange','fallingNoteRadiusRange']){
    assert.match(html,new RegExp(`<input[^>]*id="${id}"[^>]*type="range"|<input[^>]*type="range"[^>]*id="${id}"`));
  }
  assert.match(html,/toolbar-collapsed/);
  assert.match(html,/function setToolbarCollapsed/);
});
test('transposed sheet has fixed signature with distinct color',()=>{
  assert.match(html,/function displayFifths\(\)/);
  assert.match(html,/const fifths=displayFifths\(\)/);
  assert.match(html,/transposeSemitones===0\?'#3E2723':'#a128a6'/);
});
test('falling lane uses actual duration and displays rests',()=>{
  assert.match(html,/durationPx = n.durationQuarter \* pixelsPerQuarter/);
  assert.doesNotMatch(html,/Math\.max\(20, n\.durationQuarter/);
  assert.match(html,/songData\.rawSheetNotes[)]?/);
  assert.match(html,/ctx\.measureText\('Lặng'\)/);
  assert.match(html,/songData\.fallingRestSegments/);
  assert.match(html,/const noteHeight = Math\.max\(1, durationPx\)/);
});
test('audio has lookahead and live voice cleanup',()=>{
  assert.match(html,/0\.13 \* qps/);
  assert.match(html,/scheduleUpcomingNotes\(prevBeat\)/);
  assert.match(html,/function stopLiveAudio/);
});

test('canvas follows expanded stage after hiding toolbar',()=>{
  assert.match(html,/ResizeObserver/);
  assert.doesNotMatch(html,/canvas\.style\.height = stage\.clientHeight/);
});

test('accidental intensity affects only falling sharp/flat notes',()=>{
  assert.match(html,/id="fallingAccidentalIntensityRange"[^>]+min="10"[^>]+max="100"/);
  assert.match(html,/piano_fallingAccidentalIntensity/);
  assert.match(html,/isAccidentalFallingNote = isBlackKey\(n\.midi\)/);
  assert.match(html,/const fallingFill = isAccidentalFallingNote/);
  assert.match(html,/const fallingBorder = isAccidentalFallingNote/);
  assert.match(html,/ctx\.fillStyle = "#3E2723"; \/\/ Trả phím đen về màu gốc/);
  assert.doesNotMatch(html,/blackKeyLightRange|piano_blackKeyLight',String/);
});
