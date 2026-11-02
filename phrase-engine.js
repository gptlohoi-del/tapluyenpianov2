/* Piano V2 phrase segmentation. Portable: usable by browser and Node tests. */
(function(root,factory) {
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  root.PianoPhrases=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const EPS=0.0001;
  const round=q=>Math.round(q*1000)/1000;
  const ordered=xs=>[...xs].sort((a,b)=>a.startQuarter-b.startQuarter||b.durationQuarter-a.durationQuarter);
  function measureOf(song,q){
    const list=song.measuresInfo||[];
    for(let i=list.length-1;i>=0;i--) if(q+EPS>=list[i].startQuarter) return i+1;
    return 1;
  }
  function label(song,start,end,kind){
    const from=measureOf(song,start), to=measureOf(song,Math.max(start,end-0.01));
    if(kind==='intro') return `Intro · ô ${from}–${to}`;
    if(kind==='outro') return `Outro · ô ${from}–${to}`;
    const melody=ordered(song.rawRightNotes||[]);
    const lyr=melody.filter(n=>n.startQuarter>=start-EPS&&n.startQuarter<end-EPS&&n.lyric).map(n=>n.lyric.trim());
    if(lyr.length) return lyr.join(' ').slice(0,64);
    return `Ô nhịp ${from}–${to}`;
  }
  function build(song,mode='lyrics',maxBars=4){
    if(!song) return [];
    const all=ordered([...(song.rawRightNotes||[]),...(song.rawLeftNotes||[])]);
    const melody=ordered(song.rawRightNotes||[]);
    const measures=song.measuresInfo||[];
    const total=round(Math.max(song.totalQuarters||0,...all.map(n=>n.startQuarter+n.durationQuarter),0));
    if(total<EPS||!all.length) return [];
    const firstVocal=melody.find(n=>n.lyric && n.lyric.trim());
    const lyricNotes=melody.filter(n=>n.lyric&&n.lyric.trim());
    const hasPunctuation=lyricNotes.some(n=>/[.!?;…]/u.test(n.lyric));
    const fullBar=song.beats*4/song.beatType || 4;
    const cuts=[];
    let introCut=null;
    if(mode==='lyrics'&&firstVocal&&firstVocal.startQuarter>=fullBar*2-EPS){
      const previousMeasure=[...measures].reverse().find(m=>m.startQuarter<=firstVocal.startQuarter+EPS);
      introCut=round(previousMeasure?previousMeasure.startQuarter:firstVocal.startQuarter);
      if(introCut>0.5&&introCut<total-0.5) cuts.push(introCut);
    }
    if(mode==='lyrics'&&hasPunctuation){
      for(let i=0;i<lyricNotes.length;i++){
        if(!/[.!?;…]/u.test(lyricNotes[i].lyric)) continue;
        const next=lyricNotes.slice(i+1).find(n=>n.startQuarter>lyricNotes[i].startQuarter+EPS);
        if(next && next.startQuarter<total-EPS) cuts.push(round(next.startQuarter));
      }
    } else {
      // Musical breaks are *silence intervals* between sounded notes.
      // A single notated rest in one voice does not constitute a phrase break.
      let lastEnd=0;
      const gaps=[];
      for(const n of all){
        if(n.startQuarter>lastEnd+EPS) gaps.push({start:lastEnd,end:n.startQuarter,duration:n.startQuarter-lastEnd});
        lastEnd=Math.max(lastEnd,n.startQuarter+n.durationQuarter);
      }
      const safeGaps=gaps.filter(g=>g.duration>=Math.max(0.75,fullBar/3));
      const maxLength=Math.max(fullBar*2,fullBar*Math.max(2,Math.min(8,maxBars)));
      let sectionStart=0;
      for(const g of safeGaps){
        if(g.start-sectionStart>=fullBar*1.4 && g.end<total-EPS){
          cuts.push(round(g.end));sectionStart=g.end;
        }
      }
      // Long legato passages need sensible bar-boundary divisions.
      const provisional=[0,...cuts,total].sort((a,b)=>a-b);
      for(let i=1;i<provisional.length;i++){
        const left=provisional[i-1],right=provisional[i];
        if(right-left<=maxLength*1.3) continue;
        for(let q=left+maxLength;q<right-fullBar;q+=maxLength){
          const near=measures.filter(m=>m.startQuarter>left+fullBar && m.startQuarter<right-fullBar)
            .sort((a,b)=>Math.abs(a.startQuarter-q)-Math.abs(b.startQuarter-q))[0];
          if(near) cuts.push(round(near.startQuarter));
        }
      }
    }
    const boundaries=[0,...new Set(cuts.filter(q=>q>EPS&&q<total-EPS)),total].sort((a,b)=>a-b);
    const phrases=[];
    for(let i=1;i<boundaries.length;i++){
      const start=boundaries[i-1],end=boundaries[i];
      if(end-start<0.25) continue;
      const kind=(introCut!=null && i===1 && Math.abs(end-introCut)<EPS)?'intro':'normal';
      phrases.push({index:phrases.length+1,startQuarter:start,endQuarter:end,
        type:kind,lyricPreview:label(song,start,end,kind),startMeasure:measureOf(song,start),endMeasure:measureOf(song,end-0.01)});
    }
    // Invariant: continuous time coverage, including all LH notes during RH rest.
    if(phrases.length && phrases.at(-1).endQuarter<total-EPS) phrases.at(-1).endQuarter=total;
    return phrases;
  }
  function applyBoundary(song,phrases,index,startQ,endQ){
    const p=phrases[index];if(!p) throw new Error('Không tìm thấy câu.');
    const total=song.totalQuarters;
    if(!Number.isFinite(startQ)||!Number.isFinite(endQ)||startQ<0||endQ>total+EPS||endQ-startQ<0.25)
      throw new Error('Điểm A/B không hợp lệ.');
    const prev=phrases[index-1],next=phrases[index+1];
    if(prev && startQ<=prev.startQuarter+0.25) throw new Error('Điểm A quá gần đầu câu trước.');
    if(next && endQ>=next.endQuarter-0.25) throw new Error('Điểm B vượt qua câu sau.');
    p.startQuarter=round(startQ);p.endQuarter=round(endQ);
    p.lyricPreview=label(song,p.startQuarter,p.endQuarter,p.type);
    if(prev) prev.endQuarter=p.startQuarter;
    if(next) next.startQuarter=p.endQuarter;
    for(const item of phrases){
      item.startMeasure=measureOf(song,item.startQuarter);
      item.endMeasure=measureOf(song,item.endQuarter-0.01);
    }
    return phrases;
  }
  return {build,measureOf,applyBoundary,label};
});
