import test from 'node:test';
import assert from 'node:assert/strict';
await import('../web/phrase-engine.js');
const engine=globalThis.PianoPhrases;
const measures=Array.from({length:6},(_,i)=>({index:i,startQuarter:i*4,durationQuarter:4}));
const make=(q,d,lyric='')=>({startQuarter:q,durationQuarter:d,lyric,midi:60});
function song(){return {beats:4,beatType:4,totalQuarters:24,measuresInfo:measures,
  rawRightNotes:[make(8,1,'Xin'),make(9,1,'chào.'),make(12,1,'Câu'),make(13,1,'hai.')],
  rawLeftNotes:[make(0,1),make(4,1),make(9,1),make(11,1),make(14,1),make(20,3)], rawRests:[{startQuarter:11,durationQuarter:1}]};}
function verifyCover(phrases,total){
 assert.equal(phrases[0].startQuarter,0);
 assert.equal(phrases.at(-1).endQuarter,total);
 phrases.forEach((p,i)=>{assert(p.endQuarter>p.startQuarter);if(i)assert.equal(p.startQuarter,phrases[i-1].endQuarter);});
}
test('lyrics: split explicit intro; retain LH outro after RH ends',()=>{
 const data=song(),phrases=engine.build(data,'lyrics');
 verifyCover(phrases,24);
 assert.equal(phrases[0].type,'intro');
 assert.equal(phrases[0].endQuarter,8);
 assert.equal(phrases.at(-1).endQuarter,24);
});
test('music mode does not divide at short notated RH rest with LH playing',()=>{
 const data=song(),phrases=engine.build(data,'music',4);
 verifyCover(phrases,24);
 assert(phrases.every(p=>!(p.endQuarter>11&&p.endQuarter<12.01)));
});
test('manual edits keep continuous time coverage, prohibit inverted end',()=>{
 const data=song(),parts=engine.build(data,'lyrics');
 engine.applyBoundary(data,parts,1,8,12.5);
 verifyCover(parts,24);
 assert.throws(()=>engine.applyBoundary(data,parts,1,12,11),/không hợp lệ/);
});
test('no RH still produces phrases for LH',()=>{
 const data=song();data.rawRightNotes=[];
 verifyCover(engine.build(data,'music'),24);
});
