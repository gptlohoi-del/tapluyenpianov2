/** Liên kết khoảng lặng với nốt đứng trước cùng tay, trên cùng trục thời gian.
 * Dùng dữ liệu MusicXML gốc (trước transpose) để có thể render theo phím đúng.
 */
(function (root) {
  'use strict';
  const EPS = 0.001;
  function attachRestsToPreviousNotes(sheetNotes) {
    const all = Array.isArray(sheetNotes) ? sheetNotes : [];
    const pitched = all.filter(n => !n.isRest && Number.isFinite(n.midi) &&
      Number.isFinite(n.startQuarter) && Number.isFinite(n.durationQuarter));
    const restEntries = all.filter(n => n.isRest && n.measureIndex >= 1 &&
      Number.isFinite(n.startQuarter) && Number.isFinite(n.durationQuarter) && n.durationQuarter > 0);
    const segments = [], emitted = new Set(), lastRestByVoice = new Map();
    restEntries.sort((a,b) => a.startQuarter - b.startQuarter || a.staff - b.staff);
    for (const r of restEntries) {
      const sameStaff = pitched.filter(n => n.staff === r.staff);
      // Không vẽ dấu lặng của bè phụ khi một nốt khác vẫn đang vang.
      const hasOverlappingNote = sameStaff.some(n =>
        n.startQuarter < r.startQuarter + r.durationQuarter - EPS &&
        n.startQuarter + n.durationQuarter > r.startQuarter + EPS);
      if (hasOverlappingNote) continue;
      const voiceKey = `${r.staff}:${r.voice || '1'}`;
      const previousRest = lastRestByVoice.get(voiceKey);
      if (previousRest && Math.abs(previousRest.startQuarter + previousRest.durationQuarter - r.startQuarter) <= EPS) {
        // Nhiều dấu lặng liên tiếp tạo thành một dải không đứt quãng.
        previousRest.durationQuarter += r.durationQuarter;
        continue;
      }
      const preceding = sameStaff.filter(n =>
        n.startQuarter + n.durationQuarter <= r.startQuarter + EPS);
      if (!preceding.length) continue;
      preceding.sort((a, b) => {
        const endA = a.startQuarter + a.durationQuarter;
        const endB = b.startQuarter + b.durationQuarter;
        return endB - endA || Number(b.voice === r.voice) - Number(a.voice === r.voice);
      });
      const prev = preceding[0];
      // Nghỉ phải nằm ngay sau nốt trước, không tạo một dải rời rạc ngẫu nhiên.
      if (Math.abs(prev.startQuarter + prev.durationQuarter - r.startQuarter) > 0.01) continue;
      const key = [r.staff, r.startQuarter, r.durationQuarter, prev.midi].join(':');
      if (emitted.has(key)) continue;
      emitted.add(key);
      const segment = {staff:r.staff, midi:prev.midi, startQuarter:r.startQuarter,
        durationQuarter:r.durationQuarter, measureIndex:r.measureIndex};
      segments.push(segment);
      lastRestByVoice.set(voiceKey, segment);
    }
    return segments;
  }
  root.PianoFallingLayout = { attachRestsToPreviousNotes };
})(typeof window !== 'undefined' ? window : globalThis);
