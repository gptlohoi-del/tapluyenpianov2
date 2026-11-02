import test from 'node:test';
import assert from 'node:assert/strict';
import '../web/falling-note-layout.js';

const attach = globalThis.PianoFallingLayout.attachRestsToPreviousNotes;

test('không vẽ nghỉ trong ô 1; nghỉ ô 2 theo cột nốt cuối ô 1', () => {
  const source = [
    {staff:1,voice:'1',midi:71,startQuarter:3,durationQuarter:.5,measureIndex:0},
    {staff:1,voice:'1',midi:74,startQuarter:3.5,durationQuarter:.5,measureIndex:0},
    {isRest:true,staff:1,voice:'1',startQuarter:0,durationQuarter:3,measureIndex:0},
    {isRest:true,staff:1,voice:'1',startQuarter:4,durationQuarter:.5,measureIndex:1}
  ];
  assert.deepEqual(attach(source), [
    {staff:1,midi:74,startQuarter:4,durationQuarter:.5,measureIndex:1}
  ]);
});

test('nghỉ sau nốt cùng tay bám vị trí phím của nốt trước, không sang cột khác', () => {
  const source = [
    {staff:1,voice:'1',midi:60,startQuarter:5,durationQuarter:2,measureIndex:1},
    {isRest:true,staff:1,voice:'1',startQuarter:7,durationQuarter:1,measureIndex:1},
    {staff:2,voice:'1',midi:43,startQuarter:5,durationQuarter:2,measureIndex:1},
    {isRest:true,staff:2,voice:'1',startQuarter:7,durationQuarter:1,measureIndex:1}
  ];
  const rests = attach(source);
  assert.equal(rests.length, 2);
  assert.deepEqual(rests.map(x => x.midi), [60,43]);
});

test('bỏ qua nghỉ bè phụ chồng lên nốt đang phát và nghỉ không có nốt trước', () => {
  const source = [
    {isRest:true,staff:1,voice:'1',startQuarter:4,durationQuarter:1,measureIndex:1},
    {staff:1,voice:'1',midi:60,startQuarter:5,durationQuarter:2,measureIndex:1},
    {isRest:true,staff:1,voice:'2',startQuarter:6,durationQuarter:1,measureIndex:1},
    {isRest:true,staff:1,voice:'1',startQuarter:8,durationQuarter:.5,measureIndex:2}
  ];
  assert.deepEqual(attach(source), []);
});

test('hai dấu lặng liên tiếp liền một dải ngay trên nốt trước', () => {
  const source = [
    {staff:1,voice:'1',midi:60,startQuarter:4,durationQuarter:1,measureIndex:1},
    {isRest:true,staff:1,voice:'1',startQuarter:5,durationQuarter:1,measureIndex:1},
    {isRest:true,staff:1,voice:'1',startQuarter:6,durationQuarter:.5,measureIndex:1}
  ];
  assert.deepEqual(attach(source), [
    {staff:1,midi:60,startQuarter:5,durationQuarter:1.5,measureIndex:1}
  ]);
});
