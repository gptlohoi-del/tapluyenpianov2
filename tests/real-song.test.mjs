import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
await import('../web/phrase-engine.js');
const engine=globalThis.PianoPhrases;
function load(name){return JSON.parse(execFileSync('python3',['scripts/verify_musicxml.py','--json',name],{encoding:'utf8'}));}
test('48-bar user supplied MXL: intro, 2 hands, all notes including LH-only last bar',()=>{
 const song=load('viet-tiep-cau-chuyen-hoa-binh-ban-moi.mxl');
 assert.equal(song.measuresInfo.length,48);
 const phrase=engine.build(song,'lyrics');
 assert(phrase.length>5,'should detect lyric phrase endings');
 assert.equal(phrase[0].startQuarter,0);
 assert.equal(phrase.at(-1).endQuarter,song.totalQuarters);
 assert.equal(phrase[0].type,'intro');
 assert(phrase.every((p,i)=>!i||Math.abs(p.startQuarter-phrase[i-1].endQuarter)<0.001));
 const finalBar=song.measuresInfo.at(-1).startQuarter;
 assert(phrase.some(p=>p.startQuarter<=finalBar&&p.endQuarter>finalBar));
 const leftInLastBar=song.rawLeftNotes.filter(n=>n.startQuarter>=finalBar);
 assert.equal(leftInLastBar.length,8);
});
test('old MXL: phrase engine still covers full timeline',()=>{
 const song=load('viet tiep cau chuyen hoa binh.mxl');
 for(const mode of ['lyrics','music']){
  const p=engine.build(song,mode);
  assert.equal(p.at(-1).endQuarter,song.totalQuarters);
  assert.equal(p[0].startQuarter,0);
 }
});
